import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { RegistrationModal } from './components/RegistrationModal';
import { HomeView } from './views/HomeView';
import { GamesView } from './views/GamesView';
import { WalletView } from './views/WalletView';
import { EducationView } from './views/EducationView';
import { ChatView } from './views/ChatView';
import { VisionView } from './views/VisionView';
import { AdminView } from './views/AdminView';
import { AppMode, UserProfile, GameLog } from './types';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.HOME);
  const [balance, setBalance] = useState(0); 
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);

  const handleRegister = (nameInput: string) => {
    // SUPERUSER SECRET CODE LOGIC
    if (nameInput === 'SUPERADMIN') {
       setUser({
         name: 'Master Operator',
         joinedAt: Date.now(),
         isVIP: true,
         isAdmin: true
       });
       setBalance(10000000); // 10 Million FCT for Admin
       addLog('SYSTEM', 'ADMIN_ACCESS_GRANTED', 0, 0, 0, 'Master Operator');
       setCurrentMode(AppMode.ADMIN); // Direct to Dashboard
    } else {
       // Normal User
       setUser({
         name: nameInput,
         joinedAt: Date.now(),
         isVIP: true,
         isAdmin: false
       });
       setBalance(10000); // 10k Bonus
       addLog('SYSTEM', 'REGISTRATION_BONUS', 0, 10000, 1, nameInput);
    }
  };

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const addLog = (game: string, result: string, bet: number, payout: number, multiplier: number, overrideUser?: string) => {
    const newLog: GameLog = {
      id: Date.now().toString() + Math.random().toString(),
      user: overrideUser || user?.name || 'Guest',
      game,
      bet,
      payout,
      multiplier,
      timestamp: Date.now(),
      result: payout >= bet ? 'WIN' : 'LOSS'
    };
    setGameLogs(prev => [newLog, ...prev]);
  };

  const renderView = () => {
    switch (currentMode) {
      case AppMode.HOME:
        return <HomeView onNavigate={setCurrentMode} userName={user?.name} />;
      case AppMode.GAMES:
        return <GamesView balance={balance} updateBalance={updateBalance} onGameLog={addLog} />;
      case AppMode.WALLET:
        return <WalletView balance={balance} />;
      case AppMode.EDUCATION:
        return <EducationView />;
      case AppMode.AI_CONCIERGE:
        return <ChatView />;
      case AppMode.KYC:
        return <VisionView />;
      case AppMode.ADMIN:
        return <AdminView logs={gameLogs} user={user} onModifyBalance={updateBalance} />;
      default:
        return <HomeView onNavigate={setCurrentMode} userName={user?.name} />;
    }
  };

  return (
    <>
      {!user && <RegistrationModal onRegister={handleRegister} />}
      <Layout 
        currentMode={currentMode} 
        onModeChange={setCurrentMode} 
        balance={balance}
        user={user}
      >
        {renderView()}
      </Layout>
    </>
  );
}

export default App;