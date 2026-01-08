"use client";

import React, { useState } from 'react';
import { X, Target, Calendar, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../constants.tsx';
import { Goal } from '../types.ts';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'emergency' as Goal['category'],
    interestRate: '10',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: formData.title,
      targetAmount: Number(formData.targetAmount),
      deadline: formData.deadline,
      category: formData.category,
      interestRate: Number(formData.interestRate),
      description: formData.description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-emerald-600 text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-lg md:text-xl font-bold">Nova Meta Financeira</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">O que você quer conquistar?</label>
            <input
              required
              type="text"
              placeholder="Ex: Viagem para o Japão"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Valor Alvo (R$)</label>
              <input
                required
                type="number"
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                value={formData.targetAmount}
                onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Prazo Final</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <input
                  required
                  type="date"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Categoria</label>
              <select
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Rendimento (% a.a.)</label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                  value={formData.interestRate}
                  onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-200 mt-4 active:scale-95"
          >
            Criar Meta
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;