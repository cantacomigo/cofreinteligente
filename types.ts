export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string; // Campo para detalhes da meta
  targetAmount: number;
  currentAmount: number;
  interestRate: number; // Taxa de juros anual (%)
  deadline: string;
  category: 'travel' | 'car' | 'home' | 'education' | 'emergency' | 'leisure';
  createdAt: string;
}

export interface Transaction {
  id: string;
  goalId?: string; // Opcional para transações gerais de caixa
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

export interface AutomaticPlan {
  id: string;
  goalId: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextExecution: string;
  active: boolean;
}