import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import logger from "../utils/logger";

let genAI: any = null;
if (env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (error) {
    logger.error("❌ Failed to initialize Google Generative AI SDK:", error);
  }
}

/**
 * Reusable system context to let Gemini be fully aware of the workspace, files, routes, and paths.
 */
const WORKSPACE_CONTEXT = `
--- WEBSITE SYSTEM WORKSPACE ARCHITECTURE ---
You are running as the embedded AI coding assistant inside a highly advanced full-stack DSA (Data Structures and Algorithms) Notebook. You have complete semantic awareness of all routes, controllers, database models, files, folders, and components. If the user asks questions or if you analyze their code, you can refer to or use this full workspace layout:

1. CLIENT-SIDE ROUTING & PAGES (client/src/App.tsx):
   - /                      -> Dashboard (client/src/pages/Dashboard.tsx)
   - /problems              -> AllProblems problem library grid (client/src/pages/AllProblems.tsx)
   - /problems/new          -> NewProblem creation wizard (client/src/pages/NewProblem.tsx)
   - /problems/:id          -> ProblemDetails workspace (client/src/pages/ProblemDetails.tsx)
   - /problems/:id/edit     -> EditProblem editor (client/src/pages/EditProblem.tsx)
   - /ds                    -> DataStructures catalog (client/src/pages/DataStructures.tsx)
   - /algorithms            -> Algorithms catalog (client/src/pages/Algorithms.tsx)
   - /taxonomy              -> TaxonomyExplorer category hub (client/src/pages/TaxonomyExplorer.tsx)
   - /folders               -> FolderExplorer dynamic tree viewer (client/src/pages/FolderExplorer.tsx)
   - /settings              -> InterfaceSettings configuration panel (client/src/pages/Settings.tsx)

2. FRONTEND ARCHITECTURE & DIRECTORIES (client/src/):
   - app/store.ts           -> Global Redux Toolkit Store mapping problems, settings, techniques, and categories.
   - components/            -> Sidebar.tsx, ErrorBoundary.tsx, ToastContainer.tsx, MultiSelect.tsx, ProblemCard.tsx, ProblemExplorer.tsx
   - components/AIAssistantDrawer.tsx -> Glassmorphic floating drawer (your workspace panel!)
   - context/               -> ProblemDetailsContext.tsx, ProblemFormContext.tsx, SettingsContext.tsx
   - features/              -> Redux Slices: problemsSlice.ts, settingsSlice.ts, uiSlice.ts
   - services/              -> aiService.ts (connects backend /api/ai routes), sandboxStore.ts (runs solutions offline in browser sandboxes using IndexedDB caching)
   - layout/ProblemDetails/ -> CodeWorkspace.tsx (Lazy Monaco container), ProblemHeader.tsx, ProblemDescription.tsx, ProblemExplanations.tsx, ProblemFooter.tsx

3. BACKEND SERVICES & DB (server/src/):
   - index.ts               -> Server entrypoint using Express on port 5000 / mounting API routers
   - config/                -> env.ts (validates env variables), db.ts (Mongoose database connection configuration)
   - models/                -> Problem.ts, Settings.ts, Category.ts, Technique.ts (Mongoose collection schemas)
   - controllers/           -> aiController.ts (your backend handler), problemsController.ts, sandboxController.ts (runs JS/Python compilers), settingsController.ts
   - routes/                -> index.ts, aiRoutes.ts, problemsRoutes.ts, settingsRoutes.ts, sandboxRoutes.ts
   - utils/                 -> logger.ts (Winston logging utilities)
`;

/**
 * Executes a text generation prompt by attempting a cascade of Gemini model IDs.
 * This guarantees the application works on all account types, regions, and SDK editions.
 */
const generateWithFallback = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error("Google Generative AI is not initialized. Please verify your GEMINI_API_KEY.");
  }

  // Pre-configured fallback model queue (curated from live API models list query)
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      logger.info(`🤖 Attempting content generation with model target: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        logger.info(`✨ Successfully generated content using model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      logger.warn(`⚠️ Model target [${modelName}] failed. Reason: ${err.message || err}`);
      lastError = err;
      
      if (String(err.message || err).includes("429") || String(err.message || err).includes("quota")) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("Failed to generate content using all fallback models in the stack.");
};

