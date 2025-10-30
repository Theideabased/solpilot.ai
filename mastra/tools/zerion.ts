/**
 * Zerion API Integration for SOLPILOT
 * 
 * Provides comprehensive wallet data across Solana and 25+ EVM chains:
 * - Portfolio balances (tokens, NFTs, DeFi positions)
 * - Transaction history with decoded details
 * - PnL (Profit & Loss) tracking
 * - Real-time market data and charts
 * - DeFi protocol positions
 */

import { createTool } from '@mastra/core';
import { z } from 'zod';

const ZERION_API_KEY = process.env.ZERION_API_KEY;
const ZERION_BASE_URL = 'https://api.zerion.io/v1';

// Helper function to make Zerion API requests
async function zerionRequest(endpoint: string, params?: Record<string, any>) {
  if (!ZERION_API_KEY) {
    throw new Error('ZERION_API_KEY is not set in environment variables');
  }

  const url = new URL(`${ZERION_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${ZERION_API_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zerion API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get comprehensive portfolio for a wallet address
 * Includes tokens, NFTs, and DeFi positions across all chains
 */
export const getPortfolioTool = createTool({
  id: 'zerion-get-portfolio',
  description: 'Get complete portfolio data for a wallet address including tokens, NFTs, and DeFi positions across Solana and EVM chains',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to fetch portfolio for'),
    currency: z.string().optional().default('usd').describe('Currency for values (usd, eth, btc)'),
  }),
  execute: async ({ context }) => {
    try {
      const { address, currency } = context;
      
      const data = await zerionRequest(`/wallets/${address}/positions`, {
        'currency': currency,
        'filter[positions]': 'only_simple',
      });

      // Format the response for better readability
      const portfolio = {
        totalValue: data.attributes?.total?.value || 0,
        totalValueFormatted: `$${(data.attributes?.total?.value || 0).toLocaleString()}`,
        positions: data.data?.map((position: any) => ({
          name: position.attributes?.fungible_info?.name || 'Unknown',
          symbol: position.attributes?.fungible_info?.symbol || '',
          quantity: position.attributes?.quantity?.numeric || 0,
          value: position.attributes?.value || 0,
          price: position.attributes?.price || 0,
          chain: position.relationships?.chain?.data?.id || 'unknown',
          type: position.attributes?.position_type || 'wallet',
        })) || [],
      };

      return {
        success: true,
        data: portfolio,
        message: `Portfolio for ${address}: Total value $${portfolio.totalValue.toLocaleString()} with ${portfolio.positions.length} positions`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch portfolio data',
      };
    }
  },
});

/**
 * Get transaction history for a wallet
 * Includes swaps, transfers, approvals, and DeFi interactions
 */
export const getTransactionsTool = createTool({
  id: 'zerion-get-transactions',
  description: 'Get transaction history for a wallet address with decoded details (swaps, transfers, approvals)',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to fetch transactions for'),
    limit: z.number().optional().default(20).describe('Number of transactions to return (max 100)'),
    currency: z.string().optional().default('usd').describe('Currency for transaction values'),
  }),
  execute: async ({ context }) => {
    try {
      const { address, limit, currency } = context;
      
      const data = await zerionRequest(`/wallets/${address}/transactions`, {
        'currency': currency,
        'page[size]': Math.min(limit, 100),
      });

      const transactions = data.data?.map((tx: any) => ({
        hash: tx.id,
        type: tx.attributes?.operation_type || 'unknown',
        status: tx.attributes?.status || 'unknown',
        timestamp: tx.attributes?.mined_at_block?.timestamp || null,
        fee: tx.attributes?.fee?.value || 0,
        chain: tx.relationships?.chain?.data?.id || 'unknown',
        transfers: tx.attributes?.transfers?.map((transfer: any) => ({
          from: transfer.sender,
          to: transfer.recipient,
          asset: transfer.fungible_info?.symbol || transfer.nft_info?.name || 'Unknown',
          quantity: transfer.quantity?.numeric || 0,
          value: transfer.value || 0,
        })) || [],
      })) || [];

      return {
        success: true,
        data: transactions,
        message: `Found ${transactions.length} transactions for ${address}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch transaction history',
      };
    }
  },
});

/**
 * Get PnL (Profit & Loss) data for a wallet
 * Shows gains, losses, and invested value
 */
export const getPnLTool = createTool({
  id: 'zerion-get-pnl',
  description: 'Get profit and loss data for a wallet showing gains, losses, and total invested value',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to calculate PnL for'),
    currency: z.string().optional().default('usd').describe('Currency for PnL calculation'),
  }),
  execute: async ({ context }) => {
    try {
      const { address, currency } = context;
      
      // Get portfolio positions to calculate PnL
      const data = await zerionRequest(`/wallets/${address}/positions`, {
        'currency': currency,
        'filter[positions]': 'only_simple',
      });

      let totalInvested = 0;
      let totalCurrent = 0;
      const positions = data.data?.map((position: any) => {
        const cost = position.attributes?.quantity?.numeric * (position.attributes?.fungible_info?.implementations?.[0]?.coingecko_id ? 1 : position.attributes?.price || 0);
        const value = position.attributes?.value || 0;
        totalInvested += cost;
        totalCurrent += value;
        
        return {
          asset: position.attributes?.fungible_info?.symbol || 'Unknown',
          invested: cost,
          current: value,
          pnl: value - cost,
          pnlPercent: cost > 0 ? ((value - cost) / cost * 100).toFixed(2) + '%' : '0%',
        };
      }) || [];

      const totalPnL = totalCurrent - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0';

      return {
        success: true,
        data: {
          totalInvested,
          totalCurrent,
          totalPnL,
          totalPnLPercent: `${totalPnLPercent}%`,
          positions,
        },
        message: `PnL for ${address}: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()} (${totalPnLPercent}%)`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to calculate PnL',
      };
    }
  },
});

