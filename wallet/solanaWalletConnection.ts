import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export type SolanaWalletType = "phantom" | "solflare";

export async function connectToSolanaWallet(walletType: "phantom" | "solflare" = "phantom") {
  console.log(`🔌 Starting connection to ${walletType}...`);
  
  const provider = getProvider(walletType);
  
  // Check if already connected - if so, just return the existing connection
  if (provider.publicKey) {
    console.log("✅ Already connected to wallet!");
    const publicKey = new PublicKey(provider.publicKey.toString());
    const address = publicKey.toString();
    console.log("📍 Wallet address:", address);
    
    // Get authentication token
    const nonce = await fetchNonce(address);
    const { token } = await signMessage(provider, address, nonce);
    
    return { address, token };
  }
  
  console.log("🔑 Requesting wallet connection...");
  
  // Simple direct connection - no disconnect, no retries
  const response = await provider.connect();
  
  console.log("✅ Successfully connected to wallet!");
  const publicKey = new PublicKey(response.publicKey.toString());
  const address = publicKey.toString();
  console.log("📍 Wallet address:", address);
  
  // Get nonce and sign message for authentication
  console.log("🔐 Requesting authentication...");
  const nonce = await fetchNonce(address);
  const { token } = await signMessage(provider, address, nonce);
  
  return { address, token };
}

async function fetchNonce(address: string): Promise<string> {
  try {
    console.log("📝 Fetching nonce for address:", address);
    const res = await fetch("/api/auth/nonce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: address }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Nonce fetch failed:", errorData);
      throw new Error(errorData.error || "Failed to get authentication nonce");
    }
    
    const data = await res.json();
    console.log("✅ Nonce received:", data.nonce);
    return data.nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error);
    throw error;
  }
}

function getProvider(walletType: SolanaWalletType) {
  if (walletType === "phantom") {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    throw new Error("Phantom wallet is not installed! Please visit https://phantom.app/");
  } else {
    if ("solflare" in window) {
      const provider = window.solflare;
      if (provider?.isSolflare) {
        return provider;
      }
    }
    throw new Error("Solflare wallet is not installed! Please visit https://solflare.com/");
  }
}

const signMessage = async (
  provider: any,
  address: string,
  nonce: string
): Promise<{ status: string; token: string | null }> => {
  try {
    console.log("✍️ Requesting message signature...");
    // Create message to sign
    const message = `Sign this message to authenticate with SOLPILOT:\n\nNonce: ${nonce}`;
    const encodedMessage = new TextEncoder().encode(message);

    // Request signature from wallet
    const signedMessage = await provider.signMessage(encodedMessage, "utf8");
    
    // Convert signature to base58
    const signature = bs58.encode(signedMessage.signature);
    console.log("✅ Message signed successfully");

    // Verify signature with backend
    console.log("🔍 Verifying signature with backend...");
    const res = await fetch("/api/auth/verifyArbitrary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nonce, signature, address }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Verification failed:", errorData);
      return { status: "failed", token: null };
    }

    const { isValid, token } = await res.json();

    if (isValid) {
      console.log("✅ Authentication successful!");
      return { status: "success", token };
    }

    console.warn("⚠️ Signature verification returned invalid");
    return { status: "failed", token: null };
  } catch (error) {
    console.error("❌ Signing error:", error);
    return { status: "failed", token: null };
  }
};
