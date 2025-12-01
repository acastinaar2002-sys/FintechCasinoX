import React, { useState, useEffect, useRef } from 'react';
import { 
  Dices, ArrowLeft, Spade, Heart, Club, Diamond, Zap, 
  Crown, TrendingUp, Skull, Bomb, 
  StopCircle, Coins, Target, Grid3X3, ArrowDown,
  Brain, CheckCircle, XCircle, Rocket, Info
} from 'lucide-react';

interface GamesViewProps {
  balance: number;
  updateBalance: (amount: number) => void;
  onGameLog: (game: string, result: string, bet: number, payout: number, multiplier: number) => void;
}

type GameType = 'LOBBY' | 'SLOTS' | 'DICE' | 'BLACKJACK' | 'ROULETTE' | 'CRASH' | 'ROAD' | 'MINES' | 'PLINKO' | 'KENO' | 'LIMBO';

// --- UTILS ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatCurrency = (val: number) => val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- TRIVIA DATA ---
const TRIVIA_QUESTIONS = [
  { q: "¿Cuál es la capital de Francia?", options: ["Londres", "Berlín", "París", "Madrid"], ans: 2, reward: 500 },
  { q: "¿Qué elemento químico tiene el símbolo Au?", options: ["Plata", "Oro", "Cobre", "Argón"], ans: 1, reward: 500 },
  { q: "En probabilidad, ¿qué es un evento 'independiente'?", options: ["Depende del anterior", "No afecta al siguiente", "Siempre gana", "Nunca ocurre"], ans: 1, reward: 750 },
  { q: "¿Quién pintó la Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Miguel Ángel"], ans: 2, reward: 500 },
  { q: "¿Cuántos lados tiene un hexágono?", options: ["5", "6", "7", "8"], ans: 1, reward: 300 },
  { q: "¿Qué significa ROI en finanzas?", options: ["Return On Investment", "Risk Of Inflation", "Rate Of Interest", "Real Option Index"], ans: 0, reward: 1000 },
  { q: "¿Cuál es la raíz cuadrada de 144?", options: ["10", "11", "12", "13"], ans: 2, reward: 400 },
  { q: "¿Qué criptomoneda fue la primera en existir?", options: ["Ethereum", "Bitcoin", "Litecoin", "Ripple"], ans: 1, reward: 600 },
];

// --- SHARED COMPONENTS ---

interface CardProps {
  suit?: string;
  value?: string;
  color?: string;
  hidden?: boolean;
  small?: boolean;
}

const Card: React.FC<CardProps> = ({ suit, value, color, hidden, small }) => (
    <div className={`${small ? 'w-10 h-14 text-sm' : 'w-20 h-28 md:w-24 md:h-36 text-2xl'} rounded-lg border shadow-xl flex items-center justify-center font-bold relative transition-all duration-300 select-none
      ${hidden 
          ? 'bg-[#1a1d21] border-[#2f3543] bg-[url("https://www.transparenttextures.com/patterns/diagmonds-light.png")]' 
          : 'bg-white border-slate-300 shadow-black/20'}`
    }>
        {!hidden && (
            <>
              <div className={`absolute top-1 left-1 md:top-2 md:left-2 text-xs md:text-sm ${color}`}>{value}<span className="text-[0.8em]">{suit}</span></div>
              <div className={`${small ? 'text-lg' : 'text-4xl'} ${color}`}>{suit}</div>
              <div className={`absolute bottom-1 right-1 md:bottom-2 md:right-2 text-xs md:text-sm ${color} rotate-180`}>{value}<span className="text-[0.8em]">{suit}</span></div>
            </>
        )}
        {hidden && <div className="text-[#D4C28A] text-2xl opacity-50">♠</div>}
    </div>
);

