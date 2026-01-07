
import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatFinancialAdvisor } from '../services/geminiService';
import { Goal } from '../types';

interface AIAdvisorProps {
  activeGoals: Goal[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ activeGoals }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: 'Olá! Sou o consultor IA do Cofre Inteligente. Como posso ajudar com suas metas hoje? Posso sugerir planos de poupança ou analisar seu progresso.' 
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const context = activeGoals.map(g => `${g.title}: R$${g.currentAmount}/R$${g.targetAmount}`).join(', ');
    try {
      const response = await chatFinancialAdvisor(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Desculpe, tive um problema para processar isso agora.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro ao conectar com a inteligência artificial.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-xl border border-slate-800">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-bold leading-none">Consultor IA</h3>
          <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Online agora
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-xl h-fit ${msg.role === 'ai' ? 'bg-emerald-500/10' : 'bg-slate-700'}`}>
              {msg.role === 'ai' ? <Bot className="w-5 h-5 text-emerald-400" /> : <User className="w-5 h-5 text-slate-300" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'ai' 
                ? 'bg-slate-800 text-slate-200 rounded-tl-none' 
                : 'bg-emerald-600 text-white rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="p-2 rounded-xl h-fit bg-emerald-500/10">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo sobre suas finanças..."
            className="w-full bg-slate-900 text-white border border-slate-700 rounded-2xl pl-4 pr-12 py-3 outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
