"use client";

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, PlusCircle, Search, Filter, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip
} from 'recharts';
import { Transaction } from '../types.ts';
import BudgetTracker from '../components/BudgetTracker.tsx';
import AddTransactionModal from '../components/AddTransactionModal.tsx';
import SetBudgetModal from '../components/SetBudgetModal.tsx';

interface FinancePageProps {
  transactions: Transaction[];
  budgets: any[];
  customCategories: any[];
  totals: { expense: number };
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'> & { createdAt: string }) => void;
  onUpdateTransaction: (id: string, transaction: any) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveBudget: (category: string, amount: number) => void;
  onRefreshCategories: () => void;
  showCharts: boolean; // Adicionando a prop
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FinancePage: React.FC<FinancePageProps> = ({
  transactions,
  budgets,
  customCategories,
  totals,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onSaveBudget,
  onRefreshCategories,
  showCharts, // Usando a prop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editTransactionData, setEditTransactionData] = useState<Transaction | null>(null);

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

  const handleEditTransaction = (t: Transaction) => {
    setEditTransactionData(t);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditTransactionData(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Barra de Filtros e Busca Unificada */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar em suas transações..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 shadow-sm text-sm font-medium transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm w-full md:w-auto">
          <button onClick={() => setFilterType('all')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Tudo</button>
          <button onClick={() => setFilterType('income')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Ganhos</button>
          <button onClick={() => setFilterType('expense')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Gastos</button>
        </div>
        <button 
          onClick={() => { setEditTransactionData(null); setIsTransactionModalOpen(true); }}
          className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <BudgetTracker budgets={budgetProgress} onSetBudget={() => setIsBudgetModalOpen(true)} />
          
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-xs flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                  <PieChartIcon className="w-4 h-4 text-emerald-600"/> 
                  Categorias
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Distribuição de gastos</p>
              </div>
            </div>
            <div className="h-[200px] w-full relative min-w-0">
              {showCharts ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie 
                      data={categoryChartData} 
                      innerRadius={55} 
                      outerRadius={75} 
                      paddingAngle={6} 
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold'}} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 animate-pulse rounded-full" />
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Total</p>
                  <p className="text-sm font-black text-slate-900 mt-1">R$ {totals.expense.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryChartData.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-slate-500 truncate capitalize">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Extrato de Movimentações</h3>
                <p className="text-[10px] text-slate-400 font-medium">{filteredTransactions.length} transações encontradas</p>
              </div>
              <Filter className="w-4 h-4 text-slate-300" />
            </div>
            <div className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-400 text-sm font-medium">Nenhuma transação encontrada.</p>
                </div>
              ) : (
                filteredTransactions.map(t => (
                  <div key={t.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-all group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100' : 'bg-rose-50 text-rose-500 shadow-sm shadow-rose-100'}`}>
                        {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 text-sm capitalize">{t.category}</p>
                          {t.method === 'pix' && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">Pix</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                          {t.description || 'Sem descrição'} 
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          {new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-black text-base tracking-tighter ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Confirmado</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleEditTransaction(t)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={handleCloseTransactionModal} 
        onAdd={onAddTransaction} 
        onUpdate={onUpdateTransaction}
        categories={customCategories} 
        onRefreshCategories={onRefreshCategories} 
        editData={editTransactionData}
      />
      <SetBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={onSaveBudget} />
    </div>
  );
};

export default FinancePage;