import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { shuffleArray, triggerConfetti } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Users, Dice5, RefreshCcw, Settings2, Palette, Layers, Divide, Zap, GripHorizontal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_BG_LIGHT, THEME_TEXT_COLORS } from '../types';
import { Modal } from '../components/ui/Modal';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';

// Augment JSX namespace to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface Group {
    id: number;
    members: string[];
}

type TileStyle = 'list' | 'card' | 'orb';
type BgStyle = 'clean' | 'dots' | 'grid' | 'space' | 'sky';
type GenerationMode = 'count' | 'size';

interface GameSettings {
    tileStyle: TileStyle;
    bgStyle: BgStyle;
    mode: GenerationMode;
}

// Visual Shuffling Component
const ShufflingOverlay = ({ names }: { names: string[] }) => {
    const [currentNames, setCurrentNames] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Pick 3 random names to flash
            const randomPick = Array.from({ length: 3 }, () => names[Math.floor(Math.random() * names.length)]);
            setCurrentNames(randomPick);
        }, 100);
        return () => clearInterval(interval);
    }, [names]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-[2rem]">
            <motion.div 
                className="flex gap-4 mb-4 flex-wrap justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
               {currentNames.map((name, i) => (
                   <motion.div 
                       key={i}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -20, opacity: 0 }}
                       className="bg-slate-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-lg md:text-xl shadow-xl"
                   >
                       {name}
                   </motion.div>
               ))}
            </motion.div>
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                <Sparkles size={18} className="text-indigo-500" />
                Randomizing...
            </div>
        </div>
    );
};

