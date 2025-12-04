
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dices, ArrowLeft, Spade, Zap, 
  TrendingUp, Bomb, 
  Target, Grid3X3, ArrowDown,
  Brain, Rocket, Info,
  Globe, Landmark, Palette, FlaskConical, Clapperboard, Trophy,
  Diamond
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
// FORCE INTEGERS VISUALLY
const formatCurrency = (val: number) => Math.floor(val).toLocaleString('es-ES'); 

// --- LOBBY CONFIGURATION ---
const LOBBY_GAMES = [
  { id: 'TRIVIA', name: 'Trivia Royale', icon: Brain, gradient: 'bg-gradient-to-br from-indigo-600 to-purple-700' },
  { id: 'BLACKJACK', name: 'Blackjack Live', icon: Spade, gradient: 'bg-gradient-to-br from-slate-800 to-black' },
  { id: 'SLOTS', name: 'Fintech Slots', icon: Zap, gradient: 'bg-gradient-to-br from-fuchsia-600 to-pink-600' },
  { id: 'ROULETTE', name: 'Roulette', icon: Target, gradient: 'bg-gradient-to-br from-emerald-700 to-green-900' },
  { id: 'CRASH', name: 'Crash', icon: Rocket, gradient: 'bg-gradient-to-br from-red-600 to-orange-600' },
  { id: 'PLINKO', name: 'Plinko', icon: ArrowDown, gradient: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
  { id: 'MINES', name: 'Mines', icon: Bomb, gradient: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  { id: 'KENO', name: 'Keno', icon: Grid3X3, gradient: 'bg-gradient-to-br from-violet-600 to-indigo-900' },
  { id: 'LIMBO', name: 'Limbo', icon: TrendingUp, gradient: 'bg-gradient-to-br from-orange-500 to-yellow-600' },
  { id: 'DICE', name: 'Neon Dice', icon: Dices, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
];

// --- TRIVIA DATA ---
const TRIVIA_CATEGORIES = [
  { id: 'GEO', name: 'Geografía', icon: Globe, color: 'bg-blue-600', text: 'text-blue-500', hex: '#2563eb' },
  { id: 'HIST', name: 'Historia', icon: Landmark, color: 'bg-yellow-600', text: 'text-yellow-600', hex: '#ca8a04' },
  { id: 'ART', name: 'Arte', icon: Palette, color: 'bg-pink-600', text: 'text-pink-500', hex: '#db2777' },
  { id: 'SCI', name: 'Ciencia', icon: FlaskConical, color: 'bg-green-600', text: 'text-green-500', hex: '#16a34a' },
  { id: 'ENT', name: 'Entretenimiento', icon: Clapperboard, color: 'bg-purple-600', text: 'text-purple-500', hex: '#9333ea' },
  { id: 'SPORT', name: 'Deportes', icon: Trophy, color: 'bg-orange-600', text: 'text-orange-500', hex: '#ea580c' },
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
    ],
    'ART': [
        { q: "¿Quién pintó 'La Noche Estrellada'?", options: ["Picasso", "Monet", "Van Gogh", "Dalí"], ans: 2 },
        { q: "¿Dónde está el Museo del Prado?", options: ["París", "Londres", "Madrid", "Roma"], ans: 2 },
    ],
    'SCI': [
        { q: "¿Cuál es el símbolo químico del Hierro?", options: ["Fe", "Hi", "Ir", "In"], ans: 0 },
        { q: "¿Qué planeta es conocido como el Planeta Rojo?", options: ["Venus", "Marte", "Júpiter", "Saturno"], ans: 1 },
    ],
    'ENT': [
        { q: "¿Quién interpretó a Jack en Titanic?", options: ["Brad Pitt", "Tom Cruise", "Leonardo DiCaprio", "Johnny Depp"], ans: 2 },
        { q: "¿Qué serie tiene dragones y tronos?", options: ["Vikings", "Game of Thrones", "The Witcher", "Merlin"], ans: 1 },
    ],
    'SPORT': [
        { q: "¿Cuántos jugadores tiene un equipo de fútbol?", options: ["9", "10", "11", "12"], ans: 2 },
        { q: "¿En qué deporte se usa una raqueta?", options: ["Fútbol", "Tenis", "Baloncesto", "Natación"], ans: 1 },
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
    <div className={`${small ? 'w-10 h-14 text-xs' : 'w-14 h-20 md:w-16 md:h-24 text-lg'} rounded-md md:rounded-lg border shadow-xl flex items-center justify-center font-bold relative transition-all duration-300 select-none bg-white
      ${hidden 
          ? 'bg-[#1a1d21] border-[#2f3543] bg-[repeating-linear-gradient(45deg,#2f3543_0,#2f3543_2px,#1a1d21_2px,#1a1d21_8px)]' 
          : 'bg-white border-slate-300 shadow-black/30'}`
    }>
        {!hidden && (
            <>
              <div className={`absolute top-0.5 left-1 md:top-1 md:left-1 text-[10px] md:text-sm ${color} font-mono leading-none`}>{value}</div>
              <div className={`${small ? 'text-lg' : 'text-2xl md:text-3xl'} ${color}`}>{suit}</div>
              <div className={`absolute bottom-0.5 right-1 md:bottom-1 md:right-1 text-[10px] md:text-sm ${color} rotate-180 font-mono leading-none`}>{value}</div>
            </>
        )}
        {hidden && (
            <div className="w-full h-full flex items-center justify-center border-2 border-[#D4C28A]/20 rounded m-1">
                 <div className="text-[#D4C28A]/40 text-xl font-casino">X</div>
            </div>
        )}
    </div>
);

// --- PLINKO ENGINE V2 ---
const PlinkoGame = ({ triggerDrop, onFinish }: { triggerDrop: number, onFinish: (mult: number) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ballsRef = useRef<any[]>([]);
    
    // Config
    const rows = 16;
    const spacing = 40;
    const startY = 50;
    const gravity = 0.25;
    const friction = 0.98;
    const bounce = 0.7;
    const multipliers = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const width = canvas.width;
        const height = canvas.height;

        const pegs: {x: number, y: number}[] = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= row; col++) {
                const x = width / 2 - (row * spacing / 2) + (col * spacing);
                const y = startY + row * spacing;
                pegs.push({x, y});
            }
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            pegs.forEach(peg => {
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            const bottomY = startY + rows * spacing;
            multipliers.forEach((m, i) => {
                const x = width / 2 - (rows * spacing / 2) + (i * spacing);
                let color = '#f59e0b';
                if (i < 2 || i > multipliers.length - 3) color = '#ef4444'; 
                else if (i > 5 && i < multipliers.length - 6) color = '#10b981'; 
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x - 18, bottomY + 20, 36, 30, 4);
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Montserrat';
                ctx.textAlign = 'center';
                ctx.fillText(m + 'x', x, bottomY + 40);
            });

            const activeBalls: any[] = [];
            
            ballsRef.current.forEach(ball => {
                ball.vy += gravity;
                ball.vx *= friction;
                ball.x += ball.vx;
                ball.y += ball.vy;

                pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 10) { 
                        const angle = Math.atan2(dy, dx);
                        const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
                        const jitter = (Math.random() - 0.5) * 0.5;
                        ball.vx = Math.cos(angle + jitter) * speed * bounce;
                        ball.vy = Math.sin(angle + jitter) * speed * bounce;
                        
                        const overlap = 10 - dist;
                        ball.x += Math.cos(angle) * overlap;
                        ball.y += Math.sin(angle) * overlap;
                    }
                });

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.shadowColor = ball.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;

                if (ball.y > bottomY + 20) {
                     const relativeX = ball.x - (width / 2 - rows * spacing / 2);
                     const bucketIndex = Math.floor((relativeX + spacing/2) / spacing);
                     const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, bucketIndex));
                     
                     if (!ball.finished) {
                         ball.finished = true;
                         onFinish(multipliers[clampedIndex]);
                     }
                } else {
                    activeBalls.push(ball);
                }
            });
            
            ballsRef.current = activeBalls;
            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, []);

    useEffect(() => {
        if (triggerDrop > 0 && canvasRef.current) {
             const startX = canvasRef.current.width / 2;
             ballsRef.current.push({
                 x: startX + (Math.random() - 0.5) * 10,
                 y: 10, 
                 vx: (Math.random() - 0.5) * 2,
                 vy: 0,
                 color: Math.random() > 0.5 ? '#ff00ff' : '#D4C28A',
                 finished: false
             });
        }
    }, [triggerDrop]);

    return (
        <canvas ref={canvasRef} width={800} height={800} className="w-full h-full object-contain bg-transparent" />
    );
};

