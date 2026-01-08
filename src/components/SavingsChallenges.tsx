"use client";

import React from 'react';
import { Trophy, Flame, Plus, CheckCircle2, Clock } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: string;
  end_date: string;
}

interface SavingsChallengesProps {
  challenges: Challenge[];
  onAddChallenge: () => void;
  onUpdateProgress: (id: string, amount: number) => void;
}

const SavingsChallenges: React.FC<SavingsChallengesProps> = ({ challenges, onAddChallenge, onUpdateProgress }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Desafios
        </h3>
        <button 
          onClick={onAddChallenge}
          className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-black uppercase hover:bg-amber-200 transition-colors flex items-center gap-1"
        >
          <Plus className="w-2.5 h-2.5" /> Novo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {challenges.length === 0 ? (
          <div className="p-4 border border-dashed border-slate-100 rounded-xl text-center bg-slate-50/50">
            <p className="text-[10px] text-slate-400 font-medium">Nenhum desafio ativo.</p>
          </div>
        ) : (
          challenges.map(ch => {
            const progress = (ch.current_amount / ch.target_amount) * 100;
            return (
              <div key={ch.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all group">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">{ch.title}</h4>
                  <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {new Date(ch.end_date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-500">{progress.toFixed(0)}%</span>
                </div>

                <button 
                  onClick={() => onUpdateProgress(ch.id, 10)}
                  className="w-full mt-2 py-1 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 text-[9px] font-bold rounded-lg border border-slate-100 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" /> Progresso
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsChallenges;