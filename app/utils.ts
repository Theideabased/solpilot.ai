import type { ChatMessage } from "./types";

export const createChatMessage = ({
  sender,
  text = "No response from AI, try again.",
  type,
  balances = null,
  validators = null,
  contractInput = null,
  send = null,
  intent = null,
  pie = null,
  token_metadata = null,
  llama = null,
  stake_info = null,
  proposals = null,
}: ChatMessage): ChatMessage => {
  return {
    sender,
    text,
    type,
    intent,
    balances,
    validators,
    contractInput,
    token_metadata,
    pie,
    send,
    llama,
    stake_info,
    proposals,
  };
};

// Stub function for msgBroadcastClient - needs Solana implementation
// This is used by transaction components that haven't been migrated yet
export const msgBroadcastClient = () => {
  throw new Error(
    "msgBroadcastClient is not implemented for Solana yet. " +
    "Transaction components need to be migrated to use Solana Web3.js. " +
    "See TRANSACTION_COMPONENTS_TODO.md for migration guide."
  );
};

