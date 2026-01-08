"use client";

import React from 'react';
import { AlertTriangle, Plus, Target } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants.tsx';

interface Budget {
  category: string;
  limit_amount: number;
  spent: number;
}

interface BudgetTrackerProps {
  budgets: Budget[];
  onSetBudget: () => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budgets, onSetBudget }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Orçamentos Mensais
        </h3>
        <button 
          onClick={onSetBudget}
          className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl transition-colors"
          title="Definir novo limite"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {budgets.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Nenhum orçamento definido para este mês.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit_amount) * 100, 100);
            const isNearLimit = percentage >= 80;
            const isOverLimit = percentage >= 100;
            
            const categoryLabel = FINANCE_CATEGORIES.expense.find(c => c.value === budget.category)?.label || budget.category;

            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{categoryLabel}</span>
                  <span className="text-slate-500">
                    R$ {budget.spent.toLocaleString('pt-BR')} / R$ {budget.limit_amount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isOverLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isOverLimit && (
                  <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertTriangle className="w-3 h-3" /> Limite excedido!
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;