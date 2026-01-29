import React, { useState, useRef } from 'react';
import { useClass } from '../context/ClassContext';
import { parseStudentInput } from '../utils/helpers';
import { Users, Upload, X, Check, Trash2, UserPlus, GripVertical } from 'lucide-react';
import { Button } from './ui/Button';
import { THEME_TEXT_COLORS, THEME_BG_LIGHT } from '../types';
import { motion, Reorder } from 'framer-motion';

export const StudentManager: React.FC = () => {
  const { students, setStudents, className, setClassName, themeColor, resetSession } = useClass();
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleAddManual = () => {
    if (!inputText.trim()) return;
    const newStudents = parseStudentInput(inputText);
    
    // Check for duplicates based on name
    const existingNames = new Set(students.map(s => s.name.toLowerCase()));
    const uniqueNewStudents = newStudents.filter(s => !existingNames.has(s.name.toLowerCase()));

    setStudents([...students, ...uniqueNewStudents]);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text); // Load into textarea for review
    };
    reader.readAsText(file);
  };

  // Drag Handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set transparent image to avoid default ghost
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newStudents = [...students];
    const draggedItem = newStudents[draggedItemIndex];
    newStudents.splice(draggedItemIndex, 1);
    newStudents.splice(index, 0, draggedItem);
    
    setStudents(newStudents);
    setDraggedItemIndex(index);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const studentCount = students.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:w-auto">
             <label className="block text-sm font-medium text-slate-400 mb-1 ml-1">Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="text-2xl md:text-3xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors w-full"
              placeholder="Enter Class Name"
            />
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> {studentCount} Students
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="danger" onClick={resetSession} icon={<Trash2 size={18}/>} className="w-full md:w-auto">
                Reset
             </Button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full order-1 md:order-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Add Students</h3>
            <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                 />
                 <Button 
                    variant="ghost" 
                    className="!px-3 !py-2 text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload size={16}/>}
                 >
                    Import CSV
                 </Button>
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste student names here...&#10;One name per line&#10;John Doe&#10;Jane Smith"
            className="w-full flex-1 min-h-[200px] p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:outline-none resize-none mb-4 font-mono text-sm"
          />
          
          <div className="flex justify-end">
            <Button onClick={handleAddManual} disabled={!inputText.trim()} icon={<UserPlus size={18}/>} className="w-full md:w-auto">
              Add to Class
            </Button>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[400px] md:h-auto order-2 md:order-2">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Class Roster</h3>
          {students.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl min-h-[200px]">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No students added yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
              {students.map((student, idx) => (
                <motion.div 
                    layout
                    key={student.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e as any, idx)}
                    onDragOver={(e) => onDragOver(e as any, idx)}
                    onDragEnd={onDragEnd}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                        opacity: draggedItemIndex === idx ? 0.5 : 1,
                        scale: draggedItemIndex === idx ? 1.02 : 1,
                        y: 0 
                    }}
                    className={`group flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 cursor-grab active:cursor-grabbing ${draggedItemIndex === idx ? 'shadow-lg border-indigo-200' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-300 cursor-grab">
                        <GripVertical size={16} />
                    </div>
                    <span className={`w-8 h-8 rounded-full ${THEME_BG_LIGHT[themeColor]} ${THEME_TEXT_COLORS[themeColor]} flex items-center justify-center text-sm font-bold`}>
                        {idx + 1}
                    </span>
                    <span className="font-medium text-slate-700">{student.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                        const newStudents = students.filter(s => s.id !== student.id);
                        setStudents(newStudents);
                    }}
                    className="text-slate-300 hover:text-red-500 p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};