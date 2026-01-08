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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className={`px-3 py-2 ${category.color} flex justify-between items-center text-white`}>
        <div className="flex items-center gap-1.5">
          <div className="bg-white/20 p-1 rounded-md">{React.cloneElement(category.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}</div>
          <span className="font-bold text-[10px] uppercase tracking-wider">{category.label}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onDelete(goal)} className="p-1 hover:bg-rose-500/30 rounded-full transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onViewDetails(goal)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Settings className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      
      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-800 truncate">{goal.title}</h3>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full text-[9px] font-black">
            <TrendingUp className="w-2.5 h-2.5" /> {goal.interestRate}%
          </div>
        </div>

        <div className="mb-2 relative">
          {isEditingDesc ? (
            <div className="space-y-1 animate-in fade-in">
              <textarea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                className="w-full p-2 text-[11px] border border-emerald-100 rounded-lg focus:border-emerald-500 outline-none resize-none bg-slate-50 text-slate-700 min-h-[50px]"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button onClick={handleCancelDesc} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"><X className="w-3 h-3" /></button>
                <button onClick={handleSaveDesc} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"><Check className="w-3 h-3" /></button>
              </div>
            </div>
          ) : (
            <div onClick={() => setIsEditingDesc(true)} className="group/desc cursor-pointer flex items-start gap-1.5 p-1 rounded-lg hover:bg-slate-50">
              <FileText className="w-3 h-3 text-slate-300 mt-0.5" />
              <p className={`text-[10px] leading-tight line-clamp-2 ${goal.description ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                {goal.description || 'Adicionar descrição...'}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-lg font-black text-slate-900">R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
          <span className="text-slate-400 text-[10px] font-bold">/ {goal.targetAmount.toLocaleString('pt-BR')}</span>
        </div>

        <div className="space-y-1 mb-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${category.color}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
            <span className="text-emerald-600">{progress.toFixed(0)}%</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" /> {deadlineDate.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {goal.currentAmount > 0 && (
          <div className="bg-slate-50 rounded-lg p-2 mb-4 border border-slate-100">
            <p className="text-[9px] text-slate-500 leading-tight">
              Rendimento estimado: <span className="text-emerald-600 font-bold">R$ {estimatedYield.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => onDeposit(goal)} className="flex items-center justify-center gap-1 bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[10px] hover:bg-emerald-700 transition-all"><Plus className="w-3.5 h-3.5" /> Depósito</button>
          <button onClick={() => onViewDetails(goal)} className="flex items-center justify-center gap-1 bg-slate-100 text-slate-700 font-bold py-1.5 rounded-lg text-[10px] hover:bg-slate-200 transition-all">Análise</button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;