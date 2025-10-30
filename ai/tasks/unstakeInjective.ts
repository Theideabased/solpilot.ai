import { fetchSolanaStakingInfo } from "../tools/stakingInformation";
import { createChatMessage } from "@/app/utils";

// Legacy alias maintained for backwards compatibility
export async function unstakeInjective(
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
        intent: intent,
      })
    );
    return;
  }
  addToChat(
    createChatMessage({
      sender: "ai",
      text: "Checking all Solana validators for your staking information...",
      type: "text",
      intent: intent,
    })
  );
  const stakingInformation = await fetchSolanaStakingInfo(address);
  if (stakingInformation.length === 0) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "You have no staked SOL on any validators currently.",
        type: "text",
        intent: intent,
      })
    );
    return;
  }
  addToChat(
    createChatMessage({
      sender: "ai",
      text: "Done",
      type: "unstake",
      stake_info: stakingInformation,
      intent: intent,
    })
  );
}
