import { Connection, LAMPORTS_PER_SOL, type ParsedInstruction, type PartiallyDecodedInstruction } from "@solana/web3.js";
import bs58 from "bs58";
import { queryOpenRouter } from "../ai";

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC, "confirmed");

const clusterSuffix = () => {
  const lowerRpc = SOLANA_RPC.toLowerCase();
  if (lowerRpc.includes("devnet")) {
    return "?cluster=devnet";
  }
  if (lowerRpc.includes("testnet")) {
    return "?cluster=testnet";
  }
  return "";
};

const formatInstruction = (instruction: ParsedInstruction | PartiallyDecodedInstruction): string => {
  if ("program" in instruction) {
    const parsed = instruction as ParsedInstruction;
    const parsedType = typeof parsed.parsed === "object" && parsed.parsed && "type" in parsed.parsed ? (parsed.parsed as any).type : "Instruction";
    return `- **${parsed.program}** ${parsedType ? `(${parsedType})` : ""}`.trim();
  }

  const decoded = instruction as PartiallyDecodedInstruction;
  const programId = typeof decoded.programId === "string" ? decoded.programId : decoded.programId?.toBase58?.() || "Unknown Program";
  return `- Program ${programId}`;
};

export const txSearch = {
    execute: async (txHash: string, chatHistory: any[]): Promise<string> => {
      try {
        if (!txHash) {
          return "❌ Invalid transaction signature. Please provide a valid Solana transaction signature.";
        }

        let signatureBytes: Uint8Array;
        try {
          signatureBytes = bs58.decode(txHash);
        } catch (error) {
          return "❌ Invalid transaction signature. Please provide a valid Solana transaction signature.";
        }

        if (signatureBytes.length !== 64) {
          return "❌ Invalid transaction signature length. Solana signatures should decode to 64 bytes.";
        }

        const transaction = await connection.getParsedTransaction(txHash, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (!transaction) {
          return "❌ Transaction not found. Please verify the signature and try again.";
        }

        const status = transaction.meta?.err ? "❌ Failed" : "✅ Success";
        const blockTime = transaction.blockTime ? new Date(transaction.blockTime * 1000).toISOString() : "Unknown";
        const fee = transaction.meta?.fee ? (transaction.meta.fee / LAMPORTS_PER_SOL).toFixed(6) : "0";
        const computeUnitsConsumed = transaction.meta?.computeUnitsConsumed ?? "Unknown";
        const instructionSummaries = transaction.transaction.message.instructions.map((instruction) => formatInstruction(instruction));
        const accountSummaries = transaction.transaction.message.accountKeys.map((account, idx) => {
          const pubkey = typeof account === "string" ? account : (account as any).pubkey ?? account;
          if (typeof pubkey === "string") {
            return `${idx + 1}. ${pubkey}`;
          }
          if (pubkey && typeof pubkey.toString === "function") {
            return `${idx + 1}. ${pubkey.toString()}`;
          }
          return `${idx + 1}. [Unknown Account]`;
        });

        const explorerUrl = `https://explorer.solana.com/tx/${txHash}${clusterSuffix()}`;
        const transactionSummary = `
    <h1 style="margin:0;">✅ Transaction Found</h1>
    <span><strong>Signature:</strong> <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">${txHash}</a></span><br>
    <span><strong>Status:</strong> ${status}</span><br>
    <span><strong>Slot:</strong> ${transaction.slot}</span><br>
    <span><strong>Timestamp:</strong> ${blockTime}</span><br>
    <span><strong>Fee:</strong> ${fee} SOL</span><br>
    <span><strong>Compute Units:</strong> ${computeUnitsConsumed}</span><br><br>
    <span><strong>Accounts Involved:</strong></span><br>
    <span>${accountSummaries.join("<br>")}</span><br><br>
    <span><strong>Instructions:</strong> ${instructionSummaries.length}</span><br>
    <span>${instructionSummaries.join("<br>")}</span><br><br>
    <span>📜 <strong>AI Transaction Breakdown</strong></span><br>
    <span><em>Analyzing transaction details...</em></span>
  `;

        let explanation;
        try {
          explanation = await queryOpenRouter(
            `Look at the following Solana transaction details and explain clearly what happened:\n\n${JSON.stringify(
              {
                message: transaction.transaction.message,
                meta: transaction.meta,
              },
              null,
              2
            )}`,
            chatHistory
          );
        } catch (error) {
          explanation = "⚠️ AI was unable to generate a response. The transaction details above should help you analyze the transaction manually.";
        }
  
        return `${transactionSummary}<br><br><strong>🔍 AI Summary:</strong><br>${explanation}`;
      } catch (error) {
        return "❌ Failed to fetch transaction details. Please try again later.";
      }
    },
  };
  