export const GamesView: React.FC<GamesViewProps> = ({ balance, updateBalance, onGameLog }) => {
  const [activeGame, setActiveGame] = useState<GameType>('LOBBY');
  const [currentBet, setCurrentBet] = useState(10);
  const [notification, setNotification] = useState<{msg: string, type: 'win' | 'lose'} | null>(null);

  // --- MULTIPLAYER SERVICE ---
  const { messages: mpMessages, sendEvent } = useMultiplayer();

  // --- UNIVERSAL STATES ---
  const [isPlaying, setIsPlaying] = useState(false);

  // --- TRIVIA STATE ---
  const [triviaRotation, setTriviaRotation] = useState(0);
  const [triviaCategory, setTriviaCategory] = useState<(typeof TRIVIA_CATEGORIES)[number] | null>(null);
  const [collectedBadges, setCollectedBadges] = useState<string[]>([]);
  const [triviaQ, setTriviaQ] = useState<any>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'wrong' | null>(null);
  const [showTriviaModal, setShowTriviaModal] = useState(false);

  // --- ROULETTE STATE ---
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteAngle, setRouletteAngle] = useState(0);
  const [rouletteBetType, setRouletteBetType] = useState<'RED' | 'BLACK' | 'GREEN' | null>(null);
  const [rouletteResultNumber, setRouletteResultNumber] = useState<number | null>(null);

  // --- SLOTS STATE ---
  const [slotsSpinning, setSlotsSpinning] = useState(false);
  const [slotsReels, setSlotsReels] = useState(['7️⃣', '💎', '🍒']);
  const slotsSymbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔'];

  // --- LIMBO STATE ---
  const [limboTarget, setLimboTarget] = useState(2.0);
  const [limboResult, setLimboResult] = useState<number | null>(null);

  // --- KENO STATE ---
  const [kenoSelections, setKenoSelections] = useState<number[]>([]);
  const [kenoDraw, setKenoDraw] = useState<number[]>([]);
  
  // --- PLINKO STATE ---
  const [plinkoDropCount, setPlinkoDropCount] = useState(0);
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
  const BOT_NAMES_POOL = ['Lucas', 'Ana', 'Diego', 'Sofía', 'Max', 'Valentina', 'Leo', 'Camila', 'Mateo', 'Isabella'];
  const CHAT_PHRASES = {
      HIT: ["Otra.", "Voy.", "Una más.", "Arriesgo.", "Dame."],
      STAND: ["Me quedo.", "Suficiente.", "Ahí.", "Bien.", "Planto."],
      BUST: ["Bust.", "Mal.", "Pasé.", "Rayos.", "Fuera."],
      WIN: ["¡Bien!", "Gané.", "Suerte.", "Vamos.", "Yes!"],
      LOSE: ["Perdí.", "Cerca.", "Dealer gana.", "Mal.", "Uff."]
  };

  interface BjSeat {
      id: number;
      name: string;
      hand: any[];
      isUser: boolean;
      status: 'WAITING' | 'PLAYING' | 'STOOD' | 'BUST' | 'BLACKJACK' | 'WIN' | 'LOSE' | 'PUSH';
      bet: number;
      chatMessage?: string;
  }
  
  const [bjDeck, setBjDeck] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);
  const [bjState, setBjState] = useState<'IDLE' | 'DEALING' | 'PLAYING' | 'DEALER_TURN' | 'ENDED'>('IDLE');
  const [bjSeats, setBjSeats] = useState<BjSeat[]>([]);
  const [activeSeatIndex, setActiveSeatIndex] = useState(0);
  const [bjRoundResults, setBjRoundResults] = useState<string[]>([]); // Results panel state

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

  // --- BLACKJACK ENGINE REFACTORED ---
  const bjSuits = ['♠', '♥', '♣', '♦'];
  const bjValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const getBjValue = (hand: any[]) => {
    if (!hand) return 0;
    let val = 0; let aces = 0;
    hand.forEach(c => {
        if (['J','Q','K'].includes(c.value)) val += 10;
        else if (c.value === 'A') { val += 11; aces++; }
        else val += parseInt(c.value);
    });
    while (val > 21 && aces > 0) { val -= 10; aces--; }
    return val;
  };

  const getRandomPhrase = (type: keyof typeof CHAT_PHRASES) => {
      const phrases = CHAT_PHRASES[type];
      return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const startBlackjack = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setBjRoundResults([]); 

      const names = [...BOT_NAMES_POOL].sort(() => 0.5 - Math.random());
      
      const deck = bjSuits.flatMap(s => bjValues.map(v => ({ 
          suit: s, value: v, color: (s === '♥' || s === '♦') ? 'text-red-500' : 'text-slate-900' 
      }))).sort(() => Math.random() - 0.5);
      
      const initialSeats: BjSeat[] = [
          { id: 0, name: names[0], hand: [deck.pop(), deck.pop()], isUser: false, status: 'PLAYING', bet: Math.floor(Math.random() * 500) + 50 },
          { id: 1, name: 'TÚ', hand: [deck.pop(), deck.pop()], isUser: true, status: 'PLAYING', bet: currentBet },
          { id: 2, name: names[1], hand: [deck.pop(), deck.pop()], isUser: false, status: 'PLAYING', bet: Math.floor(Math.random() * 500) + 50 },
          { id: 3, name: names[2], hand: [deck.pop(), deck.pop()], isUser: false, status: 'PLAYING', bet: Math.floor(Math.random() * 500) + 50 }
      ];

      const dHand = [deck.pop(), deck.pop()]; 
      
      setBjDeck(deck);
      setBjSeats(initialSeats);
      setDealerHand(dHand);
      setBjState('PLAYING');
      setActiveSeatIndex(0); 
  };

  useEffect(() => {
      if (activeGame !== 'BLACKJACK' || bjState !== 'PLAYING') return;
      
      const currentSeat = bjSeats?.[activeSeatIndex];
      if (!currentSeat) return;

      if (!currentSeat.isUser) {
          const timer = setTimeout(() => {
              const val = getBjValue(currentSeat.hand);
              if (val < 17) {
                  const card = bjDeck.pop();
                  const newHand = [...(currentSeat.hand || []), card];
                  const newVal = getBjValue(newHand);
                  const status = newVal > 21 ? 'BUST' : 'PLAYING';
                  let chat = getRandomPhrase('HIT');
                  if (status === 'BUST') chat = getRandomPhrase('BUST');
                  updateSeat(activeSeatIndex, { hand: newHand, status, chatMessage: chat });
                  if (status === 'BUST') setTimeout(nextTurn, 800);
              } else {
                  updateSeat(activeSeatIndex, { status: 'STOOD', chatMessage: getRandomPhrase('STAND') });
                  setTimeout(nextTurn, 800);
              }
          }, 1000); 
          return () => clearTimeout(timer);
      } else {
          const val = getBjValue(currentSeat.hand);
          if (val === 21 && currentSeat.hand?.length === 2) {
              updateSeat(activeSeatIndex, { status: 'BLACKJACK' });
              nextTurn();
          } else if (val > 21) {
              updateSeat(activeSeatIndex, { status: 'BUST' });
              nextTurn();
          }
      }
  }, [activeGame, bjState, activeSeatIndex, bjSeats]); 

  useEffect(() => {
      const timer = setTimeout(() => {
           setBjSeats(prev => prev.map(s => ({ ...s, chatMessage: undefined })));
      }, 3000);
      return () => clearTimeout(timer);
  }, [bjSeats]);

  const updateSeat = (idx: number, updates: Partial<BjSeat>) => {
      setBjSeats(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const nextTurn = () => {
      if (activeSeatIndex < 3) {
          setActiveSeatIndex(prev => prev + 1);
      } else {
          setBjState('DEALER_TURN');
          playDealerTurn();
      }
  };

  const playDealerTurn = async () => {
      let dHand = [...dealerHand];
      let deck = [...bjDeck]; 
      const drawLoop = setInterval(() => {
           if (getBjValue(dHand) < 17) {
               dHand.push(deck.pop());
               setDealerHand([...dHand]);
           } else {
               clearInterval(drawLoop);
               setBjState('ENDED');
               finalizeRound(dHand);
           }
      }, 1000);
  };

  const finalizeRound = (finalDealerHand: any[]) => {
      const dVal = getBjValue(finalDealerHand);
      const results: string[] = [];
      let userWonAmt = 0;

      results.push(`DEALER: ${dVal > 21 ? 'BUST' : dVal}`);

      setBjSeats(prev => prev.map(s => {
          if (s.status === 'BUST') {
              if(s.isUser) results.push("TÚ: BUST");
              return { ...s, status: 'LOSE', chatMessage: getRandomPhrase('LOSE') };
          }
          
          const pVal = getBjValue(s.hand);
          let result: any = 'LOSE';
          let chat = getRandomPhrase('LOSE');
          let payout = 0;
          
          if (dVal > 21 || pVal > dVal) {
              result = 'WIN';
              chat = getRandomPhrase('WIN');
              payout = s.status === 'BLACKJACK' ? Math.floor(s.bet * 2.5) : Math.floor(s.bet * 2);
          } else if (pVal === dVal) {
              result = 'PUSH';
              chat = "Empate.";
              payout = s.bet;
          }
          
          if (s.isUser) {
              if (result === 'WIN') {
                  results.push(`TÚ: GANASTE ${payout}`);
                  userWonAmt = payout;
              } else if (result === 'PUSH') {
                  results.push(`TÚ: EMPATE`);
                  userWonAmt = payout;
              } else {
                  results.push(`TÚ: PERDISTE`);
              }
          }
          
          return { ...s, status: result, chatMessage: chat };
      }));

      if (userWonAmt > 0) {
          updateBalance(userWonAmt);
          onGameLog('BLACKJACK', 'WIN', currentBet, userWonAmt, userWonAmt/currentBet);
      } else {
          onGameLog('BLACKJACK', 'LOSS', currentBet, 0, 0);
      }
      
      setBjRoundResults(results);
  };

  const hitBj = () => {
      const seat = bjSeats[activeSeatIndex];
      if (!seat) return;
      const newHand = [...seat.hand, bjDeck.pop()];
      const val = getBjValue(newHand);
      updateSeat(activeSeatIndex, { hand: newHand });
      if (val > 21) {
          updateSeat(activeSeatIndex, { status: 'BUST' });
          setTimeout(nextTurn, 500);
      }
  };

  const standBj = () => {
      const seat = bjSeats[activeSeatIndex];
      if (!seat) return;
      updateSeat(activeSeatIndex, { status: 'STOOD' });
      nextTurn();
  };

  // --- TRIVIA ENGINE ---
  const spinTriviaWheel = () => {
      if (currentBet > balance) return;
      updateBalance(-currentBet);
      setIsPlaying(true);
      setTriviaResult(null);
      setTriviaQ(null);
      setShowTriviaModal(false);

      const spins = 5;
      const targetIndex = Math.floor(Math.random() * 6);
      const degreesPerSegment = 360 / 6;
      const finalRotation = 2160 + (360 - (targetIndex * 60)); 
      setTriviaRotation(finalRotation);

      setTimeout(() => {
          const category = TRIVIA_CATEGORIES[targetIndex];
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

  // --- ROULETTE ENGINE ---
  const europeanWheel = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
  
  const generateWheelGradient = () => {
    let g = `conic-gradient(from 0deg, `;
    const segSize = 360 / 37;
    const order = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    order.forEach((num, i) => {
        let color = '#000000'; 
        if (num === 0) color = '#10b981'; 
        else if (redNumbers.includes(num)) color = '#dc2626'; 
        
        const start = i * segSize;
        const end = (i + 1) * segSize;
        g += `${color} ${start}deg ${end}deg${i === 36 ? '' : ', '}`;
    });
    g += ')';
    return g;
  };

  const spinRoulette = () => {
    if (!rouletteBetType || currentBet > balance) return;
    updateBalance(-currentBet);
    setIsPlaying(true);
    setRouletteSpinning(true);
    setRouletteResultNumber(null);
    
    const randomIndex = Math.floor(Math.random() * europeanWheel.length);
    const resultNum = europeanWheel[randomIndex];
    const segmentAngle = 360 / 37;
    const targetRotation = 360 - (randomIndex * segmentAngle);
    const totalRotation = rouletteAngle + 1800 + (targetRotation - (rouletteAngle % 360)); 
    setRouletteAngle(totalRotation);

    setTimeout(() => {
        setRouletteSpinning(false);
        setRouletteResultNumber(resultNum);
        setIsPlaying(false);
        
        let win = 0;
        const isRed = redNumbers.includes(resultNum);
        const isBlack = resultNum !== 0 && !isRed;
        
        if (rouletteBetType === 'GREEN' && resultNum === 0) win = currentBet * 36;
        else if (rouletteBetType === 'RED' && isRed) win = currentBet * 2;
        else if (rouletteBetType === 'BLACK' && isBlack) win = currentBet * 2;

        notify(win, `Resultado: ${resultNum} (${resultNum === 0 ? 'Verde' : isRed ? 'Rojo' : 'Negro'})`, 'ROULETTE', win/currentBet);
    }, 4000);
  };

  // --- SLOTS ENGINE ---
  const spinSlots = () => {
    if (currentBet > balance) return;
    updateBalance(-currentBet);
    setIsPlaying(true);
    setSlotsSpinning(true);
    setTimeout(() => {
        const res = [
            slotsSymbols[Math.floor(Math.random() * slotsSymbols.length)],
            slotsSymbols[Math.floor(Math.random() * slotsSymbols.length)],
            slotsSymbols[Math.floor(Math.random() * slotsSymbols.length)]
        ];
        setSlotsReels(res);
        setSlotsSpinning(false);
        setIsPlaying(false);
        let win = 0;
        if (res[0] === res[1] && res[1] === res[2]) {
            if (res[0] === '7️⃣') win = currentBet * 50;
            else if (res[0] === '💎') win = currentBet * 25;
            else win = currentBet * 10;
        } else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) {
            win = currentBet * 2;
        }
        if (win > 0) notify(win, "¡Premio de Tragamonedas!", 'SLOTS', win/currentBet);
        else notify(0, "Inténtalo de nuevo", 'SLOTS', 0);
    }, 2000);
  };

  // --- OTHER GAMES PRESERVED ---
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
               if (targetResult >= limboTarget) notify(currentBet * limboTarget, `Objetivo ${limboTarget}x Alcanzado`, 'LIMBO', limboTarget);
               else notify(0, `Resultado: ${targetResult.toFixed(2)}x`, 'LIMBO', 0);
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
      setPlinkoDropCount(prev => prev + 1); 
  };
  
  const onPlinkoResult = (mult: number) => {
      const win = Math.floor(currentBet * mult);
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
      const win = Math.floor(currentBet * crashMultiplier);
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
      const win = Math.floor(currentBet * mult);
      notify(win, `Cobrado x${mult.toFixed(2)}`, 'MINES', mult);
  };

  const rollDice = () => {
    if (currentBet > balance) return;
    updateBalance(-currentBet);
    const roll = Math.random() * 100;
    setDiceResult(roll);
    setTimeout(() => {
        if (roll <= diceValue) {
            const multiplier = 98 / diceValue;
            const win = Math.floor(currentBet * multiplier);
            notify(win, `Ganaste (x${multiplier.toFixed(2)})`, 'DICE', multiplier);
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
          case 'BLACKJACK': return "Mesa multijugador con 3 Bots. Vence al dealer. Blackjack paga 3:2.";
          case 'ROULETTE': return "Ruleta Europea. Apuesta a Rojo, Negro o al Cero Verde. Pagos 2x y 36x.";
          case 'SLOTS': return "Alinea 3 símbolos iguales. 777 paga 50x. Diamantes 25x.";
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {LOBBY_GAMES.map((game) => (
                    <button 
                        key={game.id}
                        onClick={() => setActiveGame(game.id as GameType)}
                        className={`relative aspect-[4/3] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-2xl ${game.gradient}`}
                    >
                        {/* ICON & TEXT ONLY - NO IMAGES */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm mb-4 group-hover:bg-white/30 transition-colors">
                                <game.icon size={32} className="text-white drop-shadow-md" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider drop-shadow-md">
                                {game.name}
                            </h3>
                            <div className="mt-4 px-3 py-1 rounded-full border border-white/20 text-[10px] font-bold text-white uppercase bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                Jugar Ahora
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  // GAME CONTAINER RENDER (Never Blank)
  return (
    <div className="flex flex-col h-full bg-[#050505]">
        {/* Game Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0B0B0C]">
            <button onClick={() => setActiveGame('LOBBY')} className="flex items-center gap-2 text-slate-400 hover:text-white">
                <ArrowLeft size={20} /> <span className="hidden md:inline">Volver al Lobby</span>
            </button>
            <div className="font-heading font-bold text-[#D4C28A] text-lg">
                {activeGame.replace('_', ' ')}
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                    <Info size={14} /> {getGameDescription()}
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Game Canvas / Area */}
            <div className="flex-1 relative bg-[#0f1114] flex flex-col items-center justify-center overflow-hidden">
                 
                 {/* TRIVIA */}
                 {activeGame === 'TRIVIA' && (
                     <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-indigo-900 to-black">
                         {/* Wheel Component */}
                         <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-[#D4C28A] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-[3000ms] cubic-bezier(0.2,0.8,0.2,1)"
                              style={{ transform: `rotate(${triviaRotation}deg)`, background: generateWheelGradient().replace('37', '6').replace(/#000000|#10b981|#dc2626/g, (match) => { return match; /* Placeholder, replaced below */ }) }}>
                              {/* Custom Conic for Trivia */}
                              <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: `conic-gradient(
                                  #2563eb 0deg 60deg,
                                  #ca8a04 60deg 120deg,
                                  #db2777 120deg 180deg,
                                  #16a34a 180deg 240deg,
                                  #9333ea 240deg 300deg,
                                  #ea580c 300deg 360deg
                              )`}}></div>
                              
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-20 h-20 bg-[#0B0B0C] rounded-full border-4 border-[#D4C28A] z-20 flex items-center justify-center shadow-xl">
                                      <Brain className="text-white" size={32} />
                                  </div>
                              </div>
                         </div>
                         {/* Pointer */}
                         <div className="absolute top-[15%] md:top-[10%] z-30">
                             <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-lg"></div>
                         </div>

                         {/* Collection */}
                         <div className="mt-12 flex gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                             {TRIVIA_CATEGORIES.map(cat => {
                                 const collected = collectedBadges.includes(cat.id);
                                 return (
                                     <div key={cat.id} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${collected ? `${cat.color} border-white` : 'bg-white/5 border-white/10 grayscale opacity-50'}`}>
                                         <cat.icon size={18} className="text-white" />
                                     </div>
                                 )
                             })}
                         </div>

                         {/* Question Modal */}
                         {showTriviaModal && triviaQ && triviaCategory && (
                             <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                                 <div className="bg-[#1a1d21] border border-[#D4C28A] p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                                     <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${triviaCategory.text}`}>{triviaCategory.name}</div>
                                     <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">{triviaQ.q}</h3>
                                     <div className="grid grid-cols-1 gap-3">
                                         {triviaQ.options.map((opt: string, i: number) => (
                                             <button 
                                                key={i}
                                                onClick={() => answerTrivia(i)}
                                                className={`p-4 rounded-xl text-left font-bold transition-all border ${
                                                    triviaResult 
                                                    ? i === triviaQ.ans 
                                                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                                                        : triviaResult === 'wrong' 
                                                            ? 'bg-red-500/20 border-red-500 text-red-400' 
                                                            : 'bg-white/5 border-white/10 opacity-50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#D4C28A]'
                                                }`}
                                             >
                                                 {opt}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                 )}

                 {/* BLACKJACK V2 IMPROVED */}
                 {activeGame === 'BLACKJACK' && (
                     <div className="w-full h-full relative bg-[#1e293b] flex flex-col p-4 overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>

                        {/* Results Panel - Fixed Top Center, Semitransparent */}
                        {bjRoundResults.length > 0 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-black/80 backdrop-blur-md border border-[#D4C28A]/50 px-6 py-3 rounded-xl shadow-2xl text-center min-w-[280px] animate-fade-in-down pointer-events-none">
                                <h3 className="text-[#D4C28A] font-bold uppercase tracking-widest text-[10px] mb-2">Resumen de Ronda</h3>
                                <div className="space-y-1">
                                    {bjRoundResults.map((line, i) => (
                                        <div key={i} className={`text-xs md:text-sm font-bold ${
                                            line.includes('GANASTE') ? 'text-[#1C8C6E]' : 
                                            line.includes('PERDISTE') || line.includes('BUST') ? 'text-[#B23A48]' : 'text-white'
                                        }`}>
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dealer Area - Pushed down slightly */}
                        <div className="flex-none h-1/3 w-full flex flex-col items-center justify-center pt-12 z-10 relative">
                             <div className="flex flex-col items-center mb-4">
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 border border-slate-700 px-3 py-0.5 rounded-full bg-black/40">
                                    DEALER
                                 </div>
                                 <div className={`px-3 py-1 rounded text-white font-mono text-sm border border-white/10 ${bjState === 'ENDED' ? 'bg-black/80' : 'bg-transparent'}`}>
                                     {bjState === 'ENDED' || bjState === 'DEALER_TURN' ? getBjValue(dealerHand) : '?'}
                                 </div>
                             </div>
                             {/* Cards less overlapped */}
                             <div className="flex -space-x-4 relative"> 
                                 {dealerHand.map((c, i) => (
                                     <div key={i} className="transition-all duration-500 shadow-xl" style={{ zIndex: i }}>
                                         <Card suit={c.suit} value={c.value} color={c.color} hidden={i === 1 && bjState !== 'ENDED' && bjState !== 'DEALER_TURN'} />
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Players Area - Bottom Row */}
                        <div className="flex-1 w-full flex items-end justify-center gap-2 md:gap-6 pb-6 z-10 w-full max-w-7xl mx-auto px-2">
                            {bjSeats.map((seat, idx) => (
                                <div key={seat.id} className={`relative flex flex-col items-center justify-end transition-all duration-300 rounded-xl p-2 min-w-[90px] md:min-w-[130px]
                                    ${activeSeatIndex === idx 
                                        ? 'bg-[#D4C28A]/5 border-t-2 border-[#D4C28A] shadow-[0_-10px_20px_rgba(212,194,138,0.1)]' 
                                        : 'opacity-75 border-t-2 border-transparent'}`}>
                                    
                                    {/* Chat Bubble */}
                                    {seat.chatMessage && (
                                        <div className="absolute -top-14 bg-white text-black text-[10px] py-1 px-3 rounded-xl rounded-bl-none shadow-xl animate-fade-in whitespace-nowrap z-[60] font-bold border border-slate-200">
                                            {seat.chatMessage}
                                        </div>
                                    )}

                                    {/* Status Text (Floating above cards) */}
                                    <div className="absolute -top-6 w-full flex justify-center z-[50]">
                                        {seat.status === 'WIN' && <span className="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-bounce">GANÓ</span>}
                                        {seat.status === 'BLACKJACK' && <span className="bg-[#D4C28A] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">BJ</span>}
                                        {seat.status === 'BUST' && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg">BUST</span>}
                                        {seat.status === 'PUSH' && <span className="bg-slate-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg">EMPATE</span>}
                                        {seat.status === 'LOSE' && <span className="text-slate-500 font-bold text-xs">PERDIÓ</span>}
                                    </div>

                                    {/* Cards */}
                                    <div className="flex -space-x-6 mb-3 h-24 md:h-28 relative items-center justify-center w-full">
                                        {seat.hand?.map((c: any, i: number) => (
                                            <div key={i} className="transform transition-transform hover:-translate-y-2 origin-bottom shadow-lg" style={{ zIndex: i }}>
                                                <Card suit={c.suit} value={c.value} color={c.color} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Player Stats */}
                                    <div className={`w-full bg-[#0B0B0C]/80 rounded-lg p-2 border ${activeSeatIndex === idx ? 'border-[#D4C28A]' : 'border-white/10'} flex flex-col items-center relative z-20`}>
                                        <div className="flex items-center gap-1 mb-1 w-full justify-center">
                                             {seat.isUser && <div className="w-1.5 h-1.5 bg-[#1C8C6E] rounded-full animate-pulse"></div>}
                                             <span className={`text-[10px] font-bold truncate max-w-[80px] ${seat.isUser ? 'text-[#D4C28A]' : 'text-slate-300'}`}>{seat.name}</span>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-white">
                                            {getBjValue(seat.hand)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {/* PLINKO */}
                 {activeGame === 'PLINKO' && (
                     <div className="w-full h-full relative bg-gradient-to-b from-blue-900 to-black">
                         <PlinkoGame triggerDrop={plinkoDropCount} onFinish={onPlinkoResult} />
                         <div className="absolute top-4 right-4 flex flex-col gap-2">
                             {plinkoHistory.map((h, i) => (
                                 <div key={i} className={`px-3 py-1 rounded-full font-bold text-xs animate-fade-in ${h > 1 ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                     {h}x
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* ROULETTE */}
                 {activeGame === 'ROULETTE' && (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-[#064e3b] relative overflow-hidden">
                          {/* Wheel */}
                          <div className={`w-80 h-80 rounded-full border-8 border-[#D4C28A] shadow-2xl relative transition-transform duration-[4000ms] cubic-bezier(0.1, 0.8, 0.1, 1)`}
                               style={{ transform: `rotate(${rouletteAngle}deg)`, background: generateWheelGradient() }}>
                                <div className="absolute inset-0 rounded-full border-[30px] border-black/20"></div>
                                <div className="absolute inset-[35%] bg-[#064e3b] rounded-full border-4 border-[#D4C28A] flex items-center justify-center shadow-inner">
                                     <div className="w-4 h-4 rounded-full bg-[#D4C28A]"></div>
                                </div>
                          </div>
                          {/* Marker */}
                          <div className="absolute top-[calc(50%-170px)] z-20">
                               <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-lg"></div>
                          </div>

                          {/* Result Display */}
                          <div className="mt-12 h-16 flex items-center justify-center">
                              {rouletteResultNumber !== null && (
                                  <div className={`text-5xl font-mono font-bold animate-jackpot ${
                                      rouletteResultNumber === 0 ? 'text-green-500' : redNumbers.includes(rouletteResultNumber) ? 'text-red-500' : 'text-white'
                                  }`}>
                                      {rouletteResultNumber}
                                  </div>
                              )}
                          </div>
                     </div>
                 )}
                 
                 {/* CRASH */}
                 {activeGame === 'CRASH' && (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                         <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-black opacity-80"></div>
                         <div className="relative z-10 flex flex-col items-center">
                              {crashed ? (
                                  <div className="text-6xl md:text-8xl font-black text-red-500 animate-pulse">CRASHED</div>
                              ) : (
                                  <div className="text-6xl md:text-9xl font-mono font-bold text-white tracking-tighter">
                                      {crashMultiplier.toFixed(2)}x
                                  </div>
                              )}
                              <div className="mt-8">
                                  {!crashed && isPlaying && <Rocket size={48} className="text-orange-500 animate-bounce" />}
                              </div>
                         </div>
                     </div>
                 )}

                 {/* SLOTS */}
                 {activeGame === 'SLOTS' && (
                     <div className="w-full h-full flex items-center justify-center bg-[#2e1065] relative">
                         <div className="bg-black p-8 rounded-3xl border-4 border-fuchsia-600 shadow-[0_0_100px_rgba(192,38,211,0.5)] flex gap-4">
                             {slotsReels.map((sym, i) => (
                                 <div key={i} className="w-24 h-36 bg-white rounded-xl border-4 border-slate-300 flex items-center justify-center text-6xl overflow-hidden relative">
                                     <div className={`transition-all duration-100 ${slotsSpinning ? 'blur-sm translate-y-2' : ''}`}>
                                        {slotsSpinning ? '?' : sym}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* MINES */}
                 {activeGame === 'MINES' && (
                     <div className="w-full h-full flex items-center justify-center bg-[#1e293b]">
                         <div className="grid grid-cols-5 gap-2 md:gap-3 p-4 bg-black/40 rounded-2xl border border-white/10">
                             {minesGrid.map((cell, i) => (
                                 <button
                                    key={i}
                                    disabled={!isPlaying || minesRevealed[i]}
                                    onClick={() => clickMine(i)}
                                    className={`w-12 h-12 md:w-16 md:h-16 rounded-lg transition-all flex items-center justify-center text-2xl
                                    ${minesRevealed[i] 
                                        ? cell === 'bomb' ? 'bg-red-500 shadow-inner' : 'bg-emerald-600 shadow-inner'
                                        : 'bg-slate-700 hover:bg-slate-600'}`}
                                 >
                                     {minesRevealed[i] && (cell === 'bomb' ? <Bomb /> : <Diamond className="text-white" />)}
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* OTHER GAMES PLACEHOLDERS (Standardize UI) */}
                 {(['DICE', 'KENO', 'LIMBO', 'ROAD'] as const).includes(activeGame as any) && (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                         {activeGame === 'DICE' && (
                             <div className="w-full max-w-md bg-black/50 p-8 rounded-2xl border border-white/10">
                                 <div className="flex justify-between text-white font-mono text-xl mb-4">
                                    <span>0</span><span>100</span>
                                 </div>
                                 <input 
                                    type="range" min="2" max="98" 
                                    value={diceValue} onChange={(e) => setDiceValue(Number(e.target.value))}
                                    className="w-full accent-[#D4C28A] h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                 />
                                 <div className="text-center mt-4 text-[#D4C28A] font-bold text-2xl">Target: Under {diceValue}</div>
                             </div>
                         )}
                         {activeGame === 'LIMBO' && (
                             <div className="text-center">
                                 <div className="text-9xl font-mono font-bold text-white mb-4">
                                     {limboResult ? limboResult.toFixed(2) : '0.00'}x
                                 </div>
                                 <div className="text-slate-400">Target: {limboTarget}x</div>
                             </div>
                         )}
                         {activeGame === 'KENO' && (
                             <div className="grid grid-cols-8 gap-2 p-4">
                                 {Array.from({length: 40}, (_,i) => i+1).map(n => (
                                     <button 
                                        key={n}
                                        onClick={() => toggleKenoNum(n)}
                                        className={`w-10 h-10 rounded-md font-bold transition-all ${
                                            kenoDraw.includes(n) ? 'bg-white text-black scale-110' :
                                            kenoSelections.includes(n) ? 'bg-[#D4C28A] text-black' : 'bg-slate-800 text-slate-400'
                                        }`}
                                     >
                                         {n}
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>
                 )}

            </div>

            {/* Sidebar Controls (Universal) */}
            <div className="w-full md:w-80 bg-[#141417] border-t md:border-t-0 md:border-l border-white/5 p-6 flex flex-col z-20">
                <div className="flex-1 space-y-6">
                    {/* Bet Amount */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monto de Apuesta</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={currentBet}
                                onChange={(e) => setCurrentBet(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-[#D4C28A] outline-none"
                            />
                            <div className="absolute right-2 top-2 flex gap-1">
                                <button onClick={() => setCurrentBet(b => b/2)} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 hover:text-white">½</button>
                                <button onClick={() => setCurrentBet(b => b*2)} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 hover:text-white">2×</button>
                            </div>
                        </div>
                    </div>

                    {/* Game Specific Controls */}
                    {activeGame === 'ROULETTE' && (
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setRouletteBetType('RED')} className={`py-3 rounded-lg font-bold transition-all ${rouletteBetType === 'RED' ? 'bg-red-600 text-white ring-2 ring-white' : 'bg-red-900/50 text-red-200'}`}>Rojo (2x)</button>
                            <button onClick={() => setRouletteBetType('GREEN')} className={`py-3 rounded-lg font-bold transition-all ${rouletteBetType === 'GREEN' ? 'bg-green-600 text-white ring-2 ring-white' : 'bg-green-900/50 text-green-200'}`}>0 (36x)</button>
                            <button onClick={() => setRouletteBetType('BLACK')} className={`py-3 rounded-lg font-bold transition-all ${rouletteBetType === 'BLACK' ? 'bg-slate-800 text-white ring-2 ring-white' : 'bg-slate-900 text-slate-400'}`}>Negro (2x)</button>
                        </div>
                    )}

                    {activeGame === 'LIMBO' && (
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Target Multiplier</label>
                             <input type="number" value={limboTarget} onChange={e => setLimboTarget(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono" />
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <button 
                        disabled={(activeGame === 'BLACKJACK' && bjState === 'PLAYING') || (activeGame === 'CRASH' && isPlaying) || (activeGame === 'MINES' && isPlaying) || rouletteSpinning || slotsSpinning}
                        onClick={() => {
                            if (activeGame === 'TRIVIA') spinTriviaWheel();
                            else if (activeGame === 'BLACKJACK') startBlackjack();
                            else if (activeGame === 'PLINKO') dropPlinko();
                            else if (activeGame === 'ROULETTE') spinRoulette();
                            else if (activeGame === 'SLOTS') spinSlots();
                            else if (activeGame === 'CRASH') startCrash();
                            else if (activeGame === 'MINES') startMines();
                            else if (activeGame === 'DICE') rollDice();
                            else if (activeGame === 'LIMBO') playLimbo();
                            else if (activeGame === 'KENO') playKeno();
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02]
                        ${(activeGame === 'BLACKJACK' && bjState === 'PLAYING') ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#1C8C6E] text-white hover:bg-[#156b54]'}`}
                    >
                        {activeGame === 'PLINKO' ? 'SOLTAR BOLA' : 
                         activeGame === 'TRIVIA' ? 'GIRAR RUEDA' :
                         activeGame === 'BLACKJACK' ? (bjState === 'IDLE' || bjState === 'ENDED' ? 'REPARTIR' : 'JUGANDO...') :
                         'APOSTAR'}
                    </button>

                    {/* In-Game Actions */}
                    {activeGame === 'BLACKJACK' && bjState === 'PLAYING' && bjSeats[activeSeatIndex]?.isUser && (
                        <div className="grid grid-cols-2 gap-3 animate-fade-in">
                            <button onClick={hitBj} className="py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500">PEDIR (HIT)</button>
                            <button onClick={standBj} className="py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-500">PLANTARSE</button>
                        </div>
                    )}
                    
                    {activeGame === 'CRASH' && isPlaying && !crashed && (
                        <button onClick={cashOutCrash} className="w-full py-4 bg-orange-500 rounded-xl font-bold text-black hover:bg-orange-400 animate-pulse">
                            RETIRARSE ({(currentBet * crashMultiplier).toFixed(2)})
                        </button>
                    )}

                    {activeGame === 'MINES' && isPlaying && minesRevealed.some(Boolean) && (
                         <button onClick={cashOutMines} className="w-full py-4 bg-orange-500 rounded-xl font-bold text-black hover:bg-orange-400">
                             COBRAR
                         </button>
                    )}
                </div>
                
                {/* Balance Footer */}
                <div className="mt-6 pt-6 border-t border-white/5">
                     <div className="flex justify-between items-center text-sm mb-2">
                         <span className="text-slate-500">Saldo Disponible</span>
                         <span className="text-white font-mono">{formatCurrency(balance)}</span>
                     </div>
                     {notification && (
                         <div className={`p-3 rounded-lg text-center font-bold text-sm animate-fade-in ${notification.type === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {notification.msg}
                         </div>
                     )}
                </div>
            </div>
        </div>
    </div>
  );
};
