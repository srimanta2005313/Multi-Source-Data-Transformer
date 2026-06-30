import React from 'react';
import { PipelineTraceStep } from '../pipeline/types';
import { Database, Search, Sparkles, GitMerge, CheckSquare, Send, CheckCircle2, XCircle, AlertCircle, Clock, Cpu } from 'lucide-react';

interface PipelineTracePanelProps {
  steps: PipelineTraceStep[];
  logs: string[];
  warnings: string[];
  isProcessing: boolean;
}

export default function PipelineTracePanel({
  steps,
  logs,
  warnings,
  isProcessing
}: PipelineTracePanelProps) {

  // Map step names to icons
  const getStepIcon = (stepName: string) => {
    switch (stepName) {
      case 'Ingest': return Database;
      case 'Extract': return Search;
      case 'Model Inference': return Cpu;
      case 'Normalize': return Sparkles;
      case 'Merge': return GitMerge;
      case 'Validate': return CheckSquare;
      case 'Project': return Send;
      default: return Database;
    }
  };

  // Helper for status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'done':
        return {
          iconBg: 'bg-[#10B981] text-black border-2 border-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          lineColor: 'bg-[#10B981]/60',
          badge: 'bg-emerald-500/10 text-[#10B981] border-emerald-500/20'
        };
      case 'running':
        return {
          iconBg: 'bg-[#4F46E5] text-white border-2 border-slate-950 animate-pulse',
          lineColor: 'bg-indigo-500/20',
          badge: 'bg-indigo-500/10 text-[#22D3EE] border-indigo-500/20'
        };
      case 'error':
        return {
          iconBg: 'bg-rose-500 text-black border-2 border-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          lineColor: 'bg-rose-500/20',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      default:
        return {
          iconBg: 'bg-slate-700 text-slate-400 border-2 border-slate-950',
          lineColor: 'bg-slate-800/40',
          badge: 'bg-slate-850 text-slate-500 border-slate-800'
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1120] border border-indigo-500/10 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 bg-[#0F172A]/80 border-b border-indigo-500/10 flex items-center justify-between">
        <h2 className="font-display font-bold text-[#F0F4FF] tracking-widest text-[10px] uppercase">
          Pipeline Trace Engine
        </h2>
        {isProcessing && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-[#22D3EE] border border-indigo-500/25 animate-pulse font-mono uppercase font-bold tracking-wider">
            Transforming...
          </span>
        )}
      </div>

      {/* Steps Visual Grid Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Timeline representation */}
        <div className="relative space-y-5">
          {steps.map((step, idx) => {
            const IconComponent = getStepIcon(step.step);
            const style = getStatusStyles(step.status);
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.step} className="flex gap-4 relative group">
                
                {/* Visual Connector Line */}
                {!isLast && (
                  <div className={`absolute left-[15px] top-8 w-[2px] h-[calc(100%-4px)] transition-all ${style.lineColor} ${step.status === 'running' ? 'animate-pulse bg-gradient-to-b from-[#4F46E5] to-slate-800' : ''}`} />
                )}

                {/* Left side circular node containing status */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all z-10 shrink-0 ${style.iconBg}`}>
                  {step.status === 'done' ? (
                    <span className="text-[10px] font-bold">✓</span>
                  ) : step.status === 'running' ? (
                    <span className="text-[10px] font-bold">•</span>
                  ) : step.status === 'error' ? (
                    <span className="text-[10px] font-bold">✕</span>
                  ) : (
                    <span className="text-[10px] font-bold">○</span>
                  )}
                </div>

                {/* Right side textual details */}
                <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-lg p-3.5 space-y-1 hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-wide uppercase font-display">
                      {step.step}
                    </span>
                    <div className="flex items-center gap-2">
                      {step.duration_ms > 0 && (
                        <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/80">
                          <Clock size={8} /> {step.duration_ms}ms
                        </span>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded border font-mono tracking-wider font-bold uppercase ${style.badge}`}>
                        {step.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    {step.step === 'Ingest' && "Parses inputs using native format parsers (PapaParse, mammoth, pdf-parse, GitHub REST)."}
                    {step.step === 'Extract' && "Translates structured columns or scans text via regex/lexicon mappings to capture fields."}
                    {step.step === 'Model Inference' && "Executes candidate categorization and extracts key skills with dynamic confidence scores."}
                    {step.step === 'Normalize' && "Applies strict standardization (E.164, YYYY-MM dates, ISO-3166 countries, title-casing)."}
                    {step.step === 'Merge' && "Groups profiles and merges them with structured > unstructured conflict resolution."}
                    {step.step === 'Validate' && "Audits output properties (regex assertions, required fields, and confidence bounds)."}
                    {step.step === 'Project' && "Remaps resulting schema keys according to active configuration constraints."}
                  </p>

                  {/* Inline Error messages */}
                  {step.status === 'error' && step.message && (
                    <div className="mt-2 text-[10px] bg-rose-950/20 border border-rose-500/20 text-rose-300 p-2 rounded flex items-start gap-2.5">
                      <AlertCircle className="shrink-0 text-rose-400 mt-0.5" size={12} />
                      <span className="font-mono leading-relaxed">{step.message}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Console logs output */}
        {logs.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-indigo-500/10">
            <span className="text-[10px] text-slate-500 font-bold block tracking-widest uppercase">
              Pipeline Output Trace
            </span>
            <div className="bg-[#0B1120] border border-indigo-500/5 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
              {logs.map((log, idx) => {
                let textClass = "text-slate-400";
                if (log.includes("Error") || log.includes("failed")) textClass = "text-rose-400";
                else if (log.includes("Warning") || log.includes("Conflict")) textClass = "text-amber-400";
                else if (log.includes("completed") || log.includes("Success")) textClass = "text-emerald-400";
                else if (log.includes("started") || log.includes("Ingesting")) textClass = "text-[#22D3EE]";

                return (
                  <div key={idx} className={`leading-relaxed border-b border-slate-800/10 pb-1 ${textClass}`}>
                    <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Warnings Banner */}
        {warnings.length > 0 && (
          <div className="p-3 bg-amber-950/10 border border-amber-500/10 text-amber-300 rounded-lg text-xs space-y-1">
            <span className="font-semibold flex items-center gap-1.5 font-sans">
              <AlertCircle size={14} className="text-amber-400" /> Pipeline Notifications
            </span>
            <ul className="list-disc pl-5 font-mono text-[10px] text-amber-300/80 space-y-0.5">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
