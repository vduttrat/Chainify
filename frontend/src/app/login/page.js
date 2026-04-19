"use client";

import { signIn } from "../../../lib/auth";
import { FaGoogle } from "react-icons/fa";
import { FiLock, FiShield } from "react-icons/fi";
import PageWrapper from "../components/pagewrapper";

export default function LoginPage() {
  return (
    <PageWrapper className="flex items-center justify-center p-4">
      <div className="animate-in slide_in fill-mode-forwards">
        <div className="glass-card w-full max-w-md p-10 rounded-[2.5rem] relative overflow-hidden group">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-emerald-500/20 transition-all duration-700" />

          <div className="relative z-10 text-center">
            {/* Logo/Icon Area */}
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <FiLock className="text-4xl text-emerald-400" />
            </div>

            <h1 className="text-4xl font-black mb-2 tracking-tight">
              <span className="gradient-text">Chainify</span>
            </h1>
            <p className="text-slate-400 mb-10 font-medium">Welcome back to the protocol</p>

            <div className="space-y-6">
              <button
                onClick={() => signIn()}
                className="w-full py-4 px-6 rounded-2xl bg-white text-black font-bold text-lg flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl shadow-black/20"
              >
                <FaGoogle className="text-xl" />
                Continue with Google
              </button>

              <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-slate-500 text-sm">
                <FiShield className="text-emerald-500/50" />
                <span>On-chain security enabled</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-sm">
          By continuing, you agree to the Chainify <span className="text-emerald-400/80 hover:text-emerald-400 cursor-pointer underline underline-offset-4 decoration-emerald-400/20">Protocol Terms</span>
        </p>
      </div>
    </PageWrapper>
  );
}

