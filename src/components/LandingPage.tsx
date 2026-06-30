import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, GitMerge, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

export default function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 20);
      setMouseY((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: FileText,
      title: "6 Source Types",
      description: "CSV, ATS JSON, GitHub, LinkedIn, Resume, and Notes — ingest from any source you have."
    },
    {
      icon: GitMerge,
      title: "Confidence-scored Merging",
      description: "Intelligently merge data with confidence scores and provenance tracking."
    },
    {
      icon: ShieldCheck,
      title: "Configurable Schema",
      description: "Customize your output schema to match your exact requirements."
    },
    {
      icon: Zap,
      title: "Real-time Pipeline Trace",
      description: "Watch the transformation happen step-by-step with real-time logging."
    }
  ];

  const stats = [
    { value: "6", label: "Source Types" },
    { value: "50+", label: "Skill Mappings" },
    { value: "11", label: "Canonical Fields" },
    { value: "100%", label: "Provenance Tracked" }
  ];

  const pipelineSteps = [
    { step: "Ingest", icon: FileText },
    { step: "Extract", icon: Zap },
    { step: "Normalize", icon: GitMerge },
    { step: "Merge", icon: GitMerge },
    { step: "Score", icon: ShieldCheck },
    { step: "Output", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4F46E5]/10 border border-[#4F46E5]/20 text-[#22D3EE] text-xs font-bold tracking-wider uppercase mb-8">
            <Zap size={12} />
            New: Provenance Verification System
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            CandidateForge
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            One trustworthy profile, from every source you have.
          </p>

          {/* Node Merge Diagram */}
          <div 
            className="mb-16"
            style={{
              transform: `rotateX(${mouseY * 0.1}deg) rotateY(${mouseX * 0.1}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <svg viewBox="0 0 800 300" className="w-full max-w-4xl mx-auto">
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Top Nodes */}
              {[
                { x: 80, label: 'CSV', color: '#4F46E5' },
                { x: 200, label: 'ATS JSON', color: '#6366F1' },
                { x: 320, label: 'GitHub', color: '#818CF8' },
                { x: 440, label: 'LinkedIn', color: '#A5B4FC' },
                { x: 560, label: 'Resume', color: '#C7D2FE' },
                { x: 680, label: 'Notes', color: '#E0E7FF' }
              ].map((node, idx) => (
                <g key={idx}>
                  <circle cx={node.x} cy={60} r={20} fill="#1E293B" stroke={node.color} strokeWidth="2" />
                  <text x={node.x} y={65} textAnchor="middle" fill={node.color} fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {node.label}
                  </text>
                  <path d={`M ${node.x} 80 Q ${node.x} 150 400 200`} stroke="url(#lineGrad)" strokeWidth="2" fill="none" opacity="0.6">
                    <animate attributeName="stroke-dasharray" from="0,500" to="500,0" dur={`${1.5 + idx * 0.2}s`} repeatCount="indefinite" />
                  </path>
                </g>
              ))}

              {/* Center Node */}
              <g filter="url(#glow)">
                <circle cx={400} cy={240} r={40} fill="#0F172A" stroke="#22D3EE" strokeWidth="3" />
                <text x={400} y={245} textAnchor="middle" fill="#22D3EE" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  Canonical
                </text>
                <text x={400} y={260} textAnchor="middle" fill="#22D3EE" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  Profile
                </text>
              </g>
            </svg>
          </div>

          {/* CTA */}
          <button
            onClick={onEnterWorkspace}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] text-white rounded-xl font-display font-bold text-lg tracking-wider uppercase shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Open Workspace
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline Steps */}
        <section className="mb-20">
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#1E293B] border border-indigo-500/20 flex items-center justify-center text-[#22D3EE]">
                    <step.icon size={20} />
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{step.step}</span>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] opacity-50" />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-[#0F172A]/50 border border-indigo-500/10 rounded-xl p-6 hover:border-indigo-500/30 hover:bg-[#1E293B]/50 transition-all duration-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4F46E5]/20 to-[#22D3EE]/20 flex items-center justify-center mb-4 text-[#22D3EE] group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16 border-t border-indigo-500/10">
          <p className="text-xl text-slate-400 mb-8">Ready to merge your first candidate?</p>
          <button
            onClick={onEnterWorkspace}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4F46E5] to-[#22D3EE] text-white rounded-xl font-display font-bold text-lg tracking-wider uppercase shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Open Workspace
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </div>
    </div>
  );
}
