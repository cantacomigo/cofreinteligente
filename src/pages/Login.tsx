"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';
import { Wallet, Sparkles, MessageCircle, Github, Heart } from 'lucide-react';
import Hero from '@/src/components/landing/Hero';
import Features from '@/src/components/landing/Features';
import Pricing from '@/src/components/landing/Pricing';
import FAQ from '@/src/components/landing/FAQ';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-[100]">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">COFRE.</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Preços</a>
            <button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo da Landing */}
      <main>
        <Hero />
        
        <Features />

        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
                  <h3 className="text-3xl font-black mb-6">Educação Financeira Levada a Sério</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Não somos apenas uma planilha bonita. O Cofre Inteligente foi desenhado para mudar sua mentalidade financeira. Através de algoritmos preditivos, mostramos o impacto real de cada cafézinho ou de cada investimento de longo prazo.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-3xl font-black text-emerald-400">+25%</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Média de Economia</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-emerald-400">10min</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Setup Inicial</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">O que dizem nossos usuários?</h2>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-slate-600 italic mb-4">"A IA do Cofre me ajudou a sair do vermelho em apenas 4 meses. As sugestões diárias são como ter um consultor no bolso."</p>
                    <p className="font-bold text-slate-900">Eduardo Santos <span className="text-xs text-slate-400 font-medium">— UX Designer</span></p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-slate-600 italic mb-4">"Finalmente uma ferramenta que não é burocrática. O depósito simulado me motiva a investir de verdade todos os meses."</p>
                    <p className="font-bold text-slate-900">Carla Oliveira <span className="text-xs text-slate-400 font-medium">— Médica</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Pricing />

        <FAQ />

        <section id="auth-section" className="py-24 bg-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] -z-10" />
          <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[48px] shadow-2xl">
              <div className="flex flex-col items-center mb-10">
                <div className="bg-emerald-600 p-4 rounded-2xl mb-6 shadow-xl shadow-emerald-100">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 text-center">Entre ou Crie sua Conta</h2>
                <p className="text-slate-500 text-sm mt-2 text-center">Transforme sua vida financeira hoje.</p>
              </div>
              
              <Auth
                supabaseClient={supabase}
                providers={[]}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#059669',
                        brandAccent: '#047857',
                        defaultButtonBackground: '#f8fafc',
                        defaultButtonText: '#1e293b',
                        inputBackground: '#ffffff',
                        inputBorder: '#e2e8f0',
                      },
                      borderWidths: { buttonBorderWidth: '2px', inputBorderWidth: '2px' },
                      radii: { borderRadiusButton: '16px', inputBorderRadius: '16px' },
                    },
                  },
                }}
                theme="light"
                localization={{
                  variables: {
                    sign_in: { email_label: 'E-mail', password_label: 'Senha', button_label: 'Entrar', link_text: 'Já tem conta? Entrar' },
                    sign_up: { email_label: 'E-mail', password_label: 'Senha', button_label: 'Começar Agora', link_text: 'Novo aqui? Criar conta' },
                  },
                }}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white text-xl tracking-tighter">COFRE.</span>
            </div>
            <div className="flex gap-6 text-sm font-bold">
              <a href="#" className="hover:text-emerald-400 transition-colors">Termos</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Suporte</a>
            </div>
            <div className="flex gap-4">
              <button className="p-2 hover:text-white transition-colors"><Github className="w-5 h-5" /></button>
              <button className="p-2 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-800 text-[10px] font-bold uppercase tracking-widest">
            Feito com <Heart className="w-3 h-3 inline text-rose-500" /> para sua liberdade financeira © 2024
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;