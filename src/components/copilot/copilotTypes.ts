import type { MatchedVehicle } from "../../api/copilot";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  vehicles?: MatchedVehicle[];
  timestamp: number;
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}
