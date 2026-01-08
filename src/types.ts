export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  interestRate: number;
  deadline: string;
  category: 'travel' | 'car' | 'home' | 'education' | 'emergency' | 'leisure';
  createdAt: string;
}

export interface Transaction {
  id: string;
  goalId?: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'yield' | 'income' | 'expense';
  category: string;
  description?: string;
  createdAt: string;
  method: 'pix' | 'automatic' | 'manual' | 'card' | 'transfer';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  totalBalance: number;
}

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}