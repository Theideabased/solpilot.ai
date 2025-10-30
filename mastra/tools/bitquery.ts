/**
 * Bitquery API Integration for SOLPILOT
 * Provides real-time DEX data, new token detection, and trading analytics
 * 
 * Features:
 * - New token launches (Pump.fun, Raydium, etc.)
 * - Buy/sell pressure analysis
 * - Real-time DEX prices
 * - Trading volume and metrics
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const BITQUERY_API_URL = 'https://streaming.bitquery.io/eap';
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY ;

// Pump.fun program ID
const PUMPFUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

/**
 * Get newly launched tokens on Pump.fun
 */
export const getPumpFunNewTokens = createTool({
  id: 'bitquery-pumpfun-new-tokens',
  description: 'Get the latest tokens launched on Pump.fun (Solana meme coin launchpad). Shows recent token launches with creation time, trading activity, and initial metrics.',
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Number of tokens to return (default: 10, max: 50)'),
    minTrades: z.number().optional().default(0).describe('Minimum number of trades to filter by (default: 0)'),
  }),
  execute: async ({ context }) => {
    try {
      const { limit, minTrades } = context;

      // Simplified query without problematic distinct counts
      const query = `
        query PumpFunNewTokens {
          Solana(dataset: realtime) {
            DEXTradeByTokens(
              limit: {count: ${Math.min(limit || 10, 50)}}
              orderBy: {descending: Block_Time}
              where: {
                Trade: {
                  Dex: {
                    ProtocolName: {in: ["pump", "pump_amm", "pumpfun"]}
                  }
                }
                Transaction: {
                  Result: {Success: true}
                }
              }
            ) {
              Trade {
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
                PriceInUSD
                Amount
                Dex {
                  ProtocolName
                  ProgramAddress
                }
              }
              Block {
                Time
              }
            }
          }
        }
      `;

      const response = await axios.post(
        BITQUERY_API_URL,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BITQUERY_API_KEY}`,
          },
          timeout: 15000,
        }
      );

      if (response.data?.errors) {
        console.error('❌ Bitquery GraphQL Errors:', response.data.errors);
        return {
          success: false,
          error: response.data.errors[0]?.message || 'GraphQL query error',
          message: 'Failed to fetch Pump.fun tokens - API returned errors',
        };
      }

      const tokens = response.data?.data?.Solana?.DEXTradeByTokens || [];

      if (tokens.length === 0) {
        return {
          success: true,
          data: { tokens: [] },
          message: 'No new Pump.fun tokens found in recent blocks. Try again in a few moments.',
        };
      }

      // Group by token address to get unique tokens
      const tokenMap = new Map();
      for (const trade of tokens) {
        const address = trade.Trade.Currency.MintAddress;
        if (!tokenMap.has(address)) {
          tokenMap.set(address, {
            name: trade.Trade.Currency.Name || 'Unknown',
            symbol: trade.Trade.Currency.Symbol || 'N/A',
            mintAddress: address,
            priceUSD: trade.Trade.PriceInUSD || 0,
            launchTime: trade.Block.Time,
            platform: trade.Trade.Dex.ProtocolName,
            trades: 1,
            volume: trade.Trade.Amount || 0,
          });
        } else {
          // Update existing token data
          const existing = tokenMap.get(address);
          existing.trades += 1;
          existing.volume += trade.Trade.Amount || 0;
        }
      }

      const formattedTokens = Array.from(tokenMap.values())
        .filter(t => t.trades >= (minTrades || 0))
        .sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());

      return {
        success: true,
        data: {
          tokens: formattedTokens,
          count: formattedTokens.length,
          source: 'Bitquery (Real-time)',
        },
        message: `Found ${formattedTokens.length} Pump.fun tokens`,
      };
    } catch (error: any) {
      console.error('❌ Bitquery Pump.fun Error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Pump.fun tokens from Bitquery',
      };
    }
  },
});

/**
 * Get buy/sell pressure for a specific token
 */
export const getTokenBuySellPressure = createTool({
  id: 'bitquery-token-pressure',
  description: 'Analyze buy/sell pressure for a Solana token. Shows if token is being accumulated (bought) or distributed (sold), with buyer/seller counts and volume breakdown.',
  inputSchema: z.object({
    tokenAddress: z.string().describe('Token mint address (e.g., "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" for USDC)'),
    timeframe: z.enum(['5m', '15m', '1h', '24h']).optional().default('1h').describe('Time period to analyze (default: 1h)'),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenAddress, timeframe } = context;

      // Convert timeframe to minutes
      const timeframeMinutes: Record<string, number> = {
        '5m': 5,
        '15m': 15,
        '1h': 60,
        '24h': 1440,
      };

      const minutes = timeframeMinutes[timeframe || '1h'];

      const query = `
        query TokenPressure($tokenAddress: String!, $since: DateTime) {
          Solana(dataset: realtime) {
            DEXTradeByTokens(
              where: {
                Trade: {
                  Currency: {MintAddress: {is: $tokenAddress}}
                }
                Block: {Time: {since: $since}}
                Transaction: {Result: {Success: true}}
              }
            ) {
              Trade {
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
                PriceInUSD
              }
              buyVolume: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: buy}}}})
              sellVolume: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: sell}}}})
              buyers: count(distinct: Trade_Account_Buyer)
              sellers: count(distinct: Trade_Account_Seller)
              buyTrades: count(if: {Trade: {Side: {Type: {is: buy}}}})
              sellTrades: count(if: {Trade: {Side: {Type: {is: sell}}}})
              totalTrades: count
            }
          }
        }
      `;

      const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

      const response = await axios.post(
        BITQUERY_API_URL,
        {
          query,
          variables: {
            tokenAddress,
            since,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BITQUERY_API_KEY}`,
          },
          timeout: 15000,
        }
      );

      const data = response.data?.data?.Solana?.DEXTradeByTokens?.[0];

      if (!data) {
        return {
          success: false,
          error: 'No trading data found',
          message: `No trading activity found for this token in the last ${timeframe}`,
        };
      }

      const buyVolume = data.buyVolume || 0;
      const sellVolume = data.sellVolume || 0;
      const totalVolume = buyVolume + sellVolume;
      
      const buyPressure = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;
      const sellPressure = 100 - buyPressure;

      // Determine sentiment
      let sentiment = 'Neutral';
      if (buyPressure > 60) sentiment = 'Bullish';
      else if (buyPressure > 55) sentiment = 'Slightly Bullish';
      else if (buyPressure < 40) sentiment = 'Bearish';
      else if (buyPressure < 45) sentiment = 'Slightly Bearish';

      return {
        success: true,
        data: {
          token: {
            name: data.Trade.Currency.Name,
            symbol: data.Trade.Currency.Symbol,
            address: data.Trade.Currency.MintAddress,
            priceUSD: data.Trade.PriceInUSD,
          },
          timeframe,
          pressure: {
            buyPressure: buyPressure.toFixed(2) + '%',
            sellPressure: sellPressure.toFixed(2) + '%',
            sentiment,
          },
          volume: {
            buy: buyVolume,
            sell: sellVolume,
            total: totalVolume,
          },
          participants: {
            buyers: data.buyers,
            sellers: data.sellers,
            ratio: data.sellers > 0 ? (data.buyers / data.sellers).toFixed(2) : 'N/A',
          },
          trades: {
            buy: data.buyTrades,
            sell: data.sellTrades,
            total: data.totalTrades,
          },
        },
        message: `${sentiment} sentiment - ${buyPressure.toFixed(1)}% buy pressure`,
      };
    } catch (error: any) {
      console.error('❌ Bitquery Pressure Error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch buy/sell pressure data',
      };
    }
  },
});

