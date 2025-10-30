import axios from "axios";

export type SolanaTokenMetadata = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
};

const TOKEN_LIST_URL = "https://token.jup.ag/all";

export const findLiquidityPools = async (_contract: string) => {
  console.warn("findLiquidityPools is not implemented for Solana yet.");
  return null;
};

export const fetchVault = async () => {
  console.warn("fetchVault is not implemented for Solana yet.");
  return [];
};

export const getPieChartData = () => ({
  chartData: [],
  topHolders: [],
});

export const generateWalletTableHTML = () =>
  `<div style="padding: 16px; border-radius: 8px; background: #0f172a; color: #e2e8f0;">Solana token holder analytics are coming soon.</div>`;

export const getServerSideProps = async () => ({
  props: { tokenHolders: { data: { holders: [] } } },
});

const loadTokenList = async (): Promise<SolanaTokenMetadata[]> => {
  const response = await axios.get(TOKEN_LIST_URL);
  return response.data as SolanaTokenMetadata[];
};

export const fetchTokenMetadataBySymbol = async (
  symbol: string
): Promise<SolanaTokenMetadata | null> => {
  try {
    const tokens = await loadTokenList();
    return tokens.find((token) => token.symbol === symbol) ?? null;
  } catch (error) {
    console.error(`❌ Failed to load metadata for ${symbol}:`, error);
    return null;
  }
};

export const fetchTokenMetadataByMint = async (
  mintAddress: string
): Promise<SolanaTokenMetadata | null> => {
  try {
    const tokens = await loadTokenList();
    return tokens.find((token) => token.address === mintAddress) ?? null;
  } catch (error) {
    console.error(`❌ Failed to load metadata for ${mintAddress}:`, error);
    return null;
  }
};

export const getTokenFromMessage = (userMessage: string) => {
  const tokenRegex = /\b([A-Z]{2,10})\b/;
  const match = userMessage.match(tokenRegex);
  return match ? match[1] : null;
};

export const buildTokenAnalysisPlaceholder = (symbol: string) =>
  `Detailed Solana analytics for ${symbol} are on the roadmap. In the meantime, check solscan.io or birdeye.so for on-chain stats.`;
