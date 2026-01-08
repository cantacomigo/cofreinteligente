"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Target, LayoutDashboard, 
  ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle, LogOut, Loader2, PieChart as PieChartIcon,
  BarChart3, Plus, Search, Settings, User, Bell, Menu, X as CloseIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Goal, Transaction, UserProfile } from './src/types.ts';
import GoalCard from './src/components/GoalCard.tsx';
import PixModal from './src/components/PixModal.tsx';
import AIAdvisor from './src/components/AIAdvisor.tsx';
import AddGoalModal from './src/components/AddGoalModal.tsx';
import AddTransactionModal from './src/components/AddTransactionModal.tsx';
import GoalAnalysisModal from './src/components/GoalAnalysisModal.tsx';
import BudgetTracker from './src/components/BudgetTracker.tsx';
import SetBudgetModal from './src/components/SetBudgetModal.tsx';
import InvestmentRecommendations from './src/components/InvestmentRecommendations.tsx';
import FinancialHealthScore from './src/components/FinancialHealthScore.tsx';
import SavingsChallenges from './src/components/SavingsChallenges.tsx';
import CashFlowChart from './src/components/CashFlowChart.tsx';
import ProfileSettingsModal from './src/components/ProfileSettingsModal.tsx';
import CashFlowPrediction from './src/components/CashFlowPrediction.tsx';
import { useSession } from './src/contexts/SessionContextProvider.tsx';
import Login from './src/pages/Login.tsx';
import { supabase } from './src/integrations/supabase/client.ts';

type Tab = 'dashboard' | 'goals' | 'finance';

