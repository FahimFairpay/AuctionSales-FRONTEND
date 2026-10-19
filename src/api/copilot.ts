import { apiRequest, withAuthHeaders } from "./client";
import { apiBaseUrl } from "../config";
import { getIdToken } from "../auth/session";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export interface MatchedVehicle {
  stockNumber: string;
  year?: number;
  make?: string;
  model?: string;
  series?: string;
  currentBid?: number;
  acv?: number;
  spread?: number;
  spreadPct?: string;
  hasActiveBids?: boolean;
  primaryDamage?: string;
  secondaryDamage?: string;
  startCode?: string;
  startStatus?: string;
  keyStatus?: string;
  branch?: string;
  location?: string;
  auctionDate?: string;
  auctionDateTime?: string;
  titleType?: string;
  titleDoc?: string;
  lossType?: string;
  sellerType?: string;
  odometer?: string | number;
  airbags?: string;
  imageThumbnailUrl?: string;
  imageUrls?: string[];
  vehicleScore?: number;
  score?: number;
  lotUrl?: string;
  similarityScore?: number;
  keyInsights?: string[];
  [key: string]: any;
}

export interface CopilotThreadSummary {
  threadId: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
  activeFilterState?: Record<string, any>;
}

export interface CopilotChatResponse {
  threadId?: string;
  reply: string;
  vehicles: MatchedVehicle[];
  activeFilterState?: Record<string, any>;
  count?: number;
  queryVectorCount?: number;
}

export async function sendCopilotChat(
  messages: CopilotMessage[],
  threadId?: string | null
): Promise<CopilotChatResponse> {
  return apiRequest<CopilotChatResponse>("/copilot/chat", {
    method: "POST",
    body: JSON.stringify({ messages, threadId }),
  });
}

export async function fetchCopilotThreads(limit: number = 20): Promise<CopilotThreadSummary[]> {
  try {
    const res = await apiRequest<{ threads: CopilotThreadSummary[] }>(`/copilot/threads?limit=${limit}`);
    return res.threads || [];
  } catch (err) {
    console.warn("Failed to fetch server copilot threads:", err);
    return [];
  }
}

export async function fetchCopilotThreadHistory(threadId: string): Promise<any> {
  return apiRequest(`/copilot/threads/${encodeURIComponent(threadId)}`);
}

export async function deleteCopilotThread(threadId: string): Promise<void> {
  try {
    await apiRequest(`/copilot/threads/${encodeURIComponent(threadId)}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Failed to delete server copilot thread:", err);
  }
}

export async function streamCopilotChat(
  messages: CopilotMessage[],
  onChunk: (text: string) => void,
  onComplete: (data: CopilotChatResponse) => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    const token = await getIdToken();
    const response = await fetch(`${apiBaseUrl}/copilot/chat`, {
      method: "POST",
      headers: withAuthHeaders(token, {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      }),
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`FairSales API returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await response.json();
      const data: CopilotChatResponse = json.data || json;
      onChunk(data.reply || "");
      onComplete(data);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("ReadableStream not supported by browser.");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let finalVehicles: MatchedVehicle[] = [];
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const raw = trimmed.slice(6);
          if (raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.delta) {
              fullText += parsed.delta;
              onChunk(parsed.delta);
            }
            if (parsed.vehicles) {
              finalVehicles = parsed.vehicles;
            }
          } catch {
            // raw text chunk fallback
            fullText += raw;
            onChunk(raw);
          }
        }
      }
    }

    onComplete({ reply: fullText, vehicles: finalVehicles });
  } catch (err: any) {
    onError(err);
  }
}