/**
 * Get DeFi protocol positions
 * Shows staking, liquidity pools, lending positions
 */
export const getDeFiPositionsTool = createTool({
  id: 'zerion-get-defi-positions',
  description: 'Get DeFi protocol positions including staking, liquidity pools, and lending across 8000+ protocols',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to fetch DeFi positions for'),
    currency: z.string().optional().default('usd').describe('Currency for position values'),
  }),
  execute: async ({ context }) => {
    try {
      const { address, currency } = context;
      
      const data = await zerionRequest(`/wallets/${address}/positions`, {
        'currency': currency,
        'filter[positions]': 'only_complex',
      });

      const defiPositions = data.data?.map((position: any) => ({
        protocol: position.relationships?.dapp?.data?.id || 'unknown',
        type: position.attributes?.position_type || 'unknown',
        value: position.attributes?.value || 0,
        chain: position.relationships?.chain?.data?.id || 'unknown',
        details: position.attributes?.fungible_info?.name || '',
      })) || [];

      const totalDefiValue = defiPositions.reduce((sum: number, pos: any) => sum + pos.value, 0);

      return {
        success: true,
        data: {
          totalValue: totalDefiValue,
          totalValueFormatted: `$${totalDefiValue.toLocaleString()}`,
          positions: defiPositions,
        },
        message: `Found ${defiPositions.length} DeFi positions worth $${totalDefiValue.toLocaleString()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch DeFi positions',
      };
    }
  },
});

/**
 * Get NFT holdings for a wallet
 */
export const getNFTsTool = createTool({
  id: 'zerion-get-nfts',
  description: 'Get NFTs owned by a wallet address with metadata and floor prices',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to fetch NFTs for'),
    limit: z.number().optional().default(50).describe('Number of NFTs to return'),
  }),
  execute: async ({ context }) => {
    try {
      const { address, limit } = context;
      
      const data = await zerionRequest(`/wallets/${address}/nft-positions`, {
        'page[size]': Math.min(limit, 100),
      });

      const nfts = data.data?.map((nft: any) => ({
        name: nft.attributes?.nft_info?.name || 'Unknown',
        collection: nft.attributes?.nft_info?.collection?.name || '',
        tokenId: nft.attributes?.nft_info?.token_id || '',
        chain: nft.relationships?.chain?.data?.id || 'unknown',
        floorPrice: nft.attributes?.nft_info?.collection?.floor_price || 0,
        imageUrl: nft.attributes?.nft_info?.content?.preview?.url || '',
      })) || [];

      return {
        success: true,
        data: nfts,
        message: `Found ${nfts.length} NFTs for ${address}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch NFTs',
      };
    }
  },
});

/**
 * Get token price and market data
 */
export const getTokenDataTool = createTool({
  id: 'zerion-get-token-data',
  description: 'Get token price, market cap, and chart data for any token on supported chains',
  inputSchema: z.object({
    tokenAddress: z.string().describe('Token contract address'),
    chain: z.string().describe('Blockchain (e.g., solana, ethereum, base, arbitrum)'),
    currency: z.string().optional().default('usd').describe('Currency for price'),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenAddress, chain, currency } = context;
      
      const data = await zerionRequest(`/fungibles/${tokenAddress}`, {
        'currency': currency,
        'filter[chain_ids]': chain,
      });

      const tokenData = {
        name: data.data?.attributes?.name || 'Unknown',
        symbol: data.data?.attributes?.symbol || '',
        price: data.data?.attributes?.market_data?.price || 0,
        marketCap: data.data?.attributes?.market_data?.market_cap || 0,
        totalSupply: data.data?.attributes?.market_data?.total_supply || 0,
        priceChange24h: data.data?.attributes?.market_data?.changes?.percent_1d || 0,
        chain: chain,
      };

      return {
        success: true,
        data: tokenData,
        message: `${tokenData.symbol}: $${tokenData.price} (${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h}% 24h)`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch token data',
      };
    }
  },
});

// Export all Zerion tools
export const zerionTools = [
  getPortfolioTool,
  getTransactionsTool,
  getPnLTool,
  getDeFiPositionsTool,
  getNFTsTool,
  getTokenDataTool,
];

// Export as record object for Mastra Agent configuration
export const createZerionTools = () => ({
  getPortfolio: getPortfolioTool,
  getTransactions: getTransactionsTool,
  getPnL: getPnLTool,
  getDeFiPositions: getDeFiPositionsTool,
  getNFTs: getNFTsTool,
  getTokenData: getTokenDataTool,
});
