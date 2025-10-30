import { Connection, LAMPORTS_PER_SOL, PublicKey, StakeProgram } from "@solana/web3.js";

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC, "confirmed");

export const fetchSolanaStakingInfo = async (walletAddress: string | null) => {
  if (!walletAddress) {
    return [];
  }

  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const stakeAccounts = await connection.getParsedProgramAccounts(StakeProgram.programId);

    const validatorStakes = stakeAccounts
      .map((account) => {
        const parsed = account.account.data as any;
        const info = parsed?.parsed?.info;

        if (!info) {
          return null;
        }

        const authorized = info.meta?.authorized;
        const isOwnedByUser =
          authorized?.staker === walletAddress || authorized?.withdrawer === walletAddress;

        if (!isOwnedByUser) {
          return null;
        }

        const delegation = info.stake?.delegation;
        const stakeAmountLamports = delegation?.stake ?? 0;
        const rewardsLamports = info.stake?.credits ?? 0;

        return {
          validatorName: delegation?.voter ?? "Unknown Validator",
          validatorAddress: delegation?.voter ?? "Unknown",
          stakedAmount: stakeAmountLamports / LAMPORTS_PER_SOL,
          rewards: rewardsLamports / LAMPORTS_PER_SOL,
        };
      })
      .filter((entry): entry is {
        validatorName: string;
        validatorAddress: string;
        stakedAmount: number;
        rewards: number;
      } => entry !== null);

    return validatorStakes;
  } catch (error) {
    console.error("Error fetching Solana staking information:", error);
    return [];
  }
};
