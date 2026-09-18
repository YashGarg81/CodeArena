// worker/pull_images.ts
//
// Pulls every compiler/runtime image referenced by LANGUAGE_IMAGES so that the
// Docker sandbox can run all supported languages without an on-demand download.
//
// Usage:
//   bun run pull_images.ts              # pull all images (slow, first setup)
//   bun run pull_images.ts --prune-only # only prune the Go build cache if over limit
import { spawnSync } from "child_process";
import { LANGUAGE_IMAGES, maybePruneGoCacheVolume, goCacheMaxBytes } from "./src/sandbox/dockerRunner";

if (process.argv.includes("--prune-only")) {
  const res = await maybePruneGoCacheVolume();
  const usedMb = res.usedBytes === null ? "unknown" : `${Math.round(res.usedBytes / 1024 / 1024)}MB`;
  console.log(`GOCACHE usage: ${usedMb} (limit ${Math.round(goCacheMaxBytes() / 1024 / 1024)}MB) — ${res.pruned ? "pruned" : "no action needed"}.`);
  process.exitCode = 0;
} else {
const unique = [...new Set(Object.values(LANGUAGE_IMAGES))];
console.log(`Pulling ${unique.length} compiler images (this can take a while)...`);

let failures = 0;
for (const image of unique) {
  process.stdout.write(`\n=== docker pull ${image} ===\n`);
  const res = spawnSync("docker", ["pull", image], { stdio: "inherit" });
  if (res.status === 0) {
    console.log(`  OK ${image}`);
  } else {
    failures++;
    console.log(`  FAIL ${image} (exit ${res.status})`);
  }
}

console.log(`\nDone. ${unique.length - failures}/${unique.length} images pulled, ${failures} failed.`);
process.exitCode = failures > 0 ? 1 : 0;
}