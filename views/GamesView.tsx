import React, { useState, useEffect, useRef } from 'react';
import { 
  Dices, ArrowLeft, Spade, Heart, Club, Diamond, Zap, 
  Crown, TrendingUp, Skull, Bomb, 
  StopCircle, Coins, Target, Grid3X3, ArrowDown,
  Brain, CheckCircle, XCircle, Rocket, Info, Spline,
  Globe, Landmark, Palette, FlaskConical, Clapperboard, Trophy,
  User, Users
} from 'lucide-react';
import { useMultiplayer } from '../services/multiplayerService';

interface GamesViewProps {
  balance: number;
  updateBalance: (amount: number) => void;
  onGameLog: (game: string, result: string, bet: number, payout: number, multiplier: number) => void;
}

type GameType = 'LOBBY' | 'SLOTS' | 'DICE' | 'BLACKJACK' | 'ROULETTE' | 'CRASH' | 'ROAD' | 'MINES' | 'PLINKO' | 'KENO' | 'LIMBO' | 'TRIVIA';

// --- UTILS ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatCurrency = (val: number) => val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- TRIVIA DATA ---
const TRIVIA_CATEGORIES = [
  { id: 'GEO', name: 'Geografía', icon: Globe, color: 'bg-blue-500', text: 'text-blue-500' },
  { id: 'HIST', name: 'Historia', icon: Landmark, color: 'bg-yellow-600', text: 'text-yellow-600' },
  { id: 'ART', name: 'Arte', icon: Palette, color: 'bg-pink-500', text: 'text-pink-500' },
  { id: 'SCI', name: 'Ciencia', icon: FlaskConical, color: 'bg-green-500', text: 'text-green-500' },
  { id: 'ENT', name: 'Entretenimiento', icon: Clapperboard, color: 'bg-purple-500', text: 'text-purple-500' },
  { id: 'SPORT', name: 'Deportes', icon: Trophy, color: 'bg-orange-500', text: 'text-orange-500' },
];

const TRIVIA_DB: Record<string, { q: string, options: string[], ans: number }[]> = {
    'GEO': [
        { q: "¿Cuál es la capital de Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], ans: 2 },
        { q: "¿En qué continente está Egipto?", options: ["Asia", "África", "Europa", "Oceanía"], ans: 1 },
        { q: "¿Cuál es el río más largo del mundo?", options: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], ans: 1 },
    ],
    'HIST': [
        { q: "¿En qué año llegó Colón a América?", options: ["1492", "1500", "1485", "1510"], ans: 0 },
        { q: "¿Quién fue el primer presidente de EE.UU.?", options: ["Lincoln", "Washington", "Jefferson", "Adams"], ans: 1 },
        { q: "¿Qué imperio construyó el Coliseo?", options: ["Griego", "Romano", "Egipcio", "Otomano"], ans: 1 },
    ],
    'ART': [
        { q: "¿Quién pintó 'La Noche Estrellada'?", options: ["Picasso", "Monet", "Van Gogh", "Dalí"], ans: 2 },
        { q: "¿Qué estilo es la obra de Frida Kahlo?", options: ["Cubismo", "Surrealismo", "Impresionismo", "Barroco"], ans: 1 },
        { q: "¿Dónde está el Museo del Prado?", options: ["París", "Londres", "Madrid", "Roma"], ans: 2 },
    ],
    'SCI': [
        { q: "¿Cuál es el símbolo químico del Hierro?", options: ["Fe", "Hi", "Ir", "In"], ans: 0 },
        { q: "¿Qué planeta es conocido como el Planeta Rojo?", options: ["Venus", "Marte", "Júpiter", "Saturno"], ans: 1 },
        { q: "¿Cuál es la velocidad de la luz (aprox)?", options: ["300.000 km/s", "150.000 km/s", "1.000 km/s", "Sonido"], ans: 0 },
    ],
    'ENT': [
        { q: "¿Quién interpretó a Jack en Titanic?", options: ["Brad Pitt", "Tom Cruise", "Leonardo DiCaprio", "Johnny Depp"], ans: 2 },
        { q: "¿Qué serie tiene dragones y tronos?", options: ["Vikings", "Game of Thrones", "The Witcher", "Merlin"], ans: 1 },
        { q: "¿Quién es el rey del pop?", options: ["Elvis", "Michael Jackson", "Prince", "Madonna"], ans: 1 },
    ],
    'SPORT': [
        { q: "¿Cuántos jugadores tiene un equipo de fútbol?", options: ["9", "10", "11", "12"], ans: 2 },
        { q: "¿En qué deporte se usa una raqueta?", options: ["Fútbol", "Tenis", "Baloncesto", "Natación"], ans: 1 },
        { q: "¿Dónde fueron los Juegos Olímpicos 2016?", options: ["Londres", "Río", "Tokio", "Pekín"], ans: 1 },
    ]
};

// --- SHARED COMPONENTS ---

interface CardProps {
  suit?: string;
  value?: string;
  color?: string;
  hidden?: boolean;
  small?: boolean;
}

