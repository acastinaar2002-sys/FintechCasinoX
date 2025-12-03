
export enum AppMode {
  HOME = 'HOME',
  GAMES = 'GAMES',
  WALLET = 'WALLET',
  EDUCATION = 'EDUCATION',
  AI_CONCIERGE = 'AI_CONCIERGE',
  KYC = 'KYC',
  ADMIN = 'ADMIN'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isLoading?: boolean;
  attachment?: {
    type: 'image';
    data: string; // base64
  };
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'bonus';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface UserProfile {
  name: string;
  joinedAt: number;
  isVIP: boolean;
  isAdmin?: boolean;
}

export interface GameLog {
  id: string;
  user: string;
  game: string;
  bet: number;
  payout: number;
  multiplier: number;
  timestamp: number;
  result: 'WIN' | 'LOSS';
}

export interface MultiplayerMessage {
  type: 'CHAT' | 'WIN';
  user: string;
  message?: string;
  amount?: number;
  game?: string;
  timestamp: number;
}
