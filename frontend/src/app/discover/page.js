"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"
import { DashboardCard, StatCard, EmptyState } from "../components/dashboard/DashboardUI"
import { FiUserPlus, FiUserMinus, FiPackage, FiInfo, FiCheckCircle, FiBriefcase, FiGlobe, FiTrash2 } from "react-icons/fi"

export default function DiscoverPage() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)
    
    // Company State
    const [isInitialized, setIsInitialized] = useState(false)
    const [companyData, setCompanyData] = useState({ name: "", description: "", logo: "" })
    const [employees, setEmployees] = useState([])
    const [products, setProducts] = useState([])
    
    // Form States
    const [employeeForm, setEmployeeForm] = useState({ wallet: "", role: "supplier" })
    const [removeWallet, setRemoveWallet] = useState("")
    const [productForm, setProductForm] = useState({ name: "", description: "", metadata: "" })
    const [status, setStatus] = useState({ type: "", message: "" })

    useEffect(() => {
        const initialize = async () => {
            // 1. Fetch Role from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || "none")
            }

            // 2. Load from LocalStorage
            const storedCompany = localStorage.getItem("chainify_company")
            const storedEmployees = localStorage.getItem("chainify_employees")
            const storedProducts = localStorage.getItem("chainify_products")

            if (storedCompany) {
                setCompanyData(JSON.parse(storedCompany))
                setIsInitialized(true)
            }
            if (storedEmployees) setEmployees(JSON.parse(storedEmployees))
            if (storedProducts) setProducts(JSON.parse(storedProducts))

            setLoading(false)
        }
        initialize()
    }, []);

    const showStatus = (type, message) => {
        setStatus({ type, message })
        setTimeout(() => setStatus({ type: "", message: "" }), 3000)
    }

    // Handlers
    const handleCompanySetup = (e) => {
        e.preventDefault()
        localStorage.setItem("chainify_company", JSON.stringify(companyData))
        setIsInitialized(true)
        showStatus("success", "Company profile initialized successfully!")
    }

    const handleAddEmployee = (e) => {
        e.preventDefault()
        const newEmployees = [...employees, { ...employeeForm, id: Date.now() }]
        setEmployees(newEmployees)
        localStorage.setItem("chainify_employees", JSON.stringify(newEmployees))
        setEmployeeForm({ wallet: "", role: "supplier" })
        showStatus("success", "Employee added to registry.")
    }

    const handleRemoveEmployee = (e) => {
        e.preventDefault()
        const newEmployees = employees.filter(emp => emp.wallet !== removeWallet)
        setEmployees(newEmployees)
        localStorage.setItem("chainify_employees", JSON.stringify(newEmployees))
        setRemoveWallet("")
        showStatus("success", "Employee removed.")
    }

    const handleAddProduct = (e) => {
        e.preventDefault()
        const newProducts = [...products, { ...productForm, id: Date.now() }]
        setProducts(newProducts)
        localStorage.setItem("chainify_products", JSON.stringify(newProducts))
        setProductForm({ name: "", description: "", metadata: "" })
        showStatus("success", "Product registered successfully.")
    }

    if (loading) return null

    // 1. Role Check
    if (role !== "company") {
        return (
            <PageWrapper>
                <Sidebar />
                <main className="ml-[15vw] min-h-screen flex items-center justify-center p-8 md:p-16">
                    <div className="glass-card p-12 md:p-20 rounded-[3rem] text-center max-w-2xl animate-in fade-in duration-700">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FiInfo className="text-4xl text-emerald-500" />
                        </div>
                        <h1 className="text-4xl font-black mb-4 tracking-tight">Access Restricted</h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            The Discover dashboard and management suite are currently exclusive to verified 
                            <span className="text-white font-bold"> Company</span> roles. Explore other protocol features.
                        </p>
                    </div>
                </main>
            </PageWrapper>
        )
    }

    // 2. Initial Setup View
    if (!isInitialized) {
        return (
            <PageWrapper>
                <Sidebar />
                <main className="ml-[15vw] min-h-screen p-8 md:p-12 lg:p-16">
                    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom duration-700">
                        <div className="text-left">
                            <h1 className="text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">Register Your Company</span></h1>
                            <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">Protocol Onboarding</p>
                        </div>
                        
                        <form onSubmit={handleCompanySetup} className="glass-card p-12 md:p-16 rounded-[3rem] space-y-10 border border-white/10">
                            <div className="space-y-6">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Legal Name</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="Enter company name"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-6">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea 
                                    required
                                    placeholder="Briefly describe your business"
                                    value={companyData.description}
                                    onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl min-h-[180px] focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-6">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Logo URL (Optional)</label>
                                <input 
                                    type="text"
                                    placeholder="https://..."
                                    value={companyData.logo}
                                    onChange={(e) => setCompanyData({...companyData, logo: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                />
                            </div>
                            <button type="submit" className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
                                Initialize Organization
                            </button>
                        </form>
                    </div>
                </main>
            </PageWrapper>
        )
    }

    // 3. Main Dashboard View
    return (
        <PageWrapper>
            <Sidebar />
            <main className="ml-[15vw] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col items-center">
                <div className="w-full max-w-[1400px] space-y-12 animate-in fade-in duration-700">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-6xl font-black tracking-tight"><span className="gradient-text">{companyData.name}</span></h1>
                            <p className="text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">Discovery Dashboard</p>
                        </div>
                        {status.message && (
                            <div className={`flex items-center gap-4 px-8 py-4 rounded-full border ${status.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"} shadow-xl animate-in slide-in-from-top`}>
                                <FiCheckCircle className="text-xl" />
                                <span className="font-bold">{status.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard label="Total Employees" value={employees.length} icon={FiBriefcase} />
                        <StatCard label="Registered Products" value={products.length} icon={FiPackage} color="blue" />
                        <StatCard label="Trust Score" value="98%" icon={FiCheckCircle} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        
                        {/* Employee Management */}
                        <div className="space-y-10">
                            <DashboardCard title="Employee Access" icon={FiUserPlus}>
                                <div className="space-y-10">
                                    <form onSubmit={handleAddEmployee} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Wallet Address</label>
                                                <input 
                                                    required
                                                    placeholder="0x..."
                                                    value={employeeForm.wallet}
                                                    onChange={(e) => setEmployeeForm({...employeeForm, wallet: e.target.value})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Protocol Role</label>
                                                <select 
                                                    value={employeeForm.role}
                                                    onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="supplier">Supplier</option>
                                                    <option value="manufacturer">Manufacturer</option>
                                                    <option value="distributer">Distributer</option>
                                                    <option value="retailer">Retailer</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                                            Grant Protocol Access
                                        </button>
                                    </form>

                                    <div className="border-t border-white/5 pt-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 text-red-400">Revoke Permissions</label>
                                            <form onSubmit={handleRemoveEmployee} className="flex gap-4">
                                                <input 
                                                    required
                                                    placeholder="Enter wallet to revoke"
                                                    value={removeWallet}
                                                    onChange={(e) => setRemoveWallet(e.target.value)}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-red-500/50 transition-all"
                                                />
                                                <button type="submit" className="px-8 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all">
                                                    <FiTrash2 className="text-2xl" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>

                            <DashboardCard title="Active Protocol Registry" icon={FiBriefcase}>
                                {employees.length === 0 ? <EmptyState message="No employees registered yet." /> : (
                                    <div className="space-y-4">
                                        {employees.map(emp => (
                                            <div key={emp.id} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                                                <div className="flex items-center gap-5 overflow-hidden">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                                        <FiGlobe className="text-xl" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-sm text-white truncate max-w-[200px]">{emp.wallet}</span>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Employee</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs uppercase font-black bg-emerald-500 text-black px-4 py-2 rounded-xl shadow-lg">
                                                    {emp.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DashboardCard>
                        </div>

                        {/* Product Management */}
                        <div className="space-y-10">
                            <DashboardCard title="SKU Registry" icon={FiPackage}>
                                <form onSubmit={handleAddProduct} className="space-y-8 flex-1">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Asset Name</label>
                                            <input 
                                                required
                                                placeholder="Enter product title"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Technical Specifications</label>
                                            <textarea 
                                                required
                                                placeholder="Provide detailed description..."
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[120px] focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Immutable Metadata</label>
                                            <input 
                                                placeholder='{"batch": "A-1", "origin": "..."}'
                                                value={productForm.metadata}
                                                onChange={(e) => setProductForm({...productForm, metadata: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-6 bg-emerald-500 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                                        Register SKU
                                    </button>
                                </form>
                            </DashboardCard>

                            <DashboardCard title="On-Chain Inventory" icon={FiLayers}>
                                {products.length === 0 ? <EmptyState message="No products registered yet." /> : (
                                    <div className="space-y-4">
                                        {products.map(prod => (
                                            <div key={prod.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group hover:bg-white/10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <h4 className="font-black text-xl tracking-tight">{prod.name}</h4>
                                                    </div>
                                                    <FiArrowRight className="text-slate-600 group-hover:text-emerald-400 transition-all translate-x-0 group-hover:translate-x-1" />
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{prod.description}</p>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-3 py-1 rounded-md">Verified Asset</span>
                                                    {prod.metadata && <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-md">Rich Data</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DashboardCard>
                        </div>

                    </div>
                </div>
            </main>
        </PageWrapper>
    )
}

// Missing import fix
const FiArrowRight = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
)
const FiLayers = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
)
