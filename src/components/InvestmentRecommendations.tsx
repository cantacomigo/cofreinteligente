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
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-800 text-xs">Sugestões de Investimento</h3>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Atualizar'}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <p className="text-[10px] font-medium italic">Analisando mercado...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-700 transition-colors">{rec.product}</h4>
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {rec.yield}
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mb-2 leading-tight">
                  {rec.reasoning}
                </p>
                <div className="flex items-center gap-3 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Liquidez: {rec.liquidity}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Risco Baixo
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-[10px] italic">Sem recomendações no momento.</p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 bg-emerald-600 flex items-center justify-between group cursor-pointer">
        <span className="text-white text-[9px] font-black uppercase tracking-wider">Ver detalhes</span>
        <ExternalLink className="w-3 h-3 text-white/70 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default InvestmentRecommendations;