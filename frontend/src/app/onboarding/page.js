"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import { FiUser, FiBriefcase, FiArrowRight, FiCheck, FiTruck, FiGlobe, FiCpu, FiShoppingBag } from "react-icons/fi"

export default function OnboardingPage() {
  const [rolePreference, setRolePreference] = useState("company")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
              role: rolePreference 
          })
          .eq('id', user.id)

        if (error) throw error
        
        // Use window.location.href to force a full page reload.
        // This ensures the middleware sees the updated role in the database.
        window.location.href = '/discover';
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { id: 'company', title: 'Company', desc: 'Enterprise level entity managing assets.', icon: FiBriefcase },
    { id: 'supplier', title: 'Supplier', desc: 'Providing raw materials or resources.', icon: FiGlobe },
    { id: 'manufacturer', title: 'Manufacturer', desc: 'Producing components or finished goods.', icon: FiCpu },
    { id: 'distributer', title: 'Distributer', desc: 'Managing logistics and supply chains.', icon: FiTruck },
    { id: 'retailer', title: 'Retailer', desc: 'Direct-to-customer product sales.', icon: FiShoppingBag },
    { id: 'consumer', title: 'Consumer', desc: 'End-user verifying product authenticity.', icon: FiUser },
  ]

  return (
    <PageWrapper className="flex items-center justify-center p-4">
      <div className="max-w-3xl w-full animate-in slide_in fill-mode-forwards">
        <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden">
          
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black mb-4 tracking-tight">
                <span className="gradient-text">Identify your role</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Your profile details have been synced. Please select your position within the protocol.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setRolePreference(option.id)}
                  className={`flex flex-col gap-4 p-6 rounded-3xl border transition-all text-left group ${
                    rolePreference === option.id 
                      ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-3 rounded-xl transition-colors ${rolePreference === option.id ? "bg-emerald-500 text-black" : "bg-white/10 text-white group-hover:bg-white/20"}`}>
                      <option.icon className="text-2xl" />
                    </div>
                    {rolePreference === option.id && (
                        <div className="bg-emerald-500 rounded-full p-1 animate-in zoom-in">
                            <FiCheck className="text-black text-sm" />
                        </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">{option.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={handleComplete}
              disabled={loading}
              className={`
                group flex items-center gap-4 px-16 py-6 rounded-2xl font-bold text-xl transition-all
                ${loading
                  ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                  : "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95"
                }
              `}
            >
              {loading ? "Initializing..." : "Complete Setup"}
              {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
