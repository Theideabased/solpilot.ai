import { useChat } from "../providers/chatProvider";
import type { SendDetails } from "../types";
import { createChatMessage } from "../utils";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SendTokenMessageType = ({
  text = "",
  executing,
  setExecuting,
  handleExit,
  send,
  solanaAddress,
  token,
}: {
  solanaAddress: string | null;
  text?: string;
  executing: boolean;
  setExecuting: (executing: boolean) => void;
  handleExit: () => void;
  send: SendDetails;
  token:string;
}) => {
  const { addMessage } = useChat();

  const confirmSend = async (sendDetails: SendDetails) => {
    try {
      if (solanaAddress === null) {
        addMessage(
          token,
          createChatMessage({
            sender: "ai",
            text: "Connect your Solana wallet before sending tokens.",
            type: "text",
          })
        );
        return;
      }

      setExecuting(true);

      // Get Phantom wallet provider
      const provider = (window as any).phantom?.solana;
      if (!provider?.isPhantom) {
        throw new Error("Phantom wallet not found");
      }

      // Get RPC endpoint from env
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');

      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: "🔄 Preparing transaction... Please approve in your Phantom wallet.",
          type: "text",
        })
      );

      // Create transaction
      const fromPubkey = new PublicKey(solanaAddress);
      const toPubkey = new PublicKey(sendDetails.receiver);
      const amountLamports = Math.floor(sendDetails.amount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amountLamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Request signature from Phantom
      const signed = await provider.signAndSendTransaction(transaction);
      
      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: `⏳ Transaction sent! Confirming...\n\nSignature: ${signed.signature}`,
          type: "text",
        })
      );

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signed.signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      // Get updated balance
      const newBalance = await connection.getBalance(fromPubkey);

      addMessage(
        token,
        createChatMessage({
          sender: "ai",
          text: `✅ Transfer successful!\n\n` +
                `📤 Sent: ${sendDetails.amount} SOL\n` +
                `📍 To: ${sendDetails.receiver}\n` +
                `💰 New balance: ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL\n\n` +
                `🔗 View on Solana Explorer:\n` +
                `https://explorer.solana.com/tx/${signed.signature}${rpcUrl.includes('devnet') ? '?cluster=devnet' : ''}`,
          type: "text",
        })
      );

      setExecuting(false);
    } catch (error: any) {
      setExecuting(false);
      addMessage(token,
        createChatMessage({
          sender: "ai",
          text: `❌ Transfer failed: ${error.message || error}\n\n` +
                `Please check:\n` +
                `• Wallet is connected\n` +
                `• You have enough SOL for the transfer + fees\n` +
                `• Recipient address is valid\n` +
                `• You approved the transaction in Phantom`,
          type: "text",
        })
      );

      return;
    }
  };

  return (
    <div className="p-3 rounded-xl bg-zinc-800 text-white max-w-[75%] ">
      <h3 className="text-lg font-semibold mb-2">Your Transfer Details</h3>
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
              if (send) {
                confirmSend(send);
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

export default SendTokenMessageType;
