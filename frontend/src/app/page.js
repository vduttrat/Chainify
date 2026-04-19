import Image from "next/image";
import sample from "./Chainify_final_image.png";
import PageWrapper from "./components/pagewrapper";
import NavButton from "./components/navbutton";
import FeatureCard from "./components/FeatureCard";
import { FiShield, FiLock, FiCpu, FiGlobe } from "react-icons/fi";

export default function Home() {
  return (
    <PageWrapper className="flex flex-col items-center">
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto">
        <div className="animate-in slide_in fill-mode-forwards space-y-8">
          <div className="inline-block flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Trust Infrastructure 2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
            <span className="gradient-text">Chainify</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            The decentralized layer for <span className="text-white font-medium italic">verifiable trust</span>. 
            Secure your assets and verify interactions with on-chain integrity.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <NavButton link="/discover" text="Get Started" />
          </div>
        </div>

        <div className="mt-24 relative w-full aspect-video rounded-3xl overflow-hidden glass-card p-2 animate-in slide_in delay-300 fill-mode-forwards">
          <Image 
            src={sample} 
            alt="Chainify Dashboard" 
            layout="responsive"
            width={1200}
            height={675}
            className="rounded-2xl object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
        </div>
      </section>

      <section className="py-32 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the future of trust</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Our platform provides the building blocks for secure, transparent, and immutable on-chain verification.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard 
            icon={FiShield}
            title="Immutable Verification"
            description="Every transaction and verification is recorded on-chain, ensuring tamper-proof integrity."
            className="md:mt-8"
          />
          <FeatureCard 
            icon={FiLock}
            title="Zero-Knowledge Privacy"
            description="Verify trust without compromising sensitive data using advanced cryptographic proofs."
            className="md:mt-8"
          />
          <FeatureCard 
            icon={FiCpu}
            title="Blazing Performance"
            description="Optimized smart contracts and layer-2 integrations for near-instant transaction finality."
            className="md:mt-8"
          />
          <FeatureCard 
            icon={FiGlobe}
            title="Global Scalability"
            description="A borderless trust protocol that works across every major blockchain ecosystem."
            className="md:mt-8"
          />
        </div>
      </section>

      <section className="py-32 w-full text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] -z-10" />
        <h2 className="text-4xl md:text-6xl font-black mb-10">Ready to chainify your trust?</h2>
        <NavButton link="/discover" text="Get Started Now" />
      </section>
    </PageWrapper>
  );
}

