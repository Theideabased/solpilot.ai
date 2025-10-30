import { createChatMessage } from "@/app/utils";
import { fetchTokenPriceDirectly } from "../tools/fetchTokenPrice";

const extractTokenSymbol = (userMessage: string) => {
  const tokenRegex = /\b([A-Z]{2,10})\b/;
  const match = userMessage.match(tokenRegex);
  return match ? match[1] : null;
};

export async function tokenAnalysis(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null
) {
  addToChat(
    createChatMessage({
      sender: "ai",
      text: "Taking a quick look at that Solana token...",
      type: "text",
      intent,
    })
  );

  const token = extractTokenSymbol(message);
  if (!token) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "❌ Token ticker not detected. Please spell it as SOL, JUP, BONK, etc.",
        type: "error",
        intent,
      })
    );
    return;
  }

  const price = await fetchTokenPriceDirectly(token);
  const priceText = price ? `$${price.toFixed(6)} USD` : "unavailable right now";

  addToChat(
    createChatMessage({
      sender: "ai",
      text: `🛠️ Deep-dive token analytics for Solana is still under construction. For now, the latest reference price for ${token} is ${priceText}.`,
      type: "text",
      intent,
    })
  );

  addToChat(
    createChatMessage({
      sender: "ai",
      text: "Hang tight—full Solana token analytics (holders, liquidity, vaults) are on the roadmap.",
      type: "text",
      intent,
    })
  );
}
