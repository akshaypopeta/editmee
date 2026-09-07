import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export const EducationStudioWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gpa' | 'flashcards' | 'citation'>('gpa');
  const [copied, setCopied] = useState(false);

  // GPA State
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Computer Science 101', grade: 'A', credits: 4 },
    { id: '2', name: 'Calculus II', grade: 'A-', credits: 4 },
    { id: '3', name: 'Technical Writing', grade: 'B+', credits: 3 },
    { id: '4', name: 'Physics Mechanics', grade: 'A', credits: 4 },
  ]);

  // Flashcard State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', front: 'What is WebAssembly (Wasm)?', back: 'A binary instruction format for a stack-based virtual machine allowing near-native execution speed in browsers.' },
    { id: '2', front: 'What is Time Complexity of QuickSort on average?', back: 'O(N log N)' },
    { id: '3', front: 'What does CSP stand for in Web Security?', back: 'Content Security Policy' },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Citation State
  const [citeAuthor, setCiteAuthor] = useState('Knuth, Donald E.');
  const [citeTitle, setCiteTitle] = useState('The Art of Computer Programming');
  const [citeYear, setCiteYear] = useState('1997');
  const [citePublisher, setCitePublisher] = useState('Addison-Wesley');
  const [citeStyle, setCiteStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');

  // GPA Calculation
  const gradePoints: Record<string, number> = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.3,
    D: 1.0,
    F: 0.0,
  };

  const calculatedGpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach((c) => {
      const pts = gradePoints[c.grade] ?? 0;
      totalPoints += pts * c.credits;
      totalCredits += c.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [courses]);

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, name: 'New Course', grade: 'A', credits: 3 },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, val: any) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  // Citation Generation
  const formattedCitation = useMemo(() => {
    if (citeStyle === 'apa') {
      return `${citeAuthor} (${citeYear}). *${citeTitle}*. ${citePublisher}.`;
    }
    if (citeStyle === 'mla') {
      return `${citeAuthor}. *${citeTitle}*. ${citePublisher}, ${citeYear}.`;
    }
    if (citeStyle === 'chicago') {
      return `${citeAuthor}. ${citeYear}. *${citeTitle}*. ${citePublisher}.`;
    }
    return '';
  }, [citeAuthor, citeTitle, citeYear, citePublisher, citeStyle]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Student & Education Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Academic Lab
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Weighted GPA calculator, interactive flashcard study decks, and APA/MLA academic citation generator.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('gpa')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'gpa' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            GPA Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'flashcards' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Flashcard Deck
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('citation')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'citation' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Citation Builder
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'gpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Course & Grade Registry
              </h3>
              <button
                type="button"
                onClick={addCourse}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCourse(c.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                  <select
                    value={c.grade}
                    onChange={(e) => updateCourse(c.id, 'grade', e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {Object.keys(gradePoints).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={c.credits}
                      onChange={(e) => updateCourse(c.id, 'credits', Number(e.target.value))}
                      className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                    />
                    <span className="text-[10px] font-bold text-slate-400">CR</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourse(c.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white text-center space-y-4">
            <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400 w-fit mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Cumulative GPA</div>
            <div className="text-6xl font-black font-mono text-emerald-400">{calculatedGpa}</div>
            <p className="text-xs text-slate-400">
              Based on {courses.reduce((acc, c) => acc + c.credits, 0)} total credit hours across {courses.length} courses.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900 max-w-2xl mx-auto text-center">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>
            <span className="text-red-600">Click card to flip</span>
          </div>

          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="h-64 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-center cursor-pointer text-white shadow-xl transition-all duration-300 transform hover:scale-101"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 block">
                {isCardFlipped ? 'Answer' : 'Question / Prompt'}
              </span>
              <p className="text-lg font-bold leading-relaxed">
                {isCardFlipped
                  ? flashcards[currentCardIndex]?.back
                  : flashcards[currentCardIndex]?.front}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={currentCardIndex === 0}
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex((i) => Math.max(0, i - 1));
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              Flip Card
            </button>
            <button
              type="button"
              disabled={currentCardIndex === flashcards.length - 1}
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'citation' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex gap-2 border-b border-slate-100 pb-3">
            {(['apa', 'mla', 'chicago'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setCiteStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                  citeStyle === style ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {style} 7th/9th
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Author(s)</label>
              <input
                type="text"
                value={citeAuthor}
                onChange={(e) => setCiteAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Book / Article Title</label>
              <input
                type="text"
                value={citeTitle}
                onChange={(e) => setCiteTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Year of Publication</label>
              <input
                type="text"
                value={citeYear}
                onChange={(e) => setCiteYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Publisher</label>
              <input
                type="text"
                value={citePublisher}
                onChange={(e) => setCitePublisher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Formatted Bibliography Entry:</span>
            <p className="text-sm font-serif text-emerald-400">{formattedCitation}</p>
            <button
              type="button"
              onClick={() => handleCopy(formattedCitation)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Citation'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const educationStudioToolDef: ToolDefinition = {
  id: 'education-studio',
  name: 'Student & Education Studio Pro',
  category: 'education',
  subcategory: 'academic',
  description: 'Academic student suite featuring weighted GPA calculator, interactive flashcard deck, and citation builder.',
  iconName: 'GraduationCap',
  version: '2.0.0',
  tags: ['education', 'gpa', 'flashcards', 'citation', 'apa', 'mla', 'student', 'studio'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: EducationStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Education Studio Ready' };
  },
};
