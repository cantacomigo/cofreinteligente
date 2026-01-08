"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Target, LayoutDashboard, 
  ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle, LogOut, Loader2, PieChart as PieChartIcon,
  BarChart3, Plus, Search, Settings, User
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
import { useSession } from './src/contexts/SessionContextProvider.tsx';
import Login from './src/pages/Login.tsx';
import { supabase } from './src/integrations/supabase/client.ts';

type Tab = 'dashboard' | 'goals' | 'finance';

const App: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
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

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchCategories = async (userId: string) => {
    const { data } = await supabase.from('transaction_categories').select('*').eq('user_id', userId);
    if (data && data.length > 0) {
      setCustomCategories(data);
    } else {
      const defaults = [
        { user_id: userId, name: 'Salário', type: 'income' },
        { user_id: userId, name: 'Alimentação', type: 'expense' },
        { user_id: userId, name: 'Transporte', type: 'expense' }
      ];
      await supabase.from('transaction_categories').insert(defaults);
      const { data: newData } = await supabase.from('transaction_categories').select('*').eq('user_id', userId);
      if (newData) setCustomCategories(newData);
    }
  };

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

      await fetchCategories(userId);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) fetchData(user.id); }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;
  if (!session) return <Login />;

  const handleDeposit = (goal: Goal) => { setSelectedGoal(goal); setIsPixOpen(true); };
  const handleAnalyseGoal = (goal: Goal) => { setSelectedGoal(goal); setIsAnalysisOpen(true); };

  const confirmDeposit = async (amount: number) => {
    if (!selectedGoal || !user) return;
    await supabase.from('transactions').insert({ user_id: user.id, goal_id: selectedGoal.id, amount, type: 'deposit', category: selectedGoal.category, method: 'pix' });
    const newAmount = selectedGoal.currentAmount + amount;
    await supabase.from('goals').update({ current_amount: newAmount }).eq('id', selectedGoal.id);
    fetchData(user.id);
  };

  const handleAddGoal = async (newGoal: any) => { if (!user) return; await supabase.from('goals').insert({ user_id: user.id, ...newGoal }); fetchData(user.id); };
  const handleAddTransaction = async (newTx: any) => { if (!user) return; await supabase.from('transactions').insert({ user_id: user.id, ...newTx }); fetchData(user.id); };
  const handleUpdateDescription = async (goalId: string, description: string) => { await supabase.from('goals').update({ description }).eq('id', goalId); if (user) fetchData(user.id); };
  const handleDeleteGoal = async (goal: Goal) => { if (confirm('Excluir meta?')) { await supabase.from('goals').delete().eq('id', goal.id); if (user) fetchData(user.id); } };
  
  const handleSaveBudget = async (category: string, amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('budgets').upsert({
      user_id: user.id,
      category,
      limit_amount: amount,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }, { onConflict: 'user_id, category, month, year' });
    if (!error) fetchData(user.id);
  };

  const handleLogout = () => supabase.auth.signOut();

  const navItemClass = (tab: Tab) => `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-sm">
      <aside className="w-full md:w-56 bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-40 shadow-sm">
        <div className="p-4 flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg"><Wallet className="w-5 h-5 text-white" /></div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Cofre Inteligente</h1>
        </div>
        
        <div className="px-4 mb-2">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-emerald-600" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-black text-slate-900 truncate">{profile?.fullName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Perfil</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 py-2">
          <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}><LayoutDashboard className="w-4 h-4" /> Painel</button>
          <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}><DollarSign className="w-4 h-4" /> Finanças</button>
          <button onClick={() => setActiveTab('goals')} className={navItemClass('goals')}><Target className="w-4 h-4" /> Metas</button>
        </nav>
        
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-rose-500 hover:bg-rose-50 transition-all">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-3 md:p-6 pt-20 md:pt-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">Ganhos</span>
                </div>
                <h3 className="text-base font-black text-slate-800">R$ {totals.income.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">Gastos</span>
                </div>
                <h3 className="text-base font-black text-slate-800">R$ {totals.expense.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">Saldo</span>
                </div>
                <h3 className="text-base font-black text-emerald-400">R$ {totals.balance.toLocaleString('pt-BR')}</h3>
              </div>
              <FinancialHealthScore score={financialScore} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-xs"><BarChart3 className="w-4 h-4 text-emerald-600"/> Fluxo de Caixa (6 meses)</h3>
                  <div className="h-[200px] w-full">
                    <CashFlowChart transactions={transactions} />
                  </div>
                </div>
                <InvestmentRecommendations goals={goals} balance={totals.balance} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-[400px]">
                  <AIAdvisor activeGoals={goals} />
                </div>
                <SavingsChallenges challenges={challenges} onAddChallenge={() => {}} onUpdateProgress={() => {}} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">Finanças</h2>
              <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                <PlusCircle className="w-4 h-4" /> Registrar
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-xs"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setFilterType('all')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Tudo</button>
                <button onClick={() => setFilterType('income')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Ganhos</button>
                <button onClick={() => setFilterType('expense')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Gastos</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 space-y-4">
                <BudgetTracker budgets={budgetProgress} onSetBudget={() => setIsBudgetModalOpen(true)} />
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold mb-2 text-xs flex items-center gap-1.5"><PieChartIcon className="w-4 h-4 text-emerald-600"/> Gastos</h3>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryChartData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                          {categoryChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                      <tr><th className="px-4 py-2">Data</th><th className="px-4 py-2">Categoria</th><th className="px-4 py-2 text-right">Valor</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            <span className="capitalize font-bold text-slate-700 text-xs">{t.category}</span>
                            {t.description && <p className="text-[9px] text-slate-400 italic truncate max-w-[120px]">{t.description}</p>}
                          </td>
                          <td className={`px-4 py-2 text-right font-black text-xs ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">Minhas Metas</h2>
              <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 transition-all">
                <Plus className="w-4 h-4" /> Nova Meta
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(g => (
                <GoalCard key={g.id} goal={g} onDeposit={handleDeposit} onDelete={handleDeleteGoal} onViewDetails={handleAnalyseGoal} onUpdateDescription={handleUpdateDescription} />
              ))}
            </div>
          </div>
        )}
      </main>

      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} goalTitle={selectedGoal?.title || ''} onConfirm={confirmDeposit} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onAdd={handleAddGoal} />
      <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onAdd={handleAddTransaction} categories={customCategories} onRefreshCategories={() => user && fetchCategories(user.id)} />
      <SetBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={handleSaveBudget} />
      {selectedGoal && <GoalAnalysisModal isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} goal={selectedGoal} userBalance={totals.balance} />}
      {profile && <ProfileSettingsModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={profile} onUpdate={() => user && fetchData(user.id)} />}
    </div>
  );
};

export default App;