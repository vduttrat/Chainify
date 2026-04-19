"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome, FiUser, FiSettings, FiLogOut, FiActivity, FiLayers } from "react-icons/fi";
import { supabase } from "../../../lib/supabase";

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const links = [
        { label: "Discover", route: "/discover", icon: FiActivity },
        { label: "Onboarding", route: "/onboarding", icon: FiLayers },
        { label: "Profile", route: "/profile", icon: FiUser },
        { label: "Settings", route: "/settings", icon: FiSettings },
    ];

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = "/login";
        }
    }

    return (
        <aside className="fixed left-0 top-0 w-[15vw] h-screen glass-card border-r border-white/10 flex flex-col z-50 transition-all duration-300">
            {/* Branding Header */}
            <div className="p-8 pb-12">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-transform group-hover:scale-110 duration-300">
                        <span className="font-black text-black text-xl">C</span>
                    </div>
                    <span className="text-xl font-black tracking-tight gradient-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-100">Chainify</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4">
                <ul className="space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.route;
                        return (
                            <li key={link.route}>
                                <Link 
                                    href={link.route}
                                    className={`
                                        group flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300
                                        ${isActive 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" 
                                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        }
                                    `}
                                >
                                    <link.icon className={`text-xl transition-colors duration-300 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                    <span className="hidden md:block">{link.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-white/5">
                <div className="p-4 rounded-[2rem] bg-white/5 space-y-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-10 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                            <FiUser className="text-emerald-400" />
                        </div>
                        <div className="hidden md:flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Protocol User'}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verified</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 text-sm font-bold"
                    >
                        <FiLogOut className="text-lg" />
                        <span className="hidden md:block">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

