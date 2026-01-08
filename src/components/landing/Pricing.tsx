"use client";

import React from 'react';
import { Check, X } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Planos que cabem no seu bolso</h2>
          <p className="text-slate-500">Comece de graça e evolua conforme suas metas crescem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-10 rounded-[40px] border-2 border-slate-100 flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Iniciante</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">R$ 0</span>
              <span className="text-slate-400 font-bold">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 font-medium">
                <Check className="w-5 h-5 text-emerald-500" /> Até 3 metas ativas
              </li>
              <li className="flex items-center gap-3 text-slate-600 font-medium">
                <Check className="w-5 h-5 text-emerald-500" /> Registro de transações
              </li>
              <li className="flex items-center gap-3 text-slate-600 font-medium">
                <Check className="w-5 h-5 text-emerald-500" /> Consultoria IA básica
              </li>
              <li className="flex items-center gap-3 text-slate-400 font-medium">
                <X className="w-5 h-5" /> Investimentos Sugeridos
              </li>
            </ul>
            <button className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all">Começar Agora</button>
          </div>

          <div className="p-10 rounded-[40px] border-2 border-emerald-500 bg-emerald-600 text-white relative shadow-2xl shadow-emerald-200 flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Mais Popular</div>
            <h3 className="text-2xl font-black mb-2">Investidor Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">R$ 19,90</span>
              <span className="text-emerald-100 font-bold">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 font-medium">
                <Check className="w-5 h-5" /> Metas Ilimitadas
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Check className="w-5 h-5" /> IA com análise profunda
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Check className="w-5 h-5" /> Sugestões de Investimento
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Check className="w-5 h-5" /> Exportação de relatórios
              </li>
            </ul>
            <button className="w-full py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-slate-50 transition-all">Assinar Agora</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;