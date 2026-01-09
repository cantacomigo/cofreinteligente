import React from 'react';
import { TrendingUp, Plus, Calendar, Settings, Trash2, Check, X, FileText, ChevronRight } from 'lucide-react';
import { Goal } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';
import { formatNumber } from '../utils/formatters.ts';

interface GoalCardProps {
  goal: Goal;
  onDeposit: (goal: Goal) => void;
  onViewDetails: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onDeposit, onViewDetails, onDelete }) => {
  const category = CATEGORIES[goal.category];
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  
  const deadlineDate = new Date(goal.deadline);
  
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative">
      <div className={`h-1.5 w-full ${category.color}`} />
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`${category.color} p-2.5 rounded-2xl text-white shadow-lg shadow-current/20`}>
              {React.cloneElement(category.icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{goal.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category.label}</p>
            </div>
          </div>
          <button 
            onClick={() => onDelete(goal)} 
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xs font-bold text-slate-400">R$</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">
              {formatNumber(goal.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
            <span>Objetivo: R$ {formatNumber(goal.targetAmount)}</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{progress.toFixed(0)}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <div 
              className={`h-full ${category.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Rendimento</p>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-black">+{goal.interestRate}% a.a.</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Prazo</p>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3 h-3" />
              <span className="text-xs font-black">{deadlineDate.toLocaleDateString('pt-BR', {month: 'short', year: '2-digit'})}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button 
            onClick={() => onDeposit(goal)} 
            className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Depositar
          </button>
          <button 
            onClick={() => onViewDetails(goal)} 
            className="p-3 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;