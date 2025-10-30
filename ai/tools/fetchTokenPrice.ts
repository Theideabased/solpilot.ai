import axios from "axios";

export const fetchTokenPrice = async (ticker: string) => {
  try {
    const tokenMetadata = await fetchTokenMetadata(ticker.toUpperCase());
    if (!tokenMetadata) {
      return `❌ Failed to fetch ${ticker.toUpperCase()} price. Token not found on Solana.`;
    }

    const price = await fetchPriceByMint(tokenMetadata.address);
    if (price === null) {
      return `❌ Failed to fetch ${ticker.toUpperCase()} price. Price data unavailable.`;
    }

    return `💵 1 ${ticker.toUpperCase()} = $${price.toFixed(6)} USD on Solana.`;
  } catch (error) {
    return `❌ Failed to fetch ${ticker.toUpperCase()} price.`;
  }
};

const fetchPriceByMint = async (mintAddress: string) => {
  try {
    // Try Jupiter Price API first
    const jupiterResponse = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
    const jupiterData = await jupiterResponse.json();

    if (jupiterData.data && jupiterData.data[mintAddress]) {
      return jupiterData.data[mintAddress].price;
    }

    // Fallback to CoinGecko if Jupiter fails
    const tokenMetadata = await fetchTokenMetadata("");
    if (tokenMetadata?.extensions?.coingeckoId) {
      const cgResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenMetadata.extensions.coingeckoId}&vs_currencies=usd`
      );
      return cgResponse.data[tokenMetadata.extensions.coingeckoId]?.usd || null;
    }

    return null;
  } catch (error) {
    return null;
  }
};


export const fetchTokenPriceDirectly = async (ticker: string) => {
  try {
    const tokenMetadata = await fetchTokenMetadata(ticker.toUpperCase());
    if (!tokenMetadata) {
      return null;
    }

    return await fetchPriceByMint(tokenMetadata.address);
  } catch (error) {
    return null;
  }
};

const TOKEN_LIST_URL = "https://token.jup.ag/all";

const fetchTokenMetadata = async (ticker: string) => {
  try {
    const response = await axios.get(TOKEN_LIST_URL);
    const tokenMetadata = response.data.find((token: any) => token.symbol === ticker);

    if (tokenMetadata) {
      return tokenMetadata;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};