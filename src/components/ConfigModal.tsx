import React, { useState, useEffect, useRef } from 'react';
import { RuntimeConfig } from '../pipeline/types';
import { X, Play, RefreshCw, AlertTriangle } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RuntimeConfig;
  onSave: (newConfig: RuntimeConfig) => void;
}

export const DEFAULT_CONFIG: RuntimeConfig = {
  fields: [
    { path: "full_name", type: "string", required: true },
    { path: "primary_email", from: "emails[0]", type: "string", required: true },
    { path: "phone", from: "phones[0]", type: "string", normalize: "E164" },
    { path: "skills", from: "skills[].name", type: "string[]", normalize: "canonical" }
  ],
  include_confidence: true,
  on_missing: "null"
};

export default function ConfigModal({ isOpen, onClose, config, onSave }: ConfigModalProps) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(config, null, 2));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state if config prop updates
  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2));
  }, [config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Configuration must be a JSON object.");
      }
      if (!Array.isArray(parsed.fields)) {
        throw new Error("Configuration must contain a 'fields' array.");
      }
      
      // Perform validation of field items
      parsed.fields.forEach((field: any, idx: number) => {
        if (!field.path) {
          throw new Error(`Field index ${idx} is missing the required 'path' property.`);
        }
        if (!field.type) {
          throw new Error(`Field '${field.path}' is missing the required 'type' property.`);
        }
      });

      if (parsed.on_missing && !['null', 'omit', 'error'].includes(parsed.on_missing)) {
        throw new Error("'on_missing' must be 'null', 'omit', or 'error'.");
      }

      setErrorMsg(null);
      onSave(parsed as RuntimeConfig);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid JSON syntax.");
    }
  };

  const handleReset = () => {
    setJsonText(JSON.stringify(DEFAULT_CONFIG, null, 2));
    setErrorMsg(null);
  };

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto focus the textarea on open
    const timer = setTimeout(() => {
      const textarea = document.getElementById('config-json-textarea');
      if (textarea) textarea.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose, jsonText, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        ref={modalRef}
        id="config-modal-container"
        className="w-full max-w-2xl bg-[#1E293B] border border-[#4F46E5]/20 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-[#F0F4FF] tracking-tight">
              Runtime Pipeline Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure candidate field mappings, required fields, and normalization rules.
            </p>
          </div>
          <button 
            id="close-config-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>JSON SCHEMA CONFIGURATION (JetBrains Mono)</span>
            <button 
              id="reset-config-defaults"
              onClick={handleReset} 
              className="flex items-center gap-1.5 text-[#22D3EE] hover:text-[#22D3EE]/80 transition-colors bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset to Defaults
            </button>
          </div>

          <div className="relative">
            <textarea
              id="config-json-textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              className="w-full p-4 bg-[#0B1120] text-slate-100 font-mono text-xs rounded-lg border border-slate-700 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              placeholder="Paste Configuration JSON here..."
            />
          </div>

          {/* Validation Error Alert */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-sans">
              <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block">Configuration Error</span>
                <span className="opacity-90">{errorMsg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#0F172A] border-t border-slate-800">
          <button
            id="cancel-config-modal"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-config-modal"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] hover:brightness-110 text-white rounded-lg font-medium text-sm transition-all shadow-md shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
