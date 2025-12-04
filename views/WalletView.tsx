import React, { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Activity, Plus, ShieldAlert, CheckCircle, Wallet, Bitcoin } from 'lucide-react';

interface WalletViewProps {
  balance: number;
  onAddFunds: (amount: number) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ balance, onAddFunds }) => {
  const [method, setMethod] = useState<'paypal' | 'crypto'>('paypal');
  const [amount, setAmount] = useState(1000);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const transactions = [
    { id: 1, type: 'deposit', desc: 'Recarga Inicial Demo', amount: 5000, date: 'Hoy, 10:23 AM', status: 'Completado' },
    { id: 2, type: 'loss', desc: 'FintechSlot Activity', amount: -250, date: 'Hoy, 10:45 AM', status: 'Procesado' },
    { id: 3, type: 'win', desc: 'SmartRoll Payout', amount: 450, date: 'Hoy, 11:02 AM', status: 'Completado' },
    { id: 4, type: 'fee', desc: 'Network Fee (Simulado)', amount: -2, date: 'Hoy, 11:05 AM', status: 'Completado' },
  ];

  const handleSimulateDeposit = () => {
    if (amount <= 0) return;
    setStatus('processing');
    setTimeout(() => {
      onAddFunds(amount);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
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

        {/* Fake Deposit Module */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col">
            <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-[#1C8C6E]" /> Agregar Fondos (Simulación)
            </h3>
            
            <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-xl">
                <button 
                    onClick={() => setMethod('paypal')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${method === 'paypal' ? 'bg-[#0070BA] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Wallet size={14} /> PayPal (Simulado)
                </button>
                <button 
                    onClick={() => setMethod('crypto')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${method === 'crypto' ? 'bg-[#F7931A] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Bitcoin size={14} /> Wallet Cripto
                </button>
            </div>

            <div className="space-y-3 flex-1">
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Monto a recargar (FCT)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:border-[#D4C28A] outline-none"
                    />
                </div>

                <div className="bg-[#B23A48]/10 border border-[#B23A48]/30 p-3 rounded-lg flex items-start gap-2">
                    <ShieldAlert size={16} className="text-[#B23A48] flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-300 leading-tight">
                        <strong className="text-[#B23A48]">AVISO DE SEGURIDAD:</strong> Por seguridad, no aceptamos tarjetas ni documentos reales. Este módulo es 100% ficticio para fines académicos.
                    </p>
                </div>

                <button 
                    onClick={handleSimulateDeposit}
                    disabled={status !== 'idle' || amount <= 0}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        status === 'success' 
                        ? 'bg-green-500 text-black' 
                        : 'bg-white text-black hover:bg-slate-200'
                    }`}
                >
                    {status === 'processing' ? 'Procesando...' : status === 'success' ? (
                        <> <CheckCircle size={16} /> Fondos Agregados </>
                    ) : 'Confirmar (Simulación)'}
                </button>
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