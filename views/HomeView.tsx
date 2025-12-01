import React from 'react';
import { ArrowRight, ShieldCheck, Crown, Zap, Play } from 'lucide-react';
import { AppMode } from '../types';

interface HomeViewProps {
  onNavigate: (mode: AppMode) => void;
  userName?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, userName }) => {
  return (
    <div className="w-full min-h-full bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-[#050505]/60"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 space-y-20">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center justify-center min-h-[70vh] animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4C28A] bg-black/50 backdrop-blur-md text-[#D4C28A] text-xs font-bold tracking-widest mb-8 shadow-[0_0_15px_rgba(212,194,138,0.3)]">
            <Crown size={14} className="fill-[#D4C28A]" />
            {userName ? `BIENVENIDO, ${userName.toUpperCase()}` : 'EXPERIENCIA CASINO PREMIUM'}
          </div>
          
          <h1 className="text-6xl md:text-8xl font-casino font-bold leading-none mb-6 text-white drop-shadow-2xl">
            FINTECH<span className="text-[#D4C28A] neon-text-gold">X</span>
            <br />
            <span className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 font-heading">
              CASINO ROYALE
            </span>
          </h1>
          
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-light">
            Donde la elegancia matemática se encuentra con la adrenalina pura. 
            <br/>Juegos de alta fidelidad. Probabilidades reales. Sin riesgo real.
          </p>

          <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
            <button 
              onClick={() => onNavigate(AppMode.GAMES)}
              className="group relative px-10 py-5 bg-gradient-to-r from-[#D4C28A] to-[#8C7D50] text-[#0B0B0C] font-bold text-lg rounded-full overflow-hidden shadow-[0_0_30px_rgba(212,194,138,0.4)] hover:shadow-[0_0_50px_rgba(212,194,138,0.6)] transition-all transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
              <span className="relative flex items-center justify-center gap-3">
                JUGAR AHORA <Play size={20} fill="black" />
              </span>
            </button>
            <button 
               onClick={() => onNavigate(AppMode.WALLET)}
              className="px-10 py-5 glass-panel hover:bg-white/10 text-white font-medium text-lg rounded-full transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Zap size={20} className="text-[#D4C28A]" /> Obtener Fichas
            </button>
          </div>
        </section>

        {/* Live Status Bar */}
        <section className="glass-panel border-y border-white/10 p-4 md:p-6 rounded-none md:rounded-2xl flex flex-wrap justify-around items-center gap-4">
            <div className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Jackpot Acumulado</p>
                <p className="text-3xl font-mono text-[#D4C28A] font-bold animate-pulse">12,450,900 FCT</p>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Jugadores Activos</p>
                <p className="text-2xl font-mono text-white font-bold">8,421</p>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Último Gran Ganador</p>
                <p className="text-xl text-emerald-400 font-bold flex items-center gap-2">
                    <ShieldCheck size={16} /> Alex C. (+50k)
                </p>
            </div>
        </section>
      </div>
    </div>
  );
};