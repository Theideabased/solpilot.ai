import { useState } from "react";
import { useValidator } from "../providers/validatorProvider";
import { useChat } from "../providers/chatProvider";
import { createChatMessage } from "../utils";

const StakeAmountMessageType = ({
  handleExit,
  solanaAddress,
  token,
}: {
  solanaAddress: string | null;
  handleExit: () => void;
  token: string;
}) => {
  const [amount, setAmount] = useState<string>("");
  const { validatorAddress, setValidatorSelected } = useValidator();
  const { addMessage } = useChat();

  const confirmStake = () => {
    if (!solanaAddress) {
      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: "Please connect your Solana wallet before staking.",
          type: "text",
        })
      );
      return;
    }

    if (!validatorAddress) {
      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: "Select a validator before staking SOL.",
          type: "text",
        })
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: "Enter a valid SOL amount before staking.",
          type: "text",
        })
      );
      return;
    }

    setValidatorSelected(false);

    addMessage(
      token,
      createChatMessage({
        sender: "ai",
        text: "Native Solana staking transactions are coming soon. For now, you can stake manually using your wallet UI.",
        type: "text",
      })
    );
  };

  return (
    <div className="p-3 rounded-xl bg-zinc-800 text-white max-w-[75%]">
      <h3 className="text-lg font-semibold mb-2">Enter Staking Amount:</h3>
      <input
        type="number"
        placeholder="Amount in SOL"
        className="p-2 rounded-lg bg-gray-700 text-white w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
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
          onClick={confirmStake}
          className="mt-3 px-4 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-300"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default StakeAmountMessageType;
