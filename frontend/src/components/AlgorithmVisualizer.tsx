// frontend/src/components/AlgorithmVisualizer.tsx
import React, { useState, useEffect, useRef } from "react";

export type AlgorithmType = "sorting" | "tree" | "graph" | "dp";

interface Step {
  description: string;
  array?: number[];
  highlights?: number[];
  swaps?: number[];
  sorted?: number[];
  treeNodes?: Array<{ id: number; val: number; state?: "visited" | "current" | "target" }>;
  grid?: number[][];
  activeCell?: [number, number];
}

export function AlgorithmVisualizer({ defaultType = "sorting" }: { defaultType?: AlgorithmType }) {
  const [activeTab, setActiveTab] = useState<AlgorithmType>(defaultType);
  const [arraySize, setArraySize] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(300); // ms per step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<string>("bubble");

  const timerRef = useRef<any>(null);

  // Generate initial random sorting array & steps
  const generateSortingSteps = (algo: string, size: number) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 15);
    const newSteps: Step[] = [{ description: "Initial unsorted array", array: [...arr], highlights: [] }];

    const a: number[] = [...arr];
    if (algo === "bubble") {
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          const valJ: number = a[j]!;
          const valJ1: number = a[j + 1]!;
          newSteps.push({
            description: `Comparing elements at index ${j} (${valJ}) and ${j + 1} (${valJ1})`,
            array: [...a],
            highlights: [j, j + 1]
          });
          if (valJ > valJ1) {
            const temp: number = valJ;
            a[j] = valJ1;
            a[j + 1] = temp;
            newSteps.push({
              description: `Swapped index ${j} and ${j + 1}`,
              array: [...a],
              swaps: [j, j + 1]
            });
          }
        }
      }
      newSteps.push({ description: "Array fully sorted!", array: [...a], highlights: [], sorted: a.map((_, idx) => idx) });
    } else if (algo === "quick") {
      const quickSort = (l: number, r: number) => {
        if (l >= r) return;
        const pivot: number = a[r]!;
        newSteps.push({ description: `Chosen pivot: ${pivot} at index ${r}`, array: [...a], highlights: [r] });
        let i = l - 1;
        for (let j = l; j < r; j++) {
          const valJ: number = a[j]!;
          newSteps.push({ description: `Comparing element ${valJ} with pivot ${pivot}`, array: [...a], highlights: [j, r] });
          if (valJ < pivot) {
            i++;
            const valI: number = a[i]!;
            a[i] = valJ;
            a[j] = valI;
            newSteps.push({ description: `Swapping ${valI} and ${valJ}`, array: [...a], swaps: [i, j] });
          }
        }
        const valI1: number = a[i + 1]!;
        a[i + 1] = pivot;
        a[r] = valI1;
        const pIdx = i + 1;
        newSteps.push({ description: `Placed pivot ${pivot} at index ${pIdx}`, array: [...a], swaps: [pIdx, r] });
        quickSort(l, pIdx - 1);
        quickSort(pIdx + 1, r);
      };
      quickSort(0, a.length - 1);
      newSteps.push({ description: "QuickSort Complete!", array: [...a], sorted: a.map((_, idx) => idx) });
    }
    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  // Generate DP Table steps (Fibonacci / Knapsack DP)
  const generateDPSteps = () => {
    const n = 6;
    const grid: number[] = [0, 1, 0, 0, 0, 0, 0];
    const newSteps: Step[] = [
      { description: "Base Case: DP[0] = 0, DP[1] = 1", grid: [[0, 1, 0, 0, 0, 0, 0]], activeCell: [0, 1] }
    ];
    for (let i = 2; i <= n; i++) {
      const prev1: number = grid[i - 1]!;
      const prev2: number = grid[i - 2]!;
      grid[i] = prev1 + prev2;
      newSteps.push({
        description: `DP[${i}] = DP[${i - 1}] (${prev1}) + DP[${i - 2}] (${prev2}) = ${grid[i]}`,
        grid: [[...grid]],
        activeCell: [0, i]
      });
    }
    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    if (activeTab === "sorting") {
      generateSortingSteps(selectedAlgo, arraySize);
    } else if (activeTab === "dp") {
      generateDPSteps();
    }
  }, [activeTab, selectedAlgo, arraySize]);

  // Animation controller
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, speed);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStepIndex, steps, speed]);

  const currentStep = steps[currentStepIndex] || { description: "Ready", array: [] };

  return (
    <div className="algo-visualizer-container" style={{ padding: 24, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>✨ Interactive Algorithm Visualizer</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Explore step-by-step state animations for algorithms and data structures</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: 6, background: "var(--bg-card-hover)", padding: 4, borderRadius: 8 }}>
          {(["sorting", "dp"] as AlgorithmType[]).map(t => (
            <button
              key={t}
              className={`btn btn-sm ${activeTab === t ? "btn-primary" : "btn-ghost"}`}
              style={{ textTransform: "capitalize", fontSize: 12 }}
              onClick={() => { setActiveTab(t); setIsPlaying(false); }}
            >
              {t === "sorting" ? "📊 Sorting Algorithms" : "🧩 Dynamic Programming"}
            </button>
          ))}
        </div>
      </div>

      {/* Control Toolbar */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", padding: 14, background: "var(--bg-secondary)", borderRadius: 8, marginBottom: 20 }}>
        {activeTab === "sorting" && (
          <>
            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Algorithm:</span>
              <select className="select select-sm" value={selectedAlgo} onChange={e => { setSelectedAlgo(e.target.value); setIsPlaying(false); }}>
                <option value="bubble">Bubble Sort O(N²)</option>
                <option value="quick">Quick Sort O(N log N)</option>
              </select>
            </label>

            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Size ({arraySize}):</span>
              <input type="range" min="5" max="20" value={arraySize} onChange={e => setArraySize(Number(e.target.value))} />
            </label>
          </>
        )}

        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <span>Speed:</span>
          <select className="select select-sm" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
            <option value="600">0.5x (Slow)</option>
            <option value="300">1.0x (Normal)</option>
            <option value="100">3.0x (Fast)</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStepIndex(0)} disabled={isPlaying}>⏮ Reset</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStepIndex(s => Math.max(0, s - 1))} disabled={isPlaying || currentStepIndex === 0}>◀ Prev</button>
          <button className={`btn btn-sm ${isPlaying ? "btn-secondary" : "btn-primary"}`} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "⏸ Pause" : "▶ Play Animation"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStepIndex(s => Math.min(steps.length - 1, s + 1))} disabled={isPlaying || currentStepIndex === steps.length - 1}>Next ▶</button>
        </div>
      </div>

      {/* Description Banner */}
      <div style={{ padding: "10px 14px", background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid #3b82f6", borderRadius: 4, fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
        Step {currentStepIndex + 1} of {steps.length}: {currentStep.description}
      </div>

      {/* Canvas / Visualization Area */}
      <div style={{ height: 260, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, padding: "20px 0", borderBottom: "1px solid var(--border-color)" }}>
        {activeTab === "sorting" && currentStep.array?.map((val, idx) => {
          const isHighlight = currentStep.highlights?.includes(idx);
          const isSwap = currentStep.swaps?.includes(idx);
          const isSorted = currentStep.sorted?.includes(idx);
          const bgColor = isSwap ? "#ef4444" : isHighlight ? "#f59e0b" : isSorted ? "#10b981" : "#3b82f6";

          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 36 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{val}</span>
              <div
                style={{
                  width: "100%",
                  height: `${val * 2.4}px`,
                  background: bgColor,
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.2s ease"
                }}
              />
            </div>
          );
        })}

        {activeTab === "dp" && currentStep.grid?.[0]?.map((val, idx) => {
          const isActive = currentStep.activeCell?.[1] === idx;
          return (
            <div
              key={idx}
              style={{
                width: 60,
                height: 60,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "rgba(16, 185, 129, 0.2)" : "var(--bg-secondary)",
                border: `2px solid ${isActive ? "#10b981" : "var(--border-color)"}`,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16
              }}
            >
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>DP[{idx}]</span>
              <span>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
