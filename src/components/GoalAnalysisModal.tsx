"use client";

import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, Calendar, Target, Loader2, Lightbulb } from 'lucide-react';
import { Goal } from '../types.ts';
import { getFinancialInsight } from '../services/geminiService.ts';

interface GoalAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  userBalance: number;
}

const GoalAnalysisModal: React.FC<GoalAnalysisModalProps> = ({ isOpen, onClose, goal, userBalance }) => {
  const [insight, setInsight] = useState<{ analysis: string; monthlySuggestion: number; actionSteps: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && goal) {
      const fetchInsight = async () => {
        setLoading(true);
        const data = await getFinancialInsight(goal, userBalance);
        setInsight(data);
        setLoading(false);
      };
      fetchInsight();
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative h-32 bg-emerald-600 p-8 flex items-end">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black leading-tight">Análise Inteligente</h3>
              <p className="text-emerald-100 text-sm font-medium">{goal.title}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Status Atual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso</span>
              <p className="text-xl font-black text-emerald-600">{progress.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faltam</span>
              <p className="text-xl font-black text-slate-700">R$ {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Diária</span>
              <p className="text-xl font-black text-slate-700">R$ {((goal.targetAmount - goal.currentAmount) / 30).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h4>Sugestões da IA para você</h4>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium italic">Gemini está processando seu plano...</p>
              </div>
            ) : insight ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                  <p className="text-emerald-900 text-sm leading-relaxed font-medium">
                    "{insight.analysis}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-slate-400 uppercase">Próximos Passos</h5>
                    <ul className="space-y-2">
                      {insight.actionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl text-white">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase mb-2">Recomendação Mensal</h5>
                    <p className="text-2xl font-black">R$ {insight.monthlySuggestion.toLocaleString('pt-BR')}</p>
                    <p className="text-slate-400 text-xs mt-2">Poupar este valor mensalmente garante sua meta no prazo.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">Não foi possível gerar insights agora.</p>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            Entendido, vamos lá!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalAnalysisModal;