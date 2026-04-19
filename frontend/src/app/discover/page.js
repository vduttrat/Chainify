"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"
import { DashboardCard, StatCard, EmptyState } from "../components/dashboard/DashboardUI"
import { FiUserPlus, FiUserMinus, FiPackage, FiInfo, FiCheckCircle, FiBriefcase, FiGlobe, FiTrash2, FiClock, FiSearch, FiLayers, FiArrowRight, FiLink, FiLogOut } from "react-icons/fi"
import { useAccount, useWriteContract, useReadContract, useReadContracts, useWaitForTransactionReceipt, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { injected } from "wagmi/connectors"
import { sepolia } from "wagmi/chains"
import { ROLES_ABI, ROLES_ADDRESS, PRODUCT_ABI, PRODUCT_ADDRESS } from "../contracts/config"
import { generateEmployeeCommitment, PROTOCOL_ROLES } from "../../../lib/zkUtils"

export default function DiscoverPage() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)
    
    // Company State
    const [isInitialized, setIsInitialized] = useState(false)
    const [companyData, setCompanyData] = useState({ name: "", description: "", logo: "" })
    const [selectedProduct, setSelectedProduct] = useState(null)
    
    // Form States
    const [employeeForm, setEmployeeForm] = useState({ wallet: "", role: "supplier" })
    const [removeWallet, setRemoveWallet] = useState("")
    const [optimisticallyRemovedWallets, setOptimisticallyRemovedWallets] = useState([])
    const [productForm, setProductForm] = useState({ name: "", location: "", quantity: "", cid: "" })
    const [status, setStatus] = useState({ type: "", message: "" })

    const { address: userAddress, isConnected, chain } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { switchChain } = useSwitchChain()
    const { writeContractAsync } = useWriteContract()

    const isWrongNetwork = isConnected && chain?.id !== sepolia.id
    
    // 1. Fetch Company Profile
    const { data: onChainProfile, refetch: refetchProfile } = useReadContract({
        address: ROLES_ADDRESS,
        abi: ROLES_ABI,
        functionName: 'companyProfiles',
        args: [userAddress],
        query: { enabled: !!userAddress && isConnected && !isWrongNetwork }
    })

    // 2. Fetch Employees
    const { data: onChainEmployees, refetch: refetchEmployees } = useReadContract({
        address: ROLES_ADDRESS,
        abi: ROLES_ABI,
        functionName: 'getEmployees',
        query: { enabled: !!userAddress && isConnected && !isWrongNetwork }
    })

    // 3. Fetch Products (IDs first, then details)
    const { data: onChainProductIds, refetch: refetchProductIds } = useReadContract({
        address: PRODUCT_ADDRESS,
        abi: PRODUCT_ABI,
        functionName: 'getAllProductIds',
        query: { enabled: isConnected && !isWrongNetwork }
    })

    const productCalls = useMemo(() => (onChainProductIds || []).map(id => ({
        address: PRODUCT_ADDRESS,
        abi: PRODUCT_ABI,
        functionName: 'getProduct',
        args: [id],
    })), [onChainProductIds])

    const { data: productResults, refetch: refetchProducts } = useReadContracts({
        contracts: productCalls,
        query: { enabled: productCalls.length > 0 && isConnected && !isWrongNetwork }
    })

    // 4. Fetch Selected Product History
    const { data: productHistory } = useReadContract({
        address: PRODUCT_ADDRESS,
        abi: PRODUCT_ABI,
        functionName: 'getHistory',
        args: [selectedProduct?.id],
        query: { enabled: !!selectedProduct && isConnected && !isWrongNetwork }
    })

    useEffect(() => {
        const initialize = async () => {
            // 1. Fetch Role from Supabase (Auth only)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || "none")
            }
            setLoading(false)
        }
        initialize()
    }, []);

    useEffect(() => {
        if (onChainProfile && (onChainProfile[3] === true || onChainProfile.initialized === true)) {
            setCompanyData({
                name: onChainProfile[0] || onChainProfile.name,
                description: onChainProfile[1] || onChainProfile.description,
                logo: onChainProfile[2] || onChainProfile.logo
            })
            setIsInitialized(true)
        }
    }, [onChainProfile])

    const showStatus = (type, message) => {
        setStatus({ type, message })
        setTimeout(() => setStatus({ type: "", message: "" }), 3000)
    }

    const employees = useMemo(() => (onChainEmployees || [])
        .filter(emp => emp.isActive && !optimisticallyRemovedWallets.includes(emp.wallet.toLowerCase()))
        .map((emp, idx) => ({
            id: idx,
            wallet: emp.wallet,
            role: emp.role,
            commitment: emp.commitment
        })), [onChainEmployees, optimisticallyRemovedWallets])

    const products = useMemo(() => (productResults || []).map((res, idx) => {
        if (res.status === 'success') {
            return {
                id: Number(res.result.id),
                name: res.result.name,
                description: res.result.location, 
                quantity: Number(res.result.quantity)
            }
        }
        return null
    }).filter(p => p !== null), [productResults])

    const [setupHash, setSetupHash] = useState(null)
    const [addEmployeeHash, setAddEmployeeHash] = useState(null)
    const [removeEmployeeHash, setRemoveEmployeeHash] = useState(null)
    const [addProductHash, setAddProductHash] = useState(null)

    const { isSuccess: isSetupConfirmed } = useWaitForTransactionReceipt({
        hash: setupHash,
        query: { enabled: !!setupHash }
    })

    const { isSuccess: isAddEmployeeConfirmed } = useWaitForTransactionReceipt({
        hash: addEmployeeHash,
        query: { enabled: !!addEmployeeHash }
    })

    const { isSuccess: isRemoveEmployeeConfirmed } = useWaitForTransactionReceipt({
        hash: removeEmployeeHash,
        query: { enabled: !!removeEmployeeHash }
    })

    const { isSuccess: isAddProductConfirmed } = useWaitForTransactionReceipt({
        hash: addProductHash,
        query: { enabled: !!addProductHash }
    })

    useEffect(() => {
        if (isSetupConfirmed) {
            refetchProfile()
            showStatus("success", "Organization initialized successfully!")
            setSetupHash(null)
        }
    }, [isSetupConfirmed, refetchProfile])

    useEffect(() => {
        if (isAddEmployeeConfirmed) {
            refetchEmployees()
            showStatus("success", "Protocol access granted successfully!")
            setAddEmployeeHash(null)
        }
    }, [isAddEmployeeConfirmed, refetchEmployees])

    useEffect(() => {
        if (isRemoveEmployeeConfirmed) {
            refetchEmployees()
            showStatus("success", "Permissions revoked successfully!")
            setRemoveEmployeeHash(null)
        }
    }, [isRemoveEmployeeConfirmed, refetchEmployees])

    useEffect(() => {
        if (isAddProductConfirmed) {
            refetchProductIds()
            refetchProducts()
            showStatus("success", "SKU registered successfully!")
            setAddProductHash(null)
        }
    }, [isAddProductConfirmed, refetchProductIds, refetchProducts])

    // Handlers
    const handleCompanySetup = async (e) => {
        e.preventDefault()
        if (!isConnected || isWrongNetwork) {
            showStatus("error", "Please connect to Sepolia first.")
            return
        }
        try {
            const hash = await writeContractAsync({
                address: ROLES_ADDRESS,
                abi: ROLES_ABI,
                functionName: "setCompanyProfile",
                args: [companyData.name, companyData.description, companyData.logo]
            })
            setSetupHash(hash)
            showStatus("success", "Initialization transaction sent! Waiting for confirmation...")
        } catch (err) {
            console.error(err)
            showStatus("error", "Failed to initialize organization.")
        }
    }

    const handleAddEmployee = async (e) => {
        e.preventDefault()
        if (!isConnected || isWrongNetwork) {
            showStatus("error", "Please connect to Sepolia first.")
            return
        }
        try {
            const secret = Math.random().toString(36).substring(7)
            const commitment = generateEmployeeCommitment(
                employeeForm.wallet,
                employeeForm.role.toUpperCase(),
                secret
            )

            const hash = await writeContractAsync({
                address: ROLES_ADDRESS,
                abi: ROLES_ABI,
                functionName: "addEmployeeCommitment",
                args: [commitment, employeeForm.wallet, employeeForm.role]
            })

            setAddEmployeeHash(hash)
            showStatus("success", "Transaction broadcasted! Waiting for confirmation...")
            setEmployeeForm({ wallet: "", role: "supplier" })
        } catch (err) {
            console.error(err)
            if (err.message.includes("User denied transaction signature") || err.message.includes("User rejected the request")) {
                showStatus("error", "Transaction was rejected.")
            } else {
                showStatus("error", "Failed to grant protocol access.")
            }
        }
    }

    const handleRemoveEmployee = async (e) => {
        e.preventDefault()
        if (!isConnected || isWrongNetwork) {
            showStatus("error", "Please connect to Sepolia first.")
            return
        }
        try {
            const employee = employees.find(emp => emp.wallet.toLowerCase() === removeWallet.toLowerCase())
            if (!employee) {
                showStatus("error", "Employee not found in registry.")
                return
            }

            const hash = await writeContractAsync({
                address: ROLES_ADDRESS,
                abi: ROLES_ABI,
                functionName: "removeEmployeeCommitment",
                args: [employee.commitment]
            })

            setOptimisticallyRemovedWallets(prev => [...prev, employee.wallet.toLowerCase()])
            setRemoveEmployeeHash(hash)
            showStatus("success", "Transaction broadcasted! Waiting for confirmation...")
            setRemoveWallet("")
        } catch (err) {
            console.error(err)
            if (err.message.includes("User denied transaction signature") || err.message.includes("User rejected the request")) {
                showStatus("error", "Transaction was rejected.")
            } else {
                showStatus("error", "Failed to revoke permissions.")
            }
        }
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        if (!isConnected || isWrongNetwork) {
            showStatus("error", "Please connect to Sepolia first.")
            return
        }
        try {
            const hash = await writeContractAsync({
                address: PRODUCT_ADDRESS,
                abi: PRODUCT_ABI,
                functionName: "addProduct",
                args: [
                    productForm.name,
                    productForm.location, 
                    BigInt(productForm.quantity),
                    productForm.cid
                ]
            })

            setAddProductHash(hash)
            showStatus("success", "Transaction broadcasted! Waiting for confirmation...")
            setProductForm({ name: "", location: "", quantity: "", cid: "" })
        } catch (err) {
            console.error(err)
            if (err.message.includes("User denied transaction signature") || err.message.includes("User rejected the request")) {
                showStatus("error", "Transaction was rejected.")
            } else {
                showStatus("error", "Failed to register SKU.")
            }
        }
    }

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

    // 2. Wallet Connection & Network Check
    if (!isConnected || isWrongNetwork) {
        return (
            <PageWrapper>
                <Sidebar />
                <main className="ml-[15vw] min-h-screen flex items-center justify-center p-8 md:p-12 lg:p-16">
                    <div className="max-w-xl w-full glass-card p-12 md:p-16 rounded-[3rem] text-center space-y-8 animate-in zoom-in duration-500 border border-white/10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <FiLink className="text-4xl text-emerald-400" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">{!isConnected ? "Wallet Required" : "Wrong Network"}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            {!isConnected 
                                ? "To interact with the Chainify Protocol and manage your organization, you must connect your Ethereum wallet."
                                : "You are currently connected to an unsupported network. Please switch to the Sepolia Testnet to continue."
                            }
                        </p>
                        
                        {!isConnected ? (
                            <button 
                                onClick={() => connect({ connector: injected() })}
                                className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
                            >
                                Connect Wallet
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <button 
                                    onClick={() => switchChain({ chainId: sepolia.id })}
                                    className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                >
                                    Switch to Sepolia
                                </button>
                                <button 
                                    onClick={() => disconnect()}
                                    className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Disconnect Wallet
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </PageWrapper>
        )
    }

    // 3. Initial Setup View
    if (!isInitialized) {
        return (
            <PageWrapper>
                <Sidebar />
                <main className="ml-[15vw] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col items-center">
                    <div className="w-full max-w-[1400px] space-y-12">
                        {/* Shared Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-6xl font-black tracking-tight"><span className="gradient-text">Welcome</span></h1>
                                <p className="text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">Organization Onboarding</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {status.message && (
                                    <div className={`flex items-center gap-4 px-8 py-4 rounded-full border ${status.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"} shadow-xl animate-in slide-in-from-top`}>
                                        <FiCheckCircle className="text-xl" />
                                        <span className="font-bold">{status.message}</span>
                                    </div>
                                )}
                                {userAddress && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                                            </div>
                                            <span className="text-[8px] uppercase font-black tracking-widest text-emerald-500 mt-1 mr-2">Connected</span>
                                        </div>
                                        <button 
                                            onClick={() => disconnect()}
                                            className="h-12 w-12 rounded-2xl bg-red-500 text-black flex items-center justify-center hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] group"
                                            title="Disconnect Wallet"
                                        >
                                            <FiLogOut className="text-xl group-hover:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto w-full space-y-12 animate-in slide-in-from-bottom duration-700">
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
                    </div>
                </main>
            </PageWrapper>
        )
    }

    const STAGES = ["CREATED", "FARMER", "DISTRIBUTOR", "MANUFACTURER", "RETAILER"]

    // 4. Main Dashboard View
    return (
        <PageWrapper>
            <Sidebar />
            <main className="ml-[15vw] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col items-center relative">
                <div className="w-full max-w-[1400px] space-y-12 animate-in fade-in duration-700">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-6xl font-black tracking-tight"><span className="gradient-text">{companyData.name}</span></h1>
                            <p className="text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">Discovery Dashboard</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {status.message && (
                                <div className={`flex items-center gap-4 px-8 py-4 rounded-full border ${status.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"} shadow-xl animate-in slide-in-from-top`}>
                                    <FiCheckCircle className="text-xl" />
                                    <span className="font-bold">{status.message}</span>
                                </div>
                            )}
                            {userAddress && (
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                                        </div>
                                        <span className="text-[8px] uppercase font-black tracking-widest text-emerald-500 mt-1 mr-2">Connected</span>
                                    </div>
                                    <button 
                                        onClick={() => disconnect()}
                                        className="h-12 w-12 rounded-2xl bg-red-500 text-black flex items-center justify-center hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] group"
                                        title="Disconnect Wallet"
                                    >
                                        <FiLogOut className="text-xl group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
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
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Location</label>
                                            <input 
                                                required
                                                placeholder="Origin or current location"
                                                value={productForm.location}
                                                onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Quantity</label>
                                            <input 
                                                required
                                                type="number"
                                                min="1"
                                                placeholder="Amount"
                                                value={productForm.quantity}
                                                onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">CID (IPFS Hash)</label>
                                            <input 
                                                required
                                                placeholder='Qm...'
                                                value={productForm.cid}
                                                onChange={(e) => setProductForm({...productForm, cid: e.target.value})}
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
                                            <div 
                                                key={prod.id} 
                                                onClick={() => setSelectedProduct(prod)}
                                                className={`p-6 bg-white/5 rounded-[2rem] border transition-all cursor-pointer group hover:bg-white/10 ${selectedProduct?.id === prod.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5 hover:border-emerald-500/20"}`}
                                            >
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

                {/* Product Detail Modal/Panel */}
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)}>
                        <div className="w-full max-w-2xl h-full bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
                            <div className="p-12 space-y-12">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tight">{selectedProduct.name}</h2>
                                        <p className="text-slate-500 font-mono text-sm mt-1">Product ID: {selectedProduct.id}</p>
                                    </div>
                                    <button onClick={() => setSelectedProduct(null)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                        <FiTrash2 className="text-xl" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="glass-card p-8 rounded-3xl border border-white/5">
                                        <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">On-Chain Audit Trail</h3>
                                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                            {productHistory && productHistory.length > 0 ? productHistory.map((h, idx) => (
                                                <div key={idx} className="relative pl-10">
                                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0a0a0a] border-2 border-emerald-500 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-lg text-white">{STAGES[h.currentStage]}</span>
                                                            {h.verified && <FiCheckCircle className="text-emerald-400" />}
                                                        </div>
                                                        <p className="text-slate-500 text-xs mt-1">Timestamp: {new Date(Number(h.timestamp) * 1000).toLocaleString()}</p>
                                                        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all">
                                                            CID: {h.cid}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                                    <FiClock className="text-4xl mb-4" />
                                                    <p className="text-sm font-bold">Awaiting first stage verification...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="glass-card p-6 rounded-3xl border border-white/5">
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Batch Size</span>
                                            <span className="text-2xl font-black">{selectedProduct.quantity} Units</span>
                                        </div>
                                        <div className="glass-card p-6 rounded-3xl border border-white/5">
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Status</span>
                                            <span className="text-2xl font-black text-emerald-400">Live</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedProduct(null)} className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl font-black text-xl hover:bg-white/10 transition-all mt-12">
                                    Close Inspector
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PageWrapper>
    )
}

