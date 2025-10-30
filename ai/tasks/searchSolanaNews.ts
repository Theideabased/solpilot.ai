import { createChatMessage } from "@/app/utils";
import type { ChatMessage } from "@/app/types";
import { fetchSolanaUpdates } from "../venice";

export async function searchSolanaNews(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null
) {
  const addMessage = (msg: ChatMessage) => {
    addToChat(msg);
  };

  addMessage(
    createChatMessage({
      sender: "ai",
      text: "Calling Venice to gather the latest Solana updates...",
      type: "loading",
      intent,
    })
  );

  const summary = await fetchSolanaUpdates(message);

  addMessage(
    createChatMessage({
      sender: "venicia",
      text: "Scanning Solana news sources and social feeds...",
      type: "loading",
      intent,
    })
  );

  addMessage(
    createChatMessage({
      sender: "venicia",
      text: summary,
      type: "success",
      intent,
    })
  );
}
