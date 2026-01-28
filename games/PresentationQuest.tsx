import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Play, Pause, CheckCircle, ChevronRight, RotateCcw, Clock, Settings, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_BG_LIGHT, THEME_TEXT_COLORS, THEME_COLORS } from '../types';
import { Modal } from '../components/ui/Modal';

interface Stage {
    id: string;
    label: string;
    duration: number; // minutes
}

const DEFAULT_STAGES: Stage[] = [
    { id: 'setup', label: 'Setup', duration: 2 },
    { id: 'presentation', label: 'Presentation', duration: 5 },
    { id: 'qa', label: 'Q & A', duration: 3 },
    { id: 'feedback', label: 'Feedback', duration: 2 },
];

export const PresentationQuest: React.FC = () => {
    const { students, themeColor } = useClass();
    const [currentGroup, setCurrentGroup] = useState(1);
    const [totalGroups, setTotalGroups] = useState(Math.ceil(students.length / 4) || 1);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
    const [timer, setTimer] = useState(stages[0]?.duration * 60 || 0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Timer Logic
    React.useEffect(() => {
        let interval: any;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    // Update timer if current stage duration changes while stopped
    React.useEffect(() => {
        if (!isTimerRunning && stages[currentStageIndex]) {
            setTimer(stages[currentStageIndex].duration * 60);
        }
    }, [stages, currentStageIndex]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const nextStage = () => {
        if (currentStageIndex < stages.length - 1) {
            const nextIdx = currentStageIndex + 1;
            setCurrentStageIndex(nextIdx);
            setTimer(stages[nextIdx].duration * 60);
            setIsTimerRunning(true);
        } else {
            // Finish Group
            finishGroup();
        }
    };

    const finishGroup = () => {
        setIsTimerRunning(false);
        if (currentGroup < totalGroups) {
            if(window.confirm("Finish this group and move to the next?")) {
                setCurrentGroup(p => p + 1);
                setCurrentStageIndex(0);
                setTimer(stages[0].duration * 60);
            }
        } else {
            alert("All groups finished!");
        }
    };

    // Settings Handlers
    const addStage = () => {
        setStages([...stages, { id: Date.now().toString(), label: 'New Stage', duration: 3 }]);
    };

    const removeStage = (idx: number) => {
        if (stages.length <= 1) return;
        const newStages = stages.filter((_, i) => i !== idx);
        setStages(newStages);
        if (currentStageIndex >= newStages.length) {
            setCurrentStageIndex(newStages.length - 1);
        }
    };

    const updateStage = (idx: number, field: keyof Stage, value: any) => {
        const newStages = [...stages];
        newStages[idx] = { ...newStages[idx], [field]: value };
        setStages(newStages);
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 animate-fade-in flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar / Progress */}
            <div className="w-full lg:w-1/3 space-y-4">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Class Progress</h3>
                    <div className="flex items-center justify-between mb-4">
                        <Button 
                            variant="secondary" 
                            className="!px-3 !py-1 text-xs" 
                            onClick={() => setTotalGroups(Math.max(1, totalGroups - 1))}
                        >-</Button>
                        <span className="font-bold text-slate-800 text-lg">{totalGroups} Groups Total</span>
                        <Button 
                            variant="secondary" 
                            className="!px-3 !py-1 text-xs" 
                            onClick={() => setTotalGroups(totalGroups + 1)}
                        >+</Button>
                    </div>
                    
                    <div className="space-y-2">
                        {Array.from({ length: totalGroups }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`p-3 rounded-xl flex items-center justify-between border-2 transition-all ${
                                    currentGroup === i + 1 
                                    ? `border-${themeColor}-500 bg-white shadow-md` 
                                    : (currentGroup > i + 1 ? 'bg-slate-50 border-transparent opacity-50' : 'bg-white border-slate-100')
                                }`}
                            >
                                <span className={`font-bold ${currentGroup === i + 1 ? THEME_TEXT_COLORS[themeColor] : 'text-slate-500'}`}>Group {i + 1}</span>
                                {currentGroup > i + 1 && <CheckCircle size={16} className="text-green-500"/>}
                                {currentGroup === i + 1 && <div className={`w-2 h-2 rounded-full ${THEME_COLORS[themeColor]} animate-pulse`}/>}
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setShowSettings(true)} icon={<Settings size={18}/>}>
                    Customize Stages
                </Button>
            </div>

            {/* Main Stage Area */}
            <div className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${THEME_COLORS[themeColor]}`}></div>
                
                <h2 className="text-slate-400 font-bold uppercase tracking-widest mb-2">Currently Presenting</h2>
                <h1 className="text-5xl font-black text-slate-800 mb-8">Group {currentGroup}</h1>

                {/* Stage Tracker */}
                <div className="flex items-center gap-2 mb-12 w-full justify-center">
                    {stages.map((stage, i) => (
                        <div key={stage.id} className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full transition-all ${
                                i === currentStageIndex ? `${THEME_COLORS[themeColor]} scale-125 ring-4 ring-offset-2 ring-slate-100` : (i < currentStageIndex ? 'bg-slate-300' : 'bg-slate-100')
                            }`} />
                            <span className={`text-xs font-bold ${i === currentStageIndex ? THEME_TEXT_COLORS[themeColor] : 'text-slate-300'}`}>{stage.label}</span>
                        </div>
                    ))}
                </div>

                {/* Timer */}
                <div className={`text-8xl font-black tabular-nums mb-8 ${timer < 30 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    {formatTime(timer)}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={() => setIsTimerRunning(!isTimerRunning)} icon={isTimerRunning ? <Pause size={20}/> : <Play size={20}/>}>
                        {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </Button>
                    <Button variant="secondary" onClick={() => setTimer(stages[currentStageIndex].duration * 60)} icon={<RotateCcw size={20}/>}>
                        Reset
                    </Button>
                    <Button 
                        onClick={nextStage} 
                        className="bg-slate-800 text-white hover:bg-slate-900"
                        icon={<ChevronRight size={20}/>}
                    >
                        {currentStageIndex === stages.length - 1 ? 'Finish Group' : 'Next Stage'}
                    </Button>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Customize Stages">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">Define the steps for each group presentation.</p>
                    {stages.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-xs font-bold text-slate-500">{idx+1}</span>
                            <input 
                                className="flex-1 bg-transparent font-bold text-slate-700 focus:outline-none"
                                value={stage.label}
                                onChange={(e) => updateStage(idx, 'label', e.target.value)}
                            />
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                <Clock size={14} className="text-slate-400"/>
                                <input 
                                    type="number" 
                                    className="w-12 text-center font-mono text-sm focus:outline-none"
                                    value={stage.duration}
                                    onChange={(e) => updateStage(idx, 'duration', parseInt(e.target.value) || 1)}
                                />
                                <span className="text-xs text-slate-400">min</span>
                            </div>
                            <button onClick={() => removeStage(idx)} className="p-2 text-slate-400 hover:text-red-500">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                    <Button variant="secondary" className="w-full" onClick={addStage} icon={<Plus size={16}/>}>
                        Add Stage
                    </Button>
                </div>
            </Modal>
        </div>
    );
};