// --- PLINKO ENGINE ---
const PlinkoGame = ({ active, onFinish, rows = 16 }: { active: boolean, onFinish: (mult: number) => void, rows?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<any[]>([]);
    
    // Multipliers for 16 rows (Stake style high risk)
    const multipliers = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
    
    // Physics constants
    const gravity = 0.25;
    const friction = 0.99;
    const bounce = 0.6;
    const spacing = 35; // Wider spacing for better visuals
    
    const dropBall = () => {
        const startX = canvasRef.current!.width / 2;
        // Add random slight offset so they don't all follow exact same path
        setBalls(prev => [...prev, { 
            x: startX + (Math.random() - 0.5) * 5, 
            y: 20, 
            vx: (Math.random() - 0.5) * 2, 
            vy: 0, 
            active: true,
            color: Math.random() > 0.5 ? '#ff0055' : '#D4C28A' 
        }]);
    };

    useEffect(() => {
        if (active) dropBall();
    }, [active]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const pegs: {x: number, y: number}[] = [];
        const startY = 80;

        // Build Pyramid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= row; col++) {
                const x = canvas.width / 2 - (row * spacing / 2) + (col * spacing);
                const y = startY + row * spacing;
                pegs.push({x, y});
            }
        }

        const update = () => {
            // Clear with trail effect
            ctx.fillStyle = 'rgba(15, 17, 20, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw Pegs (Glowing)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            pegs.forEach(peg => {
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Multipliers (Buckets)
            const bottomY = startY + rows * spacing;
            multipliers.forEach((m, i) => {
                const x = canvas.width / 2 - (rows * spacing / 2) + (i * spacing);
                
                // Color Gradient based on risk
                let color = '#f59e0b'; // Middle (Yellow)
                if (i < 2 || i > multipliers.length - 3) color = '#ef4444'; // Extremes (Red)
                else if (i > 5 && i < multipliers.length - 6) color = '#10b981'; // Center (Green)
                
                // Draw Bucket
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x - 14, bottomY + 15, 28, 25, 4);
                ctx.fill();
                
                // Draw Text
                ctx.fillStyle = '#000';
                ctx.font = 'bold 9px Montserrat';
                ctx.textAlign = 'center';
                ctx.fillText(m + 'x', x, bottomY + 31);
            });

            // Update Balls
            setBalls(currentBalls => {
                const nextBalls = currentBalls.map(ball => {
                    if (!ball.active) return ball;

                    ball.vy += gravity; 
                    ball.vx *= friction;
                    ball.y += ball.vy;
                    ball.x += ball.vx;

                    // Peg Collision
                    pegs.forEach(peg => {
                        const dx = ball.x - peg.x;
                        const dy = ball.y - peg.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (dist < 9) { // Ball radius 5 + peg radius 4
                            // Simple physics bounce
                            const angle = Math.atan2(dy, dx);
                            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                            
                            // Add randomness to bounce to simulate chaos
                            const randomDeflection = (Math.random() - 0.5) * 0.5;
                            
                            ball.vx = Math.cos(angle + randomDeflection) * speed * bounce;
                            ball.vy = Math.sin(angle + randomDeflection) * speed * bounce;
                            
                            // Push out to prevent sticking
                            const overlap = 9 - dist;
                            ball.x += Math.cos(angle) * overlap;
                            ball.y += Math.sin(angle) * overlap;
                        }
                    });

                    // Floor Collision
                    if (ball.y > bottomY + 10) {
                        ball.active = false;
                        const bucketIndex = Math.floor((ball.x - (canvas.width / 2 - rows * spacing / 2) + spacing/2) / spacing);
                        const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, bucketIndex));
                        onFinish(multipliers[clampedIndex]);
                    }

                    return ball;
                });

                // Draw Balls
                nextBalls.forEach(ball => {
                    if (ball.active) {
                        ctx.beginPath();
                        ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
                        ctx.fillStyle = ball.color;
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = ball.color;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        
                        // Shine
                        ctx.beginPath();
                        ctx.arc(ball.x - 2, ball.y - 2, 2, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        ctx.fill();
                    }
                });

                return nextBalls.filter(b => b.y < canvas.height); // Cleanup
            });

            animationId = requestAnimationFrame(update);
        };
        animationId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationId);
    }, [rows]);

    return <canvas ref={canvasRef} width={800} height={700} className="w-full h-full object-contain" />;
};


