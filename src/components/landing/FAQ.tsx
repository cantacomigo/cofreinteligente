"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "Como a IA ajuda nas minhas finanças?",
    a: "Nossa IA analisa seu padrão de gastos e as metas que você definiu. Ela consegue prever se você vai atingir seu objetivo no prazo e sugere ajustes diários ou mensais para garantir seu sucesso."
  },
  {
    q: "O Cofre Inteligente é seguro?",
    a: "Sim! Não solicitamos suas senhas bancárias reais. Todo o sistema funciona com base nos dados que você insere ou via simulações seguras, garantindo total controle sobre sua privacidade."
  },
  {
    q: "Posso usar o sistema gratuitamente?",
    a: "Sim, temos um plano gratuito vitalício que permite gerenciar suas principais metas e usar a consultoria básica da nossa inteligência artificial."
  },
  {
    q: "Como funcionam as sugestões de investimento?",
    a: "Nossa IA cruza os dados das suas metas (prazo e valor) com os principais indicadores do mercado brasileiro (Selic, IPCA) para sugerir onde seu dinheiro renderia mais com o menor risco."
  }
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Dúvidas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-slate-800">{f.q}</span>
                {open === i ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;