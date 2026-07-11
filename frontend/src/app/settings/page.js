"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"
import { FiSettings, FiShield, FiGlobe, FiLogOut } from "react-icons/fi"

export default function SettingsPage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        fetchUser()
    }, [])

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            window.location.href = "/login"
        }
    }

    if (loading) {
        return (
            <PageWrapper>
                <Sidebar />
                <main className="ml-[15vw] min-h-screen flex items-center justify-center text-white font-bold">
                    Loading...
                </main>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <Sidebar />
            <main className="ml-[15vw] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col items-center">
                <div className="w-full max-w-[800px] space-y-12 animate-in fade-in duration-700">
                    <div>
                        <h1 className="text-6xl font-black tracking-tight">
                            <span className="gradient-text">Settings</span>
                        </h1>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">Configuration</p>
                    </div>

                    {/* Network */}
                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                                <FiGlobe className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">Network</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold">Sepolia Testnet</p>
                                    <p className="text-slate-500 text-sm">Primary blockchain network</p>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold">Hardhat Local</p>
                                    <p className="text-slate-500 text-sm">Development network</p>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">Available</span>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                                <FiShield className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">Security</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold">Authentication Provider</p>
                                    <p className="text-slate-500 text-sm capitalize">{user?.app_metadata?.provider || "Google OAuth"}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">Secure</span>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold">Session</p>
                                    <p className="text-slate-500 text-sm">{user?.email || "Not signed in"}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="glass-card p-10 rounded-[2.5rem] border border-red-500/20 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-red-500/10 text-red-400">
                                <FiLogOut className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-red-400">Danger Zone</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Signing out will end your current session. You will need to re-authenticate with Google to access the protocol again.
                            </p>
                            <button 
                                onClick={handleSignOut}
                                className="w-full py-5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-black text-lg hover:bg-red-500/20 transition-all active:scale-95"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PageWrapper>
    )
}