const App: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const invested = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const balance = income - expense - invested;
    return { income, expense, invested, balance };
  }, [transactions, goals]);

  const financialScore = useMemo(() => {
    if (goals.length === 0) return 50;
    const progressAvg = goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length;
    const expenseRatio = totals.income > 0 ? (totals.expense / totals.income) : 1;
    const score = (progressAvg * 60) + ((1 - Math.min(expenseRatio, 1)) * 40);
    return Math.round(score);
  }, [goals, totals]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  const budgetProgress = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((acc, t) => acc + t.amount, 0);
      return { category: b.category, limit_amount: Number(b.limit_amount), spent };
    });
  }, [budgets, transactions]);

  const categoryChartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount; });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', userId).maybeSingle();
      if (profileData) {
        setProfile({
          id: profileData.id, email: user?.email || '',
          fullName: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || user?.email || 'Usuário',
          avatarUrl: profileData.avatar_url || undefined, totalBalance: 0,
        });
      }

      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', userId);
      if (goalsData) {
        setGoals(goalsData.map(g => ({
          id: g.id, userId: g.user_id, title: g.title, description: g.description || undefined,
          targetAmount: Number(g.target_amount), currentAmount: Number(g.current_amount),
          interestRate: Number(g.interest_rate), deadline: g.deadline, category: g.category as Goal['category'],
          createdAt: g.created_at,
        })));
      }

      const { data: transactionsData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id, goalId: t.goal_id || undefined, amount: Number(t.amount),
          type: t.type as Transaction['type'], category: t.category, description: t.description || undefined,
          createdAt: t.created_at, method: t.method as Transaction['method'],
        })));
      }

      const { data: budgetsData } = await supabase.from('budgets').select('*').eq('user_id', userId);
      if (budgetsData) setBudgets(budgetsData);

      const { data: challengesData } = await supabase.from('challenges').select('*').eq('user_id', userId).eq('status', 'active');
      if (challengesData) setChallenges(challengesData);

      const { data: catData } = await supabase.from('transaction_categories').select('*').eq('user_id', userId);
      if (catData) setCustomCategories(catData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) fetchData(user.id); }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;
  if (!session) return <Login />;

  const handleDeposit = (goal: Goal) => { setSelectedGoal(goal); setIsPixOpen(true); };
  const handleAnalyseGoal = (goal: Goal) => { setSelectedGoal(goal); setIsAnalysisOpen(true); };

  const confirmDeposit = async (amount: number) => {
    if (!selectedGoal || !user) return;
    await supabase.from('transactions').insert({ 
      user_id: user.id, goal_id: selectedGoal.id, amount, 
      type: 'deposit', category: selectedGoal.category, method: 'pix' 
    });
    const newAmount = selectedGoal.currentAmount + amount;
    await supabase.from('goals').update({ current_amount: newAmount }).eq('id', selectedGoal.id);
    fetchData(user.id);
  };

  const handleAddGoal = async (newGoal: any) => { 
    if (!user) return; 
    await supabase.from('goals').insert({ user_id: user.id, ...newGoal }); 
    fetchData(user.id); 
  };

  const handleAddTransaction = async (newTx: any) => { 
    if (!user) return; 
    await supabase.from('transactions').insert({ user_id: user.id, ...newTx }); 
    fetchData(user.id); 
  };

  const handleDeleteGoal = async (goal: Goal) => { 
    if (confirm('Excluir meta?')) { 
      await supabase.from('goals').delete().eq('id', goal.id); 
      if (user) fetchData(user.id); 
    } 
  };
  
  const handleSaveBudget = async (category: string, amount: number) => {
    if (!user) return;
    await supabase.from('budgets').upsert({
      user_id: user.id, category, limit_amount: amount,
      month: new Date().getMonth() + 1, year: new Date().getFullYear()
    }, { onConflict: 'user_id, category, month, year' });
    fetchData(user.id);
  };

  const handleLogout = () => supabase.auth.signOut();

  const navItemClass = (tab: Tab) => `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-black uppercase tracking-tighter transition-all ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 pb-20 md:pb-0">
      {/* Sidebar para Desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-40">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-100">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tighter">COFRE.</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
            <LayoutDashboard className="w-4 h-4" /> Painel Geral
          </button>
          <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'finance' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
            <DollarSign className="w-4 h-4" /> Finanças
          </button>
          <button onClick={() => setActiveTab('goals')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Target className="w-4 h-4" /> Minhas Metas
          </button>
        </nav>
        
        <div className="p-4 mt-auto">
          <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-indigo-600" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold text-slate-900 truncate">{profile?.fullName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Configurações</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all text-xs">
            <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Header Mobile Fixo */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-sm font-black text-slate-900 tracking-tighter">COFRE.</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsTransactionModalOpen(true)} className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-100">
            <PlusCircle className="w-4 h-4" />
          </button>
          <button onClick={() => setIsProfileModalOpen(true)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Navegação Inferior (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-1 z-50">
        <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
          <LayoutDashboard className="w-5 h-5" /> Início
        </button>
        <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}>
          <DollarSign className="w-5 h-5" /> Finanças
        </button>
        <button onClick={() => setActiveTab('goals')} className={navItemClass('goals')}>
          <Target className="w-5 h-5" /> Metas
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ganhos</span>
                <h3 className="text-lg md:text-2xl font-black text-slate-900">R$ {totals.income.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gastos</span>
                <h3 className="text-lg md:text-2xl font-black text-slate-900">R$ {totals.expense.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl md:rounded-3xl text-white shadow-xl col-span-2 md:col-span-1">
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Saldo</span>
                <h3 className="text-lg md:text-2xl font-black text-emerald-400">R$ {totals.balance.toLocaleString('pt-BR')}</h3>
              </div>
              <FinancialHealthScore score={financialScore} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-8 space-y-4 md:space-y-6">
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-xs md:text-sm flex items-center gap-2 mb-4 md:mb-6"><BarChart3 className="w-4 h-4 text-emerald-600"/> Fluxo Mensal</h3>
                  <CashFlowChart transactions={transactions} />
                </div>
                <InvestmentRecommendations goals={goals} balance={totals.balance} />
              </div>
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                <CashFlowPrediction transactions={transactions} balance={totals.balance} />
                <AIAdvisor activeGoals={goals} />
                <SavingsChallenges challenges={challenges} onAddChallenge={() => {}} onUpdateProgress={() => {}} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 text-sm font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <button onClick={() => setFilterType('all')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Tudo</button>
                <button onClick={() => setFilterType('income')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all ${filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Ganhos</button>
                <button onClick={() => setFilterType('expense')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all ${filterType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>Gastos</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                <BudgetTracker budgets={budgetProgress} onSetBudget={() => setIsBudgetModalOpen(true)} />
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-xs flex items-center gap-2 mb-4"><PieChartIcon className="w-4 h-4 text-emerald-600"/> Gastos por Categoria</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryChartData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {categoryChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {filteredTransactions.map(t => (
                      <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                            {t.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm capitalize">{t.category}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {goals.map(g => (
                <GoalCard key={g.id} goal={g} onDeposit={handleDeposit} onDelete={handleDeleteGoal} onViewDetails={handleAnalyseGoal} />
              ))}
              <button 
                onClick={() => setIsGoalModalOpen(true)}
                className="bg-white border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
              >
                <Plus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                <p className="font-black text-slate-800 text-sm">Nova Meta</p>
              </button>
            </div>
          </div>
        )}
      </main>

      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} goalTitle={selectedGoal?.title || ''} onConfirm={confirmDeposit} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onAdd={handleAddGoal} />
      <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onAdd={handleAddTransaction} categories={customCategories} onRefreshCategories={() => user && fetchData(user.id)} />
      <SetBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={handleSaveBudget} />
      {selectedGoal && <GoalAnalysisModal isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} goal={selectedGoal} userBalance={totals.balance} />}
      {profile && <ProfileSettingsModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={profile} onUpdate={() => user && fetchData(user.id)} />}
    </div>
  );
};

export default App;