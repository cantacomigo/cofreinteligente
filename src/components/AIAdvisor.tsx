import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatFinancialAdvisor } from '../services/geminiService.ts';
import { Goal } from '../types.ts';

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
        text: 'Olá! Sou seu consultor. Como posso ajudar com suas metas hoje?' 
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
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Tive um problema agora.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro na conexão.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-[24px] overflow-hidden flex flex-col h-[320px] shadow-lg border border-slate-800">
      <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <h3 className="text-white text-[10px] font-black uppercase tracking-widest">Consultor IA</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-1.5 rounded-lg h-fit ${msg.role === 'ai' ? 'bg-emerald-500/10' : 'bg-slate-700'}`}>
              {msg.role === 'ai' ? <Bot className="w-3.5 h-3.5 text-emerald-400" /> : <User className="w-3.5 h-3.5 text-slate-300" />}
            </div>
            <div className={`max-w-[85%] p-2 rounded-xl text-[11px] leading-tight ${
              msg.role === 'ai' 
                ? 'bg-slate-800 text-slate-300 rounded-tl-none' 
                : 'bg-emerald-600 text-white rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="p-1.5 rounded-lg h-fit bg-emerald-500/10">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="bg-slate-800 p-2 rounded-lg rounded-tl-none flex gap-1">
              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-800/50 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Dúvida financeira..."
            className="w-full bg-slate-900 text-white text-[11px] border border-slate-700 rounded-xl pl-3 pr-10 py-2 outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;