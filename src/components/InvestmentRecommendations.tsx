"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Zap, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { getInvestmentRecommendations } from '../services/geminiService.ts';
import { Goal } from '../types.ts';

interface Recommendation {
  product: string;
  yield: string;
  liquidity: string;
  reasoning: string;
}

interface InvestmentRecommendationsProps {
  goals: Goal[];
  balance: number;
}

const InvestmentRecommendations: React.FC<InvestmentRecommendationsProps> = ({ goals, balance }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (goals.length === 0) return;
    setLoading(true);
    const data = await getInvestmentRecommendations(goals, balance);
    if (data && Array.isArray(data)) {
      setRecommendations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [goals.length]);

  if (goals.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800">Sugestões de Investimento</h3>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium italic">Analisando mercado financeiro...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{rec.product}</h4>
                  <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    <TrendingUp className="w-3 h-3" />
                    {rec.yield}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {rec.reasoning}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Liquidez: {rec.liquidity}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Risco Baixo
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Não foi possível gerar recomendações no momento.</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-emerald-600 flex items-center justify-between group cursor-pointer">
        <span className="text-white text-xs font-bold">Aprenda mais sobre estes títulos</span>
        <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default InvestmentRecommendations;