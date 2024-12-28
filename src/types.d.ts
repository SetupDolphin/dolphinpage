interface Window {
  solana?: {
    isConnected: boolean;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    // ... other wallet methods
  }
} 