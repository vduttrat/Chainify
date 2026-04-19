import React from 'react';

export default function FeatureCard({ title, description, icon: Icon, className = "" }) {
  return (
    <div className={`glass-card p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 group ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
        {Icon && <Icon className="text-2xl text-emerald-400" />}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
