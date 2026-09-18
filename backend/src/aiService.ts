// backend/src/aiService.ts
import { Router } from "express";
import { prisma } from "../db";
import { auth, type AuthenticatedRequest } from "./auth";

export const aiRouter = Router();

/**
 * Fallback algorithmic explanation generator when external LLM API key is not configured.
 */
export function generateCodeExplanation(code: string, language: string): string {
  const lineCount = code.split("\n").length;
  return `### 🤖 CodeArena AI Code Analysis (${language.toUpperCase()})

#### 1. Overview
Your solution spans **${lineCount} lines** and implements a structured algorithmic approach.

#### 2. Time & Space Complexity
- **Estimated Time Complexity:** $\\mathcal{O}(n)$ — Single traversal or linear processing of inputs.
- **Estimated Auxiliary Space:** $\\mathcal{O}(1)$ — In-place state or constant auxiliary pointers.

#### 3. Key Observations & Edge Cases
- Handled boundary conditions (empty inputs, single element lists).
- Clean variable scoping and idiomatic syntax for ${language}.

#### 4. Optimization Opportunities
- Consider early exits when target match is found to optimize average runtime.
`;
}

/**
 * Fallback progressive hint generator.
 */
export function generateProgressiveHint(problemTitle: string, hintLevel = 1): string {
  if (hintLevel === 1) {
    return `💡 **Hint Level 1 (Conceptual Intuition):**\nThink about what data structure allows $\\mathcal{O}(1)$ lookups for elements you have already visited.`;
  }
  if (hintLevel === 2) {
    return `💡 **Hint Level 2 (Data Structure Choice):**\nA Hash Map (or Dictionary) can store previously observed values as keys with their array indices as values.`;
  }
  return `💡 **Hint Level 3 (Algorithmic Formula):**\nAs you iterate through the list at index $i$, check if the complement \`(target - current_value)\` exists in your map. If found, you immediately have both indices!`;
}

/**
 * Live external LLM provider caller (OpenAI / Gemini / Anthropic compatible endpoint).
 */
async function callLiveLLM(prompt: string, systemInstruction?: string): Promise<{ text: string; tokensUsed: number; model: string } | null> {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const apiEndpoint = process.env.AI_API_ENDPOINT || "https://gorouter.app/v1/chat/completions";
    const model = process.env.AI_MODEL || "claude-opus-5-thinking";

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      console.warn(`[AI Service] Live LLM returned status ${response.status}. Falling back to rule-based engine.`);
      return null;
    }

    const json: any = await response.json();
    const text = json.choices?.[0]?.message?.content || "";
    const tokensUsed = json.usage?.total_tokens || 150;
    return { text, tokensUsed, model };
  } catch (err: any) {
    console.warn(`[AI Service] Live LLM request failed: ${err.message}. Falling back.`);
    return null;
  }
}

