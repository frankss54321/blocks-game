import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Home, MousePointer2, Clock, Target, CheckCircle2, ChevronRight, X, Eraser, Info, Zap, Sparkles, Cpu, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type BlockType = 'orange' | 'white';
type Mode = 'menu' | 'free' | 'practice_1' | 'practice_2' | 'result';

interface PlacedBlock {
  id: string;
  type: BlockType;
}

const PlacedBlockRenderer = ({ block, index, onDragEnd, scale = 1 }: { key?: string, block: PlacedBlock, index: number, onDragEnd: (block: PlacedBlock, info: any) => void, scale?: number }) => (
    <motion.div 
        key={`b-${block.type}-${block.id}`} 
        className="relative"
        style={{ 
            zIndex: index,
            marginLeft: block.type === 'white' && index > 0 ? `-${8 * scale}px` : '0px'
        }} 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.5 }}
    >
        <motion.div 
            drag 
            dragMomentum={false} 
            dragElastic={0}
            dragTransition={{ power: 0, timeConstant: 0 }}
            dragSnapToOrigin 
            onDragEnd={(_, info) => onDragEnd(block, info)} 
            whileDrag={{ scale: 1.05, zIndex: 9999, transition: { duration: 0 } }} 
            className="cursor-grab active:cursor-grabbing"
        >
            <BlockSVG type={block.type} scale={scale} />
        </motion.div>
    </motion.div>
);

const BlockRow = ({ row, onDragEnd, scale = 1 }: { key?: string, row: PlacedBlock[], onDragEnd: (block: PlacedBlock, info: any) => void, scale?: number }) => (
    <div className="flex flex-row items-center">
        {row.map((block, index) => (
            <PlacedBlockRenderer key={`${block.id}`} block={block} index={index} onDragEnd={onDragEnd} scale={scale} />
        ))}
    </div>
);

// --- Components ---

const GameBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Dot grid */}
    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    
    {/* Floating elements */}
    <motion.div 
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-20 left-10 text-indigo-200"
    >
      <Zap size={120} strokeWidth={0.5} />
    </motion.div>
    
    <motion.div 
      animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-40 right-10 text-orange-200"
    >
      <Cpu size={140} strokeWidth={0.5} />
    </motion.div>

    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/4 text-indigo-300"
    >
      <div className="w-64 h-64 border-4 border-current rounded-full" />
    </motion.div>

    <div className="absolute top-[10%] left-[80%] opacity-20 rotate-12">
      <div className="grid grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

const ViewportDecor = () => null;

