"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"
import { FiUser, FiMail, FiShield, FiClock } from "react-icons/fi"

export default function ProfilePage() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(profileData)
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

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
                            <span className="gradient-text">Profile</span>
                        </h1>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">Your Identity</p>
                    </div>

                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                                {user?.user_metadata?.avatar_url ? (
                                    <img 
                                        src={user.user_metadata.avatar_url} 
                                        alt="Avatar" 
                                        className="w-20 h-20 rounded-3xl object-cover"
                                    />
                                ) : (
                                    <FiUser className="text-4xl text-emerald-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-white">
                                    {user?.user_metadata?.full_name || user?.user_metadata?.name || "Protocol User"}
                                </h2>
                                <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Verified Identity</span>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FiMail className="text-lg" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Email</span>
                                </div>
                                <p className="text-white font-bold truncate">{user?.email || "N/A"}</p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FiShield className="text-lg" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Role</span>
                                </div>
                                <p className="text-white font-bold capitalize">{profile?.role || "none"}</p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FiUser className="text-lg" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Auth Provider</span>
                                </div>
                                <p className="text-white font-bold capitalize">{user?.app_metadata?.provider || "N/A"}</p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FiClock className="text-lg" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Joined</span>
                                </div>
                                <p className="text-white font-bold">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PageWrapper>
    )
}