export const GroupSpinner: React.FC = () => {
  const { students, themeColor } = useClass();
  
  // State
  const [targetValue, setTargetValue] = useState(4); // Serves as Group Count OR Max Members depending on mode
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({ 
      tileStyle: 'card', 
      bgStyle: 'dots',
      mode: 'count' 
  });
  
  // Drag State
  const [draggedMember, setDraggedMember] = useState<{groupId: number, member: string} | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);

  const generateGroups = async () => {
    if (students.length === 0) return;
    
    setIsGenerating(true);
    setGroups([]); // Clear for animation
    
    // Animation delay - extended for visual effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    const shuffled = shuffleArray([...students]);
    let newGroups: Group[] = [];
    
    if (settings.mode === 'count') {
        const count = Math.max(1, Math.min(students.length, targetValue));
        newGroups = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            members: []
        }));
        shuffled.forEach((student, index) => {
            const groupIndex = index % count;
            newGroups[groupIndex].members.push(student.name);
        });
    } else {
        const size = Math.max(1, targetValue);
        const groupCount = Math.ceil(students.length / size);
        newGroups = Array.from({ length: groupCount }, (_, i) => ({
            id: i + 1,
            members: []
        }));
        shuffled.forEach((student, index) => {
            const groupIndex = index % groupCount;
            newGroups[groupIndex].members.push(student.name);
        });
    }

    setGroups(newGroups);
    setIsGenerated(true);
    setIsGenerating(false);
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
  };

  const respinSingleGroup = (targetGroupId: number, e: React.MouseEvent) => {
    triggerConfetti(e.clientX, e.clientY);

    const targetGroupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (targetGroupIndex === -1) return;

    const newGroups = [...groups];
    const targetGroup = { ...newGroups[targetGroupIndex] };
    
    // If only one group, just internal shuffle
    if (groups.length === 1) {
        targetGroup.members = shuffleArray(targetGroup.members);
        newGroups[targetGroupIndex] = targetGroup;
        setGroups(newGroups);
        return;
    }

    // Identify other groups
    const otherGroupIndices = groups.map((_, i) => i).filter(i => i !== targetGroupIndex);

    // For each member in target group, swap with someone else
    const newTargetMembers = [...targetGroup.members];
    
    newTargetMembers.forEach((member, idx) => {
        // Pick a random other group
        const randomOtherIndex = otherGroupIndices[Math.floor(Math.random() * otherGroupIndices.length)];
        const otherGroup = { ...newGroups[randomOtherIndex] };
        
        if (otherGroup.members.length > 0) {
            // Pick random member to swap
            const swapIdx = Math.floor(Math.random() * otherGroup.members.length);
            const swapMember = otherGroup.members[swapIdx];

            // Swap
            otherGroup.members[swapIdx] = member; // Move current target member to other group
            newTargetMembers[idx] = swapMember; // Move other member to target group

            // Update the temporary groups array for next iteration validity
            newGroups[randomOtherIndex] = otherGroup;
        }
    });

    // Update target group with new members
    newGroups[targetGroupIndex] = { ...targetGroup, members: newTargetMembers };
    
    // Final shuffle of the target group for presentation
    newGroups[targetGroupIndex].members = shuffleArray(newGroups[targetGroupIndex].members);

    setGroups(newGroups);
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, groupId: number, member: string) => {
    setDraggedMember({ groupId, member });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    if (draggedMember && draggedMember.groupId !== groupId) {
        setDragOverGroup(groupId);
    }
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: number) => {
    e.preventDefault();
    setDragOverGroup(null);

    if (!draggedMember || draggedMember.groupId === targetGroupId) return;

    const sourceGroupIndex = groups.findIndex(g => g.id === draggedMember.groupId);
    const targetGroupIndex = groups.findIndex(g => g.id === targetGroupId);

    if (sourceGroupIndex === -1 || targetGroupIndex === -1) return;

    const newGroups = [...groups];
    
    // Remove from source
    newGroups[sourceGroupIndex] = {
        ...newGroups[sourceGroupIndex],
        members: newGroups[sourceGroupIndex].members.filter(m => m !== draggedMember.member)
    };

    // Add to target
    newGroups[targetGroupIndex] = {
        ...newGroups[targetGroupIndex],
        members: [...newGroups[targetGroupIndex].members, draggedMember.member]
    };

    setGroups(newGroups);
    setDraggedMember(null);
  };


  const renderBackground = () => {
      // 3D Backgrounds handled via overlay component
      if (settings.bgStyle === 'dots') return "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]";
      if (settings.bgStyle === 'grid') return "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:40px_40px]";
      return "";
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <p>Add students to create groups</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-[calc(100vh-100px)] py-4 md:py-6 animate-fade-in relative`}>
        {/* 3D Background Layers */}
        {settings.bgStyle === 'space' && (
            <div className="fixed inset-0 z-0 bg-slate-900 pointer-events-none">
                <Canvas>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Canvas>
            </div>
        )}
        {settings.bgStyle === 'sky' && (
            <div className="fixed inset-0 z-0 bg-sky-200 pointer-events-none">
                <Canvas>
                    <ambientLight intensity={0.8} />
                    <Cloud opacity={0.5} speed={0.4} bounds={[10, 1, 1]} segments={20} />
                    <Cloud opacity={0.5} speed={0.4} bounds={[10, 1, 1]} segments={20} position={[10,0,-10]} />
                </Canvas>
            </div>
        )}
        
        {/* CSS Backgrounds */}
        <div className={`fixed inset-0 z-0 pointer-events-none ${renderBackground()}`}></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Controls Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] shadow-lg border border-white sticky top-4 z-30 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 md:gap-6 transition-all">
             <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-2xl border border-white/50 w-full md:w-auto justify-center md:justify-start">
                    <Users className="text-slate-400" size={20}/>
                    <span className="font-bold text-slate-700">{students.length} Students</span>
                </div>
             </div>

             <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                <button 
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all active:scale-95 font-bold"
                >
                    <Settings2 size={20} className="text-slate-400" />
                    <span>Design & Logic</span>
                </button>
                <Button 
                    onClick={generateGroups} 
                    disabled={isGenerating}
                    className="!py-4 !px-6 md:!px-8 !text-base md:!text-lg !rounded-2xl flex-1 md:flex-none shadow-xl shadow-indigo-200"
                    icon={isGenerating ? <div className="animate-spin"><RefreshCcw size={24}/></div> : <Dice5 size={24}/>}
                >
                    {isGenerating ? 'Shuffling...' : (isGenerated ? 'Shuffle' : 'Create')}
                </Button>
             </div>
        </div>

        {/* Settings Modal */}
        <Modal 
            isOpen={settingsOpen} 
            onClose={() => setSettingsOpen(false)}
            title="Design & Logic"
        >
             <div className="space-y-8">
                {/* Mode Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Divide size={16} /> Grouping Logic
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => setSettings(s => ({...s, mode: 'count'}))}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${settings.mode === 'count' ? `border-${themeColor}-500 bg-${themeColor}-50` : 'border-slate-100 bg-slate-50'}`}
                        >
                            <div className="font-bold text-slate-800 mb-1">By Count</div>
                            <div className="text-xs text-slate-500">"I want exactly X groups"</div>
                        </button>
                        <button
                            onClick={() => setSettings(s => ({...s, mode: 'size'}))}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${settings.mode === 'size' ? `border-${themeColor}-500 bg-${themeColor}-50` : 'border-slate-100 bg-slate-50'}`}
                        >
                            <div className="font-bold text-slate-800 mb-1">By Max Size</div>
                            <div className="text-xs text-slate-500">"Max X students per group"</div>
                        </button>
                    </div>

                    {/* Logic Counter inside Modal */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                         <span className="font-bold text-slate-700">
                             {settings.mode === 'count' ? 'Target Group Count' : 'Max Members / Group'}
                         </span>
                         <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                             <button 
                                className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 transition-colors"
                                onClick={() => setTargetValue(Math.max(1, targetValue - 1))}
                             >-</button>
                             <span className="text-xl font-black w-12 text-center text-slate-800 tabular-nums">{targetValue}</span>
                             <button 
                                className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 transition-colors"
                                onClick={() => setTargetValue(Math.min(students.length, targetValue + 1))}
                             >+</button>
                         </div>
                    </div>
                </div>

                {/* Background Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Palette size={16} /> Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['clean', 'dots', 'grid', 'space', 'sky'] as BgStyle[]).map(style => (
                            <button
                                key={style}
                                onClick={() => setSettings(s => ({...s, bgStyle: style}))}
                                className={`px-2 py-3 rounded-xl text-sm font-bold capitalize transition-all ${settings.bgStyle === style ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tile Style */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Layers size={16} /> Card Style
                    </label>
                    <div className="flex gap-2">
                        {(['list', 'card', 'orb'] as TileStyle[]).map(style => (
                            <button
                                key={style}
                                onClick={() => setSettings(s => ({...s, tileStyle: style}))}
                                className={`px-4 py-3 rounded-xl text-sm font-bold capitalize transition-all ${settings.tileStyle === style ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24 relative min-h-[400px]">
             {isGenerating && <ShufflingOverlay names={students.map(s => s.name)} />}

            <AnimatePresence mode='popLayout'>
                {isGenerated && groups.map((group, i) => (
                    <motion.div 
                        key={group.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                            delay: i * 0.1, 
                            type: 'spring',
                            stiffness: 200,
                            damping: 20
                        }}
                        onDragOver={(e) => handleDragOver(e, group.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, group.id)}
                        className={`bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/20 border flex flex-col h-full hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${dragOverGroup === group.id ? `ring-4 ring-${themeColor}-400 border-${themeColor}-400 bg-white` : 'border-white'}`}
                    >
                        {/* Header with Dynamic Count */}
                        <div className={`flex items-center justify-between mb-6 pb-4 border-b border-slate-100 relative z-10`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl ${THEME_BG_LIGHT[themeColor]} flex items-center justify-center font-black ${THEME_TEXT_COLORS[themeColor]} text-xl shadow-inner`}>
                                        {group.id}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 leading-tight">Group {group.id}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                             <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                {group.members.length} Members
                                             </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => respinSingleGroup(group.id, e)}
                                    className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:rotate-180 border border-transparent hover:border-indigo-100"
                                    title="Mix this group"
                                >
                                    <Zap size={20} fill="currentColor" className={THEME_TEXT_COLORS[themeColor]} />
                                </button>
                        </div>
                        
                        {/* Members List */}
                        <div className={`flex-1 relative z-10 ${settings.tileStyle === 'card' ? 'grid grid-cols-2 gap-2' : (settings.tileStyle === 'orb' ? 'flex flex-wrap gap-2 content-start' : 'space-y-2')}`}>
                            <AnimatePresence>
                            {group.members.map((member, mIdx) => (
                                <motion.div 
                                    key={`${group.id}-${member}`} // Compound key ensures re-render on move
                                    layoutId={member}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e as any, group.id, member)}
                                    className="cursor-grab active:cursor-grabbing"
                                >
                                    {settings.tileStyle === 'list' && (
                                        <div className="bg-white border border-slate-100 text-slate-700 font-semibold flex items-center gap-3 p-3 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold flex items-center justify-center text-slate-400">
                                                <GripHorizontal size={12} />
                                            </div>
                                            {member}
                                        </div>
                                    )}
                                    {settings.tileStyle === 'card' && (
                                        <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 font-bold text-center border border-slate-100/50 shadow-sm text-sm break-words hover:shadow-md transition-shadow">
                                            {member}
                                        </div>
                                    )}
                                    {settings.tileStyle === 'orb' && (
                                        <div className="bg-white pl-1 pr-3 py-1.5 rounded-full text-sm font-bold text-slate-700 border border-slate-100 shadow-sm flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full ${THEME_BG_LIGHT[themeColor]} flex items-center justify-center text-xs`}>
                                                {member.charAt(0)}
                                            </div>
                                            {member}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        
        {!isGenerated && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 border-4 border-dashed border-slate-200/50 rounded-[3rem] bg-white/30 backdrop-blur-sm mx-auto max-w-2xl px-6 text-center">
                    <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }} 
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <Dice5 size={64} className="mb-6 opacity-20" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-500 mb-2">Ready?</h3>
                    <p className="font-medium opacity-50">Adjust settings and shuffle.</p>
                </div>
        )}
        </div>
    </div>
  );
};