"use client";

import React from 'react';
import { Clock, ToggleRight, ToggleLeft, Trash2, Calendar, Target } from 'lucide-react';
import { AutomaticPlan, Goal } from '../types.ts';

interface AutomaticSavingsProps {
  plans: AutomaticPlan[];
  goals: Goal[];
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

const AutomaticSavings: React.FC<AutomaticSavingsProps> = ({ plans, goals, onToggle, onDelete, onAddClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Poupança Automática</h3>
        </div>
        <button 
          onClick={onAddClick}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors"
        >
          + Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.length === 0 ? (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
            <p className="text-slate-400 font-medium">Você ainda não tem automações configuradas.</p>
          </div>
        ) : (
          plans.map(plan => {
            const goal = goals.find(g => g.id === plan.goalId);
            return (
              <div key={plan.id} className={`p-6 rounded-3xl border-2 transition-all ${plan.active ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Target className={`w-4 h-4 ${plan.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-800">{goal?.title || 'Meta Excluída'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onToggle(plan.id, !plan.active)} className="transition-colors">
                      {plan.active ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </button>
                    <button onClick={() => onDelete(plan.id)} className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-slate-900">R$ {plan.amount.toLocaleString('pt-BR')}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Frequência: {plan.frequency}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase mb-1">
                      <Calendar className="w-3 h-3" /> Próxima
                    </div>
                    <p className="text-xs font-bold text-slate-700">{new Date(plan.nextExecution).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AutomaticSavings;