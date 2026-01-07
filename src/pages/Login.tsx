"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client.ts';
import { Wallet } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-3 rounded-xl mb-4"><Wallet className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-black text-slate-900">Bem-vindo ao Cofre Inteligente</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie suas metas financeiras com a ajuda da IA.</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#059669', // emerald-600
                  brandAccent: '#047857', // emerald-700
                  defaultButtonBackground: '#f1f5f9', // slate-100
                  defaultButtonText: '#1e293b', // slate-800
                  inputBackground: '#ffffff',
                  inputBorder: '#e2e8f0', // slate-200
                },
                borderWidths: {
                  buttonBorderWidth: '2px',
                  inputBorderWidth: '2px',
                },
                radii: {
                  borderRadiusButton: '12px',
                  inputBorderRadius: '12px',
                },
              },
            },
          }}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail',
                password_label: 'Sua senha',
                button_label: 'Entrar',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entrar',
              },
              sign_up: {
                email_label: 'Seu e-mail',
                password_label: 'Crie uma senha',
                button_label: 'Criar conta',
                social_provider_text: 'Criar conta com {{provider}}',
                link_text: 'Não tem uma conta? Criar conta',
              },
              forgotten_password: {
                link_text: 'Esqueceu sua senha?',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;