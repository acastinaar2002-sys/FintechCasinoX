import React, { useState } from 'react';
import { AppMode, UserProfile } from '../types';
import { 
  Home, 
  Gamepad2, 
  Wallet, 
  GraduationCap, 
  MessageSquare, 
  ScanFace,
  Menu, 
  X, 
  Diamond,
  LayoutDashboard,
  Shield,
  Lock
} from 'lucide-react';

interface LayoutProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  balance: number;
  user: UserProfile | null;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, onModeChange, balance, user, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ mode, icon: Icon, label, secret }: { mode: AppMode; icon: any; label: string, secret?: boolean }) => (
    <button
      onClick={() => {
        onModeChange(mode);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-4 px-6 py-4 w-full transition-all duration-300 group border-l-2 ${
        currentMode === mode
          ? secret 
            ? 'border-[#B23A48] bg-[#B23A48]/10 text-[#B23A48]' 
            : 'border-[#D4C28A] bg-white/5 text-[#D4C28A]'
          : secret 
            ? 'border-transparent text-slate-600 hover:text-[#B23A48] hover:bg-[#B23A48]/5'
            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} className={currentMode === mode ? (secret ? 'text-[#B23A48]' : 'text-[#D4C28A]') : (secret ? '' : 'group-hover:text-white')} />
      <span className="font-heading font-medium tracking-wide text-sm">{label.toUpperCase()}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0B0B0C] text-white overflow-hidden selection:bg-[#D4C28A] selection:text-black">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/10 bg-[#0B0B0C] relative z-20">
        <div className="p-8 pb-8">
          <div className="flex items-center gap-3 text-white font-heading font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => onModeChange(AppMode.HOME)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4C28A] to-[#8C7D50] flex items-center justify-center shadow-lg shadow-[#D4C28A]/20">
              <Diamond size={20} className="text-[#0B0B0C]" />
            </div>
            <div>
              <span className="text-white">FINTECH</span>
              <span className="text-[#D4C28A]">X</span>
            </div>
          </div>
        </div>

        {/* User Profile Snippet */}
        {user && (
           <div className="px-6 mb-6">
              <div className={`rounded-xl p-4 border flex items-center gap-3 ${user.isAdmin ? 'bg-[#B23A48]/10 border-[#B23A48]/30' : 'bg-[#141417] border-white/5'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow ${user.isAdmin ? 'bg-[#B23A48] shadow-[#B23A48]/40' : 'bg-[#1C8C6E] shadow-[#1C8C6E]/40'}`}>
                    {user.isAdmin ? <Lock size={16}/> : user.name.charAt(0).toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${user.isAdmin ? 'text-[#B23A48]' : 'text-[#D4C28A]'}`}>
                      <Shield size={8} /> {user.isAdmin ? 'Superuser' : 'Verificado'}
                    </p>
                 </div>
              </div>
           </div>
        )}

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <NavItem mode={AppMode.HOME} icon={Home} label="Inicio" />
          <NavItem mode={AppMode.GAMES} icon={Gamepad2} label="Juegos (Demo)" />
          <NavItem mode={AppMode.WALLET} icon={Wallet} label="Fintech Wallet" />
          <NavItem mode={AppMode.EDUCATION} icon={GraduationCap} label="Probabilidad" />
          <div className="my-4 border-t border-white/5 mx-6"></div>
          <NavItem mode={AppMode.AI_CONCIERGE} icon={MessageSquare} label="Soporte IA" />
          <NavItem mode={AppMode.KYC} icon={ScanFace} label="Seguridad KYC" />
          
          <div className="mt-auto pb-4">
             {/* ONLY SHOW ADMIN BUTTON IF USER IS ADMIN */}
             {user?.isAdmin && (
               <NavItem mode={AppMode.ADMIN} icon={LayoutDashboard} label="Super Operador" secret={true} />
             )}
          </div>
        </nav>

        {/* Fake Balance Display */}
        <div className="p-6">
          <div className="glass-panel rounded-xl p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Wallet size={48} />
            </div>
            <p className="text-slate-400 text-xs font-heading uppercase tracking-wider mb-1">Saldo Simulado (FCT)</p>
            <p className="text-[#D4C28A] text-2xl font-bold font-mono">
              {balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center mt-4 text-[10px] text-slate-600">
            © 2025 FintechCasinoX. Proyecto Educativo.
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#0B0B0C]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2 font-heading font-bold text-lg">
            <Diamond size={20} className="text-[#D4C28A]" />
            <span>FINTECH<span className="text-[#D4C28A]">X</span></span>
        </div>
        <div className="flex items-center gap-4">
            {user && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.isAdmin ? 'bg-[#B23A48]' : 'bg-[#1C8C6E]'}`}>
                    {user.isAdmin ? <Lock size={12}/> : user.name.charAt(0).toUpperCase()}
                </div>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
            {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0B0B0C] z-40 pt-24 px-4 md:hidden flex flex-col gap-2">
            <NavItem mode={AppMode.HOME} icon={Home} label="Inicio" />
            <NavItem mode={AppMode.GAMES} icon={Gamepad2} label="Juegos (Demo)" />
            <NavItem mode={AppMode.WALLET} icon={Wallet} label="Fintech Wallet" />
            <NavItem mode={AppMode.EDUCATION} icon={GraduationCap} label="Probabilidad" />
            <NavItem mode={AppMode.AI_CONCIERGE} icon={MessageSquare} label="Soporte IA" />
            {user?.isAdmin && <NavItem mode={AppMode.ADMIN} icon={LayoutDashboard} label="Admin Panel" secret={true} />}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full pt-20 md:pt-0 overflow-hidden bg-gradient-to-br from-[#0B0B0C] to-[#111113]">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4C28A]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#1C8C6E]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 h-full overflow-y-auto">
           {children}
        </div>
      </main>
    </div>
  );
};