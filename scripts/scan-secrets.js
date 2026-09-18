#!/usr/bin/env node
/**
 * scripts/scan-secrets.js
 * 
 * High-performance repository secret and credentials scanner.
 * Prevents .env files, private keys, API keys, and sensitive tokens from ever being committed or pushed.
 * 
 * Usage:
 *   node scripts/scan-secrets.js --staged  # Scans only staged changes (for pre-commit/pre-push)
 *   node scripts/scan-secrets.js --all     # Full repository audit
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const FORBIDDEN_FILE_PATTERNS = [
  /(^|[/\\])\.env(\..+)?$/i,               // .env, .env.production, etc.
  /\.(pem|key|p12|pfx|crt|cer|der)$/i,      // Private keys & certificates
  /(^|[/\\])id_(rsa|ed25519|ecdsa|dsa)/i,   // SSH keys
  /(^|[/\\]).*service-account.*\.json$/i,   // GCP service accounts
  /(^|[/\\])google-services\.json$/i,       // Android Google services
  /(^|[/\\])client_secret.*\.json$/i,       // OAuth client secrets
  /(^|[/\\])playlist_dump.*\.html$/i,       // Scraper raw HTML dumps
  /(^|[/\\])in_memory_store\.json$/i,       // Local mock DB store dumps
];

// Files explicitly exempt from filename rules
const ALLOWED_FILENAMES = [
  ".env.example",
  "frontend/.env.example",
  "backend/.env.example",
  "worker/.env.example",
];

// High-confidence regex rules for exposed secrets
const SECRET_RULES = [
  {
    name: "Google API Key",
    regex: /AIzaSy[A-Za-z0-9_-]{33}/,
  },
  {
    name: "AWS Access Key ID",
    regex: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    name: "GitHub Token",
    regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}\b/,
  },
  {
    name: "GitHub Fine-Grained PAT",
    regex: /\bgithub_pat_[A-Za-z0-9_]{82}\b/,
  },
  {
    name: "Private Key Header",
    regex: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/,
  },
  {
    name: "Slack Token",
    regex: /\bxox[baprs]-[0-9a-zA-Z-]{10,72}\b/,
  },
  {
    name: "Stripe API Key",
    regex: /\b(sk|rk)_(live|test)_[0-9a-zA-Z]{24,99}\b/,
  },
];

// Allow list for common false-positive substrings (e.g., example code, test stubs, hash algorithms)
const ALLOWED_PATTERNS = [
  /AIzaSy_EXAMPLE/i,
  /your[_-]?api[_-]?key/i,
  /placeholder/i,
  /dummy/i,
  /mock/i,
];

function isAllowedFile(filePath) {
  const norm = filePath.replace(/\\/g, "/");
  return ALLOWED_FILENAMES.some((allowed) => norm.endsWith(allowed));
}

function getFilesToScan(isStagedOnly) {
  try {
    if (isStagedOnly) {
      const output = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
      return output.split(/\r?\n/).map((f) => f.trim()).filter(Boolean);
    } else {
      const output = execSync("git ls-files", { encoding: "utf8" });
      return output.split(/\r?\n/).map((f) => f.trim()).filter(Boolean);
    }
  } catch (err) {
    console.error("Failed to list git files:", err.message);
    process.exit(1);
  }
}

function scanFile(filePath, isStagedOnly) {
  const violations = [];
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Check 1: Forbidden filenames
  if (!isAllowedFile(normalizedPath)) {
    for (const pattern of FORBIDDEN_FILE_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        violations.push({
          type: "FORBIDDEN_FILE",
          rule: `Forbidden file detected: ${pattern}`,
          line: 0,
        });
        return violations; // Stop immediately for forbidden files
      }
    }
  }

  // Check 2: Content scanning
  let content = "";
  try {
    if (isStagedOnly) {
      content = execSync(`git show :${JSON.stringify(normalizedPath)}`, {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
    } else {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 5 * 1024 * 1024) return violations; // Skip huge binaries
        content = fs.readFileSync(filePath, "utf8");
      }
    }
  } catch {
    return violations; // Deleted or binary file
  }

  if (!content) return violations;

  const lines = content.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Check if line matches any secret regex
    for (const rule of SECRET_RULES) {
      if (rule.regex.test(line)) {
        const isExempt = ALLOWED_PATTERNS.some((p) => p.test(line));
        if (!isExempt) {
          violations.push({
            type: "SECRET_DETECTED",
            rule: rule.name,
            line: idx + 1,
            snippet: line.trim().slice(0, 100),
          });
        }
      }
    }
  }

  return violations;
}

function main() {
  const isStagedOnly = process.argv.includes("--staged");
  console.log(`🛡️  Running CodeArena Secret Protection Scanner (${isStagedOnly ? "Staged changes" : "Full repository"})...`);

  const files = getFilesToScan(isStagedOnly);
  if (files.length === 0) {
    console.log("✅ No files to scan.");
    process.exit(0);
  }

  let totalViolations = 0;

  for (const file of files) {
    const violations = scanFile(file, isStagedOnly);
    if (violations.length > 0) {
      totalViolations += violations.length;
      console.error(`\n🚨 SECURITY ALERT in [${file}]:`);
      for (const v of violations) {
        if (v.type === "FORBIDDEN_FILE") {
          console.error(`   ⛔ [${v.rule}]`);
        } else {
          console.error(`   🔑 [${v.rule}] at line ${v.line}: ${v.snippet}`);
        }
      }
    }
  }

  if (totalViolations > 0) {
    console.error(`\n❌ BLOCKED: Detected ${totalViolations} security violation(s)!`);
    console.error("   Please remove secrets/env files before committing or pushing to GitHub.");
    console.error("   If a token was exposed, rotate and revoke it immediately.");
    process.exit(1);
  }

  console.log(`✅ Security scan passed! ${files.length} file(s) checked. Zero secrets or env files detected.`);
  process.exit(0);
}

main();
