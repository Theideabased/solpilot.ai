export {};

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        disconnect?: () => Promise<void>;
        isConnected?: boolean;
        publicKey?: { toString: () => string };
        signMessage?: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
      };
    };
    solflare?: {
      isSolflare?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect?: () => Promise<void>;
      isConnected?: boolean;
      publicKey?: { toString: () => string };
      signMessage?: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
    };
  }
}
