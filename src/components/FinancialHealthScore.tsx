"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

interface FinancialHealthScoreProps {
  score: number; // 0 a 100
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ score }) => {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const getLabel = (s: number) => {
    if (s >= 80) return { text: 'Excelente', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> };
    if (s >= 50) return { text: 'Regular', icon: <TrendingUp className="w-4 h-4 text-amber-500" /> };
    return { text: 'Crítica', icon: <AlertCircle className="w-4 h-4 text-rose-500" /> };
  };

  const label = getLabel(score);

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saúde Financeira</h3>
      
      <div className="relative w-full h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={60}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor(score)} />
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-black text-slate-900 leading-none">{score}</span>
          <span className="text-[8px] font-bold text-slate-400">PONTOS</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
        {label.icon}
        <span className="font-bold text-slate-700 text-xs">{label.text}</span>
      </div>
      
      <p className="mt-2 text-[10px] text-slate-400 leading-tight">
        Baseado em suas metas e gastos.
      </p>
    </div>
  );
};

export default FinancialHealthScore;