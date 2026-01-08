"use client";

import React, { useState, useRef } from 'react';
import { X, User, Camera, Save, Loader2, Upload } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar a imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-black tracking-tight">Editar Perfil</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-slate-100 border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-emerald-600 p-3 rounded-2xl text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-90"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Toque na câmera para mudar a foto</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sobrenome</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Direta (Opcional)</label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all text-xs font-medium"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Perfil
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;