/**
 * Get real-time DEX prices for multiple tokens
 */
export const getDEXPrices = createTool({
  id: 'bitquery-dex-prices',
  description: 'Get real-time prices for Solana tokens from DEXes (Raydium, Orca, Pump.fun, etc.). More accurate than centralized exchanges for new/volatile tokens.',
  inputSchema: z.object({
    tokenAddresses: z.array(z.string()).describe('Array of token mint addresses to get prices for'),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenAddresses } = context;

      const query = `
        query DEXPrices($addresses: [String!]) {
          Solana(dataset: realtime) {
            DEXTradeByTokens(
              limit: {count: 100}
              orderBy: {descending: Block_Time}
              where: {
                Trade: {
                  Currency: {MintAddress: {in: $addresses}}
                }
                Transaction: {Result: {Success: true}}
              }
            ) {
              Trade {
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
                PriceInUSD
                Dex {
                  ProtocolName
                  ProtocolFamily
                }
              }
              Block {
                Time
              }
            }
          }
        }
      `;

      const response = await axios.post(
        BITQUERY_API_URL,
        {
          query,
          variables: {
            addresses: tokenAddresses,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BITQUERY_API_KEY}`,
          },
          timeout: 15000,
        }
      );

      const trades = response.data?.data?.Solana?.DEXTradeByTokens || [];

      if (trades.length === 0) {
        return {
          success: false,
          error: 'No price data found',
          message: 'No recent DEX trades found for these tokens',
        };
      }

      // Get the most recent price for each token
      const priceMap = new Map();
      
      for (const trade of trades) {
        const address = trade.Trade.Currency.MintAddress;
        if (!priceMap.has(address)) {
          priceMap.set(address, {
            name: trade.Trade.Currency.Name,
            symbol: trade.Trade.Currency.Symbol,
            address: address,
            priceUSD: trade.Trade.PriceInUSD,
            dex: trade.Trade.Dex.ProtocolName,
            protocol: trade.Trade.Dex.ProtocolFamily,
            lastUpdate: trade.Block.Time,
          });
        }
      }

      const prices = Array.from(priceMap.values());

      return {
        success: true,
        data: {
          prices,
          count: prices.length,
          source: 'Bitquery DEX (Real-time)',
        },
        message: `Retrieved prices for ${prices.length} tokens from DEXes`,
      };
    } catch (error: any) {
      console.error('❌ Bitquery DEX Prices Error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch DEX prices',
      };
    }
  },
});

/**
 * Get trending tokens on Solana DEXes
 */
export const getTrendingDEXTokens = createTool({
  id: 'bitquery-trending-tokens',
  description: 'Get trending tokens on Solana DEXes based on recent trading activity, buyer count, and volume. Great for discovering hot new tokens.',
  inputSchema: z.object({
    limit: z.number().optional().default(20).describe('Number of tokens to return (default: 20)'),
    minBuyers: z.number().optional().default(5).describe('Minimum number of unique buyers (default: 5)'),
  }),
  execute: async ({ context }) => {
    try {
      const { limit, minBuyers } = context;

      const query = `
        query TrendingTokens($limit: Int!, $since: DateTime) {
          Solana(dataset: realtime) {
            DEXTradeByTokens(
              limit: {count: $limit}
              orderBy: {descending: buyers}
              where: {
                Block: {Time: {since: $since}}
                Transaction: {Result: {Success: true}}
              }
            ) {
              Trade {
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
                PriceInUSD
                Dex {
                  ProtocolName
                }
              }
              Block {
                Time
              }
              buyers: count(distinct: Trade_Account_Buyer)
              sellers: count(distinct: Trade_Account_Seller)
              trades: count
              volume: sum(of: Trade_Amount)
            }
          }
        }
      `;

      // Look at last 1 hour for trending
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const response = await axios.post(
        BITQUERY_API_URL,
        {
          query,
          variables: {
            limit: Math.min(limit || 20, 50),
            since,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BITQUERY_API_KEY}`,
          },
          timeout: 15000,
        }
      );

      const tokens = response.data?.data?.Solana?.DEXTradeByTokens || [];

      // Filter by minimum buyers
      const filteredTokens = tokens.filter((t: any) => t.buyers >= (minBuyers || 5));

      const formattedTokens = filteredTokens.map((token: any) => ({
        name: token.Trade.Currency.Name || 'Unknown',
        symbol: token.Trade.Currency.Symbol || 'N/A',
        mintAddress: token.Trade.Currency.MintAddress,
        priceUSD: token.Trade.PriceInUSD || 0,
        dex: token.Trade.Dex.ProtocolName,
        buyers: token.buyers,
        sellers: token.sellers,
        trades: token.trades,
        volume: token.volume || 0,
        buyerRatio: token.sellers > 0 ? (token.buyers / token.sellers).toFixed(2) : 'N/A',
      }));

      return {
        success: true,
        data: {
          tokens: formattedTokens,
          count: formattedTokens.length,
          timeframe: '1 hour',
          source: 'Bitquery (Real-time)',
        },
        message: `Found ${formattedTokens.length} trending tokens in the last hour`,
      };
    } catch (error: any) {
      console.error('❌ Bitquery Trending Error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch trending tokens',
      };
    }
  },
});

/**
 * Export all Bitquery tools
 */
export function createBitqueryTools() {
  return {
    getPumpFunNewTokens,
    getTokenBuySellPressure,
    getDEXPrices,
    getTrendingDEXTokens,
  };
}
