/**
 * CoinGecko API Integration for SOLPILOT
 * 
 * Provides comprehensive market data for Solana ecosystem:
 * - Token lists and search
 * - Real-time prices and market data
 * - Historical data and charts
 * - Market rankings and trends
 * - No API key required for basic tier (50 calls/minute)
 */

import { createTool } from '@mastra/core';
import { z } from 'zod';
import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Get list of Solana ecosystem tokens
 */
export const getSolanaTokenList = createTool({
  id: 'coingecko-solana-tokens',
  description: 'Get comprehensive list of Solana ecosystem tokens with prices and market data',
  inputSchema: z.object({
    perPage: z.number().optional().default(50).describe('Number of tokens to return (max 250)'),
    page: z.number().optional().default(1).describe('Page number for pagination'),
    sortBy: z.enum(['market_cap', 'volume', 'price_change_24h']).optional().default('market_cap').describe('Sort tokens by'),
  }),
  execute: async ({ context }) => {
    try {
      const { perPage, page, sortBy } = context;

      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          category: 'solana-ecosystem',
          order: `${sortBy}_desc`,
          per_page: Math.min(perPage, 250),
          page,
          sparkline: false,
        },
      });

      const tokens = response.data.map((token: any) => ({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        price: token.current_price,
        priceChange24h: token.price_change_percentage_24h,
        marketCap: token.market_cap,
        volume24h: token.total_volume,
        rank: token.market_cap_rank,
        image: token.image,
      }));

      return {
        success: true,
        data: {
          tokens,
          totalTokens: tokens.length,
          page,
          sortedBy: sortBy,
        },
        message: `Found ${tokens.length} Solana ecosystem tokens`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Solana token list',
      };
    }
  },
});

/**
 * Search for specific Solana tokens
 */
export const searchSolanaToken = createTool({
  id: 'coingecko-search-token',
  description: 'Search for specific tokens by name or symbol in Solana ecosystem',
  inputSchema: z.object({
    query: z.string().describe('Token name or symbol to search for (e.g., "bonk", "jupiter")'),
  }),
  execute: async ({ context }) => {
    try {
      const { query } = context;

      // Search using CoinGecko search endpoint
      const searchResponse = await axios.get(`${COINGECKO_BASE_URL}/search`, {
        params: { query },
      });

      // Filter for Solana tokens
      const solanaTokens = searchResponse.data.coins.filter((coin: any) => 
        coin.name.toLowerCase().includes('solana') || 
        coin.symbol.toLowerCase().includes('sol') ||
        coin.id.includes('solana')
      ).slice(0, 10);

      // Get detailed data for found tokens
      const tokenDetails = await Promise.all(
        solanaTokens.map(async (token: any) => {
          try {
            const detailResponse = await axios.get(`${COINGECKO_BASE_URL}/coins/${token.id}`, {
              params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
              },
            });

            return {
              id: token.id,
              symbol: token.symbol.toUpperCase(),
              name: token.name,
              price: detailResponse.data.market_data?.current_price?.usd || 0,
              priceChange24h: detailResponse.data.market_data?.price_change_percentage_24h || 0,
              marketCap: detailResponse.data.market_data?.market_cap?.usd || 0,
              volume24h: detailResponse.data.market_data?.total_volume?.usd || 0,
              rank: detailResponse.data.market_cap_rank || 0,
              description: detailResponse.data.description?.en?.substring(0, 200) + '...' || 'No description',
            };
          } catch (err) {
            return null;
          }
        })
      );

      const validTokens = tokenDetails.filter(t => t !== null);

      return {
        success: true,
        data: {
          query,
          results: validTokens,
          count: validTokens.length,
        },
        message: `Found ${validTokens.length} tokens matching "${query}"`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to search for tokens',
      };
    }
  },
});

/**
 * Get detailed token information
 */
export const getTokenDetails = createTool({
  id: 'coingecko-token-details',
  description: 'Get comprehensive details about a specific token including price, market data, and description',
  inputSchema: z.object({
    tokenId: z.string().describe('CoinGecko token ID (e.g., "solana", "bonk", "jupiter-exchange-solana")'),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenId } = context;

      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${tokenId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
          sparkline: false,
        },
      });

      const data = response.data;

      return {
        success: true,
        data: {
          id: data.id,
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          description: data.description?.en || 'No description available',
          price: {
            usd: data.market_data.current_price?.usd || 0,
            change24h: data.market_data.price_change_percentage_24h || 0,
            change7d: data.market_data.price_change_percentage_7d || 0,
            change30d: data.market_data.price_change_percentage_30d || 0,
          },
          market: {
            marketCap: data.market_data.market_cap?.usd || 0,
            marketCapRank: data.market_cap_rank || 0,
            volume24h: data.market_data.total_volume?.usd || 0,
            circulatingSupply: data.market_data.circulating_supply || 0,
            totalSupply: data.market_data.total_supply || 0,
            maxSupply: data.market_data.max_supply || null,
          },
          links: {
            homepage: data.links?.homepage?.[0] || '',
            twitter: data.links?.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : '',
            telegram: data.links?.telegram_channel_identifier ? `https://t.me/${data.links.telegram_channel_identifier}` : '',
          },
          lastUpdated: data.last_updated,
        },
        message: `Retrieved details for ${data.name} (${data.symbol.toUpperCase()})`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch token details',
      };
    }
  },
});

