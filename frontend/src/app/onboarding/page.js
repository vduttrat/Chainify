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
    <PageWrapper className="flex items-center justify-center p-8 md:p-12">
      <div className="max-w-4xl w-full animate-in slide-in-from-bottom duration-700">
        <div className="glass-card p-12 md:p-16 rounded-[3rem] relative overflow-hidden border border-white/10 shadow-2xl">
          
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center">
              <h1 className="text-6xl font-black mb-6 tracking-tight">
                <span className="gradient-text">Identify your role</span>
              </h1>
              <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Connect your professional identity to the protocol. Select your position to unlock your custom dashboard.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setRolePreference(option.id)}
                  className={`flex flex-col gap-6 p-8 rounded-[2.5rem] border transition-all text-left group relative ${
                    rolePreference === option.id 
                      ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30" 
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${rolePreference === option.id ? "bg-emerald-500 text-black scale-110 shadow-lg" : "bg-white/10 text-white group-hover:bg-white/20"}`}>
                      <option.icon className="text-3xl" />
                    </div>
                    {rolePreference === option.id && (
                        <div className="bg-emerald-500 rounded-full p-1.5 animate-in zoom-in shadow-lg">
                            <FiCheck className="text-black text-sm font-black" />
                        </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl mb-2 tracking-tight">{option.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <button
              onClick={handleComplete}
              disabled={loading}
              className={`
                group flex items-center gap-6 px-20 py-7 rounded-2xl font-black text-2xl transition-all
                ${loading
                  ? "bg-white/5 text-slate-500 cursor-not-allowed opacity-50" 
                  : "bg-emerald-500 text-black shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_70px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95"
                }
              `}
            >
              {loading ? "Initializing Identity..." : "Authorize Role"}
              {!loading && <FiArrowRight className="group-hover:translate-x-2 transition-transform text-3xl" />}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>

  )
}
