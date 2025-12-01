import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Activity } from 'lucide-react';

interface WalletViewProps {
  balance: number;
}

export const WalletView: React.FC<WalletViewProps> = ({ balance }) => {
  const transactions = [
    { id: 1, type: 'deposit', desc: 'Recarga Inicial Demo', amount: 5000, date: 'Hoy, 10:23 AM', status: 'Completado' },
    { id: 2, type: 'loss', desc: 'FintechSlot Activity', amount: -250, date: 'Hoy, 10:45 AM', status: 'Procesado' },
    { id: 3, type: 'win', desc: 'SmartRoll Payout', amount: 450, date: 'Hoy, 11:02 AM', status: 'Completado' },
    { id: 4, type: 'fee', desc: 'Network Fee (Simulado)', amount: -2, date: 'Hoy, 11:05 AM', status: 'Completado' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-heading font-bold text-white">Billetera Digital</h2>
            <p className="text-slate-400 text-sm">Gestión de activos FCT (FintechCoinToken)</p>
        </div>
        <div className="px-4 py-1 rounded-full bg-[#1C8C6E]/20 text-[#1C8C6E] text-xs font-bold border border-[#1C8C6E]/30">
            RED DE PRUEBA ACTIVA
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Balance Card */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#000000] border border-[#D4C28A]/20 shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-[#D4C28A]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <CreditCard className="text-[#D4C28A]" size={32} />
                <span className="font-mono text-xs text-slate-500 tracking-widest">**** 8842</span>
            </div>
            
            <div className="relative z-10">
                <p className="text-slate-400 text-sm uppercase mb-1">Saldo Total Estimado</p>
                <h3 className="text-4xl font-bold text-white mb-2">{balance.toLocaleString()} <span className="text-[#D4C28A] text-lg">FCT</span></h3>
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <TrendingUp size={16} /> +12.5% vs ayer (Simulado)
                </div>
            </div>
        </div>

        {/* Analytics Summary */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between">
            <div>
                <h3 className="font-heading font-bold text-lg mb-6">Resumen de Actividad</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-2"><ArrowDownLeft size={16} className="text-emerald-500"/> Ingresos</span>
                        <span className="font-mono text-white">5,450 FCT</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-2"><ArrowUpRight size={16} className="text-[#B23A48]"/> Gastos/Juego</span>
                        <span className="font-mono text-white">252 FCT</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#D4C28A] h-full w-[75%]"></div>
                    </div>
                    <p className="text-xs text-slate-500 text-right">75% del límite de gasto seguro</p>
                </div>
            </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-slate-400" /> Historial de Transacciones
        </h3>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-500 text-xs border-b border-white/10">
                        <th className="p-4 font-normal uppercase tracking-wider">Tipo</th>
                        <th className="p-4 font-normal uppercase tracking-wider">Descripción</th>
                        <th className="p-4 font-normal uppercase tracking-wider">Estado</th>
                        <th className="p-4 font-normal uppercase tracking-wider text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-2 ${
                                    tx.type === 'win' || tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-300'
                                }`}>
                                    {tx.type === 'deposit' && <ArrowDownLeft size={14} />}
                                    {tx.type === 'loss' && <ArrowUpRight size={14} />}
                                    {tx.type === 'win' && <TrendingUp size={14} />}
                                    {tx.type.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 text-white font-medium">
                                {tx.desc}
                                <div className="text-xs text-slate-500 mt-1">{tx.date}</div>
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">
                                    {tx.status}
                                </span>
                            </td>
                            <td className={`p-4 text-right font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount} FCT
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};