export const GamesView: React.FC<GamesViewProps> = ({ balance, updateBalance, onGameLog }) => {
  const [activeGame, setActiveGame] = useState<GameType>('LOBBY');
  const [currentBet, setCurrentBet] = useState(10);
  const [notification, setNotification] = useState<{msg: string, type: 'win' | 'lose'} | null>(null);

  // --- UNIVERSAL STATES ---
  const [isPlaying, setIsPlaying] = useState(false);

  // --- TRIVIA STATE ---
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQ, setTriviaQ] = useState<any>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'wrong' | null>(null);

  // --- LIMBO STATE ---
  const [limboTarget, setLimboTarget] = useState(2.0);
  const [limboResult, setLimboResult] = useState<number | null>(null);

  // --- KENO STATE ---
  const [kenoSelections, setKenoSelections] = useState<number[]>([]);
  const [kenoDraw, setKenoDraw] = useState<number[]>([]);
  
  // --- PLINKO STATE ---
  const [plinkoTrigger, setPlinkoTrigger] = useState(false);
  const [plinkoHistory, setPlinkoHistory] = useState<number[]>([]);

  // --- CRASH STATE ---
  const [crashMultiplier, setCrashMultiplier] = useState(1.00);
  const [crashed, setCrashed] = useState(false);
  const crashRef = useRef<number>(0);

  // --- NEON DICE STATE ---
  const [diceValue, setDiceValue] = useState(50);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  // --- MINES STATE ---
  const [minesGrid, setMinesGrid] = useState<string[]>(Array(25).fill(''));
  const [minesRevealed, setMinesRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [minesCount, setMinesCount] = useState(3);

  // --- BLACKJACK STATE ---
  const [bjDeck, setBjDeck] = useState<any[]>([]);
  const [playerHand, setPlayerHand] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);
  const [bjState, setBjState] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');

  // --- NOTIFICATION SYSTEM ---
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const notify = (amount: number, msg: string, gameOverride?: string, multiplier?: number) => {
      if (amount > 0) {
          updateBalance(amount);
          setNotification({ msg: `+${formatCurrency(amount)} FCT`, type: 'win' });
          onGameLog(gameOverride || activeGame, 'WIN', currentBet, amount, multiplier || (amount/currentBet));
      } else {
          setNotification({ msg: msg, type: 'lose' });
          onGameLog(gameOverride || activeGame, 'LOSS', currentBet, 0, 0);
      }
  };

  // --- TRIVIA LOGIC ---
  const openTrivia = () => {
      const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
      setTriviaQ(q);
      setTriviaResult(null);
      setShowTrivia(true);
  };

  const handleTriviaAnswer = (idx: number) => {
      if (triviaResult) return;
      if (idx === triviaQ.ans) {
          setTriviaResult('correct');
          setTimeout(() => {
              notify(triviaQ.reward, "¡Respuesta Correcta!", "TRIVIA", 1);
              setShowTrivia(false);
          }, 1500);
      } else {
          setTriviaResult('wrong');
          setTimeout(() => setShowTrivia(false), 1500);
      }
  };

  // --- GAME ENGINES ---

  // 1. LIMBO
  const playLimbo = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      
      let targetResult = 0.99 / (1 - Math.random());
      targetResult = Math.max(1, Math.floor(targetResult * 100) / 100);
      
      // Animation Effect
      let display = 1.00;
      const interval = setInterval(() => {
          display += Math.random() * 5;
          setLimboResult(display);
          if (display >= targetResult) {
               clearInterval(interval);
               setLimboResult(targetResult);
               if (targetResult >= limboTarget) {
                    notify(currentBet * limboTarget, `Objetivo ${limboTarget}x Alcanzado`, 'LIMBO', limboTarget);
                } else {
                    notify(0, `Resultado: ${targetResult.toFixed(2)}x`, 'LIMBO', 0);
                }
          }
      }, 10);
  };

  // 2. KENO
  const toggleKenoNum = (n: number) => {
      if (isPlaying) return;
      if (kenoSelections.includes(n)) setKenoSelections(prev => prev.filter(x => x !== n));
      else if (kenoSelections.length < 10) setKenoSelections(prev => [...prev, n]);
  };
  
  const playKeno = () => {
      if (currentBet > balance || kenoSelections.length === 0) return;
      updateBalance(-currentBet);
      setIsPlaying(true);
      setKenoDraw([]);
      
      const draw: number[] = [];
      while(draw.length < 20) {
          const n = randomInt(1, 40);
          if(!draw.includes(n)) draw.push(n);
      }
      
      let i = 0;
      const interval = setInterval(() => {
          setKenoDraw(prev => [...prev, draw[i]]);
          i++;
          if (i >= 20) {
              clearInterval(interval);
              setIsPlaying(false);
              const matches = kenoSelections.filter(s => draw.includes(s)).length;
              let mult = 0;
              if (matches >= 2) mult = matches * 0.5;
              if (matches >= 5) mult = matches * 2;
              
              if (mult > 0) notify(currentBet * mult, `${matches} Aciertos`, 'KENO', mult);
              else notify(0, "Suerte la próxima", 'KENO', 0);
          }
      }, 100);
  };

  // 3. PLINKO
  const dropPlinko = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setPlinkoTrigger(prev => !prev); 
  };
  
  const onPlinkoResult = (mult: number) => {
      const win = currentBet * mult;
      setPlinkoHistory(prev => [mult, ...prev].slice(0, 5));
      if (win > 0) notify(win, `Plinko x${mult}`, 'PLINKO', mult);
      else notify(0, "Plinko x0", 'PLINKO', 0); // Technically not 0 usually, but handling just in case
  };

  // 4. BLACKJACK
  const bjSuits = ['♠', '♥', '♣', '♦'];
  const bjValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const getBjValue = (hand: any[]) => {
    let val = 0; let aces = 0;
    hand.forEach(c => {
        if (['J','Q','K'].includes(c.value)) val += 10;
        else if (c.value === 'A') { val += 11; aces++; }
        else val += parseInt(c.value);
    });
    while (val > 21 && aces > 0) { val -= 10; aces--; }
    return val;
  };

  const startBlackjack = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      const deck = bjSuits.flatMap(s => bjValues.map(v => ({ 
          suit: s, value: v, color: (s === '♥' || s === '♦') ? 'text-red-500' : 'text-slate-900' 
      }))).sort(() => Math.random() - 0.5);
      
      const p = [deck.pop(), deck.pop()];
      const d = [deck.pop(), deck.pop()];
      setBjDeck(deck); setPlayerHand(p); setDealerHand(d); setBjState('PLAYING');
      
      if (getBjValue(p) === 21) {
          setBjState('ENDED');
          notify(currentBet * 2.5, "Blackjack Puro!", 'BLACKJACK', 2.5);
      }
  };

  const hitBj = () => {
      const newP = [...playerHand, bjDeck.pop()];
      setPlayerHand(newP);
      if (getBjValue(newP) > 21) {
          setBjState('ENDED');
          notify(0, "Te pasaste (Bust)", 'BLACKJACK', 0);
      }
  };

  const standBj = () => {
      let d = [...dealerHand];
      let deck = [...bjDeck];
      while (getBjValue(d) < 17) d.push(deck.pop());
      setDealerHand(d);
      setBjState('ENDED');
      
      const pVal = getBjValue(playerHand);
      const dVal = getBjValue(d);
      
      if (dVal > 21 || pVal > dVal) notify(currentBet * 2, "Ganaste", 'BLACKJACK', 2);
      else if (pVal === dVal) notify(currentBet, "Empate (Push)", 'BLACKJACK', 1);
      else notify(0, "La casa gana", 'BLACKJACK', 0);
  };

  // 5. CRASH
  const startCrash = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setIsPlaying(true);
      setCrashed(false);
      setCrashMultiplier(1.00);
      
      const crashPoint = (0.99 / (1 - Math.random()));
      let current = 1.00;
      let speed = 0.01;

      const loop = () => {
          speed += 0.0005;
          current += speed;
          setCrashMultiplier(current);

          if (current >= crashPoint) {
              setCrashed(true);
              setIsPlaying(false);
              setNotification({ msg: "CRASH! Perdiste.", type: 'lose' });
              onGameLog('CRASH', 'LOSS', currentBet, 0, 0);
          } else {
              crashRef.current = requestAnimationFrame(loop);
          }
      };
      crashRef.current = requestAnimationFrame(loop);
  };

  const cashOutCrash = () => {
      cancelAnimationFrame(crashRef.current);
      setIsPlaying(false);
      const win = currentBet * crashMultiplier;
      notify(win, `Cobrado a ${crashMultiplier.toFixed(2)}x`, 'CRASH', crashMultiplier);
  };

  // 6. MINES
  const startMines = () => {
    if (currentBet > balance) return;
    updateBalance(-currentBet);
    setIsPlaying(true);
    setMinesRevealed(Array(25).fill(false));
    
    let newGrid = Array(25).fill('diamond');
    let planted = 0;
    while(planted < minesCount) {
        const idx = Math.floor(Math.random() * 25);
        if (newGrid[idx] !== 'bomb') {
            newGrid[idx] = 'bomb';
            planted++;
        }
    }
    setMinesGrid(newGrid);
  };

  const clickMine = (idx: number) => {
      if (!isPlaying || minesRevealed[idx]) return;
      
      const newRevealed = [...minesRevealed];
      newRevealed[idx] = true;
      setMinesRevealed(newRevealed);

      if (minesGrid[idx] === 'bomb') {
          setIsPlaying(false);
          setMinesRevealed(Array(25).fill(true));
          notify(0, "BOOM!", 'MINES', 0);
      } 
  };
  
  const cashOutMines = () => {
      const safeRevealed = minesRevealed.filter((r, i) => r && minesGrid[i] === 'diamond').length;
      if (safeRevealed === 0) return;
      let mult = 1;
      for(let i=0; i<safeRevealed; i++) mult *= 1.15;
      
      setIsPlaying(false);
      setMinesRevealed(Array(25).fill(true));
      notify(currentBet * mult, `Cobrado x${mult.toFixed(2)}`, 'MINES', mult);
  };

  // 7. DICE
  const rollDice = () => {
    if (currentBet > balance) return;
    updateBalance(-currentBet);
    const roll = Math.random() * 100;
    setDiceResult(roll);
    setTimeout(() => {
        if (roll <= diceValue) {
            const multiplier = 98 / diceValue;
            notify(currentBet * multiplier, `Ganaste (x${multiplier.toFixed(2)})`, 'DICE', multiplier);
        } else {
            notify(0, "Fallaste", 'DICE', 0);
        }
    }, 200);
  };

  // --- GAME INFO & DESCRIPTIONS ---
  const getGameDescription = () => {
      switch(activeGame) {
          case 'PLINKO': return "Suelta la bola desde la cima de la pirámide y observa cómo cae a través de las clavijas. Cada casilla en la base tiene un multiplicador. ¡Apunta a los bordes para premios grandes!";
          case 'CRASH': return "Un cohete asciende y el multiplicador aumenta. Debes 'Retirarte' antes de que explote. Si esperas demasiado, lo pierdes todo. ¿Hasta dónde te atreves a llegar?";
          case 'MINES': return "Encuentra los diamantes ocultos en la cuadrícula de 5x5. Cada diamante aumenta tu ganancia, pero si tocas una mina, pierdes todo. Puedes cobrar en cualquier momento.";
          case 'LIMBO': return "Establece un multiplicador objetivo. Si el número generado es mayor o igual a tu objetivo, ganas instantáneamente. Ideal para estrategias de alto riesgo.";
          case 'BLACKJACK': return "Juega contra la casa. Obtén una mano más cercana a 21 que el dealer sin pasarte. Blackjack paga 3 a 2. El dealer debe pedir hasta 16 y plantarse en 17.";
          case 'DICE': return "Ajusta la barra deslizadora para predecir el resultado del dado. Un rango más pequeño ofrece mayores pagos. Predice si el número será menor que tu selección.";
          case 'KENO': return "Selecciona hasta 10 números del 1 al 40. La casa sortea 20 números. Cuantos más aciertos tengas, mayor será tu premio.";
          default: return "";
      }
  }

  // --- RENDER ---

  if (activeGame === 'LOBBY') {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-casino font-bold text-white mb-2 tracking-tight">LOBBY</h2>
                    <p className="text-[#D4C28A] font-medium">Originals & Classics</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={openTrivia}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-purple-900/40"
                    >
                        <Brain size={18} /> Gana FCT Gratis
                    </button>
                    <div className="bg-[#1C1C1E] px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
                        <Zap className="text-[#D4C28A] fill-[#D4C28A]" size={20} />
                        <span className="text-white font-mono font-bold text-lg">{formatCurrency(balance)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                    { id: 'BLACKJACK', name: 'Blackjack VIP', icon: Spade, color: 'text-white', img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073&auto=format&fit=crop' },
                    { id: 'PLINKO', name: 'Plinko', icon: ArrowDown, color: 'text-pink-500', img: 'https://images.unsplash.com/photo-1595088287895-8df9523c9135?q=80&w=2070&auto=format&fit=crop' },
                    { id: 'MINES', name: 'Mines', icon: Bomb, color: 'text-yellow-500', img: 'https://images.unsplash.com/photo-1614726365723-49cfae92782f?q=80&w=2069&auto=format&fit=crop' },
                    { id: 'CRASH', name: 'Crash', icon: TrendingUp, color: 'text-rose-500', img: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2064&auto=format&fit=crop' },
                    { id: 'LIMBO', name: 'Limbo', icon: Target, color: 'text-indigo-400', img: 'https://images.unsplash.com/photo-1533749047139-1d28648928d8?q=80&w=2070&auto=format&fit=crop' },
                    { id: 'KENO', name: 'Keno', icon: Grid3X3, color: 'text-purple-500', img: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2072&auto=format&fit=crop' },
                    { id: 'DICE', name: 'Dice', icon: Dices, color: 'text-emerald-500', img: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?q=80&w=2070&auto=format&fit=crop' },
                    { id: 'ROULETTE', name: 'Roulette', icon: StopCircle, color: 'text-red-500', img: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop' },
                ].map((game) => (
                    <div key={game.id} onClick={() => setActiveGame(game.id as GameType)} className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D4C28A] transition-all shadow-2xl hover:translate-y-[-5px]">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" style={{ backgroundImage: `url(${game.img})` }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 p-6 w-full">
                            <div className={`flex items-center gap-3 font-bold text-white text-xl`}>
                                <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-sm ${game.color}`}>
                                    <game.icon size={24} />
                                </div>
                                {game.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TRIVIA MODAL */}
            {showTrivia && triviaQ && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl max-w-md w-full relative shadow-2xl animate-fade-in-up">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl"></div>
                         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <Brain className="text-purple-400" /> Trivia Challenge
                         </h3>
                         <p className="text-lg text-slate-200 mb-8 font-medium">{triviaQ.q}</p>
                         
                         <div className="space-y-3">
                             {triviaQ.options.map((opt: string, idx: number) => (
                                 <button
                                    key={idx}
                                    onClick={() => handleTriviaAnswer(idx)}
                                    className={`w-full p-4 rounded-xl text-left transition-all border
                                        ${triviaResult === null 
                                            ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                                            : idx === triviaQ.ans 
                                                ? 'bg-green-500/20 border-green-500 text-green-400' 
                                                : triviaResult === 'wrong' && idx !== triviaQ.ans 
                                                    ? 'bg-red-500/20 border-red-500 text-red-400 opacity-50'
                                                    : 'opacity-50'
                                        }
                                    `}
                                 >
                                     <div className="flex justify-between items-center">
                                        <span>{opt}</span>
                                        {triviaResult === 'correct' && idx === triviaQ.ans && <CheckCircle size={20}/>}
                                        {triviaResult === 'wrong' && idx !== triviaQ.ans && <div/>} 
                                     </div>
                                 </button>
                             ))}
                         </div>
                         
                         <button onClick={() => setShowTrivia(false)} className="mt-6 text-slate-500 hover:text-white text-sm w-full text-center">Cancelar</button>
                    </div>
                </div>
            )}

        </div>
    );
  }

  return (
      <div className="h-full flex flex-col p-4 md:p-6 max-w-[1600px] mx-auto">
          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-6 bg-[#1a1d21] p-4 rounded-xl border border-white/5 shadow-lg">
              <button onClick={() => setActiveGame('LOBBY')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-wider">
                  <ArrowLeft size={16}/> Lobby
              </button>
              <div className="text-white font-bold tracking-widest">{activeGame}</div>
              <div className="flex items-center gap-2 text-[#D4C28A] font-mono font-bold">
                  <div className="bg-[#0f1114] px-4 py-2 rounded-lg border border-[#D4C28A]/20 shadow-inner flex items-center gap-2">
                    <Coins size={16} />
                    {formatCurrency(balance)}
                  </div>
              </div>
          </div>

          {notification && (
              <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl font-bold shadow-2xl z-50 animate-bounce flex items-center gap-3 backdrop-blur-md border border-white/10 ${notification.type === 'win' ? 'bg-[#1C8C6E]/90 text-white' : 'bg-red-600/90 text-white'}`}>
                  {notification.type === 'win' ? <Crown size={20} className="fill-current"/> : <Skull size={20}/>}
                  {notification.msg}
              </div>
          )}

          <div className="flex-1 flex flex-col-reverse md:flex-row gap-6 overflow-hidden min-h-[600px]">
              
              {/* SIDEBAR CONTROLS */}
              <div className="w-full md:w-80 flex-shrink-0 bg-[#1a1d21] rounded-xl p-6 border border-white/5 flex flex-col gap-6 shadow-xl h-fit">
                  {/* Common Bet Input */}
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase">
                          <span>Apuesta</span>
                          <span>Max: 5000</span>
                      </div>
                      <div className="relative mb-2">
                          <input 
                              type="number" 
                              value={currentBet}
                              onChange={(e) => setCurrentBet(Math.max(0, parseFloat(e.target.value) || 0))}
                              disabled={isPlaying}
                              className="w-full bg-[#0f1114] border border-white/10 rounded-lg py-3 px-12 text-white font-mono focus:border-[#D4C28A] outline-none shadow-inner"
                          />
                          <Coins size={16} className="absolute left-4 top-4 text-slate-500" />
                          <div className="absolute right-2 top-2 flex gap-1">
                              <button onClick={() => setCurrentBet(b => Math.floor(b/2))} className="px-2 py-1 bg-[#24282e] rounded text-xs text-slate-400 hover:text-white hover:bg-[#2f3543]">½</button>
                              <button onClick={() => setCurrentBet(b => b*2)} className="px-2 py-1 bg-[#24282e] rounded text-xs text-slate-400 hover:text-white hover:bg-[#2f3543]">2x</button>
                          </div>
                      </div>
                  </div>

                  {/* Game Specific Inputs */}
                  {activeGame === 'LIMBO' && (
                      <div>
                          <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Objetivo (x)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={limboTarget}
                            onChange={(e) => setLimboTarget(parseFloat(e.target.value))}
                            className="w-full bg-[#0f1114] border border-white/10 rounded-lg py-3 px-4 text-white font-mono mb-2 focus:border-[#D4C28A] outline-none"
                          />
                      </div>
                  )}

                  {activeGame === 'MINES' && !isPlaying && (
                      <div>
                           <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Minas</label>
                           <div className="grid grid-cols-5 gap-2">
                               {[1, 3, 5, 10, 20].map(m => (
                                   <button key={m} onClick={() => setMinesCount(m)} className={`p-2 rounded text-xs font-bold transition-all ${minesCount === m ? 'bg-[#D4C28A] text-black shadow-lg shadow-[#D4C28A]/20' : 'bg-[#24282e] text-slate-400 hover:bg-[#2f3543]'}`}>
                                       {m}
                                   </button>
                               ))}
                           </div>
                      </div>
                  )}
                  
                  {activeGame === 'DICE' && (
                       <div>
                            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase mb-2">
                                <span>Chance: {diceValue}%</span>
                                <span>Multi: {(98/diceValue).toFixed(2)}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="2" max="98" 
                                value={diceValue} 
                                onChange={(e) => setDiceValue(parseInt(e.target.value))}
                                className="w-full accent-[#1C8C6E] cursor-pointer"
                            />
                       </div>
                  )}

                  {/* Main Action Button */}
                  <button 
                      onClick={() => {
                          if (activeGame === 'LIMBO') playLimbo();
                          if (activeGame === 'BLACKJACK') {
                              if (bjState === 'PLAYING') hitBj();
                              else startBlackjack();
                          }
                          if (activeGame === 'PLINKO') dropPlinko();
                          if (activeGame === 'CRASH') {
                              if (isPlaying) cashOutCrash();
                              else startCrash();
                          }
                          if (activeGame === 'MINES') {
                              if (isPlaying) cashOutMines();
                              else startMines();
                          }
                          if (activeGame === 'KENO') playKeno();
                          if (activeGame === 'DICE') rollDice();
                      }}
                      disabled={
                          (activeGame === 'MINES' && false) || 
                          (activeGame === 'KENO' && isPlaying) ||
                          (activeGame === 'CRASH' && crashed)
                      }
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]
                      ${activeGame === 'BLACKJACK' && bjState === 'PLAYING' 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : activeGame === 'CRASH' && isPlaying
                            ? 'bg-[#D4C28A] hover:bg-[#bfa566] text-black shadow-[#D4C28A]/20'
                            : activeGame === 'MINES' && isPlaying
                                ? 'bg-[#1C8C6E] text-white hover:brightness-110'
                                : 'bg-[#1C8C6E] hover:bg-[#167058] text-white shadow-[#1C8C6E]/20'
                      }`}
                  >
                      {activeGame === 'BLACKJACK' && bjState === 'PLAYING' ? 'PEDIR CARTA' : 
                       activeGame === 'CRASH' && isPlaying ? 'RETIRAR AHORA' :
                       activeGame === 'MINES' && isPlaying ? 'COBRAR' : 
                       'JUGAR'}
                  </button>

                  {/* Secondary Action for Blackjack */}
                  {activeGame === 'BLACKJACK' && bjState === 'PLAYING' && (
                       <button onClick={standBj} className="w-full py-4 rounded-xl font-bold text-lg bg-[#2f3543] hover:bg-[#3a4150] text-white transition-all">
                           PLANTARSE
                       </button>
                  )}

                  {/* Game Rules / Info */}
                  <div className="mt-4 p-4 rounded-lg bg-[#0f1114] border border-white/5 text-xs text-slate-400 leading-relaxed">
                      <div className="flex items-center gap-2 mb-2 text-white font-bold">
                          <Info size={14} className="text-[#D4C28A]" /> Cómo jugar
                      </div>
                      {getGameDescription()}
                  </div>
              </div>

              {/* GAME DISPLAY AREA */}
              <div className="flex-1 bg-[#0f1114] rounded-xl border border-white/5 relative overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[500px]">
                  
                  {/* --- PLINKO RENDER --- */}
                  {activeGame === 'PLINKO' && (
                      <div className="absolute inset-0 bg-[#0f1114]">
                          <PlinkoGame active={plinkoTrigger} onFinish={onPlinkoResult} />
                          <div className="absolute top-4 right-4 w-40 space-y-2">
                               {plinkoHistory.map((h, i) => (
                                   <div key={i} className={`p-2 rounded text-center font-bold text-xs animate-deal flex justify-between px-4 border border-white/5 ${h >= 10 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : h < 1 ? 'bg-red-500/20 text-red-400' : 'bg-[#2f3543] text-slate-300'}`}>
                                       <span>Payout</span>
                                       <span>{h}x</span>
                                   </div>
                               ))}
                          </div>
                      </div>
                  )}

                  {/* --- KENO RENDER --- */}
                  {activeGame === 'KENO' && (
                      <div className="grid grid-cols-8 gap-2 p-4 max-w-2xl">
                          {Array.from({length: 40}, (_, i) => i + 1).map(n => {
                              const isSelected = kenoSelections.includes(n);
                              const isHit = kenoDraw.includes(n);
                              return (
                                  <button 
                                    key={n}
                                    onClick={() => toggleKenoNum(n)}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-sm transition-all relative border
                                        ${isHit && isSelected ? 'bg-[#D4C28A] text-black scale-110 shadow-[0_0_15px_#D4C28A] z-10 border-[#D4C28A]' :
                                          isHit ? 'bg-[#B23A48] text-white border-[#B23A48]' :
                                          isSelected ? 'bg-white text-black border-white' :
                                          'bg-[#24282e] text-slate-500 hover:bg-[#2f3543] border-white/5'}
                                    `}
                                  >
                                      {n}
                                      {isSelected && <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#1C8C6E] rounded-full"></div>}
                                  </button>
                              )
                          })}
                      </div>
                  )}

                  {/* --- LIMBO RENDER --- */}
                  {activeGame === 'LIMBO' && (
                      <div className="text-center relative">
                          <div className={`text-9xl font-mono font-bold mb-4 transition-colors duration-100 ${limboResult && limboResult >= limboTarget ? 'text-[#1C8C6E] drop-shadow-[0_0_15px_rgba(28,140,110,0.5)]' : crashed || (limboResult && limboResult < limboTarget) ? 'text-[#B23A48]' : 'text-slate-200'}`}>
                              {limboResult ? limboResult.toFixed(2) : '0.00'}x
                          </div>
                          <div className="text-slate-500 font-mono tracking-widest uppercase bg-black/30 inline-block px-4 py-1 rounded">Target: {limboTarget.toFixed(2)}x</div>
                      </div>
                  )}

                  {/* --- BLACKJACK RENDER --- */}
                  {activeGame === 'BLACKJACK' && (
                      <div className="w-full h-full flex flex-col justify-between p-8 bg-[#154025] relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] opacity-50 pointer-events-none"></div>
                          
                          {/* Dealer */}
                          <div className="flex flex-col items-center z-10">
                               <div className="flex gap-[-2rem]">
                                  {dealerHand.map((c, i) => (
                                      <div key={i} className="transform transition-transform hover:-translate-y-4" style={{ marginLeft: i > 0 ? '-2rem' : 0 }}>
                                         <Card suit={c.suit} value={c.value} color={c.color} hidden={bjState === 'PLAYING' && i === 1} />
                                      </div>
                                  ))}
                               </div>
                               <div className="mt-4 bg-black/40 px-4 py-1 rounded-full text-white font-mono text-sm border border-white/10">
                                   DEALER {bjState === 'PLAYING' ? '?' : getBjValue(dealerHand)}
                               </div>
                          </div>

                          {/* Center Info */}
                          <div className="text-center z-10 h-12">
                              {bjState === 'ENDED' && (
                                  <div className="text-4xl font-bold text-white drop-shadow-lg animate-bounce">
                                      {getBjValue(playerHand) > 21 ? 'BUST' : 
                                       getBjValue(dealerHand) > 21 ? 'DEALER BUST' :
                                       getBjValue(playerHand) > getBjValue(dealerHand) ? 'YOU WIN' : 'LOSE'}
                                  </div>
                              )}
                          </div>

                          {/* Player */}
                          <div className="flex flex-col items-center z-10">
                               <div className="mb-4 bg-black/40 px-4 py-1 rounded-full text-white font-mono text-sm border border-white/10">
                                   YOU {getBjValue(playerHand)}
                               </div>
                               <div className="flex">
                                  {playerHand.map((c, i) => (
                                      <div key={i} className="transform transition-transform hover:-translate-y-4" style={{ marginLeft: i > 0 ? '-2rem' : 0 }}>
                                         <Card suit={c.suit} value={c.value} color={c.color} />
                                      </div>
                                  ))}
                               </div>
                          </div>
                      </div>
                  )}

                  {/* --- CRASH RENDER --- */}
                  {activeGame === 'CRASH' && (
                      <div className="w-full h-full relative flex items-end justify-center overflow-hidden bg-[#0f1114]">
                          {/* Grid Background Effect */}
                          <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] ${isPlaying ? 'animate-[pulse_1s_infinite]' : ''}`}></div>
                          
                          <div className={`absolute top-1/3 text-8xl font-mono font-bold z-20 ${crashed ? 'text-[#B23A48]' : 'text-white'}`}>
                              {crashMultiplier.toFixed(2)}x
                          </div>
                          
                          {crashed && (
                             <div className="absolute top-[45%] text-xl text-[#B23A48] font-bold tracking-widest uppercase">
                                 CRASHED
                             </div>
                          )}

                          {/* Graph & Rocket */}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="crashGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#D4C28A" stopOpacity="0.2"/>
                                  <stop offset="100%" stopColor="#D4C28A" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <path 
                                d={`M-50,600 Q ${isPlaying ? '400,550' : '400,600'} 800,${isPlaying ? '100' : '600'} L 800,600 L -50,600 Z`}
                                fill="url(#crashGradient)"
                              />
                              <path 
                                d={`M-50,600 Q ${isPlaying ? '400,550' : '400,600'} 800,${isPlaying ? '100' : '600'}`} 
                                stroke={crashed ? '#B23A48' : '#D4C28A'} 
                                strokeWidth="4" 
                                fill="none" 
                                className="transition-all duration-1000 ease-linear"
                              />
                          </svg>
                          
                          {/* Rocket Icon */}
                          <div className={`absolute z-30 transition-all duration-1000 ease-linear ${isPlaying ? 'bottom-[70%] left-[65%]' : 'bottom-0 left-0'} ${crashed ? 'hidden' : 'block'}`}>
                               <Rocket size={48} className="text-[#D4C28A] fill-[#D4C28A] rotate-45 drop-shadow-[0_0_15px_#D4C28A]" />
                               <div className="absolute top-10 -left-4 w-4 h-12 bg-orange-500 blur-md rounded-full animate-pulse"></div>
                          </div>
                      </div>
                  )}

                  {/* --- MINES RENDER --- */}
                  {activeGame === 'MINES' && (
                      <div className="grid grid-cols-5 gap-3 p-4 bg-[#15171a] rounded-xl border border-white/5">
                          {minesGrid.map((val, idx) => (
                              <button
                                key={idx}
                                disabled={!isPlaying || minesRevealed[idx]}
                                onClick={() => clickMine(idx)}
                                className={`w-16 h-16 rounded-lg transition-all shadow-lg flex items-center justify-center text-3xl relative overflow-hidden
                                    ${minesRevealed[idx]
                                        ? (val === 'bomb' 
                                            ? 'bg-[#B23A48] scale-95 shadow-none border border-red-400' 
                                            : 'bg-[#1C8C6E] scale-95 shadow-none border border-emerald-400')
                                        : 'bg-[#24282e] hover:bg-[#2f3543] border-b-4 border-black/30 active:border-b-0 active:translate-y-1'}
                                `}
                              >
                                  {minesRevealed[idx] ? (
                                      val === 'bomb' ? <Bomb size={32} className="text-white animate-pulse" /> : <Diamond size={32} className="text-white animate-[bounce_0.5s]" />
                                  ) : (
                                      <div className="w-2 h-2 rounded-full bg-white/10"></div>
                                  )}
                              </button>
                          ))}
                      </div>
                  )}

                  {/* --- DICE RENDER --- */}
                  {activeGame === 'DICE' && (
                       <div className="w-full max-w-2xl px-12 text-center">
                           <div className="flex justify-between text-2xl font-bold mb-8 font-mono">
                                <span className="text-slate-500">0</span>
                                <span className="text-white">50</span>
                                <span className="text-slate-500">100</span>
                           </div>
                           <div className="h-6 bg-[#1a1d21] rounded-full relative overflow-visible border border-white/10">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/10 to-white/50 rounded-l-full transition-all duration-300" style={{ width: `${diceValue}%` }}></div>
                                <div className="absolute -top-1 w-4 h-8 bg-white rounded shadow cursor-pointer hover:scale-110 transition-transform" style={{ left: `${diceValue}%` }}></div>
                                
                                {diceResult !== null && (
                                     <div className="absolute -top-2 w-1 h-10 bg-[#D4C28A] z-10 shadow-[0_0_15px_#D4C28A] transition-all duration-500 ease-out" style={{ left: `${diceResult}%` }}></div>
                                )}
                           </div>
                           {diceResult !== null && (
                               <div className={`mt-12 text-6xl font-bold animate-deal ${diceResult <= diceValue ? 'text-[#1C8C6E]' : 'text-[#B23A48]'}`}>
                                   {diceResult.toFixed(2)}
                               </div>
                           )}
                       </div>
                  )}

              </div>
          </div>
      </div>
  );
};