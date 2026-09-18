import { test, expect, describe } from "bun:test";
import { shouldPruneCache, goCacheMaxBytes, goCacheUsageBytes, maybePruneGoCacheVolume } from "./dockerRunner";

describe("Go build-cache maintenance", () => {
  test("goCacheMaxBytes defaults to 2048MB and honors GOCACHE_MAX_MB", () => {
    delete process.env.GOCACHE_MAX_MB;
    expect(goCacheMaxBytes()).toBe(2048 * 1024 * 1024);
    process.env.GOCACHE_MAX_MB = "512";
    expect(goCacheMaxBytes()).toBe(512 * 1024 * 1024);
    process.env.GOCACHE_MAX_MB = "bogus";
    expect(goCacheMaxBytes()).toBe(2048 * 1024 * 1024);
    delete process.env.GOCACHE_MAX_MB;
  });

  test("shouldPruneCache fires only above the limit", () => {
    expect(shouldPruneCache(100, 200)).toBe(false);
    expect(shouldPruneCache(200, 200)).toBe(false);
    expect(shouldPruneCache(201, 200)).toBe(true);
  });

  test("live cache volume reports usage and stays under the prune threshold", async () => {
    let dockerUp = false;
    try {
      const p = Bun.spawnSync(["docker", "info"]);
      dockerUp = p.exitCode === 0;
    } catch {
      dockerUp = false;
    }
    if (!dockerUp) {
      console.log("skip: docker unavailable");
      return;
    }
    const used = await goCacheUsageBytes();
    expect(typeof used).toBe("number");
    const res = await maybePruneGoCacheVolume();
    expect(typeof res.pruned).toBe("boolean");
    // A prune is only valid if usage actually exceeded the limit.
    if (res.pruned) {
      expect(shouldPruneCache(res.usedBytes ?? 0)).toBe(true);
    }
  }, { timeout: 180000 });
});
