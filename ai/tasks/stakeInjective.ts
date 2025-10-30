import { fetchValidators } from "../tools/stakeTool";
import { createChatMessage } from "@/app/utils";

// Legacy alias maintained for backwards compatibility
export async function stakeInjective(
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
        text: "❌ Please connect your Solana wallet first.",
        type: "text",
      })
    );
    return;
  }

  addToChat(
    createChatMessage({
      sender: "ai",
      text: "🔍 Fetching current Solana validators...",
      type: "loading",
    })
  );

  const validators = await fetchValidators();

  if (validators.length === 0) {
    addToChat(createChatMessage({ sender: "ai", text: "⚠️ No validators found!", type: "text" }));
    return;
  }

  addToChat(
    createChatMessage({
      sender: "ai",
      type: "validators",
      validators: validators.map((v, index) => ({
        index: index + 1,
        moniker: v.moniker,
        address: v.address,
        commission: v.commission,
      })),
    })
  );
}
