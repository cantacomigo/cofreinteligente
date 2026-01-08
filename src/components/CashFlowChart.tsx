"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '../types.ts';

interface CashFlowChartProps {
  transactions: Transaction[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Atraso intencional para garantir que o container DOM esteja pronto
    const timer = setTimeout(() => setMounted(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const data = React.useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('pt-BR', { month: 'short' }),
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        income: 0,
        expense: 0
      };
    }).reverse();

    transactions.forEach(t => {
      const tDate = new Date(t.createdAt);
      const monthData = last6Months.find(m => m.monthIdx === tDate.getMonth() && m.year === tDate.getFullYear());
      if (monthData) {
        if (t.type === 'income') monthData.income += t.amount;
        if (t.type === 'expense') monthData.expense += t.amount;
      }
    });

    return last6Months;
  }, [transactions]);

  if (!mounted) {
    return (
      <div className="w-full h-[200px] bg-slate-50 flex items-center justify-center rounded-xl">
        <div className="w-1/2 h-2 bg-slate-200 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-[200px] min-h-[200px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          <Bar name="Ganhos" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar name="Gastos" dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;