const Card: React.FC<CardProps> = ({ suit, value, color, hidden, small }) => (
    <div className={`${small ? 'w-8 h-12 text-xs' : 'w-16 h-24 md:w-20 md:h-28 text-xl'} rounded-lg border shadow-xl flex items-center justify-center font-bold relative transition-all duration-300 select-none
      ${hidden 
          ? 'bg-[#1a1d21] border-[#2f3543] bg-[url("https://www.transparenttextures.com/patterns/diagmonds-light.png")]' 
          : 'bg-white border-slate-300 shadow-black/20'}`
    }>
        {!hidden && (
            <>
              <div className={`absolute top-0.5 left-1 md:top-1 md:left-1 text-[10px] md:text-xs ${color}`}>{value}<span className="text-[0.8em]">{suit}</span></div>
              <div className={`${small ? 'text-base' : 'text-3xl'} ${color}`}>{suit}</div>
              <div className={`absolute bottom-0.5 right-1 md:bottom-1 md:right-1 text-[10px] md:text-xs ${color} rotate-180`}>{value}<span className="text-[0.8em]">{suit}</span></div>
            </>
        )}
        {hidden && <div className="text-[#D4C28A] text-xl opacity-50">♠</div>}
    </div>
);

// --- PLINKO ENGINE ---
const PlinkoGame = ({ active, onFinish, rows = 16 }: { active: boolean, onFinish: (mult: number) => void, rows?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<any[]>([]);
    
    // Multipliers for 16 rows (Stake style high risk)
    const multipliers = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
    
    const gravity = 0.25;
    const friction = 0.99;
    const bounce = 0.6;
    const spacing = 35; 
    
    const dropBall = () => {
        const startX = canvasRef.current!.width / 2;
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

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= row; col++) {
                const x = canvas.width / 2 - (row * spacing / 2) + (col * spacing);
                const y = startY + row * spacing;
                pegs.push({x, y});
            }
        }

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            pegs.forEach(peg => {
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            const bottomY = startY + rows * spacing;
            multipliers.forEach((m, i) => {
                const x = canvas.width / 2 - (rows * spacing / 2) + (i * spacing);
                let color = '#f59e0b';
                if (i < 2 || i > multipliers.length - 3) color = '#ef4444';
                else if (i > 5 && i < multipliers.length - 6) color = '#10b981';
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x - 14, bottomY + 15, 28, 25, 4);
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.font = 'bold 9px Montserrat';
                ctx.textAlign = 'center';
                ctx.fillText(m + 'x', x, bottomY + 31);
            });

            setBalls(currentBalls => {
                const nextBalls = currentBalls.map(ball => {
                    if (!ball.active) return ball;

                    ball.vy += gravity; 
                    ball.vx *= friction;
                    ball.y += ball.vy;
                    ball.x += ball.vx;

                    pegs.forEach(peg => {
                        const dx = ball.x - peg.x;
                        const dy = ball.y - peg.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (dist < 9) {
                            const angle = Math.atan2(dy, dx);
                            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                            const randomDeflection = (Math.random() - 0.5) * 0.5;
                            ball.vx = Math.cos(angle + randomDeflection) * speed * bounce;
                            ball.vy = Math.sin(angle + randomDeflection) * speed * bounce;
                            const overlap = 9 - dist;
                            ball.x += Math.cos(angle) * overlap;
                            ball.y += Math.sin(angle) * overlap;
                        }
                    });

                    if (ball.y > bottomY + 10) {
                        ball.active = false;
                        const bucketIndex = Math.floor((ball.x - (canvas.width / 2 - rows * spacing / 2) + spacing/2) / spacing);
                        const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, bucketIndex));
                        onFinish(multipliers[clampedIndex]);
                    }

                    return ball;
                });

                nextBalls.forEach(ball => {
                    if (ball.active) {
                        ctx.beginPath();
                        ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
                        ctx.fillStyle = ball.color;
                        ctx.fill();
                    }
                });

                return nextBalls.filter(b => b.y < canvas.height);
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

  // --- MULTIPLAYER SERVICE ---
  const { messages: mpMessages, players, sendEvent } = useMultiplayer();
  const [chatInput, setChatInput] = useState("");

  // --- UNIVERSAL STATES ---
  const [isPlaying, setIsPlaying] = useState(false);

  // --- TRIVIA STATE ---
  const [triviaRotation, setTriviaRotation] = useState(0);
  const [triviaCategory, setTriviaCategory] = useState<typeof TRIVIA_CATEGORIES[0] | null>(null);
  const [collectedBadges, setCollectedBadges] = useState<string[]>([]);
  const [triviaQ, setTriviaQ] = useState<any>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'wrong' | null>(null);
  const [showTriviaModal, setShowTriviaModal] = useState(false);

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

  // --- BLACKJACK STATE (MULTIPLAYER) ---
  interface BjSeat {
      id: number;
      name: string;
      hand: any[];
      isUser: boolean;
      status: 'WAITING' | 'PLAYING' | 'STOOD' | 'BUST' | 'BLACKJACK' | 'WIN' | 'LOSE' | 'PUSH';
      bet: number;
  }
  
  const [bjDeck, setBjDeck] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);
  const [bjState, setBjState] = useState<'IDLE' | 'DEALING' | 'PLAYING' | 'DEALER_TURN' | 'ENDED'>('IDLE');
  const [bjSeats, setBjSeats] = useState<BjSeat[]>([
      { id: 0, name: 'Sarah99', hand: [], isUser: false, status: 'WAITING', bet: 0 },
      { id: 1, name: 'TÚ', hand: [], isUser: true, status: 'WAITING', bet: 0 },
      { id: 2, name: 'CryptoKing', hand: [], isUser: false, status: 'WAITING', bet: 0 }
  ]);
  const [activeSeatIndex, setActiveSeatIndex] = useState(0);

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
          sendEvent({ type: 'WIN', user: 'YOU', amount: amount, game: activeGame });
      } else {
          setNotification({ msg: msg, type: 'lose' });
          onGameLog(gameOverride || activeGame, 'LOSS', currentBet, 0, 0);
      }
  };

  const handleChatSend = () => {
    if(!chatInput.trim()) return;
    sendEvent({ type: 'CHAT', user: 'YOU', message: chatInput });
    setChatInput("");
  };

  // --- BLACKJACK ENGINE (MULTI-SEAT) ---
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
      
      // Init Seats
      const newSeats = bjSeats.map(s => ({ 
          ...s, 
          hand: [deck.pop(), deck.pop()], 
          status: 'PLAYING' as const, 
          bet: s.isUser ? currentBet : Math.floor(Math.random() * 500) + 100 
      }));
      
      const dHand = [deck.pop(), deck.pop()];
      
      setBjDeck(deck);
      setBjSeats(newSeats);
      setDealerHand(dHand);
      setBjState('PLAYING');
      setActiveSeatIndex(0); // Start with Player 1 (Bot)
  };

  // Blackjack Bot Logic Effect
  useEffect(() => {
      if (activeGame !== 'BLACKJACK' || bjState !== 'PLAYING') return;

      const currentSeat = bjSeats[activeSeatIndex];

      if (!currentSeat.isUser) {
          // Bot Turn
          const timer = setTimeout(() => {
              const val = getBjValue(currentSeat.hand);
              if (val < 17) {
                  // Hit
                  const card = bjDeck.pop();
                  const newHand = [...currentSeat.hand, card];
                  const newVal = getBjValue(newHand);
                  const status = newVal > 21 ? 'BUST' : 'PLAYING';
                  
                  updateSeat(activeSeatIndex, { hand: newHand, status });
                  if (status === 'BUST') nextTurn();
                  // If playing, effect will trigger again for next card
              } else {
                  // Stand
                  updateSeat(activeSeatIndex, { status: 'STOOD' });
                  nextTurn();
              }
          }, 1000); // 1s think time
          return () => clearTimeout(timer);
      } else {
          // User Turn - Check blackjack immediately
          const val = getBjValue(currentSeat.hand);
          if (val === 21 && currentSeat.hand.length === 2) {
              updateSeat(activeSeatIndex, { status: 'BLACKJACK' });
              nextTurn();
          }
          if (val > 21) {
              updateSeat(activeSeatIndex, { status: 'BUST' });
              nextTurn();
          }
      }
  }, [activeGame, bjState, activeSeatIndex, bjSeats]); // Re-run when seat or hand updates

  const updateSeat = (idx: number, updates: Partial<BjSeat>) => {
      setBjSeats(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const nextTurn = () => {
      if (activeSeatIndex < 2) {
          setActiveSeatIndex(prev => prev + 1);
      } else {
          // All players done, Dealer Turn
          setBjState('DEALER_TURN');
          playDealerTurn();
      }
  };

  const playDealerTurn = async () => {
      let dHand = [...dealerHand];
      let deck = [...bjDeck]; // copy deck logic? assume state update is sync enough for demo
      
      // Simple dealer loop animation
      const drawLoop = setInterval(() => {
           if (getBjValue(dHand) < 17) {
               dHand.push(deck.pop());
               setDealerHand([...dHand]);
           } else {
               clearInterval(drawLoop);
               setBjState('ENDED');
               finalizeRound(dHand);
           }
      }, 800);
  };

  const finalizeRound = (finalDealerHand: any[]) => {
      const dVal = getBjValue(finalDealerHand);
      
      setBjSeats(prev => prev.map(s => {
          if (s.status === 'BUST') return { ...s, status: 'LOSE' };
          
          const pVal = getBjValue(s.hand);
          let result: any = 'LOSE';
          let payout = 0;

          if (dVal > 21 || pVal > dVal) {
              result = 'WIN';
              payout = s.status === 'BLACKJACK' ? s.bet * 2.5 : s.bet * 2;
          } else if (pVal === dVal) {
              result = 'PUSH';
              payout = s.bet;
          }

          if (s.isUser) {
              if (payout > 0) notify(payout, result === 'PUSH' ? 'Empate' : 'Ganaste', 'BLACKJACK', payout/s.bet);
              else notify(0, 'La casa gana', 'BLACKJACK', 0);
          }
          
          return { ...s, status: result };
      }));
  };

  // User Actions
  const hitBj = () => {
      const seat = bjSeats[activeSeatIndex];
      const newHand = [...seat.hand, bjDeck.pop()];
      const val = getBjValue(newHand);
      updateSeat(activeSeatIndex, { hand: newHand });
      
      if (val > 21) {
          updateSeat(activeSeatIndex, { status: 'BUST' });
          setTimeout(nextTurn, 500);
      }
  };

  const standBj = () => {
      updateSeat(activeSeatIndex, { status: 'STOOD' });
      nextTurn();
  };

  // --- OTHER GAME ENGINES (Crash, Mines, etc remain same, omitted for brevity but included in output) ---
  
  // (Rest of logic for other games preserved...)
  // 1. TRIVIA ROYALE
  const spinTriviaWheel = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setIsPlaying(true);
      setTriviaResult(null);
      setTriviaQ(null);
      setShowTriviaModal(false);

      const extraDegrees = Math.floor(Math.random() * 360);
      const totalRotation = triviaRotation + 1440 + extraDegrees;
      setTriviaRotation(totalRotation);

      setTimeout(() => {
          const normalized = totalRotation % 360;
          const segmentIndex = Math.floor((360 - normalized) / 60) % 6;
          const category = TRIVIA_CATEGORIES[segmentIndex];
          setTriviaCategory(category);
          const qList = TRIVIA_DB[category.id];
          const q = qList[Math.floor(Math.random() * qList.length)];
          setTriviaQ(q);
          setShowTriviaModal(true);
          setIsPlaying(false);
      }, 3000);
  };

  const answerTrivia = (idx: number) => {
      if (!triviaCategory || !triviaQ || triviaResult) return;
      if (idx === triviaQ.ans) {
          setTriviaResult('correct');
          let win = currentBet * 2;
          let newBadges = [...collectedBadges];
          if (!newBadges.includes(triviaCategory.id)) {
              newBadges.push(triviaCategory.id);
              setCollectedBadges(newBadges);
          }
          if (newBadges.length === 6) {
              win += currentBet * 50; 
              notify(win, "¡JACKPOT! 6 PERSONAJES", 'TRIVIA', 52);
              setCollectedBadges([]); 
          } else {
              notify(win, `Correcto! +${triviaCategory.name}`, 'TRIVIA', 2);
          }
      } else {
          setTriviaResult('wrong');
          notify(0, "Incorrecto", 'TRIVIA', 0);
      }
      setTimeout(() => setShowTriviaModal(false), 2000);
  };

  const playLimbo = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      let targetResult = 0.99 / (1 - Math.random());
      targetResult = Math.max(1, Math.floor(targetResult * 100) / 100);
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

  const dropPlinko = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setPlinkoTrigger(prev => !prev); 
  };
  
  const onPlinkoResult = (mult: number) => {
      const win = currentBet * mult;
      setPlinkoHistory(prev => [mult, ...prev].slice(0, 5));
      if (win > 0) notify(win, `Plinko x${mult}`, 'PLINKO', mult);
      else notify(0, "Plinko x0", 'PLINKO', 0);
  };

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

  const getGameDescription = () => {
      switch(activeGame) {
          case 'TRIVIA': return "Gira la rueda y responde preguntas. Colecciona los 6 personajes para ganar el Jackpot.";
          case 'PLINKO': return "Suelta la bola desde la cima. ¡Apunta a los bordes para premios grandes!";
          case 'CRASH': return "Retírate antes de que el cohete explote. ¿Hasta dónde te atreves a llegar?";
          case 'MINES': return "Encuentra diamantes, evita las bombas. Puedes cobrar en cualquier momento.";
          case 'BLACKJACK': return "Mesa multijugador. Vence al dealer con otros jugadores en vivo (IA). Blackjack paga 3:2.";
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
                    <button onClick={() => setActiveGame('TRIVIA')} className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-purple-900/40">
                        <Brain size={18} /> Trivia Royale
                    </button>
                    <div className="bg-[#1C1C1E] px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
                        <Zap className="text-[#D4C28A] fill-[#D4C28A]" size={20} />
                        <span className="text-white font-mono font-bold text-lg">{formatCurrency(balance)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                    { id: 'TRIVIA', name: 'Trivia Royale', icon: Brain, color: 'text-purple-400', img: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=2070' },
                    { id: 'BLACKJACK', name: 'Blackjack Live', icon: Spade, color: 'text-white', img: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2072' },
                    { id: 'PLINKO', name: 'Plinko', icon: ArrowDown, color: 'text-pink-500', img: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=2074' },
                    { id: 'MINES', name: 'Mines', icon: Bomb, color: 'text-yellow-500', img: 'https://images.unsplash.com/photo-1623949566952-0d5ee07cb2b6?q=80&w=2069' },
                    { id: 'CRASH', name: 'Crash', icon: TrendingUp, color: 'text-rose-500', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072' },
                    { id: 'LIMBO', name: 'Limbo', icon: Target, color: 'text-indigo-400', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070' },
                    { id: 'KENO', name: 'Keno', icon: Grid3X3, color: 'text-purple-500', img: 'https://images.unsplash.com/photo-1518688248740-7c31f1a945c4?q=80&w=2070' },
                    { id: 'DICE', name: 'Dice', icon: Dices, color: 'text-emerald-500', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070' },
                    { id: 'ROULETTE', name: 'Roulette', icon: StopCircle, color: 'text-red-500', img: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070' },
                    { id: 'SLOTS', name: 'Fintech Slots', icon: Spline, color: 'text-yellow-300', img: 'https://images.unsplash.com/photo-1605218427368-35b0f998cb4b?q=80&w=2080' },
                ].map((game) => (
                    <div key={game.id} onClick={() => setActiveGame(game.id as GameType)} className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D4C28A] transition-all shadow-2xl hover:translate-y-[-5px]">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" style={{ backgroundImage: `url(${game.img})` }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 p-6 w-full">
                            <div className={`flex items-center gap-3 font-bold text-white text-xl`}>
                                <div className={`p-2 rounded-lg bg-black/60 backdrop-blur-sm ${game.color} border border-white/10`}>
                                    <game.icon size={24} />
                                </div>
                                {game.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
      <div className="h-full flex flex-col p-2 md:p-6 max-w-[1600px] mx-auto overflow-hidden">
          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-4 bg-[#1a1d21] p-3 rounded-xl border border-white/5 shadow-lg flex-shrink-0">
              <button onClick={() => setActiveGame('LOBBY')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-wider">
                  <ArrowLeft size={16}/> Lobby
              </button>
              <div className="text-white font-bold tracking-widest text-sm md:text-base hidden md:block">{activeGame}</div>
              <div className="flex items-center gap-2 text-[#D4C28A] font-mono font-bold">
                  <div className="bg-[#0f1114] px-4 py-2 rounded-lg border border-[#D4C28A]/20 shadow-inner flex items-center gap-2 text-sm md:text-base">
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

          <div className="flex-1 flex flex-col-reverse md:flex-row gap-4 overflow-hidden h-full min-h-0">
              
              {/* SIDEBAR CONTROLS */}
              <div className="w-full md:w-80 flex-shrink-0 bg-[#1a1d21] rounded-xl p-4 md:p-6 border border-white/5 flex flex-col gap-4 shadow-xl overflow-y-auto h-auto md:h-full z-20">
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
                              disabled={isPlaying || (activeGame === 'BLACKJACK' && bjState === 'PLAYING')}
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
                          if (activeGame === 'TRIVIA') spinTriviaWheel();
                          if (activeGame === 'LIMBO') playLimbo();
                          if (activeGame === 'BLACKJACK') {
                              if (bjState === 'PLAYING' && bjSeats[activeSeatIndex].isUser) hitBj();
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
                          (activeGame === 'TRIVIA' && isPlaying) ||
                          (activeGame === 'BLACKJACK' && bjState === 'PLAYING' && !bjSeats[activeSeatIndex].isUser) ||
                          (activeGame === 'MINES' && false) || 
                          (activeGame === 'KENO' && isPlaying) ||
                          (activeGame === 'CRASH' && crashed)
                      }
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]
                      ${activeGame === 'BLACKJACK' && bjState === 'PLAYING'
                        ? (bjSeats[activeSeatIndex].isUser ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed')
                        : activeGame === 'TRIVIA' && isPlaying
                            ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-not-allowed opacity-50'
                            : activeGame === 'CRASH' && isPlaying
                                ? 'bg-[#D4C28A] hover:bg-[#bfa566] text-black shadow-[#D4C28A]/20'
                                : activeGame === 'MINES' && isPlaying
                                    ? 'bg-[#1C8C6E] text-white hover:brightness-110'
                                    : 'bg-[#1C8C6E] hover:bg-[#167058] text-white shadow-[#1C8C6E]/20'
                      }`}
                  >
                      {activeGame === 'TRIVIA' ? (isPlaying ? 'GIRANDO...' : 'GIRAR RUEDA') :
                       activeGame === 'BLACKJACK' && bjState === 'PLAYING' ? (bjSeats[activeSeatIndex].isUser ? 'PEDIR CARTA' : `TURNO: ${bjSeats[activeSeatIndex].name}`) : 
                       activeGame === 'CRASH' && isPlaying ? 'RETIRAR AHORA' :
                       activeGame === 'MINES' && isPlaying ? 'COBRAR' : 
                       'JUGAR'}
                  </button>

                  {/* Secondary Action for Blackjack */}
                  {activeGame === 'BLACKJACK' && bjState === 'PLAYING' && bjSeats[activeSeatIndex].isUser && (
                       <button onClick={standBj} className="w-full py-4 rounded-xl font-bold text-lg bg-[#2f3543] hover:bg-[#3a4150] text-white transition-all">
                           PLANTARSE
                       </button>
                  )}

                  <div className="mt-auto p-4 rounded-lg bg-[#0f1114] border border-white/5 text-xs text-slate-400 leading-relaxed hidden md:block">
                      <div className="flex items-center gap-2 mb-2 text-white font-bold">
                          <Info size={14} className="text-[#D4C28A]" /> Cómo jugar
                      </div>
                      {getGameDescription()}
                  </div>
              </div>

              {/* GAME DISPLAY AREA */}
              <div className="flex-1 bg-[#0f1114] rounded-xl border border-white/5 relative overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px]">
                  
                  {activeGame !== 'LOBBY' && (
                    <>
                        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm transition-all duration-1000 z-0"
                             style={{
                                 backgroundImage: 
                                    activeGame === 'TRIVIA' ? 'url("https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=2070")' :
                                    activeGame === 'DICE' ? 'url("https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070")' :
                                    activeGame === 'KENO' ? 'url("https://images.unsplash.com/photo-1518688248740-7c31f1a945c4?q=80&w=2070")' :
                                    activeGame === 'LIMBO' ? 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070")' :
                                    activeGame === 'MINES' ? 'url("https://images.unsplash.com/photo-1623949566952-0d5ee07cb2b6?q=80&w=2069")' :
                                    activeGame === 'PLINKO' ? 'url("https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=2074")' :
                                    activeGame === 'ROULETTE' ? 'url("https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070")' :
                                    activeGame === 'SLOTS' ? 'url("https://images.unsplash.com/photo-1605218427368-35b0f998cb4b?q=80&w=2080")' : 
                                    activeGame === 'CRASH' ? 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072")' : 
                                    activeGame === 'BLACKJACK' ? 'none' : 'none'
                             }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent z-0"></div>
                    </>
                  )}

                  {/* --- BLACKJACK RENDER (MULTI-SEAT) --- */}
                  {activeGame === 'BLACKJACK' && (
                      <div className="w-full h-full flex flex-col justify-between p-2 md:p-8 relative overflow-hidden">
                          {/* Felt Background */}
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] bg-[#0d2e1c] z-0 opacity-100"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_90%)] z-0 pointer-events-none"></div>
                          
                          {/* Dealer Area */}
                          <div className="flex flex-col items-center z-10 pt-4">
                               <div className="flex gap-[-2rem]">
                                  {dealerHand.map((c, i) => (
                                      <div key={i} className="transform transition-transform hover:-translate-y-4" style={{ marginLeft: i > 0 ? '-2rem' : 0 }}>
                                         <Card suit={c.suit} value={c.value} color={c.color} hidden={bjState === 'PLAYING' && i === 1} />
                                      </div>
                                  ))}
                               </div>
                               <div className="mt-4 bg-black/40 px-4 py-1 rounded-full text-white font-mono text-sm border border-white/10 backdrop-blur">
                                   DEALER {bjState === 'PLAYING' ? '?' : getBjValue(dealerHand)}
                               </div>
                          </div>

                          {/* Multiplayer Info & Chat */}
                          <div className="absolute top-4 left-4 z-20 hidden md:block">
                              <div className="bg-black/40 p-2 rounded-lg border border-white/10 backdrop-blur-md">
                                  <div className="flex items-center gap-2 text-[#1C8C6E] text-xs font-bold uppercase mb-2">
                                      <div className="w-2 h-2 rounded-full bg-[#1C8C6E] animate-pulse"></div>
                                      Live Table
                                  </div>
                                  {mpMessages.slice(-2).map((msg, i) => (
                                      <div key={i} className="text-[10px] text-white">
                                          <span className="text-[#D4C28A] font-bold">{msg.user}: </span>{msg.message}
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* 3 Seats Area */}
                          <div className="flex justify-center items-end gap-2 md:gap-8 z-10 pb-4 md:pb-0 w-full">
                              {bjSeats.map((seat, idx) => (
                                  <div key={seat.id} className={`flex flex-col items-center transition-all duration-300 ${activeSeatIndex === idx && bjState === 'PLAYING' ? 'scale-110 -translate-y-4' : 'scale-90 opacity-80'}`}>
                                      {/* Seat Info */}
                                      <div className={`mb-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur flex items-center gap-1
                                          ${seat.isUser ? 'bg-[#D4C28A] text-black border-[#D4C28A]' : 'bg-black/50 text-white border-white/10'}
                                          ${activeSeatIndex === idx && bjState === 'PLAYING' ? 'ring-2 ring-white shadow-lg' : ''}
                                      `}>
                                          {seat.isUser ? <User size={12}/> : <Users size={12}/>}
                                          {seat.name}
                                          <span className="font-mono ml-1 opacity-70">{getBjValue(seat.hand)}</span>
                                      </div>
                                      
                                      {/* Cards */}
                                      <div className="flex h-24 md:h-32">
                                          {seat.hand.map((c, i) => (
                                              <div key={i} className="transform origin-bottom hover:-translate-y-2 transition-transform" style={{ marginLeft: i > 0 ? '-1.5rem' : 0 }}>
                                                  <Card suit={c.suit} value={c.value} color={c.color} small={window.innerWidth < 768} />
                                              </div>
                                          ))}
                                      </div>

                                      {/* Status Chips */}
                                      <div className="mt-2 h-6">
                                          {seat.status === 'BLACKJACK' && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-bold animate-pulse">BLACKJACK</span>}
                                          {seat.status === 'BUST' && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold">BUST</span>}
                                          {seat.status === 'STOOD' && <span className="text-[10px] bg-slate-500 text-white px-2 py-0.5 rounded font-bold">STAND</span>}
                                          {seat.status === 'WIN' && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-bold">WIN</span>}
                                          {seat.status === 'LOSE' && <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">LOSE</span>}
                                          {seat.status === 'PUSH' && <span className="text-[10px] bg-yellow-600 text-white px-2 py-0.5 rounded font-bold">PUSH</span>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* ... (Render other games: TRIVIA, PLINKO, KENO, LIMBO, CRASH, MINES, DICE - Preserved) */}
                  {/* --- TRIVIA ROYALE RENDER --- */}
                  {activeGame === 'TRIVIA' && (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-10">
                          <div className="absolute top-4 left-0 right-0 px-8 flex justify-center gap-4">
                               {TRIVIA_CATEGORIES.map(cat => (
                                   <div key={cat.id} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${collectedBadges.includes(cat.id) ? `${cat.color} text-white border-white scale-110` : 'bg-black/40 border-white/10 text-slate-600 grayscale'}`}>
                                       <cat.icon size={20} />
                                   </div>
                               ))}
                          </div>
                          <div className="relative mt-12 mb-8">
                               <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rotate-180">
                                   <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-white drop-shadow-md"></div>
                               </div>
                               <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.2)] relative overflow-hidden transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]" style={{ transform: `rotate(${triviaRotation}deg)`, background: `conic-gradient(#3b82f6 0% 16.66%, #ca8a04 16.66% 33.33%, #ec4899 33.33% 50%, #22c55e 50% 66.66%, #a855f7 66.66% 83.33%, #f97316 83.33% 100%)` }}>
                                    {TRIVIA_CATEGORIES.map((cat, i) => {
                                        const angle = (i * 60) + 30;
                                        return (
                                            <div key={cat.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white drop-shadow-md">
                                                    <cat.icon size={24} style={{ transform: `rotate(${-angle}deg)` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                               </div>
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center border-4 border-slate-200">
                                   <div className="font-bold text-black text-xs text-center leading-none">TRIVIA<br/>ROYALE</div>
                               </div>
                          </div>
                      </div>
                  )}

                  {/* --- PLINKO RENDER --- */}
                  {activeGame === 'PLINKO' && (
                      <div className="absolute inset-0 z-10 w-full h-full aspect-square md:aspect-auto">
                          <PlinkoGame active={plinkoTrigger} onFinish={onPlinkoResult} />
                          <div className="absolute top-4 right-4 w-40 space-y-2 hidden md:block">
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
                      <div className="grid grid-cols-8 gap-1 md:gap-2 p-4 max-w-2xl relative z-10">
                          {Array.from({length: 40}, (_, i) => i + 1).map(n => {
                              const isSelected = kenoSelections.includes(n);
                              const isHit = kenoDraw.includes(n);
                              return (
                                  <button key={n} onClick={() => toggleKenoNum(n)} className={`w-8 h-8 md:w-12 md:h-12 rounded-lg font-bold text-xs md:text-sm transition-all relative border shadow-lg flex items-center justify-center ${isHit && isSelected ? 'bg-[#D4C28A] text-black scale-110 shadow-[0_0_15px_#D4C28A] z-10 border-[#D4C28A]' : isHit ? 'bg-[#B23A48] text-white border-[#B23A48]' : isSelected ? 'bg-white text-black border-white' : 'bg-[#24282e]/80 text-slate-300 hover:bg-[#2f3543] border-white/10 backdrop-blur-sm'}`}>
                                      {n}
                                      {isSelected && <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#1C8C6E] rounded-full"></div>}
                                  </button>
                              )
                          })}
                      </div>
                  )}

                  {/* --- LIMBO RENDER --- */}
                  {activeGame === 'LIMBO' && (
                      <div className="text-center relative z-10">
                          <div className={`text-6xl md:text-9xl font-mono font-bold mb-4 transition-colors duration-100 drop-shadow-2xl ${limboResult && limboResult >= limboTarget ? 'text-[#1C8C6E] drop-shadow-[0_0_35px_rgba(28,140,110,0.8)]' : crashed || (limboResult && limboResult < limboTarget) ? 'text-[#B23A48]' : 'text-white'}`}>
                              {limboResult ? limboResult.toFixed(2) : '0.00'}x
                          </div>
                          <div className="text-slate-200 font-mono tracking-widest uppercase bg-black/60 inline-block px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md shadow-lg">Target: {limboTarget.toFixed(2)}x</div>
                      </div>
                  )}

                  {/* --- CRASH RENDER --- */}
                  {activeGame === 'CRASH' && (
                      <div className="w-full h-full relative flex items-end justify-center overflow-hidden bg-transparent">
                          <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] ${isPlaying ? 'animate-[pulse_1s_infinite]' : ''}`}></div>
                          <div className={`absolute top-1/3 text-6xl md:text-8xl font-mono font-bold z-20 ${crashed ? 'text-[#B23A48]' : 'text-white'}`}>
                              {crashMultiplier.toFixed(2)}x
                          </div>
                          {crashed && <div className="absolute top-[45%] text-xl text-[#B23A48] font-bold tracking-widest uppercase">CRASHED</div>}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="crashGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#D4C28A" stopOpacity="0.2"/>
                                  <stop offset="100%" stopColor="#D4C28A" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <path d={`M-50,600 Q ${isPlaying ? '400,550' : '400,600'} 800,${isPlaying ? '100' : '600'} L 800,600 L -50,600 Z`} fill="url(#crashGradient)" />
                              <path d={`M-50,600 Q ${isPlaying ? '400,550' : '400,600'} 800,${isPlaying ? '100' : '600'}`} stroke={crashed ? '#B23A48' : '#D4C28A'} strokeWidth="4" fill="none" className="transition-all duration-1000 ease-linear" />
                          </svg>
                          <div className={`absolute z-30 transition-all duration-1000 ease-linear ${isPlaying ? 'bottom-[70%] left-[65%]' : 'bottom-0 left-0'} ${crashed ? 'hidden' : 'block'}`}>
                               <Rocket size={48} className="text-[#D4C28A] fill-[#D4C28A] rotate-45 drop-shadow-[0_0_15px_#D4C28A]" />
                               <div className="absolute top-10 -left-4 w-4 h-12 bg-orange-500 blur-md rounded-full animate-pulse"></div>
                          </div>
                      </div>
                  )}

                  {/* --- MINES RENDER --- */}
                  {activeGame === 'MINES' && (
                      <div className="grid grid-cols-5 gap-2 md:gap-3 p-4 bg-[#15171a]/40 backdrop-blur-md rounded-xl border border-white/5 relative z-10">
                          {minesGrid.map((val, idx) => (
                              <button key={idx} disabled={!isPlaying || minesRevealed[idx]} onClick={() => clickMine(idx)} className={`w-12 h-12 md:w-16 md:h-16 rounded-lg transition-all shadow-lg flex items-center justify-center text-3xl relative overflow-hidden ${minesRevealed[idx] ? (val === 'bomb' ? 'bg-[#B23A48] scale-95 shadow-none border border-red-400' : 'bg-[#1C8C6E] scale-95 shadow-none border border-emerald-400') : 'bg-[#24282e]/80 hover:bg-[#2f3543] border-b-4 border-black/30 active:border-b-0 active:translate-y-1'}`}>
                                  {minesRevealed[idx] ? (val === 'bomb' ? <Bomb size={24} className="text-white animate-pulse md:w-8 md:h-8" /> : <Diamond size={24} className="text-white animate-[bounce_0.5s] md:w-8 md:h-8" />) : <div className="w-2 h-2 rounded-full bg-white/10"></div>}
                              </button>
                          ))}
                      </div>
                  )}

                  {/* --- DICE RENDER --- */}
                  {activeGame === 'DICE' && (
                       <div className="w-full max-w-2xl px-6 md:px-12 text-center relative z-10">
                           <div className="flex justify-between text-xl md:text-2xl font-bold mb-8 font-mono">
                                <span className="text-slate-500">0</span>
                                <span className="text-white drop-shadow-md">50</span>
                                <span className="text-slate-500">100</span>
                           </div>
                           <div className="h-6 bg-[#1a1d21]/80 backdrop-blur rounded-full relative overflow-visible border border-white/10 shadow-xl">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/10 to-white/50 rounded-l-full transition-all duration-300" style={{ width: `${diceValue}%` }}></div>
                                <div className="absolute -top-1 w-4 h-8 bg-white rounded shadow cursor-pointer hover:scale-110 transition-transform" style={{ left: `${diceValue}%` }}></div>
                                {diceResult !== null && <div className="absolute -top-2 w-1 h-10 bg-[#D4C28A] z-10 shadow-[0_0_15px_#D4C28A] transition-all duration-500 ease-out" style={{ left: `${diceResult}%` }}></div>}
                           </div>
                           {diceResult !== null && <div className={`mt-12 text-5xl md:text-6xl font-bold animate-deal drop-shadow-2xl ${diceResult <= diceValue ? 'text-[#1C8C6E]' : 'text-[#B23A48]'}`}>{diceResult.toFixed(2)}</div>}
                       </div>
                  )}

              </div>
          </div>
          
            {/* TRIVIA MODAL */}
            {showTriviaModal && triviaQ && triviaCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl max-w-md w-full relative shadow-2xl animate-fade-in-up">
                         <div className={`absolute top-0 left-0 w-full h-3 rounded-t-2xl ${triviaCategory.color}`}></div>
                         <div className="flex justify-center -mt-12 mb-4">
                             <div className={`w-20 h-20 rounded-full border-4 border-[#1C1C1E] flex items-center justify-center shadow-lg ${triviaCategory.color} text-white`}>
                                 <triviaCategory.icon size={36} />
                             </div>
                         </div>
                         <h3 className={`text-center text-xl font-bold mb-2 uppercase tracking-widest ${triviaCategory.text}`}>
                             {triviaCategory.name}
                         </h3>
                         <p className="text-lg text-slate-200 mb-8 font-medium text-center">{triviaQ.q}</p>
                         <div className="space-y-3">
                             {triviaQ.options.map((opt: string, idx: number) => (
                                 <button key={idx} onClick={() => answerTrivia(idx)} disabled={triviaResult !== null} className={`w-full p-4 rounded-xl text-left transition-all border ${triviaResult === null ? 'bg-white/5 border-white/10 hover:bg-white/10' : idx === triviaQ.ans ? 'bg-green-500/20 border-green-500 text-green-400' : triviaResult === 'wrong' && idx !== triviaQ.ans ? 'bg-red-500/20 border-red-500 text-red-400 opacity-50' : 'opacity-50'}`}>
                                     <div className="flex justify-between items-center">
                                        <span>{opt}</span>
                                        {triviaResult === 'correct' && idx === triviaQ.ans && <CheckCircle size={20}/>}
                                     </div>
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>
            )}
      </div>
  );
};