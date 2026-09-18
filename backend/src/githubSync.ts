// backend/src/githubSync.ts
/**
 * GitHub Repository Solution Auto-Sync Engine
 * Commits accepted problem submissions directly into user GitHub repositories.
 */

export interface GitHubSyncConfig {
  repoName: string; // e.g., "my-leetcode-solutions"
  branch?: string;  // defaults to "main"
  token: string;    // user personal access token or OAuth token with repo scope
  folderPrefix?: string; // e.g., "solutions"
}

export interface SolutionCommitPayload {
  problemId: string;
  problemTitle: string;
  difficulty: string;
  category: string;
  language: string;
  code: string;
  runtimeMs?: number;
  memoryMb?: number;
}

/**
 * Format solution file paths and README documentation.
 */
export function buildCommitFiles(payload: SolutionCommitPayload, folderPrefix = "solutions") {
  const EXTENSION_BY_LANGUAGE: Record<string, string> = {
    js: "js", javascript: "js",
    ts: "ts", typescript: "ts",
    py: "py", python: "py", python3: "py",
    cpp: "cpp", "c++": "cpp",
    c: "c",
    java: "java",
    go: "go", golang: "go",
    rust: "rs", rs: "rs",
    cs: "cs", csharp: "cs", "c#": "cs",
    kt: "kt", kotlin: "kt",
    swift: "swift",
    ruby: "rb",
    php: "php",
    scala: "scala",
    dart: "dart",
    r: "r", rscript: "r",
    perl: "pl", pl: "pl",
    bash: "sh", sh: "sh", shell: "sh",
    hs: "hs", haskell: "hs",
    ex: "exs", elixir: "exs",
    erl: "escript", erlang: "escript",
    clj: "clj", clojure: "clj",
    groovy: "groovy",
    jl: "jl", julia: "jl",
    nim: "nim",
  };
  const ext = EXTENSION_BY_LANGUAGE[payload.language?.toLowerCase()] ?? "js";

  const safeTitle = payload.problemTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
  const problemFolder = `${folderPrefix}/${payload.problemId}-${safeTitle}`;
  const codeFilePath = `${problemFolder}/solution.${ext}`;
  const readmeFilePath = `${problemFolder}/README.md`;

  const readmeContent = `# ${payload.problemTitle}

**Difficulty:** \`${payload.difficulty}\`  
**Category:** \`${payload.category}\`  
**Runtime:** \`${payload.runtimeMs ? payload.runtimeMs.toFixed(0) + 'ms' : 'N/A'}\`  
**Memory:** \`${payload.memoryMb ? payload.memoryMb.toFixed(1) + 'MB' : 'N/A'}\`  

---

### Solution (${payload.language.toUpperCase()})

\`\`\`${ext}
${payload.code}
\`\`\`

*Auto-committed with ⚡ [CodeArena Platform](https://codearena.dev)*
`;

  return {
    codeFilePath,
    codeContent: payload.code,
    readmeFilePath,
    readmeContent,
    commitMessage: `feat(solution): sync ${payload.problemTitle} [${payload.difficulty}]`
  };
}

/**
 * Dispatches file update/creation to the GitHub REST API.
 */
export async function syncSolutionToGitHub(
  config: GitHubSyncConfig,
  payload: SolutionCommitPayload
): Promise<{ success: boolean; commitUrl?: string; error?: string }> {
  if (!config.token || !config.repoName) {
    return { success: false, error: "GitHub repository and OAuth token required" };
  }

  const { codeFilePath, codeContent, commitMessage } = buildCommitFiles(payload, config.folderPrefix);

  try {
    const apiBase = `https://api.github.com/repos/${config.repoName}/contents/${codeFilePath}`;
    
    // Check if file already exists to get SHA for updates
    let sha: string | undefined;
    const getRes = await fetch(apiBase, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "CodeArena-Sync"
      }
    });

    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      sha = existing.sha;
    }

    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "CodeArena-Sync"
      },
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(codeContent).toString("base64"),
        branch: config.branch || "main",
        ...(sha && { sha })
      })
    });

    if (putRes.ok) {
        const data = (await putRes.json()) as { commit?: { html_url?: string } };
        return {
            success: true,
            commitUrl: data.commit?.html_url || `https://github.com/${config.repoName}`
        };
    } else {
        // A failed commit must never be reported as success: callers and UIs
        // would otherwise display a fabricated commit URL.
        let detail = "";
        try { detail = (await putRes.text()).slice(0, 300); } catch {}
        return {
            success: false,
            error: `GitHub commit failed (HTTP ${putRes.status})${detail ? `: ${detail}` : ""}`
        };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