/**
 * Executes a streaming text generation prompt by attempting a cascade of Gemini model IDs.
 * Invokes the onChunk callback with text chunks as they arrive in real-time.
 */
const generateStreamWithFallback = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!genAI) {
    throw new Error("Google Generative AI is not initialized. Please verify your GEMINI_API_KEY.");
  }

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      logger.info(`🤖 Attempting content stream generation with model target: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);
      
      let fullText = "";
      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          fullText += textChunk;
          onChunk(textChunk);
        }
      }
      
      if (fullText) {
        logger.info(`✨ Successfully generated stream using model: ${modelName}`);
        return fullText;
      }
    } catch (err: any) {
      logger.warn(`⚠️ Model target stream [${modelName}] failed. Reason: ${err.message || err}`);
      lastError = err;
      
      if (String(err.message || err).includes("429") || String(err.message || err).includes("quota")) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("Failed to generate stream using all fallback models in the stack.");
};

/**
 * Request AI Review of active code in Monaco
 */
export const reviewCode = async (req: Request, res: Response): Promise<void> => {
  const { problemTitle, problemDescription, code, language } = req.body;

  if (!code || !language) {
    res.status(400).json({ error: "Missing required fields: code and language are required." });
    return;
  }

  if (!env.GEMINI_API_KEY || !genAI) {
    res.json({
      isDemo: true,
      complexity: "Time: O(N) | Space: O(1)",
      correctness: "⚠️ Gemini API Key not set! To unlock live interactive AI reviews, please add `GEMINI_API_KEY=your_google_ai_studio_key` to your server's `.env` file.",
      optimizations: "Once your API key is configured, Gemini will automatically detect logical bugs, identify unhandled extreme inputs, suggest structural optimizations, and provide clean refactored alternatives customized to your solution.",
      alternativeCode: `// Please add GEMINI_API_KEY to your server/.env file\n// Active code language: ${language}\n\n// Current code preview:\n${code.substring(0, 150)}...`
    });
    return;
  }

  try {
    const prompt = `
You are an expert DSA interviewer and compiler optimization assistant.
Analyze the following code submitted for the DSA problem "${problemTitle}".

${WORKSPACE_CONTEXT}

--- PROBLEM DESCRIPTION ---
${problemDescription || "No description provided."}

--- SUBMITTED CODE (${language}) ---
${code}

--- ANALYSIS DIRECTIONS ---
Please provide a highly professional, constructive review divided into exactly four components:
1. Complexity Analysis: State the Time and Space complexity (using Big-O notation) and provide a concise 1-sentence justification.
2. Correctness & Edge Cases: Verify logical correctness. Identify any unhandled edge cases (e.g. empty lists, negative targets, overflows) or syntax errors.
3. Optimizations & Code Quality: Give 2-3 specific refactoring recommendations to improve readability, performance, or memory.
4. Refactored Solution: Provide a complete, fully optimized, clean version of the solution in ${language} implementing your recommendations. Do not include extra conversational text outside the code block.

Return your response in standard JSON format with exactly these four string keys: "complexity", "correctness", "optimizations", "alternativeCode". Ensure the value of "alternativeCode" is pure source code without markdown block backticks around it.
`;

    const responseText = await generateWithFallback(prompt);
    
    // Parse the JSON response safely
    try {
      // Find the first '{' and last '}' in case the model wrapped it in markdown codeblocks
      const startIdx = responseText.indexOf("{");
      const endIdx = responseText.lastIndexOf("}");
      
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = responseText.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonStr);
        res.json(parsed);
      } else {
        throw new Error("Invalid JSON structure in model response");
      }
    } catch (parseError) {
      logger.warn("⚠️ Failed to parse Gemini response as JSON. Sending raw response text instead.", responseText);
      res.json({
        complexity: "Analysis completed.",
        correctness: "Raw analysis received.",
        optimizations: responseText,
        alternativeCode: code
      });
    }
  } catch (error: any) {
    logger.error("❌ Error in Gemini code review:", error);
    
    // Graceful and supportive handler for 429 quota rate-limits on Google's free tier
    const errorStr = String(error.message || error);
    if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("Quota")) {
      res.json({
        complexity: "Rate Limit (429)",
        correctness: "⚠️ Your Gemini API Key is configured and working perfectly! However, Google's Free Tier has temporarily rate-limited your requests (429: Too Many Requests).",
        optimizations: "To resolve this, please wait a minute before requesting another review, or consider checking your plan/quota inside Google AI Studio.",
        alternativeCode: `// Gemini API is temporarily rate-limited (429)\n// Please wait a minute and click 'Analyze Code' again to retry!\n\n// Your current code:\n${code}`
      });
      return;
    }
    
    res.status(500).json({ error: "Failed to communicate with Google Gemini AI. Please check your network and API key." });
  }
};

