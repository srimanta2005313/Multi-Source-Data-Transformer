import React from 'react';
import { Settings, Cpu, HardDrive, Download } from 'lucide-react';

interface HeaderProps {
  onOpenConfig: () => void;
  onExportWorkflow: () => void;
  modelStatus: 'connected' | 'disconnected' | 'checking';
}

export default function Header({ onOpenConfig, onExportWorkflow, modelStatus }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-indigo-500/20 bg-[#0B1120]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        {/* Glowing Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] rounded-lg blur-xs opacity-40"></div>
          <div className="relative w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#22D3EE] rounded-lg flex items-center justify-center font-bold text-black font-display text-xs tracking-tighter">
            CF
          </div>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-white tracking-tight uppercase leading-none">
            CandidateForge <span className="text-[#4F46E5] text-xs align-top ml-1 font-mono tracking-widest uppercase">v2.0</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-sans tracking-wider uppercase leading-none mt-1">
            Multi-Source Candidate Data Transformer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* ML model connection status badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[9px] font-bold tracking-wider ${
          modelStatus === 'connected' 
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10' 
            : modelStatus === 'checking'
            ? 'bg-amber-950/20 text-amber-400 border-amber-500/10'
            : 'bg-rose-950/20 text-rose-400 border-rose-500/10'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            modelStatus === 'connected' 
              ? 'bg-emerald-400 animate-pulse' 
              : modelStatus === 'checking'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-rose-500'
          }`} />
          MODEL_SERVER: {modelStatus.toUpperCase()}
        </div>

        {/* Live system state indicators */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 rounded-md font-mono text-[9px] font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PROMPT_ENGINE: ACTIVE
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

        {/* Export Workflow Button */}
        <button
          id="btn-export-workflow"
          onClick={onExportWorkflow}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-emerald-500/30 text-xs font-bold tracking-wider uppercase hover:bg-emerald-500/10 text-emerald-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Download size={12} /> Export Workflow
        </button>

        {/* Configuration trigger button */}
        <button
          id="btn-trigger-config"
          onClick={onOpenConfig}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-indigo-500/30 text-xs font-bold tracking-wider uppercase hover:bg-indigo-500/10 text-[#F0F4FF] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Settings size={12} /> Config
        </button>
      </div>
    </header>
  );
}