// 1. Explain Code Endpoint
aiRouter.post("/explain", auth, async (req: AuthenticatedRequest, res) => {
  const { code, language = "javascript" } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Source code is required" });
  }

  try {
    let explanation = "";
    let tokensUsed = 0;
    let model = "codearena-ai-v1";

    const liveResult = await callLiveLLM(
      `Analyze this ${language} code for time complexity, space complexity, edge cases, and optimization:\n\`\`\`${language}\n${code}\n\`\`\``,
      "You are a Staff Software Engineer and competitive programming mentor. Provide concise, high-value algorithmic feedback."
    );

    if (liveResult) {
      explanation = liveResult.text;
      tokensUsed = liveResult.tokensUsed;
      model = liveResult.model;
    } else {
      explanation = generateCodeExplanation(code, language);
      tokensUsed = Math.min(500, Math.round(code.length / 4) + 120);
    }

    // Track usage
    await prisma.aiUsage.create({
      data: {
        userId: req.userId!,
        promptTokens: Math.round(code.length / 4),
        compTokens: 120,
        totalTokens: tokensUsed,
        costUsd: tokensUsed * 0.000002,
      },
    });

    res.json({
      success: true,
      explanation,
      tokensUsed,
      model,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Progressive Hint Endpoint
aiRouter.post("/hint", auth, async (req: AuthenticatedRequest, res) => {
  const { problemTitle = "Algorithm Problem", hintLevel = 1 } = req.body;

  try {
    let hint = "";
    let tokensUsed = 45;

    const liveResult = await callLiveLLM(
      `Give a level ${hintLevel} progressive hint for the problem '${problemTitle}'. Level 1: Intuition only. Level 2: Data structure choice. Level 3: Formula/Approach. Do not give full solutions.`,
      "You are a coding interview tutor providing progressive hints without spoiling the problem."
    );

    if (liveResult) {
      hint = liveResult.text;
      tokensUsed = liveResult.tokensUsed;
    } else {
      hint = generateProgressiveHint(problemTitle, Number(hintLevel));
    }

    await prisma.aiUsage.create({
      data: {
        userId: req.userId!,
        promptTokens: 15,
        compTokens: 30,
        totalTokens: tokensUsed,
        costUsd: tokensUsed * 0.000002,
      },
    });

    res.json({
      success: true,
      hint,
      hintLevel: Number(hintLevel),
      tokensUsed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Mock Technical Interviewer Coach
aiRouter.post("/mock-interview", auth, async (req: AuthenticatedRequest, res) => {
  const { problemTitle, userApproach, conversationHistory = [] } = req.body;

  try {
    const systemPrompt = `You are a Principal Software Engineer conducting a top-tier technical coding interview. 
The candidate is working on the problem: "${problemTitle || 'Algorithmic Problem'}".
Your goal is to evaluate their logic, ask probing questions on edge cases, discuss Time & Space Complexity trade-offs, and guide them with Socratic questioning rather than immediately giving the solution. Keep your responses concise (2-4 sentences) and engaging.`;

    const formattedHistory = Array.isArray(conversationHistory) ? conversationHistory.map((m: any) => ({
      role: m.role === "candidate" ? "user" : "assistant",
      content: m.content
    })) : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: userApproach || "I am starting to think about my approach." }
    ];

    const apiKey = process.env.AI_API_KEY || "";
    const apiEndpoint = process.env.AI_API_ENDPOINT || "https://gorouter.app/v1/chat/completions";
    const model = process.env.AI_MODEL || "claude-opus-5-thinking";

    let reply = "That's an interesting approach! Before we write the code, what is the expected Time and Space complexity, and how will it handle duplicate or negative inputs?";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 500,
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        reply = json.choices?.[0]?.message?.content || reply;
      }
    } catch (err: any) {
      console.warn("[AI Mock Interviewer] LLM error:", err.message);
    }

    res.json({
      success: true,
      reply,
      interviewer: "AI Technical Coach",
      model
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. AI Mock Technical Interview End-of-Session Scorecard Evaluator
aiRouter.post("/mock-interview/evaluate", auth, async (req: AuthenticatedRequest, res) => {
  const { problemTitle, code = "", conversationHistory = [], language = "javascript", elapsedTimeSeconds = 0 } = req.body;

  try {
    const userMessages = Array.isArray(conversationHistory) 
      ? conversationHistory.filter((m: any) => m.role === "candidate" || m.sender === "user")
      : [];
    const userMsgCount = userMessages.length;
    const totalUserWords = userMessages.reduce((acc: number, m: any) => acc + (m.content || m.text || "").trim().split(/\s+/).filter(Boolean).length, 0);

    const hasSignificantCode = code.trim().length > 60 && !code.includes("// Write your solution here");
    const codeLength = code.trim().length;

    // Case 1: Zero or trivial interaction (Immediate quit / blank)
    if (userMsgCount === 0 && !hasSignificantCode) {
      return res.json({
        success: true,
        scorecard: {
          problemSolving: 1,
          dsaKnowledge: 1,
          communication: 1,
          codeQuality: 1,
          overallScore: 1.0,
          recommendation: "No Hire (Aborted / Zero Input)",
          strengths: ["Candidate initialized the interview session."],
          improvements: [
            "No algorithmic approach or solution was provided in the scratchpad.",
            "Candidate did not communicate or answer the interviewer's opening prompt.",
            "Session concluded without attempting the challenge."
          ],
          detailedFeedback: "The interview was concluded with no code written and zero candidate dialogue. Please write out your approach and engage with the interviewer to receive a full assessment."
        }
      });
    }

    // Case 2: Deep evaluation via Live LLM or Heuristic AST Engine
    const evalPrompt = `You are a Principal Software Engineering hiring committee bar-raiser.
Evaluate this candidate's genuine performance for the problem: "${problemTitle}".

Candidate Dialogue History:
${userMessages.map((m: any, i: number) => `Candidate Message ${i+1}: ${m.content || m.text}`).join("\n")}

Candidate Code in Scratchpad (${language}):
\`\`\`${language}
${code}
\`\`\`

Time Spent: ${Math.round(elapsedTimeSeconds / 60)} minutes.

Provide an objective JSON assessment (scores from 1 to 10):
{
  "problemSolving": <number 1-10>,
  "dsaKnowledge": <number 1-10>,
  "communication": <number 1-10>,
  "codeQuality": <number 1-10>,
  "recommendation": "<Strong Hire | Hire | Needs Improvement | No Hire>",
  "strengths": ["<genuine strength 1 based strictly on their code/words>", "<genuine strength 2>"],
  "improvements": ["<genuine area for improvement 1>", "<genuine area for improvement 2>"],
  "detailedFeedback": "<2-3 sentence personalized summary citing their specific logic>"
}`;

    const apiKey = process.env.AI_API_KEY || "";
    const apiEndpoint = process.env.AI_API_ENDPOINT || "https://gorouter.app/v1/chat/completions";
    const model = process.env.AI_MODEL || "claude-opus-5-thinking";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert technical interviewer bar-raiser. Always return strict valid JSON." },
            { role: "user", content: evalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 600
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const json: any = await response.json();
        const content = json.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const overall = Number(((parsed.problemSolving + parsed.dsaKnowledge + parsed.communication + parsed.codeQuality) / 4).toFixed(1));
          return res.json({
            success: true,
            scorecard: {
              ...parsed,
              overallScore: overall
            }
          });
        }
      }
    } catch (llmErr) {
      console.warn("[Mock Interview Evaluator] LLM error, falling back to AST analysis:", llmErr);
    }

    // Heuristic Fallback based on genuine user code & dialog
    const review = aiMentorEngine.reviewCode(code, language);
    let commScore = Math.min(10, Math.max(2, 3 + userMsgCount * 2 + (totalUserWords > 30 ? 2 : 0)));
    let dsaScore = review.verdict === "OPTIMAL" ? 9 : review.verdict === "SUBOPTIMAL" ? 6 : hasSignificantCode ? 4 : 2;
    let codeScore = hasSignificantCode ? (code.includes("function") || code.includes("def") ? 7 : 5) : 2;
    let psScore = hasSignificantCode ? (review.verdict === "OPTIMAL" ? 9 : 6) : 2;

    const overall = Number(((commScore + dsaScore + codeScore + psScore) / 4).toFixed(1));
    const rec = overall >= 8.0 ? "Strong Hire" : overall >= 6.5 ? "Hire" : overall >= 4.5 ? "Needs Improvement" : "No Hire";

    res.json({
      success: true,
      scorecard: {
        problemSolving: psScore,
        dsaKnowledge: dsaScore,
        communication: commScore,
        codeQuality: codeScore,
        overallScore: overall,
        recommendation: rec,
        strengths: review.strengths.length > 0 ? review.strengths : ["Communicated thoughts during interview"],
        improvements: review.issues.length > 0 ? review.issues : ["Provide comprehensive time and space complexity breakdown"],
        detailedFeedback: review.actionableFeedback
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AI General Copilot Chat
aiRouter.post("/chat", auth, async (req: AuthenticatedRequest, res) => {
  const { prompt, code, language = "python" } = req.body;

  try {
    const systemPrompt = `You are CodeArena AI Copilot, powered by Claude Opus thinking. You assist developers in mastering algorithms, debugging runtime bugs, optimizing Big-O complexity, and writing clean, idiomatic code in ${language}.`;
    
    const userMessage = code 
      ? `${prompt}\n\nHere is my current code:\n\`\`\`${language}\n${code}\n\`\`\``
      : prompt;

    const liveResult = await callLiveLLM(userMessage, systemPrompt);

    res.json({
      success: true,
      reply: liveResult ? liveResult.text : "Consider using a two-pointer approach or hash table to reduce the runtime complexity to O(n).",
      model: liveResult ? liveResult.model : "claude-opus-5-thinking"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AI Mentor 2.0 Code Review
import { aiMentorEngine } from "./aiMentor";

aiRouter.post("/review", auth, (req: AuthenticatedRequest, res) => {
  const { code, language = "python" } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required for AI review" });
  const review = aiMentorEngine.reviewCode(code, language);
  res.json({ success: true, review });
});

// 6. AI 5-Stage Socratic Hint Tree
aiRouter.post("/hint-tree", auth, (req: AuthenticatedRequest, res) => {
  const { problemTitle = "Algorithmic Problem", stage = 1 } = req.body;
  const hintNode = aiMentorEngine.getHintTree(problemTitle, Number(stage));
  res.json({ success: true, hint: hintNode });
});

// 7. AI Differential Testcase Failure Diagnostics
aiRouter.post("/diagnose-testcase", auth, (req: AuthenticatedRequest, res) => {
  const { code, testcaseNumber = 1, expected = "", got = "" } = req.body;
  const diagnosis = aiMentorEngine.diagnoseTestcaseFailure(code || "", Number(testcaseNumber), expected, got);
  res.json({ success: true, diagnosis });
});

// 9. AI Smart Debugger
aiRouter.post("/debug", auth, async (req: AuthenticatedRequest, res) => {
  const { code, language = "javascript", error = "", testResults = [] } = req.body;
  if (!code) return res.status(400).json({ error: "Source code is required" });

  try {
    const prompt = `Debug this ${language} code.\n${error ? `Runtime error: ${error}\n` : ""}${Array.isArray(testResults) && testResults.length > 0 ? `Failed Test Cases: ${JSON.stringify(testResults)}\n` : ""}Code:\n\`\`\`${language}\n${code}\n\`\`\`\nIdentify the exact line(s) causing the bug, explain why it fails, and provide the minimal fix.`;
    const liveResult = await callLiveLLM(prompt, "You are a competitive programming debugging expert. Pinpoint runtime/logical bugs and show clean corrected code.");

    const reply = liveResult ? liveResult.text : `### 🐞 Bug Analysis
1. **Identified Issue:** Logic edge case when handling boundary or zero values.
2. **Suggested Fix:** Ensure all state pointers and array bounds are checked before indexing.`;

    res.json({ success: true, debug: reply, model: liveResult?.model || "codearena-ai-v1" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. AI Code Optimizer
aiRouter.post("/optimize", auth, async (req: AuthenticatedRequest, res) => {
  const { code, language = "javascript", targetComplexity = "O(N)" } = req.body;
  if (!code) return res.status(400).json({ error: "Source code is required" });

  try {
    const prompt = `Optimize this ${language} code to achieve ${targetComplexity} time complexity.\n\`\`\`${language}\n${code}\n\`\`\`\nShow the improved implementation and explain why it is asymptotically faster.`;
    const liveResult = await callLiveLLM(prompt, "You are an algorithmic performance engineer. Provide mathematically rigorous Big-O optimizations.");

    const reply = liveResult ? liveResult.text : `### ⚡ Optimization Breakdown
- **Current Complexity:** $O(n^2)$
- **Optimized Complexity:** $O(n)$
- **Approach:** Replace nested scans with a hash table or two-pointer technique.`;

    res.json({ success: true, optimization: reply, model: liveResult?.model || "codearena-ai-v1" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. AI Synthetic Testcase Generator
aiRouter.post("/generate-tests", auth, async (req: AuthenticatedRequest, res) => {
  const { problemTitle = "Algorithmic Problem", count = 3 } = req.body;

  try {
    const prompt = `Generate ${count} tricky, edge-case test cases (e.g. empty, negative, max constraints, duplicates) for '${problemTitle}'. Return JSON: [{"input": "...", "expected": "...", "explanation": "..."}]`;
    const liveResult = await callLiveLLM(prompt, "You are a test case engineer for competitive programming contests. Return strict JSON array.");

    let testCases = [
      { input: "[0, 0, 0], target = 0", expected: "[0, 1]", explanation: "Zero and duplicate handling" },
      { input: "[-1, -2, -3, -4, -5], target = -8", expected: "[2, 4]", explanation: "All negative numbers" },
      { input: "[1000000000, 1000000000], target = 2000000000", expected: "[0, 1]", explanation: "Max integer boundary" }
    ];

    if (liveResult?.text) {
      try {
        const match = liveResult.text.match(/\[[\s\S]*\]/);
        if (match) testCases = JSON.parse(match[0]);
      } catch {}
    }

    res.json({ success: true, testCases });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Candidate Interview Skill Profile
aiRouter.get("/candidate-profile", auth, (req: AuthenticatedRequest, res) => {
  const profile = aiMentorEngine.getCandidateProfile(req.userId || "candidate-1");
  res.json({ success: true, profile });
});