const BlockSVG = ({ type, className, scale = 1 }: { type: BlockType, className?: string, scale?: number }) => {
  const isOrange = type === 'orange';
  const units = isOrange ? 10 : 1;
  const W = 26 * scale; 
  const H = 26 * scale;
  const dx = 8 * scale;
  const dy = 8 * scale;
  const width = units * W + dx;
  const height = H + dy;

  const frontColor = isOrange ? '#fba56f' : '#ffffff';
  const topColor = isOrange ? '#fdc4a3' : '#f8f9fa';
  const rightColor = isOrange ? '#d17b4c' : '#ced4da';
  const strokeColor = isOrange ? '#8e4d2a' : '#4a5568'; 

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={`select-none ${className || ''}`}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id={isOrange ? "orangeGrad" : "whiteGrad"} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
        </linearGradient>
      </defs>

      {Array.from({ length: units }).map((_, i) => (
         <path 
           key={`top-${i}`}
           d={`M ${i * W} ${dy} L ${i * W + dx} 0 L ${(i + 1) * W + dx} 0 L ${(i + 1) * W} ${dy} Z`}
           fill={topColor}
           stroke={strokeColor}
           strokeLinejoin="round"
           strokeWidth="1.5"
         />
      ))}

      <path 
        d={`M ${units * W} ${dy} L ${units * W + dx} 0 L ${units * W + dx} ${H} L ${units * W} ${dy + H} Z`}
        fill={rightColor}
        stroke={strokeColor}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />

      {Array.from({ length: units }).map((_, i) => (
        <g key={`front-${i}`} transform={`translate(${i * W}, ${dy})`}>
          <rect width={W} height={H} fill={frontColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
          <rect width={W} height={H} fill={`url(#${isOrange ? "orangeGrad" : "whiteGrad"})`} pointerEvents="none" />
          <path d={`M 2 ${H-2} L 2 2 L ${W-2} 2`} stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M ${W-2} 2 L ${W-2} ${H-2} L 2 ${H-2}`} stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
};

// --- Layout Helpers ---
const arrangeIntoRows = (blks: PlacedBlock[]) => {
    const rows: Array<PlacedBlock[]> = [];
    let currentRow: PlacedBlock[] = [];
    let currentRowVal = 0;
    
    for (const b of blks) {
        const val = b.type === 'orange' ? 1.0 : 0.1;
        if (currentRowVal + val <= 1.0001) {
            currentRow.push(b);
            currentRowVal += val;
        } else {
            rows.push(currentRow);
            currentRow = [b];
            currentRowVal = val;
        }
    }
    if (currentRow.length > 0) rows.push(currentRow);
    return rows;
};

const getCanvasLayout = (blks: PlacedBlock[]) => {
    const sorted = [...blks].sort((a,b) => (a.type === 'orange' ? -1 : 1));
    const left: PlacedBlock[] = [];
    const right: PlacedBlock[] = [];
    let leftVal = 0;
    
    for (const b of sorted) {
        const val = b.type === 'orange' ? 1.0 : 0.1;
        if (leftVal + val <= 5.0001) {
            left.push(b);
            leftVal += val;
        } else {
            right.push(b);
        }
    }
    return { 
        left: arrangeIntoRows(left), 
        right: arrangeIntoRows(right) 
    };
};

const BlockDisplay = ({ blocks, onDragEnd, scale = 1 }: { blocks: PlacedBlock[], onDragEnd: (block: PlacedBlock, info: any) => void, scale?: number }) => {
    const layout = getCanvasLayout(blocks);
    return (
        <div className="flex flex-row gap-x-10 w-full p-2">
            <div className="flex flex-col" style={{ gap: `${12 * scale}px` }}>{layout.left.map((row, i) => <BlockRow key={`l-${i}`} row={row} onDragEnd={onDragEnd} scale={scale} />)}</div>
            <div className="flex flex-col" style={{ gap: `${12 * scale}px` }}>{layout.right.map((row, i) => <BlockRow key={`r-${i}`} row={row} onDragEnd={onDragEnd} scale={scale} />)}</div>
        </div>
    );
};

const DraggableSource = ({ 
  type, 
  onDragEnd 
}: { 
  type: BlockType; 
  onDragEnd: (x: number, y: number) => boolean 
}) => {
  const [resetKey, setResetKey] = useState(0);

  const handleDragEnd = (_: any, info: any) => {
    const dropped = onDragEnd(info.point.x, info.point.y);
    if (dropped) {
      setResetKey(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 group">
      <motion.div
        key={resetKey}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.1, zIndex: 9999, transition: { duration: 0 } }} 
        className="cursor-grab active:cursor-grabbing relative"
      >
        <BlockSVG type={type} />
      </motion.div>
      <div className="px-2 py-0.5 bg-slate-100 rounded">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {type === 'orange' ? '1 條' : '0.1 條'}
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState<Mode>('menu');
  const [blocks, setBlocks] = useState<PlacedBlock[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Game state to track if we just switched from p1 to p2 to reset timer
  const [hasSwitchedToP2, setHasSwitchedToP2] = useState(false);
  
  const [targetP1Value, setTargetP1Value] = useState(0);
  const [p1BlocksVisual, setP1BlocksVisual] = useState<PlacedBlock[]>([]); // Changed to PlacedBlock[]
  const [p1Input, setP1Input] = useState('');
  
  const [targetP2Value, setTargetP2Value] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'' | 'correct' | 'wrong'>('');

  const calculateValue = (blks: PlacedBlock[]) => {
    const total = blks.reduce((acc, curr) => acc + (curr.type === 'orange' ? 1.0 : 0.1), 0);
    return Math.round(total * 10) / 10;
  };

  useEffect(() => {
    if (mode === 'practice_1' || mode === 'practice_2') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (mode === 'practice_1' && !hasSwitchedToP2) {
                setHasSwitchedToP2(true);
                setTimeLeft(60); // Reset to 60 for p2
                setMode('practice_2');
                generateP2Target();
                return 60;
              }
              setMode('result');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        if (mode === 'practice_1' && !hasSwitchedToP2) {
            setHasSwitchedToP2(true);
            setTimeLeft(60);
            setMode('practice_2');
            generateP2Target();
        } else {
            setMode('result');
        }
      }
    }
  }, [mode, timeLeft, hasSwitchedToP2]);

  const generateP1Target = () => {
    let finalO = Math.floor(Math.random() * 11); 
    let finalW = Math.floor(Math.random() * 10);
    if (finalO === 0 && finalW === 0) { finalW = 1; }
    if (finalO === 10) { finalW = 0; }
    setTargetP1Value(Math.round((finalO + finalW * 0.1) * 10) / 10);
    const vis: PlacedBlock[] = [];
    for (let i = 0; i < finalO; i++) vis.push({ id: `p1-o-${i}`, type: 'orange' });
    for (let i = 0; i < finalW; i++) vis.push({ id: `p1-w-${i}`, type: 'white' });
    setP1BlocksVisual(vis);
    setP1Input('');
  };

  const generateP2Target = () => {
    let val = parseFloat(((Math.random() * 9.9) + 0.1).toFixed(1)); 
    setTargetP2Value(val);
    setBlocks([]);
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setHasSwitchedToP2(false);
    setTimeLeft(90); // Updated to 90s as per menu description
    generateP1Target();
    setMode('practice_1');
  };

  const addBlockAt = (type: BlockType, px: number, py: number): boolean => {
    if (!dropZoneRef.current) return false;
    const rect = dropZoneRef.current.getBoundingClientRect();
    if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
      const currentVal = calculateValue(blocks);
      const addVal = type === 'orange' ? 1.0 : 0.1;
      if (Math.round((currentVal + addVal) * 10) / 10 > 10.0) return false;
      const newBlock: PlacedBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
      };
      setBlocks(prev => [...prev, newBlock]);
      return true;
    }
    return false;
  };

  const handleDragEnd = (block: PlacedBlock, info: any) => {
    if (!dropZoneRef.current) return;
    const rect = dropZoneRef.current.getBoundingClientRect();
    if (info.point.x < rect.left || info.point.x > rect.right || info.point.y < rect.top || info.point.y > rect.bottom) {
      setBlocks(prev => prev.filter(b => b.id !== block.id));
    }
  };

  const handleP1Submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(p1Input);
    if (!isNaN(val) && Math.abs(val - targetP1Value) < 0.01) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      showTemporaryFeedback('correct');
      generateP1Target();
    } else {
      setStreak(0);
      showTemporaryFeedback('wrong');
    }
  };

  const handleP2Submit = () => {
    if (Math.abs(calculateValue(blocks) - targetP2Value) < 0.01) {
      const integerPart = Math.floor(targetP2Value);
      const tenthsPart = Math.round((targetP2Value * 10) % 10);
      setScore(s => s + integerPart + tenthsPart);
      setStreak(s => s + 1);
      showTemporaryFeedback('correct');
      generateP2Target();
    } else {
      setStreak(0);
      showTemporaryFeedback('wrong');
    }
  };

  const showTemporaryFeedback = (type: 'correct' | 'wrong') => {
    setShowFeedback(type);
    setTimeout(() => setShowFeedback(''), 1000);
  };

  return (
    <div className="h-screen h-[100dvh] w-screen bg-[#f8fafc] flex flex-col overflow-hidden select-none relative">
      <GameBackground />
      
      <header className="h-12 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 justify-between shadow-sm z-50 relative">
        <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full" />
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1 rounded shadow-sm">
            <MousePointer2 className="w-3.5 h-3.5 fill-current" />
          </div>
          <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">
            小數積木探險 <span className="text-indigo-600">Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {(mode !== 'menu') && (
            <button 
              onClick={() => setMode('menu')}
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1.5"
            >
              <Home className="w-3 h-3" /> 結束練習
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative bg-slate-50/50 min-h-0 text-slate-600">
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center gap-12 p-8 relative z-10"
            >
              <div className="text-center">
                 <motion.div 
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4 shadow-lg shadow-indigo-200"
                 >
                   Mathematics Expedition
                 </motion.div>
                 <h2 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">小數積木探險</h2>
                 <p className="text-base font-medium text-slate-500 max-w-sm mx-auto">直觀的 3D 積木操作，讓你輕鬆掌握小數的位值觀念</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
                <motion.button 
                  whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setMode('free'); setBlocks([]); }}
                  className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-indigo-400 transition-all flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform" />
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform relative z-10">
                    <MousePointer2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-2 relative z-10">自由探索模式</h3>
                  <p className="text-sm text-slate-400 font-bold relative z-10">隨意組合積木觀察變化</p>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={startGame}
                  className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-orange-400 transition-all flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform" />
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform relative z-10">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-2 relative z-10">計時挑戰模式</h3>
                  <p className="text-sm text-slate-400 font-bold relative z-10">90秒極限挑戰爭奪高分</p>
                </motion.button>
              </div>
            </motion.div>
          )}
          {mode === 'free' && (
            <motion.div key="free" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0 h-full relative overflow-hidden">
               {/* Top Tool Bar - 15% */}
               <div className="h-[15%] shrink-0 py-1.5 sm:py-2.5 px-4 flex items-center justify-center bg-slate-50/20 backdrop-blur-sm z-50 border-b border-slate-100">
                  <div className="flex items-center gap-4 sm:gap-8 bg-white/90 p-1.5 px-5 sm:p-2.5 sm:px-8 rounded-full shadow-md border border-indigo-50">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <DraggableSource type="orange" onDragEnd={(x,y) => addBlockAt('orange', x, y)} />
                      <DraggableSource type="white" onDragEnd={(x,y) => addBlockAt('white', x, y)} />
                    </div>
                    <div className="h-6 sm:h-8 w-px bg-slate-200/50" />
                    <button 
                      onClick={() => setBlocks([])} 
                      className="p-1 px-3 sm:px-4 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group flex items-center gap-1.5"
                      title="清除所有"
                    >
                      <Eraser className="w-4 h-4" />
                      <span className="text-[10px] font-bold">重設</span>
                    </button>
                  </div>
               </div>

               {/* Large Status Display - 15% */}
               <div className="h-[15%] shrink-0 w-full flex flex-col items-center justify-center py-2 sm:py-3 px-4 relative z-40 border-b border-slate-100 bg-white/60 backdrop-blur-md">
                  <motion.div 
                    key={calculateValue(blocks)}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-indigo-600 text-white px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full shadow-lg flex items-center gap-2 sm:gap-2.5 border-2 border-indigo-400/30"
                  >
                    <span className="text-[10px] sm:text-xs font-black tracking-widest flex items-center gap-1 sm:gap-2 uppercase truncate">
                      目前共有 
                      <span className="text-base sm:text-2xl font-mono mx-1 bg-white/10 px-2 sm:px-3 py-0.5 rounded-lg">
                        【{calculateValue(blocks).toFixed(1)}】
                      </span> 
                      條積木
                    </span>
                  </motion.div>
               </div>

               {/* Canvas - 70% */}
               <div className="h-[70%] p-2 sm:p-3 relative flex flex-col items-center min-h-0">
                  <div ref={dropZoneRef} className="w-full max-w-4xl flex-1 bg-white rounded-[1.5rem] p-3 sm:p-6 pt-6 sm:pt-8 shadow-xl border border-indigo-100 backdrop-blur-sm text-slate-600 flex flex-col min-h-0">
                     <ViewportDecor />
                     <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar relative z-10 w-full px-2">
                        {blocks.length === 0 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                             <Zap className="w-12 h-12 text-indigo-400 mb-2 animate-pulse" />
                             <p className="text-sm font-bold text-slate-400 text-center">開始拖曳上方積木</p>
                          </div>
                        )}
                        <div className="flex flex-row flex-wrap gap-x-10 gap-y-3 items-start content-start justify-start w-full p-2">
                           {(() => {
                               const layout = getCanvasLayout(blocks);
                               return (
                                   <>
                                       <div className="flex flex-col gap-y-3">{layout.left.map((row, i) => <BlockRow key={`l-${i}`} row={row} onDragEnd={(b, info) => handleDragEnd(b, info)} />)}</div>
                                       <div className="flex flex-col gap-y-3">{layout.right.map((row, i) => <BlockRow key={`r-${i}`} row={row} onDragEnd={(b, info) => handleDragEnd(b, info)} />)}</div>
                                   </>
                               );
                           })()}
                        </div>
                     </div>
                 </div>
               </div>
            </motion.div>
          )}

          {(mode === 'practice_1' || mode === 'practice_2') && (
            <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden h-full">
                {mode === 'practice_1' ? (
                   <motion.div key="p1area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col w-full h-full min-h-0">
                      {/* 1. Time and Score - 15% */}
                      <div className="h-[15%] shrink-0 bg-white/60 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-center gap-8 z-50">
                          <div className="flex gap-4 sm:gap-12">
                               <div className="flex items-center gap-2 sm:gap-4">
                                   <div className={`p-2 rounded-xl shadow-md ${timeLeft < 20 ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-slate-100 text-indigo-500'}`}>
                                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                   </div>
                                   <div className="flex flex-col">
                                       <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">剩餘時間</span>
                                       <div className={`text-lg sm:text-2xl font-black font-mono leading-none tracking-tight ${timeLeft < 20 ? 'text-red-500' : 'text-slate-800'}`}>
                                          {timeLeft}<span className="text-xs ml-0.5 opacity-50">S</span>
                                       </div>
                                   </div>
                               </div>
                               <div className="flex items-center gap-2 sm:gap-4">
                                   <div className="p-2 bg-white border border-slate-100 text-orange-500 rounded-xl shadow-md">
                                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                   </div>
                                   <div className="flex flex-col">
                                       <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">目前得分</span>
                                       <div className="text-lg sm:text-2xl font-black text-slate-800 leading-none tracking-tight">
                                          {score}
                                       </div>
                                   </div>
                               </div>
                          </div>
                      </div>

                      {/* 2. Instruction - 15% */}
                      <div className="h-[15%] shrink-0 w-full flex items-center justify-center bg-white/40 backdrop-blur-sm border-b border-slate-100 px-4 z-10">
                         <div className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-3">
                            <Info className="w-4 h-4" />
                            <span className="text-sm font-black tracking-widest whitespace-nowrap">請讀出畫布上的積木總量</span>
                         </div>
                      </div>

                      {/* 3. Canvas - 50% */}
                      <div className="h-[50%] p-3 relative flex flex-col items-center justify-center min-h-0">
                          <div className="w-full max-w-4xl h-full bg-white rounded-[1.5rem] p-6 shadow-xl border border-indigo-100 backdrop-blur-sm relative flex flex-col items-center justify-center overflow-hidden">
                              <div className="flex-1 overflow-y-auto no-scrollbar w-full p-2 flex items-center justify-center">
                                  <div className="w-full">
                                      <BlockDisplay blocks={p1BlocksVisual} onDragEnd={handleDragEnd} scale={0.75} />
                                  </div>
                              </div>
                              {showFeedback && <FeedbackOverlay type={showFeedback} />}
                          </div>
                      </div>

                      {/* 4. Answer Row - 15% */}
                      <div className="h-[15%] shrink-0 bg-white/60 backdrop-blur-md border-t border-slate-100 px-6 flex items-center justify-center gap-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 relative">
                         <form onSubmit={handleP1Submit} className="flex items-center gap-4">
                             <div className="flex flex-col items-center">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">填入數值</span>
                                 <div className="flex items-center gap-1.5 mt-0.5">
                                   <input 
                                     autoFocus 
                                     type="number" 
                                     step="0.1" 
                                     value={p1Input} 
                                     onChange={e => setP1Input(e.target.value)} 
                                     className="w-24 h-10 text-center text-2xl font-black text-indigo-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono shadow-inner" 
                                     placeholder="0.0" 
                                   />
                                   <span className="text-sm font-bold text-slate-400">條</span>
                                 </div>
                             </div>
                             <button 
                               type="submit" 
                               className="h-10 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-all shadow-md text-sm whitespace-nowrap active:scale-95 disabled:opacity-50"
                             >
                               確認答案
                             </button>
                         </form>
                      </div>

                      {/* 5. Bottom Spacer - 5% */}
                      <div className="h-[5%] shrink-0 w-full" />
                   </motion.div>
               ) : (
                  <motion.div key="p2area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-h-0 flex flex-col w-full h-full relative overflow-hidden">
                      {/* 1. Time and Score - 15% */}
                      <div className="h-[15%] shrink-0 bg-white/60 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-center gap-8 z-50">
                          <div className="flex gap-4 sm:gap-12">
                               <div className="flex items-center gap-2 sm:gap-4">
                                   <div className={`p-2 rounded-xl shadow-md ${timeLeft < 20 ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-slate-100 text-indigo-500'}`}>
                                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                   </div>
                                   <div className="flex flex-col">
                                       <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">剩餘時間</span>
                                       <div className={`text-lg sm:text-2xl font-black font-mono leading-none tracking-tight ${timeLeft < 20 ? 'text-red-500' : 'text-slate-800'}`}>
                                          {timeLeft}<span className="text-xs ml-0.5 opacity-50">S</span>
                                       </div>
                                   </div>
                               </div>
                               <div className="flex items-center gap-2 sm:gap-4">
                                   <div className="p-2 bg-white border border-slate-100 text-orange-500 rounded-xl shadow-md">
                                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                   </div>
                                   <div className="flex flex-col">
                                       <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">目前得分</span>
                                       <div className="text-lg sm:text-2xl font-black text-slate-800 leading-none tracking-tight">
                                          {score}
                                       </div>
                                   </div>
                               </div>
                          </div>
                      </div>

                      {/* 2. Target Task / Source Bar - 15% */}
                      <div className="h-[15%] shrink-0 py-1.5 sm:py-2.5 px-4 flex items-center justify-center bg-slate-50/20 backdrop-blur-sm z-50 border-b border-slate-100">
                         <div className="flex flex-row items-center gap-3 sm:gap-6 bg-white/90 p-2 px-5 sm:p-2.5 sm:px-8 rounded-[2rem] shadow-md border border-slate-100">
                            <div className="flex flex-col items-center shrink-0 pr-3 sm:pr-6 border-r border-slate-100">
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">目標任務</span>
                                <div className="text-lg sm:text-2xl font-black text-orange-600 font-mono leading-none">
                                  {targetP2Value.toFixed(1)} <span className="text-[8px] sm:text-[9px] font-bold opacity-60 ml-0.5">條</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 sm:gap-6 px-1">
                              <DraggableSource type="orange" onDragEnd={(x,y) => addBlockAt('orange', x, y)} />
                              <DraggableSource type="white" onDragEnd={(x,y) => addBlockAt('white', x, y)} />
                            </div>
                            
                            <div className="flex items-center pl-3 sm:pl-6 border-l border-slate-100">
                              <button onClick={() => setBlocks([])} className="p-1.5 sm:p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
                                <Eraser className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform"/>
                              </button>
                            </div>
                         </div>
                      </div>

                      {/* 3. Large Status Display & Submit - 15% */}
                      <div className="h-[15%] shrink-0 w-full flex flex-row items-center justify-center py-1.5 sm:py-3 px-4 relative z-50 gap-2 sm:gap-6 bg-white/60 backdrop-blur-md border-b border-slate-200/30 shadow-sm">
                         <motion.div 
                           key={calculateValue(blocks)}
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="bg-indigo-600 text-white px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full shadow-lg flex items-center gap-2 border-2 border-indigo-400/30 shrink-0"
                         >
                           <span className="text-[10px] sm:text-xs font-black tracking-widest flex items-center gap-1">
                             目前組合 
                             <span className="text-sm sm:text-xl font-mono mx-1 bg-white/10 px-2 py-0.5 rounded-lg">
                               【{calculateValue(blocks).toFixed(1)}】
                             </span> 
                             條
                           </span>
                         </motion.div>
                         
                         <button 
                           onClick={handleP2Submit} 
                           className="h-9 sm:h-12 px-4 sm:px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-md text-[10px] sm:text-base tracking-widest uppercase truncate active:rotate-1"
                         >
                           提交答案
                         </button>
                      </div>

                      {/* 4. Canvas Area - 50% */}
                      <div className="h-[50%] p-2 sm:p-3 relative flex flex-col items-center justify-center min-h-0 overflow-hidden">
                          <div ref={dropZoneRef} className="w-full max-w-4xl bg-white rounded-[1.5rem] p-4 sm:p-6 shadow-xl border border-indigo-100 backdrop-blur-sm overflow-hidden text-slate-600 h-full flex flex-col">
                              <ViewportDecor />
                              <div className="flex-1 overflow-y-auto no-scrollbar w-full p-2 relative z-10 flex items-center justify-center">
                               <div className="w-full flex items-center justify-center">
                                   <AnimatePresence>
                                       <BlockDisplay blocks={blocks} onDragEnd={handleDragEnd} />
                                   </AnimatePresence>
                               </div>
                              </div>
                              {showFeedback && <FeedbackOverlay type={showFeedback} />}
                          </div>
                      </div>

                      {/* 5. Bottom Spacer - 5% */}
                      <div className="h-[5%] shrink-0 w-full" />
                  </motion.div>
               )}
            </div>
          )}

          {mode === 'result' && (
             <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 min-h-0 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl border border-white flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500" />
                    
                    <motion.div 
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-orange-200"
                    >
                        <Trophy className="w-12 h-12" />
                    </motion.div>
                    
                    <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">任務成功！</h2>
                    <p className="text-base text-slate-400 font-bold mb-10">你在小數積木中獲得了卓越的成就</p>
                    
                    <div className="w-full mb-10 text-center">
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 inline-block min-w-[200px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Total Points</span>
                          <div className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">
                              {score}
                          </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <button onClick={startGame} className="w-full h-14 rounded-2xl font-black text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group">
                           <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"/> 再次挑戰極限
                        </button>
                        <button onClick={() => setMode('menu')} className="w-full h-14 rounded-2xl font-black text-base text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">返回控制中心</button>
                    </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        body { overflow: hidden; touch-action: none; background: #f8fafc; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="absolute bottom-2 w-full flex justify-center pointer-events-none z-[60] select-none opacity-40">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          Designed by 致宇老師
        </span>
      </div>
    </div>
  );
}

function FeedbackOverlay({ type }: { type: 'correct' | 'wrong' }) {
  const isCorrect = type === 'correct';
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50 pointer-events-none rounded-[2rem] ${isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}`}
    >
       {isCorrect && (
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {Array.from({ length: 15 }).map((_, i) => (
             <motion.div
               key={i}
               initial={{ top: "50%", left: "50%", scale: 0 }}
               animate={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
               transition={{ duration: 1.2 + Math.random(), ease: "easeOut", repeat: Infinity, repeatDelay: Math.random() }}
               className={`absolute w-2 h-2 rounded-full ${['bg-indigo-400', 'bg-orange-400', 'bg-pink-400', 'bg-green-400'][i % 4]}`}
             />
           ))}
         </div>
       )}
       <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`px-8 py-4 rounded-3xl font-black text-4xl shadow-2xl ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {isCorrect ? '太棒了！' : '再試試看！'}
       </motion.div>
    </motion.div>
  );
}
