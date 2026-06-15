import type { PrdOutput } from "./validator";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  prd?: PrdOutput;
}

interface PrdVersion {
  id: number;
  prd: PrdOutput;
  prompt: string;
  timestamp: number;
}

interface GenerateRequest {
  problemStatement: string;
  messages?: ChatMessage[];
  currentPrd?: PrdOutput;
  refineAction?: "add_metrics" | "expand_edge_cases" | "exec_ready" | null;
}

export type { ChatMessage, PrdVersion, GenerateRequest };
