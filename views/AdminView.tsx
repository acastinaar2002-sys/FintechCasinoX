import React, { useState } from 'react';
import { GameLog, UserProfile } from '../types';
import { Activity, Users, DollarSign, TrendingUp, Search, Eye, Plus, Minus } from 'lucide-react';

interface AdminViewProps {
  logs: GameLog[];
  user: UserProfile | null;
  onModifyBalance: (amount: number) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ logs, user, onModifyBalance }) => {
  const [fundAmount, setFundAmount] = useState(1000);

  // Mock data to mix with real user data for a "Live" feel
  const mockUsers = [
    { name: "SarahConnor_99", status: "Active" },
    { name: "CryptoWhale_ETH", status: "Active" },
    { name: "JohnDoe_Vegas", status: "Idle" },
  ];

  const totalVolume = logs.reduce((acc, log) => acc + log.bet, 1450000); // Start with fake base volume
  const totalPayout = logs.reduce((acc, log) => acc + log.payout, 1320000);
  const profit = totalVolume - totalPayout;

  return (
    <div className="h-full overflow-y-auto bg-[#050505] p-4 md:p-10 animate-fade-in pb-24 md:pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
             <Activity className="text-[#B23A48]" /> Dashboard SuperOperador
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Panel de Control & Analítica en Tiempo Real</p>
        </div>
        <div className="flex items-center gap-3 bg-[#1a1d21] px-4 py-2 rounded-lg border border-white/10 w-full md:w-auto justify-center md:justify-start">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono text-slate-300">SISTEMA: ONLINE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#141417] p-5 rounded-2xl border border-white/5">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Users size={18} /></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Usuarios</span>
           </div>
           <div className="text-2xl md:text-3xl font-mono font-bold text-white">4,281</div>
           <div className="text-xs text-green-500 mt-2">+12 registrados hoy</div>
        </div>

        <div className="bg-[#141417] p-5 rounded-2xl border border-white/5">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-[#D4C28A]/10 text-[#D4C28A]"><DollarSign size={18} /></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Volumen Total (FCT)</span>
           </div>
           <div className="text-2xl md:text-3xl font-mono font-bold text-white">{(totalVolume / 1000).toFixed(1)}k</div>
           <div className="text-xs text-slate-400 mt-2">Circulación Global</div>
        </div>

        <div className="bg-[#141417] p-5 rounded-2xl border border-white/5">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-[#1C8C6E]/10 text-[#1C8C6E]"><TrendingUp size={18} /></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">House Profit (GGR)</span>
           </div>
           <div className={`text-2xl md:text-3xl font-mono font-bold ${profit >= 0 ? 'text-[#1C8C6E]' : 'text-[#B23A48]'}`}>
             {profit.toLocaleString()}
           </div>
           <div className="text-xs text-slate-400 mt-2">Margen Actual</div>
        </div>

        <div className="bg-[#141417] p-5 rounded-2xl border border-white/5">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Eye size={18} /></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Sesión Actual</span>
           </div>
           <div className="text-lg font-bold text-white truncate">{user?.name || 'Guest'}</div>
           <div className="text-xs text-purple-400 mt-2 font-mono">ID: {user?.joinedAt.toString().slice(-6)}</div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Live Game Feed (Logs) */}
        <div className="lg:col-span-2 bg-[#141417] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[450px] md:h-[500px]">
          <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h3 className="font-heading font-bold text-white">Log de Apuestas</h3>
            <div className="relative w-full md:w-auto">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-500"/>
              <input type="text" placeholder="Buscar ID..." className="bg-black/30 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4C28A] outline-none w-full md:w-48"/>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 bg-[#1a1d21] z-10 shadow-lg">
                   <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3 md:p-4">Hora</th>
                      <th className="p-3 md:p-4">Jugador</th>
                      <th className="p-3 md:p-4">Juego</th>
                      <th className="p-3 md:p-4 text-right">Apuesta</th>
                      <th className="p-3 md:p-4 text-right">Multi</th>
                      <th className="p-3 md:p-4 text-right">Pago</th>
                   </tr>
                </thead>
                <tbody className="font-mono text-xs md:text-sm">
                   {logs.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="p-8 text-center text-slate-500 italic">Esperando actividad de juego...</td>
                     </tr>
                   ) : (
                     logs.map((log) => (
                       <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors animate-fade-in">
                          <td className="p-3 md:p-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="p-3 md:p-4 font-bold text-white flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#D4C28A]"></div>
                             {log.user}
                          </td>
                          <td className="p-3 md:p-4">
                             <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] md:text-xs border border-slate-700">{log.game}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right text-slate-300">{log.bet.toFixed(2)}</td>
                          <td className={`p-3 md:p-4 text-right font-bold ${log.multiplier >= 1 ? 'text-[#1C8C6E]' : 'text-slate-500'}`}>
                             {log.multiplier.toFixed(2)}x
                          </td>
                          <td className={`p-3 md:p-4 text-right font-bold ${log.payout > 0 ? 'text-[#1C8C6E]' : 'text-slate-600'}`}>
                             {log.payout.toFixed(2)}
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* User Base Sidebar & Fund Management */}
        <div className="bg-[#141417] rounded-2xl border border-white/5 p-4 md:p-6 h-auto lg:h-[500px] flex flex-col">
            <h3 className="font-heading font-bold text-white mb-4 md:mb-6">Usuarios Conectados</h3>
            
            <div className="space-y-3 md:space-y-4 overflow-y-auto flex-1 pr-2 max-h-[200px] lg:max-h-none mb-6 lg:mb-0">
                {/* Real User */}
                {user && (
                  <div className="flex items-center justify-between p-3 bg-[#D4C28A]/10 border border-[#D4C28A]/30 rounded-xl">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D4C28A] flex items-center justify-center font-bold text-black">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-white font-bold text-sm">{user.name}</p>
                             <p className="text-[#D4C28A] text-[10px] uppercase font-bold">Jugando Ahora</p>
                          </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                )}

                {/* Fake Users */}
                {mockUsers.map((u, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-slate-300 font-bold text-sm">{u.name}</p>
                             <p className="text-slate-500 text-[10px] uppercase">{u.status}</p>
                          </div>
                      </div>
                   </div>
                ))}
            </div>

            {/* FUND MANAGEMENT SECTION */}
            <div className="mt-auto pt-4 border-t border-white/10">
                <h4 className="text-white font-bold text-xs uppercase mb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-[#D4C28A]" /> Gestión de Fondos
                </h4>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="number" 
                        value={fundAmount}
                        onChange={(e) => setFundAmount(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-3 text-white text-sm font-mono focus:border-[#D4C28A] outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => onModifyBalance(fundAmount)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                        <Plus size={16} /> ACREDITAR
                    </button>
                    <button onClick={() => onModifyBalance(-fundAmount)} className="bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                        <Minus size={16} /> DEBITAR
                    </button>
                </div>

                <button className="w-full py-3 bg-[#B23A48]/20 text-[#B23A48] border border-[#B23A48]/30 rounded-xl text-sm font-bold hover:bg-[#B23A48] hover:text-white transition-colors">
                    PAUSAR OPERACIONES
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};