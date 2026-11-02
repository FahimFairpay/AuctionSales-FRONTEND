import { resolveApiBase } from "../config";
import { publicApiPost } from "./publicClient";
import type { CopilotMessage, CopilotChatResponse } from "./copilot";

export async function sendPublicCopilotChat(
  messages: CopilotMessage[],
  guestSessionId?: string
): Promise<CopilotChatResponse> {
  return publicApiPost<CopilotChatResponse>("/public/copilot/chat", {
    messages,
    guestSessionId: guestSessionId || getOrCreateGuestSessionId(),
    stream: false,
  });
}

export function getOrCreateGuestSessionId(): string {
  if (typeof window === "undefined") return "guest_ssr";
  let id = sessionStorage.getItem("fairautos_guest_session");
  if (!id) {
    id = "guest_" + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem("fairautos_guest_session", id);
  }
  return id;
}

export async function streamPublicCopilotChat(
  messages: CopilotMessage[],
  onChunk: (text: string) => void,
  onComplete: (data: CopilotChatResponse) => void,
  onError: (err: Error) => void,
  guestSessionId?: string
): Promise<void> {
  try {
    const sessionId = guestSessionId || getOrCreateGuestSessionId();
    const response = await fetch(`${resolveApiBase("/public/copilot/chat")}/public/copilot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      },
      body: JSON.stringify({
        messages,
        guestSessionId: sessionId,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Public Copilot API returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await response.json();
      if (!json.success && json.message) {
        throw new Error(json.message);
      }
      const data: CopilotChatResponse = json.data || json;
      if (data.reply) onChunk(data.reply);
      onComplete(data);
      return;
    }

    if (!response.body) {
      throw new Error("No response body received from stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";
    let matchedVehicles: any[] = [];
    let returnedSessionId = sessionId;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        if (!block.trim()) continue;
        const eventLines = block.split("\n");
        let eventType = "";
        let dataPayload = "";

        for (const line of eventLines) {
          if (line.startsWith("event: ")) {
            eventType = line.replace("event: ", "").trim();
          } else if (line.startsWith("data: ")) {
            dataPayload = line.replace("data: ", "").trim();
          }
        }

        if (!dataPayload) continue;

        try {
          const parsed = JSON.parse(dataPayload);
          if (eventType === "token" && parsed.text) {
            accumulatedText += parsed.text;
            onChunk(parsed.text);
          } else if (eventType === "vehicles" && Array.isArray(parsed)) {
            matchedVehicles = parsed;
          } else if (eventType === "session" && parsed.sessionId) {
            returnedSessionId = parsed.sessionId;
          } else if (eventType === "done") {
            onComplete({
              reply: accumulatedText,
              vehicles: matchedVehicles,
              threadId: returnedSessionId,
              count: matchedVehicles.length,
            });
            return;
          }
        } catch {
          // ignore non-json SSE heartbeats
        }
      }
    }

    onComplete({
      reply: accumulatedText,
      vehicles: matchedVehicles,
      threadId: returnedSessionId,
      count: matchedVehicles.length,
    });
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
