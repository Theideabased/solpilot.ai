import axios from "axios";
import { PublicKey } from "@solana/web3.js";

export async function extractTransactionData(message: string) {
  // Updated regex to capture full Solana addresses (32-44 characters, base58 encoded)
  const regex_send = /send\s+(\d+(?:\.\d+)?)\s+([A-Z]+)\s+to\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i;
  const regex_transfer = /transfer\s+(\d+(?:\.\d+)?)\s+([A-Z]+)\s+to\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i;

  const match_send = message.match(regex_send);
  const match_transfer = message.match(regex_transfer);
  let match;

  if (match_send) {
    match = match_send;
  } else {
    match = match_transfer;
  }

  if (match) {
    const amount = parseFloat(match[1]);
    const token = match[2].toUpperCase();
    const receiver = match[3];

    // Validate Solana address
    if (!isValidSolanaAddress(receiver)) {
      return { amount: 0, token: "", receiver: "", status: "fail_address" };
    }

    // Fetch token metadata
    const tokenMetadata = await fetchTokenMetadata(token);
    if (!tokenMetadata) {
      return { amount: 0, token: "", receiver: "", status: "fail_token" };
    }

    return { amount: amount, token: tokenMetadata, receiver: receiver, status: "success" };
  } else {
    return { amount: 0, token: "", receiver: "", status: "fail_match" };
  }
}

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

const fetchTokenMetadata = async (ticker: string) => {
  try {
    // For SOL, return hardcoded metadata (no API call needed)
    if (ticker === 'SOL') {
      return {
        symbol: 'SOL',
        name: 'Solana',
        address: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        tokenType: 'native',
        denom: 'SOL',
      };
    }

    // For other tokens, fetch from Jupiter with timeout
    const response = await axios.get("https://token.jup.ag/strict", {
      timeout: 8000, // 8 second timeout
    });
    
    const token = response.data.find((t: any) => t.symbol === ticker);
    
    if (token) {
      return {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        decimals: token.decimals,
        tokenType: 'spl',
        denom: token.symbol,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    // If Jupiter fails and it's SOL, return hardcoded
    if (ticker === 'SOL') {
      return {
        symbol: 'SOL',
        name: 'Solana',
        address: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        tokenType: 'native',
        denom: 'SOL',
      };
    }
    return null;
  }
};
