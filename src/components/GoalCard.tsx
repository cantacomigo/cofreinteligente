import React, { useState } from 'react';
import { TrendingUp, Plus, Calendar, Settings, Info, Trash2, Edit3, Check, X, FileText } from 'lucide-react';
import { Goal } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';

interface GoalCardProps {
  goal: Goal;
  onDeposit: (goal: Goal) => void;
  onViewDetails: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onUpdateDescription?: (goalId: string, description: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onDeposit, onViewDetails, onDelete, onUpdateDescription }) => {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(goal.description || '');

  const category = CATEGORIES[goal.category];
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  
  const deadlineDate = new Date(goal.deadline);
  const now = new Date();
  const diffTime = Math.max(0, deadlineDate.getTime() - now.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  
  const projectedValue = goal.currentAmount * Math.pow(1 + (goal.interestRate / 100), diffYears);
  const estimatedYield = projectedValue - goal.currentAmount;

  const handleSaveDesc = () => {
    if (onUpdateDescription) {
      onUpdateDescription(goal.id, tempDesc);
    }
    setIsEditingDesc(false);
  };

  const handleCancelDesc = () => {
    setTempDesc(goal.description || '');
    setIsEditingDesc(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out overflow-hidden flex flex-col group">
      <div className={`p-4 ${category.color} flex justify-between items-center text-white transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>
          <span className="font-semibold text-sm uppercase tracking-wider">{category.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onDelete(goal)} 
            className="p-1.5 hover:bg-rose-500/30 rounded-full transition-colors group/del"
            title="Excluir meta"
          >
            <Trash2 className="w-4 h-4 text-white/80 group-hover/del:text-white" />
          </button>
          <button 
            onClick={() => onViewDetails(goal)} 
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300">{goal.title}</h3>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <TrendingUp className="w-3 h-3" />
            {goal.interestRate}% a.a.
          </div>
        </div>

        <div className="mb-4 relative">
          {isEditingDesc ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <textarea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                placeholder="Adicione detalhes sobre sua meta..."
                className="w-full p-3 text-sm border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none resize-none bg-slate-50 text-slate-700 min-h-[80px]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={handleCancelDesc} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSaveDesc} className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingDesc(true)}
              className="group/desc cursor-pointer min-h-[40px] flex items-start gap-2 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300 mt-1 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${goal.description ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                {goal.description || 'Clique para adicionar uma descrição...'}
              </p>
              <Edit3 className="w-3 h-3 text-emerald-500 opacity-0 group-hover/desc:opacity-100 transition-opacity ml-auto mt-1" />
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-1 mb-4">
          <span className="text-2xl font-bold text-slate-900">R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
          <span className="text-slate-400 text-sm mb-1 pb-0.5">de R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${category.color} transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-600">{progress.toFixed(0)}% concluído</span>
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>{deadlineDate.toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {goal.currentAmount > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 mb-6 border border-slate-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-100 transition-colors duration-300">
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase mb-1">
              <Info className="w-3 h-3 text-emerald-500" />
              Projeção de Rendimento
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              O saldo atual renderá aprox. <span className="text-emerald-600 font-bold">R$ {estimatedYield.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> extras até o prazo.
            </p>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button 
            onClick={() => onDeposit(goal)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Depositar
          </button>
          <button 
            onClick={() => onViewDetails(goal)}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 transition-all active:scale-95"
          >
            <TrendingUp className="w-4 h-4" />
            Analisar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;