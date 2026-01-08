"use client";

import React from 'react';
import { 
  LayoutDashboard, BarChart3, PiggyBank, Loader2
} from 'lucide-react';
import { Goal, Transaction } from '../types.ts';
import FinancialHealthScore from '../components/FinancialHealthScore.tsx';
import CashFlowChart from '../components/CashFlowChart.tsx';
import InvestmentRecommendations from '../components/InvestmentRecommendations.tsx';
import SavingsOptimizer from '../components/SavingsOptimizer.tsx';
import SmartSavingsRules from '../components/SmartSavingsRules.tsx';
import CashFlowPrediction from '../components/CashFlowPrediction.tsx';
import AIAdvisor from '../components/AIAdvisor.tsx';
import SavingsChallenges from '../components/SavingsChallenges.tsx';

interface DashboardPageProps {
  goals: Goal[];
  transactions: Transaction[];
  challenges: any[];
  totals: { income: number; expense: number; invested: number; balance: number };
  financialScore: number;
  showCharts: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  goals,
  transactions,
  challenges,
  totals,
  financialScore,
  showCharts,
}) => {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center min-h-[70px]">
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Ganhos</span>
          <h3 className="text-base font-black text-slate-900">R$ {totals.income.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center min-h-[70px]">
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Gastos</span>
          <h3 className="text-base font-black text-slate-900">R$ {totals.expense.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center min-h-[70px] relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-12 h-12 text-emerald-600" />
          </div>
          <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Guardado</span>
          <h3 className="text-base font-black text-emerald-700">R$ {totals.invested.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg flex flex-col justify-center min-h-[70px]">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Saldo</span>
          <h3 className="text-base font-black text-emerald-400">R$ {totals.balance.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <FinancialHealthScore score={financialScore} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        <div className="lg:col-span-8 space-y-3 md:space-y-4">
          <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
            <h3 className="font-black text-[10px] md:text-xs flex items-center gap-2 mb-3"><BarChart3 className="w-3.5 h-3.5 text-emerald-600"/> Fluxo Mensal</h3>
            <div className="h-[200px]">
              {showCharts ? <CashFlowChart transactions={transactions} /> : <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />}
            </div>
          </div>
          <InvestmentRecommendations goals={goals} balance={totals.balance} />
          <SavingsOptimizer transactions={transactions} />
        </div>
        <div className="lg:col-span-4 space-y-3 md:space-y-4">
          <SmartSavingsRules />
          <CashFlowPrediction transactions={transactions} balance={totals.balance} />
          <div className="h-[350px]">
            <AIAdvisor activeGoals={goals} />
          </div>
          <SavingsChallenges challenges={challenges} onAddChallenge={() => {}} onUpdateProgress={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;