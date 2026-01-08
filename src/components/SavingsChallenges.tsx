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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-slate-800">
          <Trophy className="w-5 h-5 text-amber-500" />
          Desafios de Economia
        </h3>
        <button 
          onClick={onAddChallenge}
          className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Aceitar Desafio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {challenges.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center bg-slate-50/50">
            <Flame className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Você não tem desafios ativos. Que tal começar um?</p>
          </div>
        ) : (
          challenges.map(ch => {
            const progress = (ch.current_amount / ch.target_amount) * 100;
            return (
              <div key={ch.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{ch.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ch.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Clock className="w-3 h-3" />
                    {new Date(ch.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{progress.toFixed(0)}%</span>
                </div>

                <button 
                  onClick={() => onUpdateProgress(ch.id, 10)}
                  className="w-full mt-3 py-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-[10px] font-bold rounded-lg border border-slate-100 hover:border-amber-100 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3 h-3" /> Marcar Progresso
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