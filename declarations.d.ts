declare module '*.png' {
    const value: string;
    export default value;
  }

interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
      publicKey?: any;
    };
  };
  solflare?: {
    isSolflare?: boolean;
    connect: () => Promise<{ publicKey: any }>;
    disconnect: () => Promise<void>;
    signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
    publicKey?: any;
  };
}