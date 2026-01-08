"use client";

import React from 'react';
import { Wallet, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

const Hero = () => {
  const scrollToAuth = () => {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
              <Sparkles className="w-4 h-4" />
              Finanças turbinadas por IA
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
              Seu dinheiro <span className="text-emerald-600">trabalhando</span> para você.
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              O Cofre Inteligente usa IA de última geração para rastrear suas metas, prever economias e alertar sobre riscos financeiros antes mesmo deles acontecerem.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
              <button 
                onClick={scrollToAuth}
                className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Começar Agora <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 font-black rounded-2xl hover:bg-slate-50 transition-all"
              >
                Ver Recursos
              </button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Segurança Bancária
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Rendimentos Reais
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            {/* Simulação de Preview do App */}
            <div className="relative z-10 bg-white p-8 rounded-[48px] shadow-2xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="bg-slate-900 p-4 rounded-3xl text-white">
                  <Wallet className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Saldo Estimado</span>
                  <p className="text-3xl font-black text-slate-900">R$ 45.230,00</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Meta: Viagem Japão</span>
                  <span>75% Concluído</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-medium">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    <strong>IA Sugere:</strong> "Se você economizar R$ 200 extras este mês, atingirá sua meta 3 meses antes!"
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;