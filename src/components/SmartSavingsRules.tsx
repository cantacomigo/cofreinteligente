"use client";

import React, { useState } from 'react';
import { ToggleLeft as Toggle, ToggleRight, Sparkles, Coins, Landmark } from 'lucide-react';

const SmartSavingsRules = () => {
  const [rules, setRules] = useState({
    roundUp: true,
    salarySplit: false,
    yieldAccelerator: true
  });

  const toggleRule = (rule: keyof typeof rules) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
  };

  return (
    <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl border border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Regras Inteligentes</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleRule('roundUp')}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${rules.roundUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Investir Troco</p>
              <p className="text-[10px] text-slate-500 font-medium">Arredonda compras e guarda a diferença.</p>
            </div>
          </div>
          {rules.roundUp ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <Toggle className="w-8 h-8 text-slate-700" />}
        </div>

        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleRule('salarySplit')}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${rules.salarySplit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Aporte Salarial</p>
              <p className="text-[10px] text-slate-500 font-medium">Transfere 10% do salário para metas.</p>
            </div>
          </div>
          {rules.salarySplit ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <Toggle className="w-8 h-8 text-slate-700" />}
        </div>

        <div className="bg-emerald-600/10 border border-emerald-500/20 p-4 rounded-2xl">
          <p className="text-[10px] font-bold text-emerald-400 leading-relaxed">
            <Sparkles className="w-3 h-3 inline mr-1" />
            <strong>Impacto Estimado:</strong> Ativando as regras, você economiza cerca de <strong>R$ 245,00 extras</strong> por mês sem esforço.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartSavingsRules;