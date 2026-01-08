import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Target, TrendingUp, History, Plus, LayoutDashboard, 
  Trash2, Clock, Sparkles, ChevronRight, Layers, BarChart3,
  ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle, LogOut, Loader2, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend
} from 'recharts';
import { Goal, Transaction, UserProfile, AutomaticPlan } from './src/types.ts';
import { CATEGORIES } from './src/constants.tsx';
import GoalCard from './src/components/GoalCard.tsx';
import PixModal from './src/components/PixModal.tsx';
import AIAdvisor from './src/components/AIAdvisor.tsx';
import InvestmentRecommendations from './src/components/InvestmentRecommendations.tsx';
import AddGoalModal from './src/components/AddGoalModal.tsx';
import AddTransactionModal from './src/components/AddTransactionModal.tsx';
import GoalAnalysisModal from './src/components/GoalAnalysisModal.tsx';
import AddPlanModal from './src/components/AddPlanModal.tsx';
import AutomaticSavings from './src/components/AutomaticSavings.tsx';
import { useSession } from './src/contexts/SessionContextProvider.tsx';
import Login from './src/pages/Login.tsx';
import { supabase } from './src/integrations/supabase/client.ts';

type Tab = 'dashboard' | 'goals' | 'finance' | 'investments';

const App: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [automaticPlans, setAutomaticPlans] = useState<AutomaticPlan[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const invested = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const balance = income - expense - invested;
    
    return { income, expense, invested, balance };
  }, [transactions, goals]);

  const categoryChartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const sortedByDeadline = useMemo(() => 
    [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
  [goals]);

  const top3ProgressData = useMemo(() => {
    return sortedByDeadline.slice(0, 3).map(g => ({
      name: g.title,
      progresso: Math.round((g.currentAmount / g.targetAmount) * 100)
    }));
  }, [sortedByDeadline]);

  const fetchData = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      setProfile({
        id: profileData.id,
        email: user?.email || '',
        fullName: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || user?.email || 'Usuário',
        avatarUrl: profileData.avatar_url || undefined,
        totalBalance: totals.balance,
      });
    }

    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsData) {
      const mappedGoals: Goal[] = goalsData.map(g => ({
        id: g.id,
        userId: g.user_id,
        title: g.title,
        description: g.description || undefined,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        interestRate: Number(g.interest_rate),
        deadline: g.deadline,
        category: g.category as Goal['category'],
        createdAt: g.created_at,
      }));
      setGoals(mappedGoals);
    }

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transactionsData) {
      const mappedTransactions: Transaction[] = transactionsData.map(t => ({
        id: t.id,
        goalId: t.goal_id || undefined,
        amount: Number(t.amount),
        type: t.type as Transaction['type'],
        category: t.category,
        description: t.description || undefined,
        createdAt: t.created_at,
        method: t.method as Transaction['method'],
      }));
      setTransactions(mappedTransactions);
    }

    const { data: plansData } = await supabase
      .from('automatic_plans')
      .select('*')
      .eq('user_id', userId);

    if (plansData) {
      const mappedPlans: AutomaticPlan[] = plansData.map(p => ({
        id: p.id,
        goalId: p.goal_id,
        amount: Number(p.amount),
        frequency: p.frequency as any,
        nextExecution: p.next_execution,
        active: p.active
      }));
      setAutomaticPlans(mappedPlans);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
    </div>
  );

  if (!session) return <Login />;

  const handleDeposit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsPixOpen(true);
  };

  const handleAnalyseGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsAnalysisOpen(true);
  };

  const confirmDeposit = async (amount: number) => {
    if (!selectedGoal || !user) return;
    const { data: txData } = await supabase.from('transactions').insert({
      user_id: user.id, goal_id: selectedGoal.id, amount, type: 'deposit', category: selectedGoal.category, method: 'pix'
    }).select().single();

    if (txData) {
      const newAmount = selectedGoal.currentAmount + amount;
      await supabase.from('goals').update({ current_amount: newAmount }).eq('id', selectedGoal.id);
      fetchData(user.id);
    }
  };

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => {
    if (!user) return;
    const { data } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description,
      target_amount: newGoal.targetAmount,
      interest_rate: newGoal.interestRate,
      deadline: newGoal.deadline,
      category: newGoal.category
    }).select().single();
    if (data) fetchData(user.id);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'createdAt'> & { createdAt: string }) => {
    if (!user) return;
    const { data } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      description: newTx.description,
      method: newTx.method,
      created_at: newTx.createdAt
    }).select().single();
    if (data) fetchData(user.id);
  };

  const handleAddPlan = async (plan: { goalId: string; amount: number; frequency: string }) => {
    if (!user) return;
    const nextExec = new Date();
    nextExec.setDate(nextExec.getDate() + (plan.frequency === 'daily' ? 1 : plan.frequency === 'weekly' ? 7 : 30));

    await supabase.from('automatic_plans').insert({
      user_id: user.id,
      goal_id: plan.goalId,
      amount: plan.amount,
      frequency: plan.frequency,
      next_execution: nextExec.toISOString().split('T')[0],
      active: true
    });
    fetchData(user.id);
  };

  const handleTogglePlan = async (id: string, active: boolean) => {
    await supabase.from('automatic_plans').update({ active }).eq('id', id);
    setAutomaticPlans(prev => prev.map(p => p.id === id ? { ...p, active } : p));
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Deseja excluir esta automação?')) return;
    await supabase.from('automatic_plans').delete().eq('id', id);
    setAutomaticPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteGoal = async (goal: Goal) => {
    if (!confirm('Deseja realmente excluir esta meta?')) return;
    await supabase.from('goals').delete().eq('id', goal.id);
    setGoals(prev => prev.filter(g => g.id !== goal.id));
  };

  const handleUpdateGoalDescription = async (goalId: string, description: string) => {
    await supabase.from('goals').update({ description }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, description } : g));
  };

  const handleLogout = () => supabase.auth.signOut();

  const navItemClass = (tab: Tab) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
    ${activeTab === tab ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}
  `;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-40 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl"><Wallet className="w-6 h-6 text-white" /></div>
          <h1 className="text-xl font-bold text-slate-900">Cofre Inteligente</h1>
        </div>
        {profile && (
          <div className="px-6 pb-4 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">{profile.fullName}</p>
            <p className="text-xs text-slate-400">{profile.email}</p>
          </div>
        )}
        <nav className="flex-1 px-4 space-y-1 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}><LayoutDashboard className="w-5 h-5" /> Painel</button>
          <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}><DollarSign className="w-5 h-5" /> Meu Dinheiro</button>
          <button onClick={() => setActiveTab('goals')} className={navItemClass('goals')}><Target className="w-5 h-5" /> Metas</button>
          <button onClick={() => setActiveTab('investments')} className={navItemClass('investments')}><TrendingUp className="w-5 h-5" /> Investimentos</button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-500 hover:bg-rose-50 transition-all"><LogOut className="w-5 h-5" /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-8 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4"><div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ArrowUpCircle className="w-5 h-5" /></div><span className="font-bold text-slate-500 text-sm">Ganhos</span></div>
                <h3 className="text-2xl font-black">R$ {totals.income.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4"><div className="bg-rose-100 p-2 rounded-lg text-rose-600"><ArrowDownCircle className="w-5 h-5" /></div><span className="font-bold text-slate-500 text-sm">Gastos</span></div>
                <h3 className="text-2xl font-black">R$ {totals.expense.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-slate-400"><div className="bg-slate-800 p-2 rounded-lg"><Wallet className="w-5 h-5" /></div><span className="font-bold text-sm">Saldo</span></div>
                <h3 className="text-2xl font-black text-emerald-400">R$ {totals.balance.toLocaleString('pt-BR')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600"/> Progresso das Metas</h3>
                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={top3ProgressData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 600}} axisLine={false} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="progresso" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {sortedByDeadline.slice(0, 2).map(g => (
                    <GoalCard key={g.id} goal={g} onDeposit={handleDeposit} onDelete={handleDeleteGoal} onViewDetails={handleAnalyseGoal} onUpdateDescription={handleUpdateGoalDescription} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4"><AIAdvisor activeGoals={goals} /></div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Meu Dinheiro</h2>
              <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <PlusCircle className="w-5 h-5" /> Registrar Valor
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-emerald-600"/> Divisão de Gastos</h3>
                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
                      <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4 text-right">Valor</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 capitalize font-bold text-slate-700">{t.category}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{t.description || (t.type === 'deposit' ? 'Depósito em Meta' : 'Transação')}</td>
                          <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
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
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Minhas Metas</h2>
              <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Nova Meta
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(g => (
                <GoalCard key={g.id} goal={g} onDeposit={handleDeposit} onDelete={handleDeleteGoal} onViewDetails={handleAnalyseGoal} onUpdateDescription={handleUpdateGoalDescription} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <AutomaticSavings 
              plans={automaticPlans} 
              goals={goals} 
              onToggle={handleTogglePlan} 
              onDelete={handleDeletePlan}
              onAddClick={() => setIsPlanModalOpen(true)}
            />
            <InvestmentRecommendations goals={goals} balance={totals.invested} />
          </div>
        )}
      </main>

      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} goalTitle={selectedGoal?.title || ''} onConfirm={confirmDeposit} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onAdd={handleAddGoal} />
      <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onAdd={handleAddTransaction} />
      <AddPlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} goals={goals} onAdd={handleAddPlan} />
      {selectedGoal && (
        <GoalAnalysisModal 
          isOpen={isAnalysisOpen} 
          onClose={() => setIsAnalysisOpen(false)} 
          goal={selectedGoal} 
          userBalance={totals.balance} 
        />
      )}
    </div>
  );
};

export default App;