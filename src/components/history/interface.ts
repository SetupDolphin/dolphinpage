export interface History {
  id: number;
  date: Date;
  command: string;
  output: string;
}

interface SolanaSubmission {
  address: string;
  timestamp: number;
  deviceId: string;
}
