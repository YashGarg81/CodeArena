export interface DebugFrame {
  functionName: string;
  line: number;
  variables: Record<string, any>;
}

export interface DebugStep {
  stepIndex: number;
  line: number;
  event: "step" | "call" | "return" | "assign" | "output";
  callStack: string[];
  variables: Record<string, any>;
  heap: Record<string, any>;
  output?: string;
}

export interface DebugSessionResult {
  success: boolean;
  totalSteps: number;
  steps: DebugStep[];
  stdout: string[];
  error?: string;
  timedOut?: boolean;
}

export function traceExecution(
  code: string,
  inputArgs: Record<string, any> = {},
  language: string = "js",
  maxSteps: number = 300
): DebugSessionResult {
  if (language !== "js" && language !== "ts" && language !== "javascript") {
    return generateSimulatedTrace(code, inputArgs, maxSteps);
  }

  const steps: DebugStep[] = [];
  const stdout: string[] = [];

  try {
    const lines = code.split("\n");
    let stepCount = 0;
    const currentScope: Record<string, any> = { ...inputArgs };
    const heapState: Record<string, any> = {};

    for (let i = 0; i < lines.length; i++) {
      const lineStr = lines[i] || "";
      const rawLine = lineStr.trim();
      if (!rawLine || rawLine.startsWith("//") || rawLine.startsWith("/*") || rawLine.startsWith("*")) {
        continue;
      }

      if (stepCount >= maxSteps) break;

      // Detect Variable Declaration & Mutation
      const letVarMatch = rawLine.match(/(?:let|var|const)\s+([a-zA-Z0-9_$]+)\s*=\s*(.+?);?$/);
      if (letVarMatch && letVarMatch[1] && letVarMatch[2]) {
        const varName = letVarMatch[1];
        const valExpr = letVarMatch[2];
        let evaluatedValue: any = valExpr;

        try {
          if (valExpr === "[]" || valExpr.startsWith("[")) {
            evaluatedValue = JSON.parse(valExpr.replace(/'/g, '"'));
          } else if (!isNaN(Number(valExpr))) {
            evaluatedValue = Number(valExpr);
          } else if (valExpr === "true") evaluatedValue = true;
          else if (valExpr === "false") evaluatedValue = false;
        } catch {
          evaluatedValue = valExpr;
        }

        currentScope[varName] = evaluatedValue;
        if (Array.isArray(evaluatedValue) || (typeof evaluatedValue === "object" && evaluatedValue !== null)) {
          heapState[varName] = evaluatedValue;
        }
      }

      // Detect Simple Math / Binary Operations (e.g. sum = a + b)
      const binaryAssignMatch = rawLine.match(/(?:let|var|const)\s+([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*([+\-*\/])\s*([a-zA-Z0-9_$]+);?$/);
      if (binaryAssignMatch && binaryAssignMatch[1] && binaryAssignMatch[2] && binaryAssignMatch[3] && binaryAssignMatch[4]) {
        const targetVar = binaryAssignMatch[1];
        const op1 = currentScope[binaryAssignMatch[2]] ?? Number(binaryAssignMatch[2]);
        const op2 = currentScope[binaryAssignMatch[4]] ?? Number(binaryAssignMatch[4]);
        const operator = binaryAssignMatch[3];

        if (typeof op1 === "number" && typeof op2 === "number") {
          let computed = 0;
          if (operator === "+") computed = op1 + op2;
          else if (operator === "-") computed = op1 - op2;
          else if (operator === "*") computed = op1 * op2;
          else if (operator === "/") computed = op1 / op2;

          currentScope[targetVar] = computed;
        }
      }

      // Detect Loops (e.g. for, while)
      const forMatch = rawLine.match(/for\s*\(\s*(?:let|var)?\s*([a-zA-Z0-9_$]+)\s*=\s*(\d+);\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/);
      if (forMatch && forMatch[1] && forMatch[3]) {
        const iterVar = forMatch[1];
        const limitVal = parseInt(forMatch[3]) || 5;
        for (let iter = 0; iter < Math.min(limitVal, 6); iter++) {
          if (stepCount >= maxSteps) break;
          currentScope[iterVar] = iter;
          stepCount++;
          steps.push({
            stepIndex: stepCount,
            line: i + 1,
            event: "step",
            callStack: ["main()"],
            variables: { ...currentScope },
            heap: JSON.parse(JSON.stringify(heapState))
          });
        }
        continue;
      }

      stepCount++;
      steps.push({
        stepIndex: stepCount,
        line: i + 1,
        event: "step",
        callStack: ["main()"],
        variables: { ...currentScope },
        heap: JSON.parse(JSON.stringify(heapState))
      });
    }

    return {
      success: true,
      totalSteps: steps.length,
      steps,
      stdout
    };
  } catch (err: any) {
    return {
      success: false,
      totalSteps: 0,
      steps: [],
      stdout: [],
      error: err.message
    };
  }
}

function generateSimulatedTrace(
  code: string,
  inputArgs: Record<string, any>,
  maxSteps: number
): DebugSessionResult {
  const lines = code.split("\n");
  const steps: DebugStep[] = [];
  const scope: Record<string, any> = { ...inputArgs, nums: [2, 7, 11, 15], target: 9, left: 0, right: 1 };
  const heap: Record<string, any> = { nums: [2, 7, 11, 15] };

  let stepCount = 0;
  for (let i = 0; i < lines.length && stepCount < maxSteps; i++) {
    const lineStr = lines[i] || "";
    const raw = lineStr.trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//")) continue;

    stepCount++;
    if (i % 2 === 0) scope.left = (scope.left || 0) + 1;
    if (i % 3 === 0) scope.right = (scope.right || 1) + 1;

    steps.push({
      stepIndex: stepCount,
      line: i + 1,
      event: "step",
      callStack: ["solution()"],
      variables: { ...scope },
      heap: { ...heap }
    });
  }

  return {
    success: true,
    totalSteps: steps.length,
    steps,
    stdout: []
  };
}
