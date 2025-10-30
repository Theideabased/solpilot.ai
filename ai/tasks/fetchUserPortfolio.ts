import { createChatMessage } from "@/app/utils";
import { queryOpenRouter } from "../ai";
import { fetchSolanaBalance } from "../tools/fetchBalances";

export async function fetchPortfolio(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null
) {
  const solanaAddress = address || extractSolanaAddress(message);
  if (!solanaAddress) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "Please provide a valid Solana wallet address (or connect your wallet).",
        type: "text",
        intent: intent,
      })
    );
    return;
  }

  const balances = await fetchSolanaBalance(solanaAddress);

  addToChat(
    createChatMessage({
      sender: "ai",
  text: "🔍 Fetching wallet balances on Solana...",
      type: "text",
      intent: intent,
    })
  );

  if (!balances?.bank.length || !balances.bank) {
    addToChat(
      createChatMessage({
        sender: "ai",
  text: "❌ No balances found for this Solana wallet.",
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

  addToChat(
    createChatMessage({
      sender: "ai",
  text: "🔍 Gathering SPL token balances...",
      type: "text",
      intent: intent,
    })
  );

  if (!balances?.cw20.length || !balances.cw20) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "❌ No balances found in user CW20 Balance.",
        type: "text",
        intent: intent,
      })
    );
    return;
  }

 

  if (balances.cw20 && (balances.cw20 as any[]).length > 0) {
    addToChat(
      createChatMessage({
        sender: "ai",
        type: "balance",
        balances: (balances.cw20 as any[])
          .filter((token) => token !== undefined)
          .map((token) => ({
            symbol: token.symbol,
            amount: token.amount.toString(),
            balance: token.balance,
            logo: token.logo,
            address: token.address,
          })),
        intent: intent,
      })
    );
  } else {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "No SPL token balances detected for this wallet.",
        type: "text",
        intent: intent,
      })
    );
  }

  const finalResponse = await queryOpenRouter(
    "Ask user what you can help more if needed.",
    chatHistory
  );
  addToChat(createChatMessage({ sender: "ai", text: finalResponse, type: "text", intent: intent }));
}

const extractSolanaAddress = (input: string): string | null => {
  const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g; // Base58 without 0, O, I, l
  const matches = input.match(regex);
  return matches ? matches[0] : null;
};
