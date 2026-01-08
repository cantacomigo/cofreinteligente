"use client";

import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants.tsx';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string, amount: number) => void;
}

const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(category, Number(amount));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h3 className="font-bold">Definir Orçamento</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
            <select
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {FINANCE_CATEGORIES.expense.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Limite Mensal (R$)</label>
            <input
              required
              type="number"
              placeholder="0,00"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all text-xl font-black text-center"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:bg-emerald-700"
          >
            Salvar Limite
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetBudgetModal;