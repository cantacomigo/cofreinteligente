"use client";

import React from 'react';
import { AlertTriangle, Plus, Target, Wallet } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants.tsx';
import { formatNumber, formatCurrency } from '../utils/formatters.ts';

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
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-xs flex items-center gap-2 text-slate-800 uppercase tracking-widest">
            <Target className="w-4 h-4 text-emerald-600" />
            Orçamentos
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Controle de gastos mensal</p>
        </div>
        <button 
          onClick={onSetBudget}
          className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          title="Definir novo limite"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {budgets.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Wallet className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase">Nenhum limite definido</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit_amount) * 100, 100);
            const remaining = Math.max(0, budget.limit_amount - budget.spent);
            const isNearLimit = percentage >= 80;
            const isOverLimit = percentage >= 100;
            
            const categoryLabel = FINANCE_CATEGORIES.expense.find(c => c.value === budget.category)?.label || budget.category;

            return (
              <div key={budget.category} className="space-y-2.5">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[11px] font-black text-slate-800 capitalize">{categoryLabel}</span>
                    <p className="text-[9px] font-medium text-slate-400">Restam {formatCurrency(remaining)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-900">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold ml-1">/ {formatCurrency(budget.limit_amount)}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      isOverLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isOverLimit && (
                  <p className="text-[9px] text-rose-500 font-black flex items-center gap-1 uppercase tracking-tighter animate-pulse">
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