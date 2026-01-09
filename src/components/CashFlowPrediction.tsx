"use client";

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Transaction } from '../types.ts';
import { getCashFlowPrediction } from '../services/geminiService.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface CashFlowPredictionProps {
  transactions: Transaction[];
  balance: number;
}

const CashFlowPrediction: React.FC<CashFlowPredictionProps> = ({ transactions, balance }) => {
  const [prediction, setPrediction] = useState<{ predictedBalance: number, alert: string, riskLevel: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (transactions.length < 3) return;
      setLoading(true);
      const data = await getCashFlowPrediction(transactions, balance);
      setPrediction(data);
      setLoading(false);
    };
    fetchPrediction();
  }, [transactions.length, balance]);

  if (transactions.length < 3) return null;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Predição de Fluxo (30 dias)</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400 italic font-medium">IA analisando seus padrões...</p>
        </div>
      ) : prediction ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo Previsto</p>
              <h4 className={`text-2xl font-black ${prediction.predictedBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(prediction.predictedBalance)}
              </h4>
            </div>
            {prediction.predictedBalance < balance ? (
              <TrendingDown className="w-8 h-8 text-rose-200" />
            ) : (
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            )}
          </div>

          <div className={`p-4 rounded-2xl border flex gap-3 ${
            prediction.riskLevel === 'high' ? 'bg-rose-50 border-rose-100 text-rose-900' :
            prediction.riskLevel === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-900' :
            'bg-emerald-50 border-emerald-100 text-emerald-900'
          }`}>
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
              prediction.riskLevel === 'high' ? 'text-rose-500' :
              prediction.riskLevel === 'medium' ? 'text-amber-500' :
              'text-emerald-500'
            }`} />
            <p className="text-xs font-medium leading-relaxed">
              {prediction.alert}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Aguardando dados suficientes para predição.</p>
      )}
    </div>
  );
};

export default CashFlowPrediction;