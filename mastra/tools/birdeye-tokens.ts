/**
 * Birdeye API Integration for Solana Token Data
 * 
 * Birdeye is a more reliable alternative to Jupiter for Solana token data
 * Provides: token search, prices, market data, and swap routing
 * 
 * FREE tier: 100 requests/day per API key
 * Website: https://birdeye.so
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || 'public'; // Use 'public' for testing
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

// Common Solana token addresses (cached for quick lookups)
const COMMON_TOKENS: Record<string, { address: string; decimals: number; name: string }> = {
  'SOL': {
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    name: 'Solana'
  },
  'USDC': {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    name: 'USD Coin'
  },
  'USDT': {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    name: 'Tether USD'
  },
  'BONK': {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    name: 'Bonk'
  },
  'JUP': {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    name: 'Jupiter'
  },
  'RAY': {
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    name: 'Raydium'
  },
  'ORCA': {
    address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    decimals: 6,
    name: 'Orca'
  },
  'NOS': {
    address: 'nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7',
    decimals: 6,
    name: 'Nosana'
  },
  'PYTH': {
    address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    decimals: 6,
    name: 'Pyth Network'
  },
  'WIF': {
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    name: 'dogwifhat'
  },
};

/**
 * Quick token lookup for swaps - uses cached addresses
 */
export const quickTokenLookup = createTool({
  id: 'quick-token-lookup',
  description: 'Fast lookup of common Solana tokens by symbol (SOL, USDC, BONK, NOS, etc.) - use this for swap operations',
  inputSchema: z.object({
    symbol: z.string().describe('Token symbol (e.g., "SOL", "USDC", "NOS", "BONK")'),
  }),
  execute: async ({ context }) => {
    const { symbol } = context;
    const upperSymbol = symbol.toUpperCase();

    // Check cached tokens first
    const cachedToken = COMMON_TOKENS[upperSymbol];
    if (cachedToken) {
      return {
        success: true,
        data: {
          symbol: upperSymbol,
          name: cachedToken.name,
          address: cachedToken.address,
          decimals: cachedToken.decimals,
          source: 'cached',
        },
        message: `Found ${upperSymbol} (${cachedToken.name}): ${cachedToken.address}`,
      };
    }

    // If not in cache, try Birdeye search
    try {
      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/token_overview`, {
        params: { address: symbol },
        headers: { 'X-API-KEY': BIRDEYE_API_KEY },
        timeout: 5000,
      });

      if (response.data?.success && response.data.data) {
        const token = response.data.data;
        return {
          success: true,
          data: {
            symbol: token.symbol || upperSymbol,
            name: token.name || 'Unknown',
            address: token.address,
            decimals: token.decimals || 9,
            source: 'birdeye',
          },
          message: `Found ${token.symbol}: ${token.name}`,
        };
      }
    } catch (error) {
      // Birdeye failed, continue to fallback
    }

    // If all else fails, return error with suggestions
    return {
      success: false,
      error: `Token "${symbol}" not found`,
      message: `Supported tokens: ${Object.keys(COMMON_TOKENS).join(', ')}. For other tokens, use their mint address directly.`,
    };
  },
});

/**
 * Search for tokens using Birdeye (more reliable than Jupiter)
 */
export const searchBirdeyeToken = createTool({
  id: 'search-birdeye-token',
  description: 'Search for any Solana token using Birdeye API - more reliable than Jupiter',
  inputSchema: z.object({
    query: z.string().describe('Token name or symbol to search for'),
    limit: z.number().optional().default(10).describe('Maximum results to return'),
  }),
  execute: async ({ context }) => {
    try {
      const { query, limit } = context;

      // Try token list search
      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/tokenlist`, {
        params: {
          sort_by: 'v24hUSD',
          sort_type: 'desc',
          offset: 0,
          limit: 100,
        },
        headers: { 'X-API-KEY': BIRDEYE_API_KEY },
        timeout: 10000,
      });

      if (!response.data?.success || !response.data.data?.tokens) {
        throw new Error('No tokens found');
      }

      // Filter by search query
      const searchLower = query.toLowerCase();
      const matches = response.data.data.tokens.filter((token: any) =>
        token.symbol?.toLowerCase().includes(searchLower) ||
        token.name?.toLowerCase().includes(searchLower)
      );

      if (matches.length === 0) {
        return {
          success: false,
          error: `No tokens found matching "${query}"`,
          message: 'Try common tokens like SOL, USDC, BONK, JUP, RAY, ORCA',
        };
      }

      const limitedMatches = matches.slice(0, limit);

      return {
        success: true,
        data: {
          tokens: limitedMatches.map((token: any) => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            decimals: token.decimals,
            price: token.price,
            volume24h: token.v24hUSD,
            liquidity: token.liquidity,
          })),
          total: matches.length,
          returned: limitedMatches.length,
          source: 'birdeye',
        },
        message: `Found ${matches.length} tokens matching "${query}"`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to search tokens',
        message: 'Birdeye API unavailable. Using cached common tokens instead.',
        fallback: Object.entries(COMMON_TOKENS).map(([symbol, data]) => ({
          symbol,
          name: data.name,
          address: data.address,
          decimals: data.decimals,
        })),
      };
    }
  },
});

/**
 * Get token price from Birdeye
 */
export const getBirdeyePrice = createTool({
  id: 'get-birdeye-price',
  description: 'Get real-time token price from Birdeye (alternative to CoinGecko)',
  inputSchema: z.object({
    address: z.string().describe('Token mint address'),
  }),
  execute: async ({ context }) => {
    try {
      const { address } = context;

      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/price`, {
        params: { address },
        headers: { 'X-API-KEY': BIRDEYE_API_KEY },
        timeout: 5000,
      });

      if (!response.data?.success || !response.data.data) {
        throw new Error('Price not available');
      }

      const data = response.data.data;

      return {
        success: true,
        data: {
          address,
          price: data.value,
          priceChange24h: data.updateUnixTime ? ((data.value - data.value) / data.value * 100) : null,
          updateTime: data.updateUnixTime,
        },
        message: `Price: $${data.value}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get price',
        message: 'Could not fetch token price from Birdeye',
      };
    }
  },
});

/**
 * Export all Birdeye tools
 */
export function createBirdeyeTools() {
  return {
    quickTokenLookup,
    searchBirdeyeToken,
    getBirdeyePrice,
  };
}
