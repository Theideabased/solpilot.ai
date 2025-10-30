import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC, "confirmed");

export const fetchValidators = async () => {
  try {
    // Fetch all vote accounts (validators)
    const voteAccounts = await connection.getVoteAccounts();

    if (!voteAccounts || (!voteAccounts.current.length && !voteAccounts.delinquent.length)) {
      return [];
    }

    // Combine active and delinquent validators
    const allValidators = [
      ...voteAccounts.current.map((v) => ({ ...v, isActive: true })),
      ...voteAccounts.delinquent.map((v) => ({ ...v, isActive: false })),
    ];

    // Sort by activated stake (descending)
    allValidators.sort((a, b) => b.activatedStake - a.activatedStake);

    // Take top 100 validators
    const topValidators = allValidators.slice(0, 100);

    return topValidators.map((validator) => ({
      moniker: validator.nodePubkey.slice(0, 8) + "..." + validator.nodePubkey.slice(-8), // Shortened address as name
      address: validator.votePubkey,
      commission: validator.commission + "%",
      tokens:
        (validator.activatedStake / LAMPORTS_PER_SOL).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " SOL",
      status: validator.isActive ? "✅ Active" : "❌ Delinquent",
      selfDelegation: "N/A", // Solana doesn't expose this directly
      delegatorShares:
        (validator.activatedStake / LAMPORTS_PER_SOL).toFixed(2) + " SOL",
    }));
  } catch (error) {
    console.error("Error fetching validators:", error);
    return [];
  }
};
