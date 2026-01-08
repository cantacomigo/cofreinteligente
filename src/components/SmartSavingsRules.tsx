"use client";

import React, { useState, useEffect } from 'react';
import { ToggleLeft as Toggle, ToggleRight, Sparkles, Coins, Landmark } from 'lucide-react';

const STORAGE_KEY = 'cofre_smart_rules';

const SmartSavingsRules = () => {
  // Inicializa o estado a partir do localStorage ou usa os valores padrão
  const [rules, setRules] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      roundUp: true,
      salarySplit: false,
      yieldAccelerator: true
    };
  });

  // Salva no localStorage sempre que uma regra mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  const toggleRule = (rule: keyof typeof rules) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
  };

  return (
    <div className="bg-slate-900 p-4 rounded-[24px] text-white shadow-xl border border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h3 className="font-black text-[9px] uppercase tracking-widest text-slate-400">Regras Inteligentes</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleRule('roundUp')}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg transition-colors ${rules.roundUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Investir Troco</p>
              <p className="text-[8px] text-slate-500 font-medium">Arredonda compras e guarda o troco.</p>
            </div>
          </div>
          {rules.roundUp ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <Toggle className="w-6 h-6 text-slate-700" />}
        </div>

        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleRule('salarySplit')}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg transition-colors ${rules.salarySplit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Aporte Salarial</p>
              <p className="text-[8px] text-slate-500 font-medium">Transfere 10% do salário mensal.</p>
            </div>
          </div>
          {rules.salarySplit ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <Toggle className="w-6 h-6 text-slate-700" />}
        </div>

        <div className="bg-emerald-600/10 border border-emerald-500/20 p-2.5 rounded-xl">
          <p className="text-[9px] font-bold text-emerald-400 leading-tight">
            <Sparkles className="w-2.5 h-2.5 inline mr-1" />
            <strong>Impacto:</strong> Economia extra de <strong>R$ 245/mês</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartSavingsRules;