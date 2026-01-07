
import React from 'react';
import { 
  Plane, Car, Home, GraduationCap, ShieldAlert, Sparkles, 
  ShoppingBag, Utensils, Zap, HeartPulse, Bus, Banknote, Briefcase, TrendingUp 
} from 'lucide-react';
import { UserProfile } from './types';

export const CATEGORIES = {
  travel: { label: 'Viagem', icon: <Plane className="w-5 h-5" />, color: 'bg-blue-500' },
  car: { label: 'Veículo', icon: <Car className="w-5 h-5" />, color: 'bg-purple-500' },
  home: { label: 'Casa Própria', icon: <Home className="w-5 h-5" />, color: 'bg-emerald-500' },
  education: { label: 'Educação', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-orange-500' },
  emergency: { label: 'Reserva de Emergência', icon: <ShieldAlert className="w-5 h-5" />, color: 'bg-rose-500' },
  leisure: { label: 'Lazer', icon: <Sparkles className="w-5 h-5" />, color: 'bg-amber-500' },
};

export const FINANCE_CATEGORIES = {
  income: [
    { value: 'salary', label: 'Salário', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'freelance', label: 'Freelance', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'bonus', label: 'Bônus/Presente', icon: <Banknote className="w-4 h-4" /> },
  ],
  expense: [
    { value: 'food', label: 'Alimentação', icon: <Utensils className="w-4 h-4" /> },
    { value: 'transport', label: 'Transporte', icon: <Bus className="w-4 h-4" /> },
    { value: 'utilities', label: 'Contas (Luz/Água)', icon: <Zap className="w-4 h-4" /> },
    { value: 'health', label: 'Saúde', icon: <HeartPulse className="w-4 h-4" /> },
    { value: 'shopping', label: 'Compras', icon: <ShoppingBag className="w-4 h-4" /> },
  ]
};

export const MOCK_USER: UserProfile = {
  id: 'user-123',
  fullName: 'João Silva',
  email: 'joao@exemplo.com',
  totalBalance: 4500.00,
  avatarUrl: 'https://picsum.photos/seed/user123/200'
};
