"use client";

import React from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Vamos conversar?</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Nossa equipe está pronta para ajudar você a atingir sua liberdade financeira. Tire suas dúvidas ou peça uma demonstração personalizada.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">E-mail</p>
                  <p className="font-bold text-slate-900">suporte@cofreinteligente.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Chat Online</p>
                  <p className="font-bold text-slate-900">Disponível de Seg. a Sex. das 9h às 18h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-50 p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Seu Nome</label>
                  <input type="text" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="João Silva" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">E-mail</label>
                  <input type="email" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="joao@exemplo.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Mensagem</label>
                <textarea rows={4} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium resize-none" placeholder="Como podemos ajudar?" />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                <Send className="w-5 h-5" />
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;