"use client"

import { FiPlus, FiTrash2, FiUserPlus, FiPackage, FiSearch, FiInfo } from "react-icons/fi"

export const DashboardCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`glass-card p-10 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 h-full ${className}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Icon className="text-2xl" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
)



export const StatCard = ({ label, value, icon: Icon, color = "emerald" }) => (
    <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-6">
        <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-400`}>
            <Icon className="text-2xl" />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    </div>
)

export const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 grayscale">
        <FiSearch className="text-4xl mb-4" />
        <p className="text-slate-400">{message}</p>
    </div>
)
