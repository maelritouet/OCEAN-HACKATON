import React from 'react';
import { Compass, Headphones, Database, Volume2, VolumeX, Mic, Waves } from 'lucide-react';


interface HeaderProps {
  activeMode: string;
  setActiveMode: (mode: string) => void;
  ambientSoundOn: boolean;
  toggleAmbientSound: () => void;
  voiceOverOn: boolean;
  setVoiceOverOn: (val: boolean) => void;
  isSpeaking: boolean;
}

export default function Header({ activeMode, setActiveMode, ambientSoundOn, toggleAmbientSound, voiceOverOn, setVoiceOverOn, isSpeaking }: HeaderProps) {
  return (
    <header className="shrink-0 z-40 backdrop-blur-xl bg-white/95 border-b border-sky-200/80 px-4 lg:px-6 py-2.5 shadow-xs">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Titre */}
        <div className="flex items-center gap-3">
           <Waves className="w-8 h-8 text-sky-500" />
           <div><h1 className="font-extrabold text-sky-900">ThermoMaris</h1></div>
        </div>
        {/* Navigation Tabs */}
        <nav className="flex items-center bg-sky-100/80 p-1 rounded-xl">
           <button onClick={() => setActiveMode('explore')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${activeMode === 'explore' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}><Compass className="w-4 h-4 inline mr-2"/>Carte</button>
           <button onClick={() => setActiveMode('museum')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${activeMode === 'museum' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}><Headphones className="w-4 h-4 inline mr-2"/>Musée</button>
           <button onClick={() => setActiveMode('data')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${activeMode === 'data' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}><Database className="w-4 h-4 inline mr-2"/>Data</button>
           <button onClick={() => setActiveMode('expert')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${activeMode === 'expert' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>🧪 Expert</button>
        </nav>
        {/* Controls */}
        <div className="flex gap-2">
           <button onClick={toggleAmbientSound} className="p-2 border rounded-lg">{ambientSoundOn ? <Volume2 className="w-4 h-4 text-cyan-600" /> : <VolumeX className="w-4 h-4" />}</button>
           <button onClick={() => setVoiceOverOn(!voiceOverOn)} className="p-2 border rounded-lg"><Mic className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-pulse' : ''}`} /></button>
        </div>
      </div>
    </header>
  );
}