"use client"

/**
 * Client-side streaming chat service
 * Handles Server-Sent Events (SSE) for real-time AI responses
 */

const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface StreamChunk {
  type: 'agent' | 'text' | 'done' | 'error';
  content?: string;
  agent?: string;
  error?: string;
}

/**
 * Fetch streaming response from chat API
 * Returns an async generator that yields text chunks
 */
export async function* fetchStreamingResponse(
  userMessage: string,
  chatHistory: any[],
  address: string | null,
  token: string
): AsyncGenerator<StreamChunk, void, unknown> {
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
            yield data as StreamChunk;
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

/**
 * Helper function to consume the streaming response and build the full message
 */
export async function consumeStream(
  userMessage: string,
  chatHistory: any[],
  address: string | null,
  token: string,
  onChunk: (chunk: string) => void,
  onAgent?: (agent: string) => void,
  onComplete?: () => void,
  onError?: (error: string) => void
): Promise<string> {
  let fullText = '';

  try {
    for await (const chunk of fetchStreamingResponse(userMessage, chatHistory, address, token)) {
      switch (chunk.type) {
        case 'agent':
          if (chunk.agent && onAgent) {
            onAgent(chunk.agent);
          }
          break;

        case 'text':
          if (chunk.content) {
            fullText += chunk.content;
            onChunk(chunk.content);
          }
          break;

        case 'done':
          if (onComplete) {
            onComplete();
          }
          break;

        case 'error':
          if (chunk.error && onError) {
            onError(chunk.error);
          }
          break;
      }
    }
  } catch (error: any) {
    if (onError) {
      onError(error.message || 'Streaming failed');
    }
    throw error;
  }

  return fullText;
}
