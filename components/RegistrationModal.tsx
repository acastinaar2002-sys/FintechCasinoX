import React, { useState } from 'react';
import { Crown, ArrowRight, ShieldCheck } from 'lucide-react';

interface RegistrationModalProps {
  onRegister: (name: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegister }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRegister(name);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1565514020176-db79238b938f?q=80&w=1974&auto=format&fit=crop")' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/90 to-[#0B0B0C]/60"></div>

      <div className="relative z-10 w-full max-w-lg p-6 animate-fade-in-up">
        <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#D4C28A]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(212,194,138,0.15)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D4C28A] to-[#8C7D50] mb-6 shadow-lg shadow-[#D4C28A]/20">
              <Crown size={32} className="text-black" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Bienvenido a la Élite</h1>
            <p className="text-slate-400">FintechCasinoX - Simulation Experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#D4C28A] uppercase tracking-widest mb-2">
                Identificación de Jugador
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu Nombre o Alias"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:border-[#D4C28A] focus:ring-1 focus:ring-[#D4C28A] outline-none transition-all text-lg"
                autoFocus
              />
            </div>

            <div className="bg-[#1C8C6E]/10 border border-[#1C8C6E]/30 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-[#1C8C6E] flex-shrink-0" size={20} />
              <div>
                <p className="text-white font-bold text-sm">Bono de Bienvenida</p>
                <p className="text-slate-400 text-xs mt-1">Regístrate ahora y recibe <span className="text-[#1C8C6E] font-mono font-bold">10,000.00 FCT</span> en créditos de simulación.</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform
                ${name.trim() 
                  ? 'bg-gradient-to-r from-[#D4C28A] to-[#8C7D50] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(212,194,138,0.3)]' 
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
            >
              INGRESAR AL CASINO <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-600 mt-6">
            Al ingresar, aceptas que esto es una simulación educativa sin dinero real.
          </p>
        </div>
      </div>
    </div>
  );
};