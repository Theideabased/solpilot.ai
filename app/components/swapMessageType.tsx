import type { ChatMessage, ContractInput } from "../types";
import { createChatMessage } from "../utils";

const SwapMessageType = ({
  text = "",
  executing,
  handleExit,
  contractInput,
  updateChat,
  updateExecuting,
  solanaAddress,
  token,
}: {
  text?: string;
  executing: boolean;
  handleExit: () => void;
  contractInput: ContractInput;
  updateChat: (cb: (prevChat: ChatMessage[]) => ChatMessage[]) => void;
  updateExecuting: (executing: boolean) => void;
  solanaAddress: string | null;
  token: string;
}) => {
  const confirmSwap = async (contractInput: ContractInput) => {
    try {
      if (solanaAddress === null) {
        updateChat((prevChat) => [
          ...prevChat,
          createChatMessage({
            sender: "ai",
            text: "Connect your Solana wallet before confirming a swap.",
            type: "text",
            intent: "general",
          }),
        ]);
        return;
      }
      updateExecuting(true);
      updateChat((prevChat) => [
        ...prevChat,
        createChatMessage({
          sender: "ai",
          text: "Direct Solana swap execution inside SOLPILOT is coming soon. For now, please confirm the quote in your wallet manually.",
          type: "text",
          intent: "general",
        }),
      ]);
      updateExecuting(false);
    } catch (error) {
      if (error instanceof Error) {
        updateExecuting(false);
        const errorMessage = error.message;

        // Check if the error message indicates that the minimum receive amount condition failed.
        if (errorMessage.includes("minimum receive amount")) {
          updateChat((prevChat) => [
            ...prevChat,
            createChatMessage({
              sender: "ai",
              text: "Swap failed. Please verify your Solana wallet connection and try again.",
              type: "text",
              intent: "general",
            }),
          ]);
        } else {
          updateChat((prevChat) => [
            ...prevChat,
            createChatMessage({
              sender: "ai",
              text: `Swap failed, Error : ${errorMessage}`,
              type: "text",
              intent: "general",
            }),
          ]);
        }
      } else {
        // Fallback for errors that are not instances of Error
        updateChat((prevChat) => [
          ...prevChat,
          createChatMessage({
            sender: "ai",
            text: `Swap failed, Error : ${error}`,
            type: "text",
            intent: "general",
          }),
        ]);
      }
    }
  };

  return (
    <div className="p-3 rounded-xl bg-zinc-800 text-white max-w-[75%] ">
      <h3 className="text-lg font-semibold mb-2">Your Swap Details</h3>
      <div>{text}</div>
      {!executing && (
        <div className=" space-x-4">
          <button
            type="button"
            onClick={handleExit}
            className="mt-3 px-4 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-300"
          >
            Exit
          </button>
          <button
            type="button"
            onClick={() => {
              if (contractInput) {
                confirmSwap(contractInput);
              }
            }}
            className="mt-3 px-4 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-300"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default SwapMessageType;
