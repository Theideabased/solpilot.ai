import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from "axios";
import { fetchTokenPriceDirectly } from "./fetchTokenPrice";

// Use public RPC or your own endpoint
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC, "confirmed");

export const fetchSolanaBalance = async (solanaAddress: string) => {
  try {
    // Validate Solana address
    const publicKey = new PublicKey(solanaAddress);

    // Fetch SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;

    // Fetch all SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Format SOL balance
    const solPrice = await fetchTokenPriceDirectly("SOL");
    const solBalanceUSD = solPrice ? solAmount * Number(solPrice) : 0;

    const formattedBalances = [
      {
        symbol: "SOL",
        amount: solAmount,
        balance: solBalanceUSD,
        logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        address: "So11111111111111111111111111111111111111112",
      },
    ];

    // Process SPL tokens
    for (const accountInfo of tokenAccounts.value) {
      const parsedInfo = accountInfo.account.data.parsed.info;
      const tokenAmount = parsedInfo.tokenAmount;

      // Skip if balance is zero
      if (tokenAmount.uiAmount === 0) continue;

      const mintAddress = parsedInfo.mint;
      const amount = tokenAmount.uiAmount;

      // Fetch token metadata
      const metadata = await fetchTokenMetadata(mintAddress);
      if (!metadata) {
        // If metadata not found, still show the token with basic info
        formattedBalances.push({
          symbol: "UNKNOWN",
          amount: amount,
          balance: 0,
          logo: "",
          address: mintAddress,
        });
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 300)); // Rate limiting

      const price = await fetchTokenPriceDirectly(metadata.symbol);
      const balanceUSD = price ? amount * Number(price) : 0;

      formattedBalances.push({
        symbol: metadata.symbol,
        amount: amount,
        balance: balanceUSD,
        logo: metadata.logoURI || "",
        address: mintAddress,
      });
    }

    // Sort by balance (highest first)
    formattedBalances.sort((a, b) => b.balance - a.balance);

    return {
      bank: formattedBalances, // Keep same structure for compatibility
      cw20: [], // Empty for Solana (no CW20 equivalent)
    };
  } catch (error) {
    console.error("❌ Error fetching Solana balance:", error);
    return null;
  }
};

const TOKEN_LIST_URL = "https://token.jup.ag/all";

export const fetchTokenMetadata = async (mintAddress: string) => {
  try {
    const response = await axios.get(TOKEN_LIST_URL);
    const tokenMetadata = response.data.find((token: any) => token.address === mintAddress);

    if (tokenMetadata) {
      return tokenMetadata;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to fetch ${mintAddress} metadata:`, error);
    return null;
  }
};
