import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Braces, Github, Linkedin, FileText, StickyNote, Upload, CheckCircle2, Trash2 } from 'lucide-react';

interface SourceInputs {
  csv: string;
  ats_json: string;
  github_url: string;
  linkedin_text: string;
  resume_base64: string;
  resume_filename: string;
  notes: string;
}

interface SourceInputsPanelProps {
  inputs: SourceInputs;
  setInputs: React.Dispatch<React.SetStateAction<SourceInputs>>;
  onLoadSample: () => void;
  onClear: () => void;
  onRunPipeline: () => void;
  isProcessing: boolean;
}

type TabType = 'csv' | 'ats_json' | 'github' | 'linkedin' | 'resume' | 'notes';

export default function SourceInputsPanel({
  inputs,
  setInputs,
  onLoadSample,
  onClear,
  onRunPipeline,
  isProcessing
}: SourceInputsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('csv');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'csv', label: 'CSV', icon: FileSpreadsheet, key: 'csv' },
    { id: 'ats_json', label: 'ATS JSON', icon: Braces, key: 'ats_json' },
    { id: 'github', label: 'GitHub', icon: Github, key: 'github_url' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, key: 'linkedin_text' },
    { id: 'resume', label: 'Resume', icon: FileText, key: 'resume_base64' },
    { id: 'notes', label: 'Notes', icon: StickyNote, key: 'notes' }
  ];

  // Check if a source has content
  const isSourceActive = (tabId: TabType): boolean => {
    if (tabId === 'resume') return !!inputs.resume_base64;
    return !!inputs[tabId as keyof SourceInputs]?.trim();
  };

  // Handle Text Changes
  const handleInputChange = (key: keyof SourceInputs, value: string) => {
    let cleanedValue = value;
    if (key === "github_url") {
      // Clean up GitHub URL: trim whitespace, remove extra spaces
      cleanedValue = value.trim().replace(/\s+/g, '');
    }
    setInputs(prev => ({ ...prev, [key]: cleanedValue }));
  };

  // Convert File to Base64
  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      alert("Please upload a valid PDF, DOCX, or TXT file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract the raw base64 string from data URL
      const base64 = result.split(',')[1] || result;
      setInputs(prev => ({
        ...prev,
        resume_base64: base64,
        resume_filename: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeResume = () => {
    setInputs(prev => ({
      ...prev,
      resume_base64: "",
      resume_filename: ""
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-indigo-500/10 rounded-xl overflow-hidden shadow-xl">
      {/* Title Header with Sample Data triggers */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0F172A]/80 border-b border-indigo-500/10">
        <h2 className="font-display font-bold text-[#F0F4FF] tracking-widest text-[10px] uppercase">
          Source Selection
        </h2>
        <div className="flex gap-2">
          <button
            id="btn-load-sample"
            onClick={onLoadSample}
            className="text-[10px] font-bold uppercase tracking-wider text-[#22D3EE] hover:text-[#22D3EE]/80 bg-[#22D3EE]/5 px-2.5 py-1 rounded border border-[#22D3EE]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Load Sample
          </button>
          <button
            id="btn-clear-sources"
            onClick={onClear}
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white px-2.5 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Tabs as a beautiful grid to match "Source Selection" in Design HTML */}
      <div className="p-4 border-b border-indigo-500/10 bg-[#0F172A]/20">
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] uppercase font-bold tracking-tight">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const loaded = isSourceActive(tab.id as TabType);
            return (
              <button
                id={`tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab(tab.id as TabType);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active 
                    ? 'bg-[#4F46E5] text-white border-indigo-400/30' 
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon size={12} className={loaded ? "text-[#22D3EE] mb-1" : "text-slate-500 mb-1"} />
                <span className="text-[9px]">{tab.label}</span>
                {loaded && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-xs shadow-[#22D3EE]/50 animate-pulse absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents Frame */}
      <div className="flex-1 p-5 min-h-[280px] bg-slate-900/10 flex flex-col justify-between">
        <div className="flex-1 flex flex-col justify-start">
          {/* CSV INPUT */}
          {activeTab === 'csv' && (
            <div className="flex flex-col h-full space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>RECRUITER CSV BLOB (comma separated)</span>
                {isSourceActive('csv') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>
              <textarea
                id="textarea-csv"
                value={inputs.csv}
                onChange={(e) => handleInputChange('csv', e.target.value)}
                placeholder="full_name,email,phone,current_company,title&#10;Alex Rivera,alex.rivera@example.com,+1-555-0199,TechCorp,Senior Engineer"
                className="w-full flex-1 min-h-[180px] p-3.5 bg-[#0B1120] text-slate-100 font-mono text-[11px] rounded-lg border border-slate-800 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* ATS JSON INPUT */}
          {activeTab === 'ats_json' && (
            <div className="flex flex-col h-full space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>ATS RECORD JSON</span>
                {isSourceActive('ats_json') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>
              <textarea
                id="textarea-ats-json"
                value={inputs.ats_json}
                onChange={(e) => handleInputChange('ats_json', e.target.value)}
                placeholder={`{\n  "fullname": "Alex Rivera",\n  "email_address": "alex.rivera@example.com",\n  "phone_number": "+15550199",\n  "company": "TechCorp",\n  "role": "Senior Engineer"\n}`}
                className="w-full flex-1 min-h-[180px] p-3.5 bg-[#0B1120] text-slate-100 font-mono text-[11px] rounded-lg border border-slate-800 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* GITHUB URL INPUT */}
          {activeTab === 'github' && (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>GITHUB PROFILE URL OR USERNAME</span>
                {isSourceActive('github') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>
              <input
                id="input-github-url"
                type="text"
                value={inputs.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                placeholder="e.g. https://github.com/torvalds"
                className="w-full px-4 py-3 bg-[#0B1120] text-slate-100 rounded-lg border border-slate-800 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none text-xs transition-all font-mono"
              />
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Fetches profile details and repository data in real-time via GitHub REST API to intelligently compile skills.
              </p>
            </div>
          )}

          {/* LINKEDIN PASTED TEXT */}
          {activeTab === 'linkedin' && (
            <div className="flex flex-col h-full space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>PASTED LINKEDIN COPYTEXT</span>
                {isSourceActive('linkedin') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>
              <textarea
                id="textarea-linkedin"
                value={inputs.linkedin_text}
                onChange={(e) => handleInputChange('linkedin_text', e.target.value)}
                placeholder="Paste text copied from LinkedIn..."
                className="w-full flex-1 min-h-[180px] p-3.5 bg-[#0B1120] text-slate-100 font-sans text-xs rounded-lg border border-slate-800 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* RESUME FILE UPLOAD */}
          {activeTab === 'resume' && (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>RESUME ATTACHMENT</span>
                {isSourceActive('resume') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>

              {!inputs.resume_base64 ? (
                <div
                  id="dropzone-resume"
                  tabIndex={0}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    dragActive 
                      ? 'border-[#22D3EE] bg-cyan-950/10' 
                      : 'border-indigo-500/20 hover:border-[#4F46E5] bg-slate-900/40'
                  }`}
                >
                  <input
                    id="file-input-resume"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload size={24} className={`mb-2 ${dragActive ? 'text-[#22D3EE]' : 'text-slate-500'}`} />
                  <p className="text-xs text-slate-300 font-sans font-medium">
                    Drag & Drop, or <span className="text-[#22D3EE] hover:underline">browse files</span>
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1 font-sans">
                    PDF, DOCX, or TXT format
                  </p>
                </div>
              ) : (
                <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#4F46E5]/10 p-2 rounded text-[#4F46E5]">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs text-white font-semibold font-sans truncate max-w-[150px]">
                        {inputs.resume_filename}
                      </h4>
                      <span className="text-[9px] text-slate-500 font-mono">
                        File Loaded
                      </span>
                    </div>
                  </div>
                  <button
                    id="btn-remove-resume"
                    onClick={removeResume}
                    className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NOTES TEXTAREA */}
          {activeTab === 'notes' && (
            <div className="flex flex-col h-full space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>FREEFORM RECRUITER NOTES</span>
                {isSourceActive('notes') && <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>}
              </div>
              <textarea
                id="textarea-notes"
                value={inputs.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Paste recruiter scratchpad notes..."
                className="w-full flex-1 min-h-[180px] p-3.5 bg-[#0B1120] text-slate-100 font-sans text-xs rounded-lg border border-slate-800 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Run CTA */}
      <div className="p-4 bg-[#0F172A]/80 border-t border-indigo-500/10">
        <button
          id="btn-run-pipeline"
          onClick={onRunPipeline}
          disabled={isProcessing}
          className={`w-full py-4 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] text-white rounded-xl font-display font-bold text-sm tracking-widest uppercase shadow-lg shadow-indigo-500/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isProcessing ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Transforming...</span>
            </div>
          ) : (
            <span>Run Pipeline</span>
          )}
        </button>
      </div>
    </div>
  );
}
