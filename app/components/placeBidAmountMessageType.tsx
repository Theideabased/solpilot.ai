import { useState } from "react";
import { useChat } from "../providers/chatProvider";
import { createChatMessage } from "../utils";

const PlaceBidAmountMessageType = ({
  handleExit,
  solanaAddress,
  token,
}: {
  solanaAddress: string | null;
  handleExit: () => void;
  token: string;
}) => {
  const [amount, setAmount] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { addMessage } = useChat();

  const confirmBid = () => {
    if (!solanaAddress) {
      setErrorMessage("Please connect your Solana wallet first.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Enter a valid SOL amount before bidding.");
      return;
    }

    setErrorMessage("");

    addMessage(
      token,
      createChatMessage({
        sender: "ai",
        text: "Solana auction bidding is coming soon. We'll notify you as soon as it is available.",
        type: "text",
      })
    );
  };

  return (
    <div className="p-3 rounded-xl bg-zinc-800 text-white max-w-[75%]">
      <h3 className="text-lg font-semibold mb-2">Enter Bid Amount:</h3>
      <div className="text-red-400">
        {errorMessage}
      </div>
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
          onClick={confirmBid}
          className="mt-3 px-4 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-300"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default PlaceBidAmountMessageType;
