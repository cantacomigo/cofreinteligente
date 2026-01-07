
import React, { useState, useMemo } from 'react';
import { 
  Wallet, Target, TrendingUp, History, Plus, LayoutDashboard, 
  Trash2, Clock, Sparkles, ChevronRight, Layers, BarChart3,
  ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  AreaChart, Area
} from 'recharts';
import { Goal, Transaction, UserProfile } from './types';
import { MOCK_USER, CATEGORIES, FINANCE_CATEGORIES } from './constants';
import GoalCard from './components/GoalCard';
import PixModal from './components/PixModal';
import AIAdvisor from './components/AIAdvisor';
import InvestmentRecommendations from './components/InvestmentRecommendations';

type Tab = 'dashboard' | 'goals' | 'finance' | 'investments';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [goals, setGoals] = useState<Goal[]>([
    { 
      id: 'g1', 
      userId: MOCK_USER.id, 
      title: 'Viagem Japão', 
      description: 'Passagens e hospedagem em Tokyo e Kyoto.',
      targetAmount: 15000, 
      currentAmount: 4200, 
      interestRate: 12.5, 
      deadline: '2025-12-15', 
      category: 'travel', 
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'g2', 
      userId: MOCK_USER.id, 
      title: 'Reserva', 
      description: 'Fundo para imprevistos e segurança familiar.',
      targetAmount: 20000, 
      currentAmount: 8500, 
      interestRate: 10.75, 
      deadline: '2026-06-30', 
      category: 'emergency', 
      createdAt: new Date().toISOString() 
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', amount: 5000, type: 'income', category: 'salary', description: 'Salário Mensal', createdAt: new Date().toISOString(), method: 'manual' },
    { id: 't2', amount: 1200, type: 'expense', category: 'food', description: 'Supermercado', createdAt: new Date().toISOString(), method: 'manual' },
    { id: 't3', goalId: 'g1', amount: 500, type: 'deposit', category: 'travel', createdAt: new Date().toISOString(), method: 'pix' }
  ]);

  const [isPixOpen, setIsPixOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Cálculos Financeiros
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const invested = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    return { income, expense, invested, balance: income - expense - invested };
  }, [transactions, goals]);

  const sortedByDeadline = useMemo(() => 
    [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
  [goals]);

  const top3ProgressData = useMemo(() => {
    return sortedByDeadline.slice(0, 3).map(g => ({
      name: g.title,
      progresso: Math.round((g.currentAmount / g.targetAmount) * 100)
    }));
  }, [sortedByDeadline]);

  const handleDeposit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsPixOpen(true);
  };

  const confirmDeposit = (amount: number) => {
    if (!selectedGoal) return;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      goalId: selectedGoal.id,
      amount,
      type: 'deposit',
      category: selectedGoal.category,
      createdAt: new Date().toISOString(),
      method: 'pix'
    };
    setTransactions(prev => [newTx, ...prev]);
    setGoals(prev => prev.map(g => g.id === selectedGoal.id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const handleUpdateGoalDescription = (goalId: string, description: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, description } : g));
  };

  const navItemClass = (tab: Tab) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
    ${activeTab === tab ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}
  `;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-40 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl"><Wallet className="w-6 h-6 text-white" /></div>
          <h1 className="text-xl font-bold text-slate-900">Cofre Inteligente</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}><LayoutDashboard className="w-5 h-5" /> Painel</button>
          <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}><DollarSign className="w-5 h-5" /> Meu Dinheiro</button>
          <button onClick={() => setActiveTab('goals')} className={navItemClass('goals')}><Target className="w-5 h-5" /> Metas</button>
          <button onClick={() => setActiveTab('investments')} className={navItemClass('investments')}><TrendingUp className="w-5 h-5" /> Investimentos</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-8 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ArrowUpCircle className="w-5 h-5" /></div>
                  <span className="font-bold text-slate-500 text-sm">Ganhos Totais</span>
                </div>
                <h3 className="text-2xl font-black">R$ {totals.income.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><ArrowDownCircle className="w-5 h-5" /></div>
                  <span className="font-bold text-slate-500 text-sm">Gastos Totais</span>
                </div>
                <h3 className="text-2xl font-black">R$ {totals.expense.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-slate-400">
                  <div className="bg-slate-800 p-2 rounded-lg"><Wallet className="w-5 h-5" /></div>
                  <span className="font-bold text-sm">Saldo Disponível</span>
                </div>
                <h3 className="text-2xl font-black text-emerald-400">R$ {totals.balance.toLocaleString('pt-BR')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600"/> Progresso das Metas</h3>
                  <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                    <ResponsiveContainer aspect={2}>
                      <BarChart data={top3ProgressData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 600}} axisLine={false} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="progresso" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {sortedByDeadline.slice(0, 2).map(g => (
                    <GoalCard 
                      key={g.id} 
                      goal={g} 
                      onDeposit={handleDeposit} 
                      onDelete={() => {}} 
                      onViewDetails={() => {}} 
                      onUpdateDescription={handleUpdateGoalDescription}
                    />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4">
                <AIAdvisor activeGoals={goals} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Extrato Detalhado</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm"><PlusCircle className="w-4 h-4"/> Ganho</button>
                <button className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm"><PlusCircle className="w-4 h-4"/> Gasto</button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 capitalize font-bold text-slate-700">{t.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{t.description || 'Transação'}</td>
                      <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-500">
            {goals.map(g => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onDeposit={handleDeposit} 
                onDelete={() => {}} 
                onViewDetails={() => {}} 
                onUpdateDescription={handleUpdateGoalDescription}
              />
            ))}
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <InvestmentRecommendations goals={goals} balance={totals.invested} />
          </div>
        )}
      </main>

      {selectedGoal && (
        <PixModal 
          isOpen={isPixOpen} 
          onClose={() => setIsPixOpen(false)} 
          goalTitle={selectedGoal.title} 
          onConfirm={confirmDeposit} 
        />
      )}
    </div>
  );
};

export default App;
