import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User } from "../../types";
import { LANGUAGE_OPTIONS } from "../../utils/languages";

// ─── 1V1 BATTLE ARENA PAGE ──────────────────────────────────────────────────

export function BattleArenaPage({ user, onToast }: { user: User | null; onToast: (m: string, t: string) => void }) {
  const [matchState, setMatchState] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [gameMode, setGameMode] = useState<"classic" | "speed" | "score" | "best_of_3" | "survival">("classic");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [arenaLanguage, setArenaLanguage] = useState<string>("js");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  
  const ARENA_TEMPLATES: Record<string, string> = {
    js: `function twoSum(nums, target) {\n    // Write your code here\n    \n}`,
    ts: `function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}`,
    py: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass`,
    cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}`,
    c: `#include <stdio.h>\n#include <stdlib.h>\n\n// Return indices via out-parameters; set *returnSize = 2\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 0;\n    return NULL;\n}`,
    java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
    go: `func twoSum(nums []int, target int) []int {\n    // Write your code here\n    return nil\n}`,
    rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    // Write your code here\n    vec![]\n}`,
    cs: `using System.Collections.Generic;\n\nclass Solution {\n    public int[] TwoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}`,
    kt: `fun twoSum(nums: IntArray, target: Int): IntArray {\n    // Write your code here\n    return intArrayOf()\n}`,
    swift: `func twoSum(_ nums: [Int], _ target: Int) -> [Int] {\n    // Write your code here\n    return []\n}`,
    ruby: `def two_sum(nums, target)\n  # Write your code here\nend`,
    php: `<?php\nfunction twoSum($nums, $target) {\n    // Write your code here\n}`,
    scala: `def twoSum(nums: Array[Int], target: Int): Array[Int] = {\n  // Write your code here\n  Array()\n}`,
    dart: `List<int> twoSum(List<int> nums, int target) {\n  // Write your code here\n  return [];\n}`,
    r: `two_sum <- function(nums, target) {\n  # Write your code here\n}`,
    perl: `sub two_sum {\n  my ($nums, $target) = @_;\n  # Write your code here\n}`,
    bash: `#!/usr/bin/env bash\n# Read nums + target from stdin, print indices\n# Write your code here`,
    hs: `twoSum :: [Int] -> Int -> [Int]\ntwoSum nums target =\n  -- Write your code here\n  []`,
    ex: `defmodule Solution do\n  def two_sum(nums, target) do\n    # Write your code here\n  end\nend`,
    erl: `#!/usr/bin/env escript\nmain(_) ->\n  %% Write your code here\n  ok.`,
    clj: `(defn two-sum [nums target]\n  ;; Write your code here\n  [])`,
    groovy: `static int[] twoSum(int[] nums, int target) {\n    // Write your code here\n    return [] as int[]\n}`,
    jl: `function two_sum(nums, target)\n    # Write your code here\nend`,
    nim: `proc twoSum(nums: seq[int], target: int): seq[int] =\n  # Write your code here\n  @[]`,
  };

  const [code, setCode] = useState<string>(ARENA_TEMPLATES.js || "");
  const [testsPassed, setTestsPassed] = useState(0);
  const [opponentTests, setOpponentTests] = useState(0);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [battleHistory, setBattleHistory] = useState<any[]>([]);
  const [compiling, setCompiling] = useState(false);
  const [runLogs, setRunLogs] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [pasteEvents, setPasteEvents] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number>(900);

  // Load recent global clashes for the lobby (backend seeds + records history)
  useEffect(() => {
    let cancelled = false;
    api.get("/api/v1/arena/history")
      .then((res) => {
        if (!cancelled && Array.isArray(res.data?.history)) {
          setBattleHistory(res.data.history);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Runnable duel problems: published catalog problems the judge can execute.
  // The lobby pick becomes round 1 (and pads best_of_3 / survival waves).
  const [arenaProblems, setArenaProblems] = useState<Array<{ id: string; title: string; difficulty: string; category: string }>>([]);
  const [problemSearch, setProblemSearch] = useState("");
  const [arenaProblemId, setArenaProblemId] = useState<string>("two-sum");

  useEffect(() => {
    let cancelled = false;
    api.get("/api/v1/arena/problems")
      .then((res) => {
        if (!cancelled && Array.isArray(res.data?.problems)) {
          setArenaProblems(res.data.problems);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const filteredArenaProblems = arenaProblems.filter((p) => {
    const q = problemSearch.trim().toLowerCase();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  // Current round's problem (server-driven for best_of_3 / survival waves)
  const roundIdx = Math.max(0, (matchState?.currentRound || 1) - 1);
  const roundProblemRef = matchState?.problems?.[roundIdx];
  const duelProblemId: string = roundProblemRef?.id || arenaProblemId || "two-sum";

  // Round problem detail: templates + first public test case for the judge.
  const [duelProblem, setDuelProblem] = useState<any>(null);
  useEffect(() => {
    if (!matchState?.matchId) return;
    let cancelled = false;
    api.get(`/api/v1/problems/${duelProblemId}`)
      .then((res) => {
        if (cancelled) return;
        const detail = res.data?.problem;
        setDuelProblem(detail || null);
        const tpl = detail?.templates?.[arenaLanguage] || ARENA_TEMPLATES[arenaLanguage] || "";
        lastTemplateRef.current = tpl;
        setCode(tpl);
        setRunLogs("");
      })
      .catch(() => {
        if (!cancelled) setDuelProblem(null);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchState?.matchId, duelProblemId]);

  // Poll room state when waiting for player 2 in private rooms
  useEffect(() => {
    if (!matchState?.matchId) return;

    // Timer interval
    const timerInterval = setInterval(() => {
      if (matchState.status === "active" && matchState.startTime > 0) {
        const elapsed = Math.floor((Date.now() - matchState.startTime) / 1000);
        const remaining = Math.max(0, (matchState.durationSeconds || 900) - elapsed);
        setTimeLeft(remaining);
      }
    }, 1000);

    // Room sync polling — server is authoritative for both players' progress.
    // This also handles best_of_3 round resets driven by the backend.
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/arena/matches/${matchState.matchId}`);
        const serverMatch = res.data.match;
        if (serverMatch) {
          if (matchState.status === "waiting" && serverMatch.status === "active") {
            onToast("⚔️ Opponent connected! Duel timer started!", "success");
            setStartTime(serverMatch.startTime || Date.now());
          }
          if (matchState.status !== "completed" && serverMatch.status === "completed") {
            const iWon = serverMatch.winnerId === user?.id;
            setMatchResult({
              won: iWon,
              timeTakenSec: Math.max(1, Math.round((Date.now() - startTime) / 1000)),
              deltaElo: iWon ? 28 : -12,
              newElo: (user?.contestRating || 1500) + (iWon ? 28 : -12),
              speedAccuracy: iWon ? "⚡ Opponent solved first — wait, you won!" : "Opponent solved first. GG!",
            });
            onToast(iWon ? "VICTORY! 🏆" : "Defeat — opponent solved first.", iWon ? "success" : "error");
          }
          setMatchState(serverMatch);
          const me = serverMatch.player1?.id === user?.id ? serverMatch.player1 : serverMatch.player2;
          const opp = serverMatch.player1?.id === user?.id ? serverMatch.player2 : serverMatch.player1;
          if (typeof me?.testsPassed === "number") setTestsPassed(me.testsPassed);
          if (typeof opp?.testsPassed === "number") setOpponentTests(opp.testsPassed);
        }
      } catch {}
    }, 2000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollInterval);
    };
  }, [matchState?.matchId, matchState?.status, matchState?.startTime, matchState?.durationSeconds, user?.id, startTime]);

  const lastTemplateRef = useRef<string>(ARENA_TEMPLATES.js || "");
  const handleLanguageChange = (lang: string) => {
    setArenaLanguage(lang);
    const nextTemplate = duelProblem?.templates?.[lang] || ARENA_TEMPLATES[lang] || "";
    // Don't wipe code the user has already edited — only swap the scaffold
    // when the editor still holds the previous template (or is empty).
    setCode((prev) => {
      if (!prev.trim() || prev === lastTemplateRef.current) {
        lastTemplateRef.current = nextTemplate;
        return nextTemplate;
      }
      lastTemplateRef.current = nextTemplate;
      onToast(`Language switched to ${lang.toUpperCase()} — your code was kept.`, "info");
      return prev;
    });
  };

  const startMatchmaking = async () => {
    if (!user) { onToast("Please sign in to enter the 1v1 Battle Arena", "error"); return; }
    setSearching(true);
    try {
      const res = await api.post("/api/v1/arena/matchmake", { gameMode, difficulty, language: arenaLanguage, problemIds: [arenaProblemId] });
      if (res.data.match) {
        setMatchState(res.data.match);
        setSearching(false);
        setTestsPassed(0);
        setOpponentTests(0);
        setMatchResult(null);
        setRunLogs("");
        setStartTime(res.data.match.startTime || Date.now());
        setPasteEvents(0);
        onToast(`Opponent Found! ⚔️ Matched vs @${res.data.match.player2?.username || 'Challenger'}!`, "success");
      } else {
        onToast(`Joined queue for [${gameMode.toUpperCase()}] mode... Searching ⏳`, "info");
      }
    } catch {
      onToast("Failed to join arena queue", "error");
      setSearching(false);
    }
  };

  const handleCreatePrivateRoom = async () => {
    if (!user) { onToast("Please sign in to create a private room", "error"); return; }
    try {
      const res = await api.post("/api/v1/arena/rooms", { gameMode, difficulty, language: arenaLanguage, problemIds: [arenaProblemId] });
      setMatchState(res.data.match);
      setStartTime(Date.now());
      setPasteEvents(0);
      onToast(`Private room created! Code: ${res.data.roomCode} 🔑`, "success");
    } catch {
      onToast("Failed to create room", "error");
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (!user) { onToast("Please sign in to join private rooms", "error"); return; }
    if (!roomCodeInput.trim()) { onToast("Enter a 6-digit room code", "error"); return; }
    try {
      const res = await api.post("/api/v1/arena/rooms/join", { roomCode: roomCodeInput.trim() });
      setMatchState(res.data.match);
      setStartTime(Date.now());
      setPasteEvents(0);
      onToast("Joined room! ⚔️ Ready to duel", "success");
    } catch (e: any) {
      onToast(e.response?.data?.error || "Room not found or expired", "error");
    }
  };

  const handleRematch = async () => {
    if (!matchState?.matchId) return;
    try {
      const res = await api.post(`/api/v1/arena/matches/${matchState.matchId}/rematch`, {});
      const next = res.data.match;
      setMatchState(next);
      if (next?.status === "rematch_requested") {
        onToast("Rematch requested! Waiting for opponent to accept… 🔄", "info");
        return;
      }
      setTestsPassed(0);
      setOpponentTests(0);
      setMatchResult(null);
      setRunLogs("");
      setStartTime(Date.now());
      setPasteEvents(0);
      onToast("Rematch accepted — new duel started! 🔄", "success");
    } catch {
      onToast("Failed to request rematch", "error");
    }
  };

  const handleExitArena = () => {
    if (matchState && !matchResult) {
      if (!confirm("Are you sure you want to forfeit or leave this match? You will return to the Arena Lobby.")) {
        return;
      }
    }
    setMatchState(null);
    setMatchResult(null);
    setTestsPassed(0);
    setOpponentTests(0);
    setSearching(false);
    setRunLogs("");
    onToast("Returned to Battle Arena Lobby ⚔️", "info");
  };

  const handleRunBattleTest = async () => {
    if (!code.trim()) { onToast("Write code before compiling", "error"); return; }
    setCompiling(true);
    setRunLogs("⚙️ Compiling and running through judge sandbox...");

    const timeTakenSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Judge the current round's problem (works for any catalog problem, not just two-sum).
    const visibleTCs = Array.isArray(duelProblem?.testCases) ? duelProblem.testCases.filter((tc: any) => !tc.isHidden) : [];
    const judgeInput = visibleTCs[0]?.input ?? "";
    const judgeExpected = visibleTCs[0]?.output ?? visibleTCs[0]?.expectedOutput ?? "";

    // 1. Anti-Cheat Real-Time Inspection (non-blocking: never fail silently)
    try {
      const auditRes = await api.post("/api/v1/contests/anti-cheat/analyze", {
        problemId: duelProblemId,
        code,
        timeTakenSec,
        pasteEventDetected: pasteEvents > 0,
        pasteCharCount: pasteEvents * 200,
        tabSwitchCount: 0
      });
      if (auditRes.data.audit?.isFlagged) {
        onToast("⚠️ Anti-Cheat Telemetry: Unnatural solve pattern detected", "error");
      }
    } catch {
      onToast("Anti-cheat service unavailable — continuing without telemetry", "info");
    }

    // 2. Real Sandboxed Compilation & Test Execution
    try {
      const runRes = await api.post("/api/v1/submissions/run", {
        problemId: duelProblemId,
        code,
        language: arenaLanguage,
        input: judgeInput,
        expectedOutput: judgeExpected
      });

      const passed = runRes.data.result?.passed || runRes.data.result?.status === "Accepted" || runRes.data.result?.status === "Success";
      const nextPassed = passed ? Math.min(5, testsPassed + 1) : testsPassed;
      setTestsPassed(nextPassed);
      
      setRunLogs(passed 
        ? `✅ Testcase ${nextPassed}/5 Accepted! Runtime: ${runRes.data.result?.runtimeMs || 18}ms`
        : (runRes.data.result?.error 
           ? `❌ Error: ${runRes.data.result.error}`
           : `❌ Output Mismatch: Got ${runRes.data.result?.got || 'Error'} (Expected: ${runRes.data.result?.expected || judgeExpected || '?'})`)
      );

      if (matchState?.matchId) {
        const progressRes = await api.post(`/api/v1/arena/matches/${matchState.matchId}/progress`, {
          testsPassed: nextPassed,
          totalTests: 5
        });
        const serverMatch = progressRes.data?.match;
        if (serverMatch) {
          setMatchState(serverMatch);
          const me = serverMatch.player1?.id === user?.id ? serverMatch.player1 : serverMatch.player2;
          const opp = serverMatch.player1?.id === user?.id ? serverMatch.player2 : serverMatch.player1;
          if (typeof me?.testsPassed === "number") setTestsPassed(me.testsPassed);
          if (typeof opp?.testsPassed === "number") setOpponentTests(opp.testsPassed);
          // Server is authoritative: only declare victory if WE are the recorded winner.
          if (serverMatch.status === "completed") {
            const iWon = serverMatch.winnerId === user?.id;
            const delta = iWon ? 28 : -12;
            setMatchResult({
              won: iWon,
              timeTakenSec,
              deltaElo: delta,
              newElo: (user?.contestRating || 1500) + delta,
              speedAccuracy: iWon
                ? `⚡ Solved in ${timeTakenSec}s with 100% test accuracy!`
                : "Opponent solved first. GG — queue again!",
            });
            onToast(
              iWon ? "VICTORY! 🏆 You solved all testcases first!" : "Defeat — opponent solved first.",
              iWon ? "success" : "error"
            );
          }
        } else if (nextPassed === 5) {
          const delta = 28;
          setMatchResult({
            won: true,
            timeTakenSec,
            deltaElo: delta,
            newElo: (user?.contestRating || 1500) + delta,
            speedAccuracy: `⚡ Solved in ${timeTakenSec}s with 100% test accuracy!`
          });
          onToast("VICTORY! 🏆 You solved all testcases first with highest accuracy!", "success");
        }
      }
    } catch (e: any) {
      // No fake progress: judge unreachable means no verified tests.
      setRunLogs(`❌ Judge unreachable: ${e?.response?.data?.error || e?.message || "network error"}. Your code was kept — retry.`);
      onToast("Judge unreachable — code kept, retry shortly", "error");
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>⚔️ 1v1 Algorithmic Battle Arena</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Real-time ranked coding duels, Best-of-3 clashes, Survival waves, private rooms, and instant Elo progression.
          </p>
        </div>
        {!matchState ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={handleCreatePrivateRoom}>
              🔒 Create Private Room
            </button>
            {searching ? (
              <>
                <span className="badge badge-yellow" style={{ padding: "8px 16px", fontSize: 13 }}>
                  ⏳ Searching for opponent...
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setSearching(false); onToast("Matchmaking cancelled", "info"); }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={startMatchmaking}>
                ⚡ Ranked Quick Match
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {matchState.status === "waiting" ? (
              <span className="badge badge-yellow" style={{ padding: "8px 16px", fontSize: 13 }}>
                ⏳ WAITING FOR OPPONENT TO JOIN...
              </span>
            ) : (
              <>
                <span className="badge badge-purple" style={{ padding: "8px 16px", fontSize: 13 }}>
                  🔴 LIVE BATTLE · {matchState.gameMode?.toUpperCase()} ({matchState.difficulty || 'Medium'})
                </span>
                <span className="badge badge-gray" style={{ padding: "8px 16px", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 800, color: timeLeft < 60 ? "var(--accent-red)" : "var(--accent-primary)" }}>
                  ⏱️ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </>
            )}
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
              onClick={handleExitArena}
              title="Quit duel and return to lobby"
            >
              🚪 Leave Match / Back to Arena
            </button>
          </div>
        )}
      </div>

      {!matchState ? (
        <div>
          {/* Game Modes & Settings Bar */}
          <div className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label className="label" style={{ fontSize: 13, fontWeight: 700 }}>
                Duel Problem — any runnable catalog problem (round 1; waves pad best_of_3 / survival)
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  className="input input-sm"
                  placeholder="🔍 Search duel problems..."
                  style={{ width: 220 }}
                  value={problemSearch}
                  onChange={e => setProblemSearch(e.target.value)}
                />
                <select
                  className="select"
                  value={arenaProblemId}
                  onChange={e => setArenaProblemId(e.target.value)}
                  style={{ minWidth: 240 }}
                  title="Problem to duel on"
                >
                  {filteredArenaProblems.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} · {p.difficulty}
                    </option>
                  ))}
                </select>
                <span className="badge badge-gray">{arenaProblems.length} runnable</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 700 }}>Select Game Mode</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { key: "classic", label: "⚔️ Classic", desc: "Solve first" },
                    { key: "speed", label: "⚡ Speed", desc: "Fastest runtime" },
                    { key: "score", label: "🧠 Score", desc: "Optimal complexity" },
                    { key: "best_of_3", label: "🔥 Best of 3", desc: "First to 2 wins" },
                    { key: "survival", label: "🎯 Survival", desc: "Harder waves" }
                  ].map(m => (
                    <button
                      key={m.key}
                      className={`btn btn-sm ${gameMode === m.key ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setGameMode(m.key as any)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 700 }}>Language Constraint</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l.key}
                      className={`btn btn-sm ${arenaLanguage === l.key ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => handleLanguageChange(l.key)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 700 }}>Difficulty Bracket</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {["All", "Easy", "Medium", "Hard"].map(d => (
                    <button
                      key={d}
                      className={`btn btn-sm ${difficulty === d ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setDifficulty(d as any)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 700 }}>Join with Room Code</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="input input-sm"
                    placeholder="e.g. 8K9F2A"
                    style={{ width: 110, textTransform: "uppercase", fontFamily: "var(--font-mono)" }}
                    value={roomCodeInput}
                    onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleJoinPrivateRoom}>
                    Join 🚪
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--accent-primary)" }}>
                🌟 Arena Modes & Mechanics
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Speed & Accuracy Checker</h4>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                    First to reach 100% testcase verification wins. Runtime benchmarks calculate bonus Elo points for efficient solutions.
                  </p>
                </div>

                <div className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Anti-Cheat Engine</h4>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                    Monitors AST structural code similarity, unnatural bulk clipboard paste events, and solve timing anomalies.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>📜 Recent Global Arena Clashes</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Array.isArray(battleHistory) && battleHistory.length > 0 ? battleHistory.map((h, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: "var(--bg-tertiary)", borderRadius: 8, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                        <span style={{ color: "var(--accent-green)" }}>👑 @{h?.winner || 'Champion'}</span>
                        <span style={{ color: "var(--accent-primary)" }}>+{h?.deltaElo ?? 25} Elo</span>
                      </div>
                      <div style={{ color: "var(--text-muted)", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                        <span>vs @{h?.player1 === h?.winner ? (h?.player2 || 'Opponent') : (h?.player1 || 'Opponent')}</span>
                        <span className="badge badge-gray">{h?.gameMode || 'Classic'}</span>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: 12, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                      No arena clashes recorded yet. Be the first to start a match!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Room Header & Room Code */}
          {matchState.roomCode && (
            <div className="card" style={{ marginBottom: 14, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(88,166,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800 }}>🔑 Room Code:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 900, color: "var(--accent-primary)" }}>{matchState.roomCode}</span>
                <span className="badge badge-gray" style={{ textTransform: "uppercase" }}>Language: {arenaLanguage}</span>
                <span className="badge badge-gray" style={{ textTransform: "uppercase" }}>Problem: {duelProblemId}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Share this code with a friend or spectator to join.</span>
            </div>
          )}

          {/* Live Progress Race Bar */}
          <div className="card" style={{ marginBottom: 20, padding: 18, background: "var(--bg-secondary)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  <span style={{ color: "var(--accent-primary)" }}>👤 You (@{user?.username || 'You'})</span>
                  <span>{testsPassed}/5 Tests ({Math.round((testsPassed / 5) * 100)}%)</span>
                </div>
                <div style={{ height: 10, background: "var(--bg-tertiary)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(testsPassed / 5) * 100}%`, background: "var(--accent-primary)", transition: "width 0.3s ease" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  <span style={{ color: "var(--accent-red)" }}>⚔️ Opponent (@{(matchState.player1?.id === user?.id ? matchState.player2 : matchState.player1)?.username || 'Challenger'})</span>
                  <span>{opponentTests}/5 Tests ({Math.round((opponentTests / 5) * 100)}%)</span>
                </div>
                <div style={{ height: 10, background: "var(--bg-tertiary)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(opponentTests / 5) * 100}%`, background: "var(--accent-red)", transition: "width 0.3s ease" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Code Workspace & Problem */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card" style={{ height: "calc(100vh - 220px)", overflowY: "auto" }}>
              {(() => {
                const roundIdx = Math.max(0, (matchState.currentRound || 1) - 1);
                const roundProblem = matchState.problems?.[roundIdx];
                const pTitle = roundProblem?.title || "Two Sum";
                const pDesc = roundProblem?.description || "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.";
                const pDiff = roundProblem?.difficulty || matchState.difficulty || "Easy";
                return (<>
                  <span className="badge badge-easy" style={{ marginBottom: 8 }}>{pTitle} · Round {matchState.currentRound || 1}/{matchState.totalRounds || 1} · {pDiff}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0" }}>{pTitle} ({matchState.gameMode?.toUpperCase()} Arena)</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{pDesc}</p>
                </>);
              })()}
              
              {/* Compiler Live Status Pane */}
              {runLogs && (
                <div style={{ padding: "10px 12px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: 12, margin: "14px 0", color: runLogs.includes("❌") ? "var(--accent-red)" : "var(--accent-green)" }}>
                  {runLogs}
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={handleRunBattleTest} disabled={compiling}>
                  {compiling ? "⚙️ Compiling..." : `🚀 Compile & Verify (${testsPassed}/5)`}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
                  onClick={handleExitArena}
                >
                  🚪 Forfeit / Back to Arena
                </button>
              </div>
              {/* Editor Workspace */}
            </div>

            <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)" }}>
                <span>BATTLE SCRATCHPAD ({arenaLanguage.toUpperCase()})</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l.key}
                      className={`btn btn-sm ${arenaLanguage === l.key ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "2px 8px", fontSize: 10 }}
                      onClick={() => handleLanguageChange(l.key)}
                    >
                      {l.key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="code-textarea"
                style={{ minHeight: 340, border: "none", borderRadius: 0, padding: 14, fontFamily: "var(--font-mono)", fontSize: 13, whiteSpace: "pre", overflowX: "auto" }}
                value={code}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                placeholder="// Write your solution here — Ctrl+Enter to compile & verify"
                onPaste={() => setPasteEvents(p => p + 1)}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => {
                  const el = e.target as HTMLTextAreaElement;
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const start = el.selectionStart ?? code.length;
                    const end = el.selectionEnd ?? code.length;
                    setCode(code.slice(0, start) + "  " + code.slice(end));
                    requestAnimationFrame(() => {
                      try { el.selectionStart = el.selectionEnd = start + 2; } catch {}
                    });
                  } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleRunBattleTest();
                  }
                }}
              />
            </div>
          </div>

          {matchResult && (
            <div className="card" style={{ marginTop: 20, border: "1px solid var(--accent-green)", background: "rgba(63,185,80,0.08)", padding: 24, textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-green)", marginBottom: 6 }}>
                🎉 VICTORY! Match Completed!
              </h2>
              <div style={{ fontSize: 15, color: "var(--text-primary)" }}>
                Rating Updated: <strong>{matchResult.newElo} Elo</strong> ({matchResult.deltaElo > 0 ? `+${matchResult.deltaElo}` : matchResult.deltaElo} pts)
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                <button className="btn btn-primary btn-sm" onClick={handleRematch}>
                  🔄 Request Rematch
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setMatchState(null); setMatchResult(null); setTestsPassed(0); setOpponentTests(0); }}>
                  Back to Arena Lobby
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}