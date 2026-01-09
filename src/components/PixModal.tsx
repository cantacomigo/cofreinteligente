"use client";

import React, { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import ConfirmationModal from './ConfirmationModal.tsx';
import { formatNumber } from '../utils/formatters.ts';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  goalTitle: string;
}

const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose, onConfirm, goalTitle }) => {
  const [amount, setAmount] = useState<string>('50');
  const [step, setStep] = useState<'input' | 'qr'>('input');
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    // Copia o payload do PIX para a área de transferência com segurança
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerConfirmation = () => {
    setShowConfirm(true);
  };

  const handleFinalConfirm = () => {
    onConfirm(Number(amount));
    onClose();
    setStep('input');
    setShowConfirm(false);
  };

  // Payload simulado para o QR Code gerado 100% no cliente para privacidade total
  const pixPayload = `00020126330014br.gov.bcb.pix0111simulado@pix520400005303986540${amount.length.toString().padStart(2, '0')}${amount}5802BR5916CofreInteligente6009Sao Paulo62070503***6304`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Depósito PIX</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="p-8">
            {step === 'input' ? (
              <div className="space-y-6">
                <p className="text-slate-600">Quanto você deseja depositar na meta <span className="font-semibold text-emerald-600">"{goalTitle}"</span>?</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-colors"
                    placeholder="0,00"
                  />
                </div>
                <button
                  onClick={() => setStep('qr')}
                  disabled={!amount || Number(amount) <= 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200"
                >
                  Gerar QR Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100">
                  {/* Geração local de QR Code sem chamadas externas para proteger a privacidade */}
                  <QRCodeCanvas 
                    value={pixPayload} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="w-full space-y-3">
                  <button 
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    <span className="font-medium">{copied ? 'Copiado!' : 'Copiar código PIX'}</span>
                  </button>
                  <button
                    onClick={handleTriggerConfirmation}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Confirmar Pagamento Simulado
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center italic">Ambiente seguro: QR Code gerado localmente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        title="Confirmar Adição"
        message={`Deseja realmente adicionar R$ ${formatNumber(Number(amount))} à meta "${goalTitle}"?`}
        onConfirm={handleFinalConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default PixModal;