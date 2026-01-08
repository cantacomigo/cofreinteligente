"use client";

import React, { useState } from 'react';
import { X, Clock, Repeat, ArrowRight } from 'lucide-react';
import { Goal } from '../types.ts';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plan: { goalId: string; amount: number; frequency: 'daily' | 'weekly' | 'monthly' }) => void;
  goals: Goal[];
}

const AddPlanModal: React.FC<AddPlanModalProps> = ({ isOpen, onClose, onAdd, goals }) => {
  const [formData, setFormData] = useState({
    goalId: goals[0]?.id || '',
    amount: '50',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      goalId: formData.goalId,
      amount: Number(formData.amount),
      frequency: formData.frequency
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">Automação de Poupança</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Para qual meta?</label>
            <select
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none"
              value={formData.goalId}
              onChange={e => setFormData({ ...formData, goalId: e.target.value })}
            >
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Valor (R$)</label>
              <input
                required
                type="number"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Frequência</label>
              <select
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3">
            <Repeat className="w-5 h-5 text-emerald-600 mt-1" />
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Ao ativar, o sistema transferirá automaticamente o valor do seu saldo disponível para a meta selecionada conforme o período escolhido.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-200"
          >
            Ativar Automação
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlanModal;