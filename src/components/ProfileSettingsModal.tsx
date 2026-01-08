"use client";

import React, { useState } from 'react';
import { X, User, Camera, Save, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client.ts';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: { id: string; fullName: string; avatarUrl?: string };
  onUpdate: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, profile, onUpdate }) => {
  const [firstName, setFirstName] = useState(profile.fullName.split(' ')[0] || '');
  const [lastName, setLastName] = useState(profile.fullName.split(' ').slice(1).join(' ') || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (!error) {
      onUpdate();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h3 className="font-bold">Configurações de Perfil</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full text-white cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                <Camera className="w-4 h-4" />
                <input 
                  type="text" 
                  className="hidden" 
                  placeholder="URL da imagem"
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Foto de Perfil (URL)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome</label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sobrenome</label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">URL do Avatar</label>
            <input
              type="text"
              placeholder="https://exemplo.com/foto.jpg"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;