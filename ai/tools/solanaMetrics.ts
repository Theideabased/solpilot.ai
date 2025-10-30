import axios from "axios";

interface SolanaData {
  tvl: number;
  protocols: Protocol[];
}

interface Protocol {
  name: string;
  logo: string;
  category: string;
  methodology: string;
  tvl: number;
}

export const fetchTopSolanaProtocols = async (): Promise<Protocol[] | null> => {
  try {
    const response = await axios.get("https://api.llama.fi/protocols");
    const protocols = response.data;

    const solanaProtocols: Protocol[] = protocols
      .filter((protocol: any) => protocol.chains.includes("Solana"))
      .map((protocol: any) => ({
        name: protocol.name,
        logo: protocol.logo,
        category: protocol.category,
        methodology: protocol.methodology,
        tvl: protocol.chainTvls?.Solana ?? 0,
      }))
      .filter((protocol: { tvl: number }) => protocol.tvl > 0);

    solanaProtocols.sort((a, b) => b.tvl - a.tvl);

    const top10Protocols = solanaProtocols.slice(0, 10);

    const remainingTvl = solanaProtocols.slice(10).reduce((sum, protocol) => sum + protocol.tvl, 0);

    if (remainingTvl > 0) {
      top10Protocols.push({
        name: "Others",
        logo: "",
        category: "Aggregated",
        methodology: "Summed TVL of protocols outside top 10",
        tvl: remainingTvl,
      });
    }
    return top10Protocols;
  } catch (error) {
    console.error("Error fetching Solana protocols:", error);
    return null;
  }
};

export const fetchSolanaData = async (): Promise<SolanaData | null> => {
  try {
    const response = await axios.get("https://api.llama.fi/chains");
    const chainsData = response.data;

    const solanaData = chainsData.find((chain: any) => chain.name.toLowerCase() === "solana");

    if (!solanaData) {
      throw new Error("Solana chain data not found");
    }

    const protocols = await fetchTopSolanaProtocols();

    if (protocols == null) {
      return null;
    }

    const tvl = solanaData.tvl;

    return {
      tvl,
      protocols,
    };
  } catch (error) {
    console.error("Error fetching Solana data:", error);
    return null;
  }
};
