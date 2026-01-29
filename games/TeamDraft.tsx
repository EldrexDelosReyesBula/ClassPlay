import React, { useState, useEffect, useRef } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Shuffle, RotateCcw, ArrowRightLeft, Settings2, Edit2, GripHorizontal, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray } from '../utils/helpers';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';

interface Team {
  id: string;
  name: string;
  color: TeamColor;
  members: string[]; // Student IDs
}

interface TeamColor {
    bg: string;
    border: string;
    text: string;
    ring: string;
    name: string;
}

const COLOR_PALETTE: TeamColor[] = [
  { name: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', ring: 'ring-indigo-300' },
  { name: 'Rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', ring: 'ring-rose-300' },
  { name: 'Amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', ring: 'ring-amber-300' },
  { name: 'Teal', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', ring: 'ring-teal-300' },
  { name: 'Violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', ring: 'ring-violet-300' },
  { name: 'Sky', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', ring: 'ring-sky-300' },
  { name: 'Emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', ring: 'ring-emerald-300' },
  { name: 'Slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', ring: 'ring-slate-300' },
];

type DraftOrder = 'SEQUENTIAL' | 'SNAKE';

interface GameState {
    teams: Team[];
    unassigned: string[];
    draftOrder: DraftOrder;
}

const DB_KEY = 'landecs_game_draft';

export const TeamDraft: React.FC = () => {
  const { students } = useClass();
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassigned, setUnassigned] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState<DraftOrder>('SNAKE');
  
  // Drag State
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<string | 'bench' | null>(null);

  // Edit Team State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load state on mount
  useEffect(() => {
    const load = async () => {
        const saved = await loadGameState<GameState>(DB_KEY);
        if (saved) {
            // Verify if students still match (basic check)
            const allSavedIds = [...saved.unassigned, ...saved.teams.flatMap(t => t.members)];
            const currentIds = students.map(s => s.id);
            // If student list changed significantly, might want to reset or merge. 
            // For simplicity, if count mismatch, we reset to be safe, or just use saved.
            // Let's use saved but filter out deleted students.
            
            const validUnassigned = saved.unassigned.filter(id => currentIds.includes(id));
            const validTeams = saved.teams.map(t => ({
                ...t,
                members: t.members.filter(id => currentIds.includes(id))
            }));
            
            // Find students who are new and not in saved state
            const savedIdSet = new Set(allSavedIds);
            const newStudents = currentIds.filter(id => !savedIdSet.has(id));

            setTeams(validTeams);
            setUnassigned([...validUnassigned, ...newStudents]);
            setDraftOrder(saved.draftOrder);
            setLastSaved(new Date());
        } else {
            setUnassigned(students.map(s => s.id));
            initializeTeams(2);
        }
    };
    load();
  }, []); // Run once on mount

  // Save state on change
  useEffect(() => {
      if (teams.length > 0) {
        saveGameState(DB_KEY, { teams, unassigned, draftOrder });
        setLastSaved(new Date());
      }
  }, [teams, unassigned, draftOrder]);

  const initializeTeams = (count: number) => {
    const newTeams: Team[] = Array.from({ length: count }, (_, i) => ({
      id: `team-${Date.now()}-${i}`,
      name: `Team ${i + 1}`,
      color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      members: []
    }));
    setTeams(newTeams);
  };

  const updateTeamCount = (count: number) => {
      let currentTeams = [...teams];
      if (count < currentTeams.length) {
          const removed = currentTeams.slice(count);
          const membersToReturn = removed.flatMap(t => t.members);
          setUnassigned(prev => [...prev, ...membersToReturn]);
          currentTeams = currentTeams.slice(0, count);
      } else if (count > currentTeams.length) {
          for (let i = currentTeams.length; i < count; i++) {
              currentTeams.push({
                  id: `team-${Date.now()}-${i}`,
                  name: `Team ${i + 1}`,
                  color: COLOR_PALETTE[i % COLOR_PALETTE.length],
                  members: []
              });
          }
      }
      setTeams(currentTeams);
  };

  const autoDraft = () => {
    const allIds = [...unassigned, ...teams.flatMap(t => t.members)];
    const shuffled = shuffleArray(allIds);
    
    const newTeams = teams.map(t => ({ ...t, members: [] as string[] }));
    
    shuffled.forEach((id, idx) => {
        let teamIdx = 0;
        
        if (draftOrder === 'SEQUENTIAL') {
            teamIdx = idx % newTeams.length;
        } else {
            // Snake Draft
            const cycle = Math.floor(idx / newTeams.length);
            const isEvenCycle = cycle % 2 === 0;
            teamIdx = isEvenCycle 
                ? (idx % newTeams.length) 
                : (newTeams.length - 1 - (idx % newTeams.length));
        }
        
        newTeams[teamIdx].members.push(id);
    });

    setTeams(newTeams);
    setUnassigned([]);
  };

  const resetAll = async () => {
    if(confirm("Reset all teams and move everyone to the bench?")) {
        const allIds = students.map(s => s.id);
        setTeams(teams.map(t => ({ ...t, members: [] })));
        setUnassigned(allIds);
        setSelectedStudentId(null);
        await clearGameState(DB_KEY);
    }
  };

  const handleMove = (studentId: string, targetTeamId: string | 'bench') => {
      // Find where student currently is
      const isUnassigned = unassigned.includes(studentId);
      
      let newUnassigned = [...unassigned];
      let newTeams = [...teams];

      // Remove from source
      if (isUnassigned) {
          newUnassigned = newUnassigned.filter(id => id !== studentId);
      } else {
          newTeams = newTeams.map(t => ({
              ...t,
              members: t.members.filter(id => id !== studentId)
          }));
      }

      // Add to target
      if (targetTeamId === 'bench') {
          newUnassigned.push(studentId);
      } else {
          newTeams = newTeams.map(t => {
              if (t.id === targetTeamId) {
                  return { ...t, members: [...t.members, studentId] };
              }
              return t;
          });
      }

      setUnassigned(newUnassigned);
      setTeams(newTeams);
      setSelectedStudentId(null);
  };

  // --- Drag and Drop Logic ---

  const onDragStart = (e: React.DragEvent, studentId: string) => {
      setDraggedStudentId(studentId);
      e.dataTransfer.effectAllowed = "move";
      // Optional: Set ghost image
  };

  const onDragOver = (e: React.DragEvent, containerId: string | 'bench') => {
      e.preventDefault();
      setDragOverTeamId(containerId);
  };

  const onDrop = (e: React.DragEvent, targetId: string | 'bench') => {
      e.preventDefault();
      setDragOverTeamId(null);
      if (draggedStudentId) {
          handleMove(draggedStudentId, targetId);
          setDraggedStudentId(null);
      }
  };

  // --- Edit Logic ---
  const saveTeamEdit = (name: string, color: TeamColor) => {
      if (!editingTeam) return;
      setTeams(teams.map(t => t.id === editingTeam.id ? { ...t, name, color } : t));
      setEditingTeam(null);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-fade-in pb-32">
        {/* Controls */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex items-center justify-between w-full md:w-auto gap-4 bg-slate-100 p-2 rounded-xl">
                    <button onClick={() => updateTeamCount(Math.max(2, teams.length - 1))} className="w-8 h-8 bg-white rounded-lg font-bold shadow-sm hover:bg-slate-50">-</button>
                    <span className="font-bold text-slate-700 w-24 text-center">{teams.length} Teams</span>
                    <button onClick={() => updateTeamCount(Math.min(12, teams.length + 1))} className="w-8 h-8 bg-white rounded-lg font-bold shadow-sm hover:bg-slate-50">+</button>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm font-medium bg-slate-50 p-2 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => setDraftOrder('SEQUENTIAL')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${draftOrder === 'SEQUENTIAL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                    >
                        Sequential
                    </button>
                    <button 
                         onClick={() => setDraftOrder('SNAKE')}
                         className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all ${draftOrder === 'SNAKE' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                    >
                        Snake
                    </button>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto items-center">
                {lastSaved && (
                     <div className="hidden lg:flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md mr-2 animate-pulse">
                         <Save size={12}/> Saved
                     </div>
                )}
                <Button onClick={resetAll} variant="secondary" icon={<RotateCcw size={18}/>} className="flex-1 md:flex-none">Reset</Button>
                <Button onClick={autoDraft} icon={<Shuffle size={18}/>} className="flex-1 md:flex-none">Auto Draft</Button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Unassigned / Bench */}
            <div 
                className={`w-full lg:w-72 bg-slate-100/50 rounded-[2rem] p-4 min-h-[200px] border-2 transition-all ${
                    (selectedStudentId && !unassigned.includes(selectedStudentId)) || dragOverTeamId === 'bench' 
                    ? 'border-indigo-400 bg-indigo-50/50 cursor-pointer shadow-inner' 
                    : 'border-dashed border-slate-300'
                }`}
                onClick={() => selectedStudentId && !unassigned.includes(selectedStudentId) && handleMove(selectedStudentId, 'bench')}
                onDragOver={(e) => onDragOver(e, 'bench')}
                onDrop={(e) => onDrop(e, 'bench')}
                onDragLeave={() => setDragOverTeamId(null)}
            >
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Bench ({unassigned.length})</h3>
                    <Users size={16} className="text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {unassigned.map(id => (
                            <motion.div
                                layoutId={id}
                                key={id}
                                draggable
                                onDragStart={(e) => onDragStart(e as any, id)}
                                onClick={(e) => { e.stopPropagation(); setSelectedStudentId(selectedStudentId === id ? null : id); }}
                                className={`
                                    cursor-grab active:cursor-grabbing px-3 py-2 rounded-xl text-sm font-bold shadow-sm transition-all text-left w-full flex justify-between items-center group
                                    ${selectedStudentId === id ? 'bg-slate-800 text-white scale-105 ring-2 ring-indigo-300' : 'bg-white text-slate-700 hover:scale-102 hover:shadow-md'}
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <GripHorizontal size={12} className="opacity-0 group-hover:opacity-50" />
                                    {getStudentName(id)}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {unassigned.length === 0 && <div className="w-full text-center text-slate-400 py-8 text-sm italic">Empty</div>}
                </div>
            </div>

            {/* Teams */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                {teams.map((team) => {
                    const isTarget = (selectedStudentId && !team.members.includes(selectedStudentId)) || dragOverTeamId === team.id;

                    return (
                        <div 
                            key={team.id}
                            onClick={() => isTarget && selectedStudentId && handleMove(selectedStudentId, team.id)}
                            onDragOver={(e) => onDragOver(e, team.id)}
                            onDrop={(e) => onDrop(e, team.id)}
                            onDragLeave={() => setDragOverTeamId(null)}
                            className={`rounded-[2rem] p-5 border-2 transition-all min-h-[200px] flex flex-col ${team.color.bg} ${team.color.border} 
                                ${isTarget ? `ring-4 ring-offset-2 ${team.color.ring} cursor-pointer scale-[1.02] shadow-xl` : ''}
                            `}
                        >
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/5">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-black text-lg ${team.color.text}`}>{team.name}</h3>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingTeam(team); }} className="p-1.5 rounded-full hover:bg-black/5 text-black/30 transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                                <span className="bg-white/60 px-2 py-0.5 rounded-lg text-xs font-bold">{team.members.length}</span>
                            </div>

                            <div className="flex-1 space-y-2">
                                <AnimatePresence>
                                    {team.members.map(id => (
                                        <motion.div
                                            layoutId={id}
                                            key={id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e as any, id)}
                                            onClick={(e) => { e.stopPropagation(); setSelectedStudentId(selectedStudentId === id ? null : id); }}
                                            className={`
                                                w-full text-left px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all flex justify-between items-center cursor-grab active:cursor-grabbing group
                                                ${selectedStudentId === id ? 'bg-slate-800 text-white scale-105 ring-2 ring-white/50' : 'bg-white/80 hover:bg-white text-slate-800'}
                                            `}
                                        >
                                            <span className="flex items-center gap-2">
                                                 <GripHorizontal size={12} className="opacity-0 group-hover:opacity-30" />
                                                {getStudentName(id)}
                                            </span>
                                            {selectedStudentId === id && <ArrowRightLeft size={14}/>}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {team.members.length === 0 && !isTarget && (
                                    <div className="text-center py-8 opacity-30 text-sm font-bold italic">Drop here</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Edit Team Modal */}
        <Modal 
            isOpen={!!editingTeam} 
            onClose={() => setEditingTeam(null)} 
            title="Customize Team"
        >
            {editingTeam && (
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 block">Team Name</label>
                        <input 
                            value={editingTeam.name}
                            onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                            className="w-full text-2xl font-bold border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-2 bg-transparent text-slate-800"
                        />
                    </div>

                    <div>
                         <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Team Color</label>
                         <div className="grid grid-cols-4 gap-3">
                             {COLOR_PALETTE.map((c) => (
                                 <button
                                    key={c.name}
                                    onClick={() => setEditingTeam({...editingTeam, color: c})}
                                    className={`h-12 rounded-xl transition-all border-2 flex items-center justify-center ${c.bg} ${c.border} ${editingTeam.color.name === c.name ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : 'hover:scale-105'}`}
                                 >
                                    {editingTeam.color.name === c.name && <Check size={16} className={c.text} />}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button className="w-full" onClick={() => saveTeamEdit(editingTeam.name, editingTeam.color)}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};