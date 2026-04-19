"use client"

import Particles from "./particles";

export default function PageWrapper({ children, className = "" }) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <Particles
          className="absolute inset-0"
          quantity={200}
          staticity={20}
          ease={100}
          refresh
        />
      </div>

      <div className="absolute top-0 left-0 w-screen h-screen bg-green-700/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen fixed" />

      <div className="relative z-10 pb-20">
        {children}
      </div>
    </div>
  );
}