/**
 * Request streaming AI Review of active code in Monaco using SSE
 */
export const reviewCodeStream = async (req: Request, res: Response): Promise<void> => {
  const { problemTitle, problemDescription, code, language } = req.body;

  if (!code || !language) {
    res.status(400).json({ error: "Missing required fields: code and language are required." });
    return;
  }

  // Setup Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");

  const sendEvent = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  if (!env.GEMINI_API_KEY || !genAI) {
    const mockResponse = {
      complexity: "Time: O(N) | Space: O(1)",
      correctness: "⚠️ Gemini API Key not set! To unlock live interactive AI reviews, please add `GEMINI_API_KEY=your_google_ai_studio_key` to your server's `.env` file.",
      optimizations: "Once your API key is configured, Gemini will automatically detect logical bugs, identify unhandled extreme inputs, suggest structural optimizations, and provide clean refactored alternatives customized to your solution.",
      alternativeCode: `// Please add GEMINI_API_KEY to your server/.env file\n// Active code language: ${language}\n\n// Current code preview:\n${code.substring(0, 150)}...`
    };

    sendEvent("chunk", { chunk: JSON.stringify(mockResponse) });
    sendEvent("done", {});
    res.end();
    return;
  }

  try {
    const prompt = `
You are an expert DSA interviewer and compiler optimization assistant.
Analyze the following code submitted for the DSA problem "${problemTitle}".

${WORKSPACE_CONTEXT}

--- PROBLEM DESCRIPTION ---
${problemDescription || "No description provided."}

--- SUBMITTED CODE (${language}) ---
${code}

--- ANALYSIS DIRECTIONS ---
Please provide a highly professional, constructive review divided into exactly four components:
1. Complexity Analysis: State the Time and Space complexity (using Big-O notation) and provide a concise 1-sentence justification.
2. Correctness & Edge Cases: Verify logical correctness. Identify any unhandled edge cases (e.g. empty lists, negative targets, overflows) or syntax errors.
3. Optimizations & Code Quality: Give 2-3 specific refactoring recommendations to improve readability, performance, or memory.
4. Refactored Solution: Provide a complete, fully optimized, clean version of the solution in ${language} implementing your recommendations. Do not include extra conversational text outside the code block.

Return your response in standard JSON format with exactly these four string keys: "complexity", "correctness", "optimizations", "alternativeCode". Ensure the value of "alternativeCode" is pure source code without markdown block backticks around it.
`;

    await generateStreamWithFallback(prompt, (chunk) => {
      sendEvent("chunk", { chunk });
    });
    
    sendEvent("done", {});
    res.end();
  } catch (error: any) {
    logger.error("❌ Error in Gemini streaming code review:", error);
    
    const errorStr = String(error.message || error);
    if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("Quota")) {
      const rateLimitResponse = {
        complexity: "Rate Limit (429)",
        correctness: "⚠️ Your Gemini API Key is configured and working perfectly! However, Google's Free Tier has temporarily rate-limited your requests (429: Too Many Requests).",
        optimizations: "To resolve this, please wait a minute before requesting another review, or consider checking your plan/quota inside Google AI Studio.",
        alternativeCode: `// Gemini API is temporarily rate-limited (429)\n// Please wait a minute and click 'Analyze Code' again to retry!\n\n// Your current code:\n${code}`
      };
      sendEvent("chunk", { chunk: JSON.stringify(rateLimitResponse) });
      sendEvent("done", {});
      res.end();
      return;
    }
    
    sendEvent("error", { message: "Failed to communicate with Google Gemini AI. Please check your network and API key." });
    res.end();
  }
};

/**
 * Generate progressive, learning-focused hints
 */
