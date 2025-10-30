import { createChatMessage } from "@/app/utils";
import { queryOpenRouter } from "../ai";
import { fetchSolanaBalance } from "../tools/fetchBalances";

export async function fetchBalance(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null
) {
  if (!address) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "Please connect your wallet first.",
        type: "text",
        intent: intent,
      })
    );
    return;
  }

  const balances = await fetchSolanaBalance(address);

  addToChat(
    createChatMessage({
      sender: "ai",
  text: "🔍 Fetching your Solana token balances...",
      type: "text",
      intent: intent,
    })
  );

  if (!balances?.bank.length || !balances.bank) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "❌ No balances found in your Bank Balance.",
        type: "text",
        intent: intent,
      })
    );
    return;
  }

  addToChat(
    createChatMessage({
      sender: "ai",
      type: "balance",
      balances: balances.bank
        .filter((token) => token !== undefined) 
        .map((token) => ({
          symbol: token.symbol,
          amount: token.amount.toString(),
          balance:token.balance,
          logo: token.logo,
          address: token.address,
        })),
      intent: intent,
    })
  );

  const finalResponse = await queryOpenRouter(
    "Ask user what you can help more if needed.",
    chatHistory
  );
  addToChat(createChatMessage({ sender: "ai", text: finalResponse, type: "text", intent: intent }));
}
