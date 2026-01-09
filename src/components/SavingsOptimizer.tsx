"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, RefreshCcw, Loader2, Trash2 } from 'lucide-react';
import { Transaction } from '../types.ts';
import { detectSubscriptions } from '../services/geminiService.ts';
import { formatNumber } from '../utils/formatters.ts';

interface SavingsOptimizerProps {
  transactions: Transaction[];
}

const SavingsOptimizer: React.FC<SavingsOptimizerProps> = ({ transactions }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyze = async () => {
      if (transactions.length < 5) return;
      setLoading(true);
      const data = await detectSubscriptions(transactions);
      setSubscriptions(data);
      setLoading(false);
    };
    analyze();
  }, [transactions.length]);

  if (transactions.length < 5) return null;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Otimizador de Gastos
        </h3>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
      </div>

      <div className="space-y-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-rose-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">R$ {formatNumber(sub.amount)} • {sub.frequency}</p>
                </div>
                <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </div>
              </div>
              <p className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md inline-block">
                <Zap className="w-3 h-3 inline mr-1" /> {sub.tip}
              </p>
            </div>
          ))
        ) : !loading && (
          <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma assinatura recorrente detectada ainda.</p>
        )}
      </div>
    </div>
  );
};

export default SavingsOptimizer;