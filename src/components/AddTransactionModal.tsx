"use client";

import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants.tsx';
import { Transaction } from '../types.ts';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as Transaction['type'],
    category: 'shopping',
    description: '',
    method: 'manual' as Transaction['method']
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      method: formData.method
    });
    onClose();
  };

  const categories = formData.type === 'income' ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`p-6 border-b flex justify-between items-center ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white transition-colors`}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            <h3 className="text-xl font-bold">Registrar {formData.type === 'income' ? 'Ganho' : 'Gasto'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Ganho
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: 'shopping' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Gasto
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Valor (R$)</label>
            <input
              required
              type="number"
              placeholder="0,00"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all text-2xl font-black text-center"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
            <select
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none capitalize"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Almoço de domingo"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className={`w-full ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white font-bold py-4 rounded-2xl transition-all shadow-lg mt-4`}
          >
            Confirmar Registro
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;