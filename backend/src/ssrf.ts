// backend/src/ssrf.ts
import { URL } from "url";
import net from "net";

const BLOCKED_IP_PREFIXES = [
  "0.",          // Current network (RFC 1122)
  "10.",         // Class A Private (RFC 1918)
  "127.",        // Loopback (RFC 1122)
  "169.254.",    // Link-local / Cloud Metadata (AWS, GCP, Azure)
  "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.",
  "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
  "172.30.", "172.31.", // Class B Private (RFC 1918)
  "192.168.",    // Class C Private (RFC 1918)
  "198.18.", "198.19.", // Benchmark testing (RFC 2544)
  "224.", "225.", "226.", "227.", "228.", "229.", "230.", "231.", "232.", "233.", "234.", "235.", "236.", "237.", "238.", "239.", // Multicast
  "240.",        // Reserved (RFC 1112)
];

const BLOCKED_HOSTNAMES = [
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
  "instance-data",
];

export interface SSRFValidationResult {
  safe: boolean;
  reason?: string;
  sanitizedUrl?: string;
}

export function isIpBlocked(ipAddress: string): boolean {
  const isIP = net.isIP(ipAddress);
  if (isIP === 4) {
    for (const prefix of BLOCKED_IP_PREFIXES) {
      if (ipAddress.startsWith(prefix)) return true;
    }
  } else if (isIP === 6) {
    if (
      ipAddress === "::1" ||
      ipAddress === "::" ||
      ipAddress.startsWith("fc") ||
      ipAddress.startsWith("fd") ||
      ipAddress.startsWith("fe80") ||
      ipAddress.includes("127.0.0.1") ||
      ipAddress.includes("169.254.")
    ) {
      return true;
    }
  }
  return false;
}

import dns from "dns/promises";

/**
 * Synchronous preliminary URL validation against SSRF vulnerabilities (internal IPs, cloud metadata, loopback).
 */
export function validateUrlForSSRF(rawUrl: string): SSRFValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { safe: false, reason: "Invalid URL string provided" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "Malformed URL" };
  }

  // Enforce HTTP / HTTPS protocols only
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: `Unsupported protocol '${parsed.protocol}'. Only http: and https: are allowed.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block forbidden hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: `Hostname '${hostname}' is restricted (internal loopback/metadata)` };
  }

  // If host is an IP address, check against banned ranges
  if (isIpBlocked(hostname)) {
    return { safe: false, reason: `Access to private/internal IP address '${hostname}' is forbidden` };
  }

  // Block credentials in URL (e.g. http://user:pass@host)
  if (parsed.username || parsed.password) {
    return { safe: false, reason: "Embedded credentials in URL are prohibited" };
  }

  return { safe: true, sanitizedUrl: parsed.toString() };
}

/**
 * Issue 21: Full DNS-resolved SSRF & DNS rebinding protection.
 * Performs DNS resolution immediately prior to network connection and verifies
 * that resolved IP addresses do not resolve to internal, private, loopback, or metadata networks.
 */
export async function validateResolvedUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  const preliminary = validateUrlForSSRF(rawUrl);
  if (!preliminary.safe) return preliminary;

  const parsed = new URL(rawUrl);
  const hostname = parsed.hostname.toLowerCase();

  // If already an IP address, preliminary check was sufficient
  if (net.isIP(hostname)) {
    return preliminary;
  }

  try {
    // Resolve both IPv4 and IPv6 addresses for hostname
    const lookupResults = await dns.lookup(hostname, { all: true });
    for (const record of lookupResults) {
      if (isIpBlocked(record.address)) {
        return {
          safe: false,
          reason: `DNS resolution for '${hostname}' mapped to forbidden internal/private IP '${record.address}' (DNS rebinding prevention)`
        };
      }
    }
  } catch (err: any) {
    return { safe: false, reason: `DNS resolution failed for '${hostname}': ${err.message}` };
  }

  return preliminary;
}
