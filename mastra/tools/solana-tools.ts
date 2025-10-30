import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';

// Initialize Solana connection
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC);

export function createSolanaTools() {
  return {
    fetchBalance: createTool({
      id: 'fetch-balance',
      description: 'Fetches SOL and SPL token balances for a Solana wallet address',
      inputSchema: z.object({
        address: z.string().describe('Solana wallet address (base58 format)'),
      }),
      execute: async ({ context }) => {
        try {
          const { address } = context;
          const publicKey = new PublicKey(address);

          // Fetch SOL balance
          const balance = await connection.getBalance(publicKey);
          const solBalance = balance / LAMPORTS_PER_SOL;

          // Fetch SPL token accounts
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          });

          const tokens = tokenAccounts.value
            .filter((account) => {
              const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
              return amount && amount > 0;
            })
            .map((account) => {
              const info = account.account.data.parsed.info;
              return {
                mint: info.mint,
                amount: info.tokenAmount.uiAmount,
                decimals: info.tokenAmount.decimals,
              };
            });

          return {
            success: true,
            data: {
              address,
              solBalance,
              tokens,
              tokenCount: tokens.length,
            },
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to fetch balance',
          };
        }
      },
    }),

    fetchTokenPrice: createTool({
      id: 'fetch-token-price',
      description: 'Fetches current price for Solana tokens. Accepts token symbol (SOL, USDC, BONK) or CoinGecko ID.',
      inputSchema: z.object({
        token: z.string().describe('Token symbol (e.g., SOL, USDC, BONK, JUP) or CoinGecko ID'),
      }),
      execute: async ({ context }) => {
        try {
          const { token } = context;
          
          // Map of common token symbols to their CoinGecko IDs
          const tokenIdMap: Record<string, string> = {
            'SOL': 'solana',
            'USDC': 'usd-coin',
            'USDT': 'tether',
            'BONK': 'bonk',
            'JUP': 'jupiter-exchange-solana',
            'RAY': 'raydium',
            'ORCA': 'orca',
            'PYTH': 'pyth-network',
            'WIF': 'dogwifcoin',
            'BOME': 'book-of-meme',
            'MNGO': 'mango-markets',
            'STEP': 'step-finance',
            'SBR': 'saber',
            'SAMO': 'samoyedcoin',
            'FIDA': 'bonfida',
          };

          // Determine if input is a symbol or ID
          const tokenId = tokenIdMap[token.toUpperCase()] || token.toLowerCase();

          // Use CoinGecko simple price API for fast, reliable pricing
          const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
            params: {
              ids: tokenId,
              vs_currencies: 'usd',
              include_24hr_change: true,
              include_24hr_vol: true,
              include_market_cap: true,
            },
          });

          const priceData = response.data[tokenId];
          
          if (!priceData) {
            return {
              success: false,
              error: `Price not available for ${token}. Try using the token's CoinGecko ID or check if it's listed.`,
            };
          }

          return {
            success: true,
            data: {
              token: token.toUpperCase(),
              tokenId: tokenId,
              price: priceData.usd,
              priceFormatted: `$${priceData.usd < 0.01 ? priceData.usd.toFixed(6) : priceData.usd.toFixed(2)}`,
              change24h: priceData.usd_24h_change || 0,
              changeFormatted: `${priceData.usd_24h_change > 0 ? '+' : ''}${(priceData.usd_24h_change || 0).toFixed(2)}%`,
              volume24h: priceData.usd_24h_vol || 0,
              marketCap: priceData.usd_market_cap || 0,
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to fetch token price',
          };
        }
      },
    }),

    fetchSwapQuote: createTool({
      id: 'fetch-swap-quote',
      description: 'Fetches a token swap quote from Jupiter Aggregator (Mainnet only)',
      inputSchema: z.object({
        inputMint: z.string().describe('Input token mint address'),
        outputMint: z.string().describe('Output token mint address'),
        amount: z.number().describe('Amount of input token to swap'),
        slippageBps: z.number().optional().describe('Slippage tolerance in basis points (default: 50 = 0.5%)'),
      }),
      execute: async ({ context }) => {
        try {
          const { inputMint, outputMint, amount, slippageBps = 50 } = context;
          
          // Check if on devnet
          const isDevnet = SOLANA_RPC.toLowerCase().includes('devnet');
          if (isDevnet) {
            return {
              success: false,
              error: 'Jupiter swaps only work on Solana Mainnet',
              message: `⚠️ You're currently on DEVNET. Jupiter swaps and most tokens (like NOS) only exist on MAINNET.\n\n` +
                      `To enable swaps:\n` +
                      `1. Update .env.local: NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com\n` +
                      `2. Restart the server\n` +
                      `3. Get real SOL (0.1 SOL minimum recommended)\n` +
                      `4. Switch Phantom wallet to Mainnet\n\n` +
                      `For testing without real money, you can:\n` +
                      `- Test wallet connections on devnet\n` +
                      `- Test SOL transfers with test tokens\n` +
                      `- Check balances and network info\n\n` +
                      `See NETWORK_CONFIGURATION.md for detailed guide.`,
            };
          }
          
          // Convert amount to lamports/smallest unit (assuming 6 decimals for most tokens)
          const amountInSmallestUnit = Math.floor(amount * 1000000);

          const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
            params: {
              inputMint,
              outputMint,
              amount: amountInSmallestUnit,
              slippageBps,
            },
            timeout: 10000, // 10 second timeout
          });

          const quote = response.data;

          return {
            success: true,
            data: {
              inputMint,
              outputMint,
              inAmount: quote.inAmount,
              outAmount: quote.outAmount,
              outAmountFormatted: (parseInt(quote.outAmount) / 1000000).toFixed(6),
              priceImpactPct: quote.priceImpactPct,
              route: quote.routePlan?.map((plan: any) => plan.swapInfo.label).join(' → '),
              slippageBps,
            },
            message: `Swap quote: ${amount} input tokens → ${(parseInt(quote.outAmount) / 1000000).toFixed(6)} output tokens. Price impact: ${quote.priceImpactPct}%. Route: ${quote.routePlan?.map((plan: any) => plan.swapInfo.label).join(' → ')}`,
          };
        } catch (error: any) {
          if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return {
              success: false,
              error: 'Jupiter API timeout',
              message: 'The Jupiter swap service is taking too long to respond. Please try again in a moment.',
            };
          }
          return {
            success: false,
            error: error.message || 'Failed to fetch swap quote',
            message: 'Could not get swap quote from Jupiter. The tokens may not have sufficient liquidity, or Jupiter API may be temporarily unavailable.',
          };
        }
      },
    }),

    fetchValidators: createTool({
      id: 'fetch-validators',
      description: 'Fetches active Solana validators for staking',
      inputSchema: z.object({
        limit: z.number().optional().describe('Number of validators to return (default: 10)'),
      }),
      execute: async ({ context }) => {
        try {
          const { limit = 10 } = context;
          const voteAccounts = await connection.getVoteAccounts();

          const validators = voteAccounts.current
            .sort((a, b) => b.activatedStake - a.activatedStake)
            .slice(0, limit)
            .map((validator) => ({
              votePubkey: validator.votePubkey,
              nodePubkey: validator.nodePubkey,
              commission: validator.commission,
              activatedStake: validator.activatedStake / LAMPORTS_PER_SOL,
              lastVote: validator.lastVote,
            }));

          return {
            success: true,
            data: {
              validators,
              totalValidators: voteAccounts.current.length,
              delinquentValidators: voteAccounts.delinquent.length,
            },
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to fetch validators',
          };
        }
      },
    }),

    fetchMetrics: createTool({
      id: 'fetch-metrics',
      description: 'Fetches Solana network metrics including TVL from DeFiLlama',
      inputSchema: z.object({
        metric: z.enum(['tvl', 'all']).optional().describe('Specific metric to fetch (default: all)'),
      }),
      execute: async ({ context }) => {
        try {
          // Fetch from DeFiLlama
          const response = await axios.get('https://api.llama.fi/v2/chains');
          const solanaData = response.data.find((chain: any) => chain.name === 'Solana');

          if (!solanaData) {
            return {
              success: false,
              error: 'Solana metrics not found',
            };
          }

          return {
            success: true,
            data: {
              chain: 'Solana',
              tvl: solanaData.tvl,
              tokenSymbol: solanaData.tokenSymbol,
              cmcId: solanaData.cmcId,
              gecko_id: solanaData.gecko_id,
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to fetch metrics',
          };
        }
      },
    }),

    fetchAuction: createTool({
      id: 'fetch-auction',
      description: 'Fetches information about Solana burn auctions and recent auction activity',
      inputSchema: z.object({
        auctionId: z.number().optional().describe('Specific auction ID (optional)'),
      }),
      execute: async ({ context }) => {
        // Note: Solana burn auctions are currently in development
        // This is a placeholder that provides useful information about the program
        
        return {
          success: true,
          data: {
            status: 'Coming Soon',
            message: 'Solana Burn Auction Program',
            description: 'The Solana burn auction is a deflationary mechanism where users can participate in auctions by burning SOL tokens to receive exclusive NFTs and rewards.',
            features: [
              '🔥 Burn SOL tokens to participate',
              '🎨 Receive exclusive NFTs',
              '💎 Deflationary mechanism for SOL',
              '🏆 Competitive bidding system',
            ],
            how_to_participate: [
              '1. Visit the official Solana Burn website',
              '2. Connect your Solana wallet (Phantom, Solflare)',
              '3. Check current auction details',
              '4. Place your bid by burning SOL',
              '5. Wait for auction to close',
              '6. Claim your NFT if you win',
            ],
            official_links: {
              website: 'https://burn.solana.com',
              twitter: 'https://twitter.com/solanamobile',
              docs: 'https://docs.solana.com',
            },
            next_steps: [
              'Follow @solanamobile on Twitter for auction announcements',
              'Join Solana Discord for community updates',
              'Check burn.solana.com regularly for launch date',
            ],
            note: 'The burn auction program is being developed by the Solana Foundation. Stay tuned for official announcements about launch dates and auction schedules.',
          },
          message: 'Solana Burn Auction information retrieved. Follow official channels for launch announcements.',
        };
      },
    }),

    listAllTokens: createTool({
      id: 'list-all-tokens',
      description: 'Fetches a comprehensive list of all verified Solana tokens with metadata (symbol, name, mint address)',
      inputSchema: z.object({
        limit: z.number().optional().describe('Maximum number of tokens to return (default: 50, max: 500)'),
        search: z.string().optional().describe('Search query to filter tokens by name or symbol'),
        source: z.enum(['jupiter', 'coingecko']).optional().default('jupiter').describe('Data source to use'),
      }),
      execute: async ({ context }) => {
        try {
          const { limit = 50, search, source = 'jupiter' } = context;
          let tokens: any[] = [];

          if (source === 'coingecko') {
            // Use CoinGecko API for token list
            const response = await axios.get(
              'https://api.coingecko.com/api/v3/coins/markets',
              {
                params: {
                  vs_currency: 'usd',
                  category: 'solana-ecosystem',
                  order: 'market_cap_desc',
                  per_page: Math.min(limit, 250),
                  page: 1,
                  sparkline: false,
                }
              }
            );

            tokens = response.data.map((coin: any) => ({
              symbol: coin.symbol?.toUpperCase() || 'Unknown',
              name: coin.name || 'Unknown Token',
              address: coin.id, // CoinGecko uses ID instead of address
              decimals: null,
              logoURI: coin.image || null,
              tags: ['coingecko'],
              verified: true,
              dailyVolume: coin.total_volume || 0,
              price: coin.current_price || 0,
              marketCap: coin.market_cap || 0,
              priceChange24h: coin.price_change_percentage_24h || 0,
            }));
          } else {
            // Jupiter is BLOCKED on this network - Use CoinGecko instead
            console.warn('⚠️ Jupiter API unavailable - falling back to CoinGecko');
            const response = await axios.get(
              'https://api.coingecko.com/api/v3/coins/markets',
              {
                params: {
                  vs_currency: 'usd',
                  category: 'solana-ecosystem',
                  order: 'market_cap_desc',
                  per_page: Math.min(limit * 2, 250),
                  page: 1,
                  sparkline: false,
                },
                timeout: 15000
              }
            );

            tokens = response.data;

            // Filter by search query if provided
            if (search) {
              const searchLower = search.toLowerCase();
              tokens = tokens.filter((coin: any) =>
                coin.symbol?.toLowerCase().includes(searchLower) ||
                coin.name?.toLowerCase().includes(searchLower)
              );
            }

            // Format CoinGecko data
            tokens = tokens.map((coin: any) => ({
              symbol: coin.symbol?.toUpperCase() || 'Unknown',
              name: coin.name || 'Unknown Token',
              address: coin.id,
              decimals: null,
              logoURI: coin.image || null,
              tags: ['coingecko', ...(coin.symbol === 'bonk' || coin.name?.toLowerCase().includes('meme') ? ['meme'] : [])],
              verified: true,
              dailyVolume: coin.total_volume || 0,
              price: coin.current_price || 0,
              marketCap: coin.market_cap || 0,
              priceChange24h: coin.price_change_percentage_24h || 0,
            }));
          }

          // Limit results
          const limitedTokens = tokens.slice(0, Math.min(limit, 500));

          return {
            success: true,
            data: {
              total: tokens.length,
              returned: limitedTokens.length,
              tokens: limitedTokens,
              source: source === 'coingecko' ? 'CoinGecko' : 'Jupiter Token List',
            },
            message: `Found ${tokens.length} tokens${search ? ` matching "${search}"` : ''}, showing ${limitedTokens.length} from ${source}`,
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to fetch token list',
            message: 'Could not retrieve Solana token list. Try using source="coingecko" if Jupiter is slow.',
          };
        }
      },
    }),

    searchToken: createTool({
      id: 'search-token',
      description: 'Search for a specific Solana token by name or symbol and get its details. Use this for swap operations to find token addresses.',
      inputSchema: z.object({
        query: z.string().describe('Token name or symbol to search for (e.g., "SOL", "Bonk", "Jupiter", "NOS")'),
      }),
      execute: async ({ context }) => {
        try {
          const { query } = context;

          // Fetch tokens from Jupiter with timeout
          const response = await axios.get('https://token.jup.ag/all', {
            timeout: 10000 // 10 second timeout
          });
          const tokens = response.data;

          // Search for matching tokens
          const searchLower = query.toLowerCase();
          const matches = tokens.filter((token: any) => 
            token.symbol?.toLowerCase() === searchLower ||
            token.name?.toLowerCase().includes(searchLower) ||
            token.symbol?.toLowerCase().includes(searchLower)
          );

          if (matches.length === 0) {
            return {
              success: false,
              error: `No tokens found matching "${query}"`,
              message: `Try searching for common tokens like SOL, USDC, BONK, JUP, RAY, ORCA, etc.`,
            };
          }

          // Get the best match (exact symbol match or first result)
          const exactMatch = matches.find((t: any) => 
            t.symbol?.toLowerCase() === searchLower
          );
          const bestMatch = exactMatch || matches[0];

          // Fetch current price if available
          let priceData = null;
          try {
            const priceResponse = await axios.get(
              `https://price.jup.ag/v6/price?ids=${bestMatch.address}`,
              { timeout: 5000 }
            );
            priceData = priceResponse.data.data?.[bestMatch.address];
          } catch (e) {
            // Price not available, continue without it
          }

          return {
            success: true,
            data: {
              symbol: bestMatch.symbol,
              name: bestMatch.name,
              address: bestMatch.address,
              decimals: bestMatch.decimals,
              logoURI: bestMatch.logoURI,
              verified: bestMatch.verified || false,
              tags: bestMatch.tags || [],
              price: priceData?.price || null,
              priceFormatted: priceData?.price ? `$${priceData.price.toFixed(priceData.price < 1 ? 6 : 2)}` : 'N/A',
              totalMatches: matches.length,
              alternativeMatches: matches.slice(1, 4).map((t: any) => ({
                symbol: t.symbol,
                name: t.name,
                address: t.address,
              })),
            },
            message: `Found ${bestMatch.symbol}: ${bestMatch.name}${priceData ? ` at $${priceData.price.toFixed(6)}` : ''}. Address: ${bestMatch.address}`,
          };
        } catch (error: any) {
          if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return {
              success: false,
              error: 'Request timeout - Jupiter API is slow or unavailable',
              message: 'The token list service is taking too long to respond. Please try again.',
            };
          }
          return {
            success: false,
            error: error.message || 'Failed to search for token',
            message: 'Could not search token list',
          };
        }
      },
    }),
  };
}
