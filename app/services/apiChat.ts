
"use server"
import type { ChatMessage } from "../types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const fetchResponse = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  injectiveAddress: string | null,
  token:string
) => {
  

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "", // Attach the token if available
    },
    body: JSON.stringify({
      message: userMessage,
      chatHistory: chatHistory,
      address: injectiveAddress,
      stream: false, // Use non-streaming for now
    }),
  });

  if (!res.ok) throw new Error(`Server Error: ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
};

/**
 * Fetch streaming response from chat API
 * Returns an async generator that yields text chunks
 */
export async function* fetchStreamingResponse(
  userMessage: string,
  chatHistory: ChatMessage[],
  address: string | null,
  token: string
): AsyncGenerator<{ type: string; content?: string; agent?: string; error?: string }, void, unknown> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      message: userMessage,
      chatHistory: chatHistory,
      address: address,
      stream: true, // Enable streaming
    }),
  });

  if (!res.ok) {
    throw new Error(`Server Error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete message in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
