"use client";

import React from 'react';
import { Brain, Zap, Target, BarChart3, PieChart, Shield } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Consultoria IA 24/7",
    desc: "Tire dúvidas sobre investimentos e receba planos de economia personalizados do nosso consultor Gemini."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Depósitos Instantâneos",
    desc: "Simule depósitos via PIX e veja seu saldo crescer em tempo real com juros compostos automáticos."
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Gestão de Metas",
    desc: "Defina objetivos claros. Nossa IA calcula exatamente quanto você precisa poupar para chegar lá."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análise de Saúde",
    desc: "Receba um Score de Saúde Financeira baseado no seu comportamento de gastos e metas."
  },
  {
    icon: <PieChart className="w-6 h-6" />,
    title: "Orçamentos Inteligentes",
    desc: "Crie limites por categoria e receba alertas preditivos antes de estourar o orçamento."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacidade Total",
    desc: "Seus dados são criptografados e utilizados apenas para gerar os insights que você solicita."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Tudo o que você precisa para <span className="text-emerald-600">dominar</span> seu dinheiro.</h2>
          <p className="text-slate-500 text-lg">Combinamos o poder da inteligência artificial com uma interface intuitiva para criar a melhor experiência financeira da sua vida.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;