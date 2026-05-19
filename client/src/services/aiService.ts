import api from "./api";

export interface AIReviewResponse {
  isDemo?: boolean;
  complexity: string;
  correctness: string;
  optimizations: string;
  alternativeCode: string;
}

export interface AIHintResponse {
  isDemo?: boolean;
  hint: string;
}

/**
 * Send active solution code for structural review and complexity analysis (Traditional Request)
 */
export const requestAIReview = async (
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string
): Promise<AIReviewResponse> => {
  const response = await api.post<AIReviewResponse>("/ai/review", {
    problemTitle,
    problemDescription,
    code,
    language,
  });
  return response.data;
};

/**
 * Fetch a progressive hint for the current problem (Traditional Request)
 */
export const requestAIHint = async (
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string,
  hintCount: number
): Promise<AIHintResponse> => {
  const response = await api.post<AIHintResponse>("/ai/hint", {
    problemTitle,
    problemDescription,
    code,
    language,
    hintCount,
  });
  return response.data;
};

/**
 * Request streaming AI Review of active code in Monaco using fetch and readable streams
 */
export const requestAIReviewStream = async (
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: any) => void
): Promise<void> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}/ai/review/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problemTitle,
        problemDescription,
        code,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize streaming code review (HTTP ${response.status})`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      throw new Error("Response body is not readable.");
    }

    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep the last partial line in buffer

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned.startsWith("data: ")) continue;

        try {
          const parsed = JSON.parse(cleaned.substring(6));
          if (parsed.type === "chunk" && parsed.chunk) {
            onChunk(parsed.chunk);
          } else if (parsed.type === "done") {
            onDone();
            return;
          } else if (parsed.type === "error") {
            onError(new Error(parsed.message || "Failed to generate stream."));
            return;
          }
        } catch (e) {
          // Keep parser stable
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err);
  }
};

/**
 * Fetch progressive streaming hint for the current problem
 */
export const requestAIHintStream = async (
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string,
  hintCount: number,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: any) => void
): Promise<void> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}/ai/hint/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problemTitle,
        problemDescription,
        code,
        language,
        hintCount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize streaming tutor hint (HTTP ${response.status})`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      throw new Error("Response body is not readable.");
    }

    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned.startsWith("data: ")) continue;

        try {
          const parsed = JSON.parse(cleaned.substring(6));
          if (parsed.type === "chunk" && parsed.chunk) {
            onChunk(parsed.chunk);
          } else if (parsed.type === "done") {
            onDone();
            return;
          } else if (parsed.type === "error") {
            onError(new Error(parsed.message || "Failed to generate hint stream."));
            return;
          }
        } catch (e) {
          // Keep parser stable
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err);
  }
};