/**
 * Get trending Solana tokens
 */
export const getTrendingSolanaTokens = createTool({
  id: 'coingecko-trending-tokens',
  description: 'Get currently trending tokens in the Solana ecosystem',
  inputSchema: z.object({}),
  execute: async ({ context }) => {
    try {
      // Get trending coins
      const trendingResponse = await axios.get(`${COINGECKO_BASE_URL}/search/trending`);
      
      // Get Solana ecosystem tokens for comparison
      const solanaResponse = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          category: 'solana-ecosystem',
          order: 'volume_desc',
          per_page: 20,
          page: 1,
        },
      });

      const trending = trendingResponse.data.coins.slice(0, 10).map((item: any) => ({
        id: item.item.id,
        symbol: item.item.symbol.toUpperCase(),
        name: item.item.name,
        rank: item.item.market_cap_rank || 0,
        image: item.item.large,
      }));

      const solanaTopMovers = solanaResponse.data
        .sort((a: any, b: any) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
        .slice(0, 10)
        .map((token: any) => ({
          id: token.id,
          symbol: token.symbol.toUpperCase(),
          name: token.name,
          price: token.current_price,
          priceChange24h: token.price_change_percentage_24h,
          volume24h: token.total_volume,
        }));

      return {
        success: true,
        data: {
          globalTrending: trending,
          solanaTopMovers,
        },
        message: 'Retrieved trending tokens and Solana top movers',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch trending tokens',
      };
    }
  },
});

/**
 * Get Solana network stats
 */
export const getSolanaNetworkStats = createTool({
  id: 'coingecko-solana-stats',
  description: 'Get comprehensive Solana network statistics and market data',
  inputSchema: z.object({}),
  execute: async ({ context }) => {
    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/solana`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
        },
      });

      const data = response.data;

      return {
        success: true,
        data: {
          name: 'Solana',
          symbol: 'SOL',
          price: {
            usd: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            change7d: data.market_data.price_change_percentage_7d,
            change30d: data.market_data.price_change_percentage_30d,
            ath: data.market_data.ath.usd,
            atl: data.market_data.atl.usd,
          },
          market: {
            marketCap: data.market_data.market_cap.usd,
            marketCapRank: data.market_cap_rank,
            volume24h: data.market_data.total_volume.usd,
            fullyDilutedValuation: data.market_data.fully_diluted_valuation?.usd || 0,
          },
          supply: {
            circulating: data.market_data.circulating_supply,
            total: data.market_data.total_supply,
            max: data.market_data.max_supply,
          },
          community: {
            twitterFollowers: data.community_data?.twitter_followers || 0,
            redditSubscribers: data.community_data?.reddit_subscribers || 0,
            telegramUsers: data.community_data?.telegram_channel_user_count || 0,
          },
          developer: {
            forks: data.developer_data?.forks || 0,
            stars: data.developer_data?.stars || 0,
            subscribers: data.developer_data?.subscribers || 0,
            totalIssues: data.developer_data?.total_issues || 0,
            pullRequestsMerged: data.developer_data?.pull_requests_merged || 0,
          },
          lastUpdated: data.last_updated,
        },
        message: 'Retrieved Solana network statistics',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Solana network stats',
      };
    }
  },
});

/**
 * Compare multiple tokens
 */
export const compareTokens = createTool({
  id: 'coingecko-compare-tokens',
  description: 'Compare multiple Solana tokens side-by-side',
  inputSchema: z.object({
    tokenIds: z.array(z.string()).describe('Array of CoinGecko token IDs to compare (e.g., ["solana", "bonk", "jupiter-exchange-solana"])'),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenIds } = context;

      const comparisons = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${tokenId}`, {
              params: {
                localization: false,
                tickers: false,
                market_data: true,
              },
            });

            const data = response.data;
            return {
              id: data.id,
              symbol: data.symbol.toUpperCase(),
              name: data.name,
              price: data.market_data.current_price.usd,
              priceChange24h: data.market_data.price_change_percentage_24h,
              marketCap: data.market_data.market_cap.usd,
              volume24h: data.market_data.total_volume.usd,
              rank: data.market_cap_rank,
            };
          } catch (err) {
            return null;
          }
        })
      );

      const validComparisons = comparisons.filter(c => c !== null);

      return {
        success: true,
        data: {
          tokens: validComparisons,
          count: validComparisons.length,
        },
        message: `Compared ${validComparisons.length} tokens`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to compare tokens',
      };
    }
  },
});

// Export all CoinGecko tools
export const coinGeckoTools = [
  getSolanaTokenList,
  searchSolanaToken,
  getTokenDetails,
  getTrendingSolanaTokens,
  getSolanaNetworkStats,
  compareTokens,
];

// Export as record object for Mastra Agent configuration
export const createCoinGeckoTools = () => ({
  getTokenList: getSolanaTokenList,
  searchToken: searchSolanaToken,
  getTokenDetails: getTokenDetails,
  getTrending: getTrendingSolanaTokens,
  getNetworkStats: getSolanaNetworkStats,
  compareTokens: compareTokens,
});
