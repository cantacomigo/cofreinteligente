"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '../types.ts';

interface CashFlowChartProps {
  transactions: Transaction[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions }) => {
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

  return (
    <div className="h-[200px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
          />
          <Bar name="Ganhos" dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar name="Gastos" dataKey="expense" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;