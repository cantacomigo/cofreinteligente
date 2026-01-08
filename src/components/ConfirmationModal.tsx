import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl scale-in-center animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-emerald-100 p-4 rounded-2xl mb-6">
            <AlertCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={onCancel}
              className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className="py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;