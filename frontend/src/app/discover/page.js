"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"
import { DashboardCard, StatCard, EmptyState } from "../components/dashboard/DashboardUI"
import { FiUserPlus, FiUserMinus, FiPackage, FiInfo, FiCheckCircle, FiBriefcase, FiGlobe } from "react-icons/fi"

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
                <main className="ml-[15vw] min-h-screen flex items-center justify-center p-20">
                    <div className="glass-card p-20 rounded-[3rem] text-center max-w-2xl animate-in fade-in duration-700">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FiInfo className="text-4xl text-emerald-500" />
                        </div>
                        <h1 className="text-4xl font-black mb-4 tracking-tight">Access Restricted</h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            The Discover dashboard and management suite are currently exclusive to verified 
                            <span className="text-white font-bold"> Company</span> roles. Explore other protocol features in the sidebar.
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
                <main className="ml-[15vw] min-h-screen p-20">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-12">
                            <h1 className="text-5xl font-black mb-4 tracking-tight"><span className="gradient-text">Register Your Company</span></h1>
                            <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">Protocol Onboarding</p>
                        </div>
                        
                        <form onSubmit={handleCompanySetup} className="glass-card p-12 rounded-[3rem] space-y-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Legal Name</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="Enter company name"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea 
                                    required
                                    placeholder="Briefly describe your business"
                                    value={companyData.description}
                                    onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl min-h-[150px] focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Logo URL (Optional)</label>
                                <input 
                                    type="text"
                                    placeholder="https://..."
                                    value={companyData.logo}
                                    onChange={(e) => setCompanyData({...companyData, logo: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <button type="submit" className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
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
            <main className="ml-[15vw] min-h-screen p-12 space-y-12 animate-in fade-in duration-500">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight"><span className="gradient-text">{companyData.name}</span></h1>
                        <p className="text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">Discovery Dashboard</p>
                    </div>
                    {status.message && (
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border ${status.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"} animate-in slide-in-from-top`}>
                            <FiCheckCircle />
                            <span className="font-bold text-sm">{status.message}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Total Employees" value={employees.length} icon={FiBriefcase} />
                    <StatCard label="Registered Products" value={products.length} icon={FiPackage} color="blue" />
                    <StatCard label="Trust Score" value="98%" icon={FiCheckCircle} color="amber" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Employee Management */}
                    <div className="space-y-8">
                        <DashboardCard title="Employee Access" icon={FiUserPlus}>
                            <div className="space-y-8">
                                <form onSubmit={handleAddEmployee} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input 
                                            required
                                            placeholder="Wallet Address"
                                            value={employeeForm.wallet}
                                            onChange={(e) => setEmployeeForm({...employeeForm, wallet: e.target.value})}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500/50"
                                        />
                                        <select 
                                            value={employeeForm.role}
                                            onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <option value="supplier">Supplier</option>
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="distributer">Distributer</option>
                                            <option value="retailer">Retailer</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                                        Grant Access
                                    </button>
                                </form>

                                <div className="border-t border-white/5 pt-8">
                                    <form onSubmit={handleRemoveEmployee} className="flex gap-4">
                                        <input 
                                            required
                                            placeholder="Revoke Wallet Address"
                                            value={removeWallet}
                                            onChange={(e) => setRemoveWallet(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-red-500/50"
                                        />
                                        <button type="submit" className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                                            <FiTrash2 className="text-xl" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Employee List" icon={FiBriefcase}>
                            {employees.length === 0 ? <EmptyState message="No employees registered yet." /> : (
                                <div className="space-y-3">
                                    {employees.map(emp => (
                                        <div key={emp.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <FiGlobe className="text-sm" />
                                                </div>
                                                <span className="font-mono text-xs text-slate-400 truncate max-w-[150px]">{emp.wallet}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                                {emp.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    {/* Product Management */}
                    <div className="space-y-8">
                        <DashboardCard title="Product Registry" icon={FiPackage}>
                            <form onSubmit={handleAddProduct} className="space-y-6">
                                <div className="space-y-4">
                                    <input 
                                        required
                                        placeholder="Product Name"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <textarea 
                                        required
                                        placeholder="Full Specifications"
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <input 
                                        placeholder="Batch Metadata (JSON)"
                                        value={productForm.metadata}
                                        onChange={(e) => setProductForm({...productForm, metadata: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                    Register SKU
                                </button>
                            </form>
                        </DashboardCard>

                        <DashboardCard title="Active Inventory" icon={FiLayers || FiPackage}>
                            {products.length === 0 ? <EmptyState message="No products registered yet." /> : (
                                <div className="space-y-3">
                                    {products.map(prod => (
                                        <div key={prod.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-lg">{prod.name}</h4>
                                                <FiArrowRight className="text-slate-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-1">{prod.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DashboardCard>
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
