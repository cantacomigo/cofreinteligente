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
    if (s >= 80) return { text: 'Excelente', icon: <ShieldCheck className="w-3 h-3 text-emerald-500" /> };
    if (s >= 50) return { text: 'Regular', icon: <TrendingUp className="w-3 h-3 text-amber-500" /> };
    return { text: 'Crítica', icon: <AlertCircle className="w-3 h-3 text-rose-500" /> };
  };

  const label = getLabel(score);

  return (
    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
      <div className="relative w-14 h-14 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={18}
              outerRadius={25}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor(score)} />
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-slate-900">{score}</span>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Saúde Financeira</h3>
        <div className="flex items-center gap-1">
          {label.icon}
          <span className="font-bold text-slate-700 text-[10px]">{label.text}</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScore;