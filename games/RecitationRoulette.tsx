import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useClass } from '../context/ClassContext';
import { THEME_COLORS, THEME_TEXT_COLORS, THEME_BG_LIGHT } from '../types';
import { Button } from '../components/ui/Button';
import { Shuffle, RefreshCw, CheckCircle2, RotateCcw, Box, Cuboid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerConfetti } from '../utils/helpers';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Text, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Augment JSX namespace to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// --- 3D Components ---

const WheelSection = ({ index, total, name, color, isSelected }: any) => {
  const angle = (Math.PI * 2) / total;
  const rotation = index * angle;
  const radius = 3.5;
  
  return (
    <group rotation={[0, 0, rotation]}>
       {/* Pie Slice - Approximated with shape or custom geometry usually, but here using simple blocks for style */}
       <mesh position={[radius/2, 0, 0]}>
         <boxGeometry args={[radius, 0.1, 0.5]} />
         <meshStandardMaterial color={isSelected ? '#ffffff' : color} emissive={isSelected ? color : '#000000'} />
       </mesh>
       
       {/* Name Text */}
       <group position={[radius * 0.7, 0, 0.3]} rotation={[0, 0, 0]}>
         <Text
           color={isSelected ? color : 'white'}
           anchorX="center"
           anchorY="middle"
           fontSize={0.3}
           maxWidth={2}
         >
           {name}
         </Text>
       </group>
    </group>
  );
};

const Wheel3D = ({ students, spinning, selectedName }: { students: string[], spinning: boolean, selectedName: string }) => {
   const groupRef = useRef<THREE.Group>(null);
   const [rotationSpeed, setRotationSpeed] = useState(0);
   const [currentRotation, setCurrentRotation] = useState(0);

   useEffect(() => {
     if (spinning) {
        setRotationSpeed(0.5); // High speed
     } else {
        // Decelerate
        setRotationSpeed(0);
        // Calculate target rotation to land on selectedName? 
        // For simplicity in this demo, we just stop. 
        // Real implementation would calculate exact angle.
     }
   }, [spinning]);

   useFrame((state, delta) => {
      if (groupRef.current) {
          // Spin logic
          if (spinning) {
            groupRef.current.rotation.z -= rotationSpeed;
          } else {
            // Idle drift
             groupRef.current.rotation.z -= 0.002;
          }
      }
   });

   const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'];

   return (
     <group ref={groupRef}>
        {students.map((s, i) => (
           <WheelSection 
             key={i} 
             index={i} 
             total={students.length} 
             name={s} 
             color={colors[i % colors.length]}
             isSelected={s === selectedName && !spinning} 
           />
        ))}
     </group>
   );
};


// --- Main Component ---

