"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Target, LayoutDashboard, 
  DollarSign, PlusCircle, LogOut, Loader2, User
} from 'lucide-react';
import { Goal, Transaction, UserProfile } from './src/types.ts';
import PixModal from './src/components/PixModal.tsx';
import AddGoalModal from './src/components/AddGoalModal.tsx';
import GoalAnalysisModal from './src/components/GoalAnalysisModal.tsx';
import ProfileSettingsModal from './src/components/ProfileSettingsModal.tsx';
import { useSession } from './src/contexts/SessionContextProvider.tsx';
import Login from './src/pages/Login.tsx';
import DashboardPage from './src/pages/DashboardPage.tsx';
import FinancePage from './src/pages/FinancePage.tsx';
import GoalsPage from './src/pages/GoalsPage.tsx';
import { supabase } from './src/integrations/supabase/client.ts';

type Tab = 'dashboard' | 'goals' | 'finance';

const App: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State for core data
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // State for global modals
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // State for chart rendering (to avoid Recharts warnings)
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o layout CSS terminou de calcular
    const timer = setTimeout(() => setShowCharts(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Reinicia o estado dos gráficos ao mudar de aba para forçar recalculo de dimensões
  useEffect(() => {
    setShowCharts(false);
    const timer = setTimeout(() => setShowCharts(true), 150);
    return () => clearTimeout(timer);
  }, [activeTab]);

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

  // --- Handlers ---

  const handleDeposit = (goal: Goal) => { setSelectedGoal(goal); setIsPixOpen(true); };
  const handleAnalyseGoal = (goal: Goal) => { setSelectedGoal(goal); setIsAnalysisOpen(true); };

  const confirmDeposit = async (amount: number) => {
    if (!selectedGoal || !user) return;
    
    const { error } = await supabase.rpc('deposit_to_goal', {
      goal_id_param: selectedGoal.id,
      amount_param: amount,
    });

    if (error) { 
      console.error('Erro ao depositar via RPC:', error); 
      alert(`Erro ao depositar: ${error.message}`);
      return;
    }
    
    fetchData(user.id);
  };

  const handleAddGoal = async (newGoal: any) => { 
    if (!user) return; 
    const { error } = await supabase.from('goals').insert({ user_id: user.id, ...newGoal }); 
    if (error) {
      console.error('Erro ao adicionar meta:', error);
      alert(`Erro ao adicionar meta: ${error.message}`);
      return;
    }
    fetchData(user.id); 
  };

  const handleAddTransaction = async (newTx: any) => { 
    if (!user) return; 
    const { error } = await supabase.from('transactions').insert({ user_id: user.id, ...newTx }); 
    
    if (error) {
      console.error('Erro ao adicionar transação:', error);
      alert(`Erro ao adicionar transação: ${error.message}`);
      return;
    }
    
    fetchData(user.id); 
  };

  const handleUpdateTransaction = async (id: string, updatedTx: any) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').update({
      amount: updatedTx.amount,
      category: updatedTx.category,
      description: updatedTx.description,
      method: updatedTx.method,
      created_at: updatedTx.createdAt
    }).eq('id', id);

    if (error) {
      console.error('Erro ao atualizar transação:', error);
      alert(`Erro ao atualizar transação: ${error.message}`);
      return;
    }
    fetchData(user.id);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Deseja excluir este registro permanentemente?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir transação:', error);
        alert(`Erro ao excluir transação: ${error.message}`);
        return;
      }
      if (user) fetchData(user.id);
    }
  };

  const handleDeleteGoal = async (goal: Goal) => { 
    if (confirm('Excluir meta?')) { 
      const { error } = await supabase.from('goals').delete().eq('id', goal.id); 
      if (error) {
        console.error('Erro ao excluir meta:', error);
        alert(`Erro ao excluir meta: ${error.message}`);
        return;
      }
      if (user) fetchData(user.id); 
    } 
  };
  
  const handleSaveBudget = async (category: string, amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('budgets').upsert({
      user_id: user.id, category, limit_amount: amount,
      month: new Date().getMonth() + 1, year: new Date().getFullYear()
    }, { onConflict: 'user_id, category, month, year' });

    if (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert(`Erro ao salvar orçamento: ${error.message}`);
      return;
    }
    fetchData(user.id);
  };

  const handleLogout = () => supabase.auth.signOut();

  const navItemClass = (tab: Tab) => `flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[9px] font-black uppercase tracking-tighter transition-all ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 pb-16 md:pb-0">
      {/* Sidebar Compacta */}
      <aside className="hidden md:flex w-56 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-40">
        <div className="p-5 flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-100">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tighter">COFRE.</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-0.5 py-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <LayoutDashboard className="w-3.5 h-3.5" /> Painel Geral
          </button>
          <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'finance' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <DollarSign className="w-3.5 h-3.5" /> Finanças
          </button>
          <button onClick={() => setActiveTab('goals')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'goals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Target className="w-3.5 h-3.5" /> Minhas Metas
          </button>
        </nav>
        
        <div className="p-3 mt-auto">
          <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-indigo-600" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-900 truncate">{profile?.fullName}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Configurações</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-rose-500 hover:bg-rose-50 transition-all text-[10px]">
            <LogOut className="w-3 h-3" /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Header Mobile Compacto */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 py-2 flex justify-between items-center z-50">
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-600 p-1 rounded-md">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-xs font-black text-slate-900 tracking-tighter">COFRE.</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleLogout} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
          <button onClick={() => { /* FinancePage handles its own modal state */ }} className="p-1.5 bg-emerald-600 text-white rounded-lg">
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsProfileModalOpen(true)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Navegação Inferior Compacta */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-1 z-50">
        <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
          <LayoutDashboard className="w-4 h-4" /> Início
        </button>
        <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}>
          <DollarSign className="w-4 h-4" /> Finanças
        </button>
        <button onClick={() => setActiveTab('goals')} className={navItemClass('goals')}>
          <Target className="w-4 h-4" /> Metas
        </button>
      </nav>

      {/* Conteúdo Principal Compactado */}
      <main className="flex-1 p-3 md:p-6 pt-16 md:pt-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <DashboardPage 
            goals={goals}
            transactions={transactions}
            challenges={challenges}
            totals={totals}
            financialScore={financialScore}
            showCharts={showCharts}
          />
        )}

        {activeTab === 'finance' && (
          <FinancePage
            transactions={transactions}
            budgets={budgets}
            customCategories={customCategories}
            totals={totals}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSaveBudget={handleSaveBudget}
            onRefreshCategories={() => user && fetchData(user.id)}
            showCharts={showCharts} // Passando showCharts
          />
        )}

        {activeTab === 'goals' && (
          <GoalsPage
            goals={goals}
            onDeposit={handleDeposit}
            onDeleteGoal={handleDeleteGoal}
            onViewAnalysis={handleAnalyseGoal}
            setIsGoalModalOpen={setIsGoalModalOpen}
          />
        )}
      </main>

      {/* Global Modals */}
      <PixModal 
        isOpen={isPixOpen} 
        onClose={() => setIsPixOpen(false)} 
        goalTitle={selectedGoal?.title || ''} 
        onConfirm={confirmDeposit} 
      />
      <AddGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onAdd={handleAddGoal} 
      />
      {selectedGoal && (
        <GoalAnalysisModal 
          isOpen={isAnalysisOpen} 
          onClose={() => setIsAnalysisOpen(false)} 
          goal={selectedGoal} 
          userBalance={totals.balance} 
        />
      )}
      {profile && (
        <ProfileSettingsModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          profile={profile} 
          onUpdate={() => user && fetchData(user.id)} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;