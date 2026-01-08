"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Trash2, Sparkles, Loader2, Save } from 'lucide-react';
import { Transaction } from '../types.ts';
import { supabase } from '../integrations/supabase/client.ts';
import { useSession } from '../contexts/SessionContextProvider.tsx';
import { categorizeTransaction } from '../services/geminiService.ts';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'> & { createdAt: string }) => void;
  onUpdate?: (id: string, transaction: any) => void;
  categories: { id: string, name: string, type: string }[];
  onRefreshCategories: () => void;
  editData?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate,
  categories, 
  onRefreshCategories,
  editData 
}) => {
  const { user } = useSession();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as Transaction['type'],
    category: '',
    description: '',
    method: 'manual' as Transaction['method'],
    date: new Date().toISOString().split('T')[0]
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount.toString(),
        type: editData.type,
        category: editData.category,
        description: editData.description || '',
        method: editData.method,
        date: new Date(editData.createdAt).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        method: 'manual',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editData, isOpen]);

  useEffect(() => {
    const filtered = categories.filter(c => c.type === formData.type);
    if (filtered.length > 0 && !formData.category && !editData) {
      setFormData(prev => ({ ...prev, category: filtered[0].name }));
    }
  }, [formData.type, categories, editData]);

  if (!isOpen) return null;

  const handleSuggestCategory = async () => {
    if (!formData.description) return;
    setIsSuggesting(true);
    const result = await categorizeTransaction(formData.description, formData.type);
    if (result && result.category) {
      const existing = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
      if (existing) {
        setFormData(prev => ({ ...prev, category: existing.name }));
      } else {
        setNewCategoryName(result.category);
        setIsAddingCategory(true);
      }
    }
    setIsSuggesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      method: formData.method,
      createdAt: new Date(formData.date).toISOString()
    };

    if (editData && onUpdate) {
      onUpdate(editData.id, data);
    } else {
      onAdd(data);
    }
    onClose();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !user) return;
    const { error } = await supabase.from('transaction_categories').insert({
      user_id: user.id,
      name: newCategoryName.trim(),
      type: formData.type
    });
    if (!error) {
      const addedName = newCategoryName.trim();
      setNewCategoryName('');
      setIsAddingCategory(false);
      onRefreshCategories();
      setFormData(prev => ({ ...prev, category: addedName }));
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`p-6 border-b flex justify-between items-center ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white transition-colors`}>
          <div className="flex items-center gap-2">
            {editData ? <Save className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
            <h3 className="text-xl font-bold">{editData ? 'Editar' : 'Registrar'} {formData.type === 'income' ? 'Ganho' : 'Gasto'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              disabled={!!editData}
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'} ${editData ? 'opacity-50' : ''}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Ganho
            </button>
            <button
              type="button"
              disabled={!!editData}
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'} ${editData ? 'opacity-50' : ''}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Gasto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Valor (R$)</label>
              <input
                required
                type="number"
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all text-xl font-black text-center"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Data</label>
              <input
                required
                type="date"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all text-sm font-bold"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Almoço de domingo"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              {!editData && formData.description && (
                <button
                  type="button"
                  onClick={handleSuggestCategory}
                  disabled={isSuggesting}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Categoria</label>
              <button 
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {isAddingCategory ? 'Cancelar' : 'Nova Categoria'}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="flex gap-2 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  className="flex-1 p-3 bg-slate-50 border-2 border-emerald-100 rounded-xl outline-none focus:border-emerald-500 text-sm"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Ok
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none capitalize"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!formData.category || !formData.amount}
            className={`w-full ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white font-bold py-4 rounded-2xl transition-all shadow-lg mt-4 hover:brightness-110 active:scale-[0.98] disabled:opacity-50`}
          >
            {editData ? 'Salvar Alterações' : 'Confirmar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;