export const generateHint = async (req: Request, res: Response): Promise<void> => {
  const { problemTitle, problemDescription, code, language, hintCount = 1 } = req.body;

  if (!env.GEMINI_API_KEY || !genAI) {
    res.json({
      isDemo: true,
      hint: `💡 [Hint #${hintCount}] To enable live progressive hints, configure your \`GEMINI_API_KEY\` in the server's \`.env\` file. In the meantime, remember the general pattern for this problem: think about how a Hash Map or Two Pointers can help minimize traversals!`
    });
    return;
  }

  try {
    const prompt = `
You are a top-tier computer science tutor. A student is trying to solve the DSA problem "${problemTitle}".
They are currently stuck and are requesting Hint #${hintCount} to help them progress.

${WORKSPACE_CONTEXT}

--- PROBLEM DESCRIPTION ---
${problemDescription || "No description provided."}

--- STUDENT'S ACTIVE CODE (${language}) ---
${code || "// No code written yet."}

--- HINT DIRECTIONS ---
Provide Hint #${hintCount} for this problem.
- DO NOT give the full solution or write the completed code.
- Instead, give an incremental, conceptual clue that guides the student to the next step.
- Make the hint progressive: Hint #1 should be high-level conceptual, Hint #2 should highlight data structures or relationships, Hint #3 should guide them on edge cases or loop bounds.
- Keep the response short (2-3 sentences max) and highly encouraging.
`;

    const responseText = await generateWithFallback(prompt);
    res.json({ hint: responseText.trim() });
  } catch (error: any) {
    logger.error("❌ Error in Gemini hint generator:", error);
    
    // Graceful and supportive handler for 429 quota rate-limits on Google's free tier
    const errorStr = String(error.message || error);
    if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("Quota")) {
      res.json({
        hint: "⚠️ Your Gemini API Key is configured and working perfectly, but it has hit Google's Free Tier rate limit (429: Too Many Requests). Please wait a few seconds and try clicking 'Get Next Hint' again!"
      });
      return;
    }
    
    res.status(500).json({ error: "Failed to communicate with Google Gemini AI." });
  }
};

/**
 * Generate progressive, learning-focused hints using SSE stream
 */
export const generateHintStream = async (req: Request, res: Response): Promise<void> => {
  const { problemTitle, problemDescription, code, language, hintCount = 1 } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");

  const sendEvent = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  if (!env.GEMINI_API_KEY || !genAI) {
    const demoHint = `💡 [Hint #${hintCount}] To enable live progressive hints, configure your \`GEMINI_API_KEY\` in the server's \`.env\` file. In the meantime, remember the general pattern for this problem: think about how a Hash Map or Two Pointers can help minimize traversals!`;
    sendEvent("chunk", { chunk: demoHint });
    sendEvent("done", {});
    res.end();
    return;
  }

  try {
    const prompt = `
You are a top-tier computer science tutor. A student is trying to solve the DSA problem "${problemTitle}".
They are currently stuck and are requesting Hint #${hintCount} to help them progress.

${WORKSPACE_CONTEXT}

--- PROBLEM DESCRIPTION ---
${problemDescription || "No description provided."}

--- STUDENT'S ACTIVE CODE (${language}) ---
${code || "// No code written yet."}

--- HINT DIRECTIONS ---
Provide Hint #${hintCount} for this problem.
- DO NOT give the full solution or write the completed code.
- Instead, give an incremental, conceptual clue that guides the student to the next step.
- Make the hint progressive: Hint #1 should be high-level conceptual, Hint #2 should highlight data structures or relationships, Hint #3 should guide them on edge cases or loop bounds.
- Keep the response short (2-3 sentences max) and highly encouraging.
`;

    await generateStreamWithFallback(prompt, (chunk) => {
      sendEvent("chunk", { chunk });
    });
    
    sendEvent("done", {});
    res.end();
  } catch (error: any) {
    logger.error("❌ Error in Gemini hint streaming:", error);
    
    const errorStr = String(error.message || error);
    if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("Quota")) {
      sendEvent("chunk", { chunk: "⚠️ Your Gemini API Key is configured and working perfectly, but it has hit Google's Free Tier rate limit (429: Too Many Requests). Please wait a few seconds and try clicking 'Get Next Hint' again!" });
      sendEvent("done", {});
      res.end();
      return;
    }
    
    sendEvent("error", { message: "Failed to communicate with Google Gemini AI." });
    res.end();
  }
};