export const RecitationRoulette: React.FC = () => {
  const { students, themeColor } = useClass();
  const [currentName, setCurrentName] = useState<string>("Ready?");
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<string[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

  // Initialize available students
  useEffect(() => {
    if (availableStudents.length === 0 && history.length === 0) {
        setAvailableStudents(students.map(s => s.name));
    }
  }, [students]);

  const spin = useCallback(() => {
    if (availableStudents.length === 0) {
      setRoundComplete(true);
      return;
    }

    setIsSpinning(true);
    let counter = 0;
    const maxSpins = 30; 
    const speed = 50; 

    // Sound effect trigger could go here

    const interval = setInterval(() => {
      // Pick a random name just for visual effect
      const randomVisual = availableStudents[Math.floor(Math.random() * availableStudents.length)];
      setCurrentName(randomVisual);
      counter++;

      if (counter >= maxSpins) {
        clearInterval(interval);
        
        // Final selection logic
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        const selected = availableStudents[randomIndex];
        
        setCurrentName(selected);
        setHistory(prev => [selected, ...prev]);
        const newAvailable = availableStudents.filter(n => n !== selected);
        setAvailableStudents(newAvailable);
        
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);

        if (newAvailable.length === 0) {
            setTimeout(() => setRoundComplete(true), 1500);
        }
        
        setIsSpinning(false);
      }
    }, speed);
  }, [availableStudents]);

  const resetGame = () => {
    setHistory([]);
    setAvailableStudents(students.map(s => s.name));
    setCurrentName("Ready?");
    setRoundComplete(false);
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <p>Add students to play Recitation Roulette</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 animate-fade-in">
        
        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setViewMode('2D')} 
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === '2D' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
           >
             Simple
           </button>
           <button 
             onClick={() => setViewMode('3D')} 
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === '3D' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
           >
             <Cuboid size={16}/> 3D Wheel
           </button>
        </div>

        {/* Main Stage */}
        <div className="relative w-full aspect-square md:aspect-[2/1] max-h-[500px] flex items-center justify-center overflow-hidden bg-white rounded-[3rem] shadow-sm border border-slate-200">
            
            {viewMode === '2D' && (
                <>
                {/* Background Decoration */}
                <div className={`absolute inset-0 ${THEME_BG_LIGHT[themeColor]} opacity-30 blur-3xl transform scale-110`}></div>
                <div className="relative z-10 text-center w-full px-4">
                    <AnimatePresence mode="wait">
                        {roundComplete ? (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">All Done!</h2>
                                <p className="text-slate-500 mb-6 font-medium">Class cycle completed.</p>
                                <Button onClick={resetGame} icon={<RotateCcw size={20}/>}>Restart Cycle</Button>
                            </motion.div>
                        ) : (
                            <div key="active">
                                <motion.h1 
                                    key={currentName}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 1.1 }}
                                    transition={{ duration: 0.1 }}
                                    className={`text-4xl sm:text-5xl md:text-7xl font-black ${THEME_TEXT_COLORS[themeColor]} drop-shadow-sm tracking-tight break-words`}
                                >
                                    {currentName}
                                </motion.h1>
                                
                                {!isSpinning && currentName !== "Ready?" && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-bold text-sm"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        {availableStudents.length} students left
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
                </>
            )}

            {viewMode === '3D' && (
                <div className="w-full h-full cursor-grab active:cursor-grabbing">
                   <Canvas>
                      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                      <ambientLight intensity={0.8} />
                      <pointLight position={[10, 10, 10]} />
                      <Suspense fallback={null}>
                         <Float speed={isSpinning ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Wheel3D students={availableStudents.length > 0 ? availableStudents : history} spinning={isSpinning} selectedName={currentName} />
                         </Float>
                      </Suspense>
                   </Canvas>
                   <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                         {isSpinning ? 'Spinning...' : (currentName === "Ready?" ? 'Ready to Spin' : currentName)}
                      </span>
                   </div>
                </div>
            )}
        </div>

        {/* Controls */}
        {!roundComplete && (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
                <Button 
                    onClick={spin} 
                    disabled={isSpinning}
                    className="!text-xl !px-12 !py-6 shadow-xl active:scale-95 transition-transform w-full sm:w-auto"
                    icon={<Shuffle size={24} />}
                >
                    {isSpinning ? '...' : 'Spin'}
                </Button>
                
                <Button 
                    variant="secondary" 
                    onClick={resetGame}
                    disabled={isSpinning || history.length === 0}
                    icon={<RefreshCw size={24} />}
                    title="Reset History"
                    className="w-full sm:w-auto"
                >
                    Reset
                </Button>
            </div>
        )}

        {/* History Stream */}
        {history.length > 0 && (
            <div className="w-full mt-4 bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4 flex justify-between">
                    <span>Already Called ({history.length})</span>
                    <span className="text-slate-300">Recent first</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                    {history.map((name, i) => (
                        <motion.div 
                            key={`${name}-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-100 flex items-center gap-2 text-sm font-medium"
                        >
                            <CheckCircle2 size={12} className="text-green-500" />
                            {name}
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>
        )}
    </div>
  );
};