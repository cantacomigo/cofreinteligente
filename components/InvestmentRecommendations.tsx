
import React, { useState, useEffect } from 'react';
import { Lightbulb, ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import { getInvestmentRecommendations } from '../services/geminiService';
import { Goal } from '../types';

interface Recommendation {
  product: string;
  yield: string;
  liquidity: string;
  reasoning: string;
}

interface Props {
  goals: Goal[];
  balance: number;
}

const InvestmentRecommendations: React.FC<Props> = ({ goals, balance }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      const data = await getInvestmentRecommendations(goals, balance);
      setRecommendations(data);
      setLoading(false);
    };
    fetchRecs();
  }, [goals.length, balance]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Analisando o mercado para você...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sugestões de Investimento</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Conservador</span>
            </div>
            
            <h4 className="text-lg font-bold text-slate-900 mb-1">{rec.product}</h4>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rentabilidade</p>
                <p className="text-sm font-bold text-emerald-600">{rec.yield}</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Liquidez</p>
                <p className="text-sm font-bold text-slate-700">{rec.liquidity}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed italic mb-6">
              "{rec.reasoning}"
            </p>

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
              Saber mais
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Importante:</strong> Estas sugestões são geradas por Inteligência Artificial com base em estratégias conservadoras padrão. Consulte sempre um assessor financeiro antes de tomar decisões de investimento reais.
        </p>
      </div>
    </div>
  );
};

export default InvestmentRecommendations;
