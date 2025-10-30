import { fetchSolanaStakingInfo } from "../tools/stakingInformation";
import { createChatMessage } from "@/app/utils";

export async function unstakeSolana(
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
        text: "Please connect your Solana wallet first.",
        type: "text",
        intent,
      })
    );
    return;
  }

  addToChat(
    createChatMessage({
      sender: "ai",
      text: "🔍 Gathering your Solana staking positions...",
      type: "text",
      intent,
    })
  );

  const stakingInformation = await fetchSolanaStakingInfo(address);

  if (stakingInformation.length === 0) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "It looks like you do not have any staked SOL positions right now.",
        type: "text",
        intent,
      })
    );
    return;
  }

  addToChat(
    createChatMessage({
      sender: "ai",
      text: "Here are your current Solana staking positions.",
      type: "unstake",
      stake_info: stakingInformation,
      intent,
    })
  );
}
