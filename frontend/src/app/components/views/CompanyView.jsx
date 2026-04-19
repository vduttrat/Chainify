import { DashboardCard, StatCard, EmptyState } from "../dashboard/DashboardUI"
import { FiUserPlus, FiPackage, FiCheckCircle, FiBriefcase, FiGlobe, FiTrash2, FiLayers, FiArrowRight } from "react-icons/fi"

export default function CompanyView({ 
    companyData, 
    employees, 
    products, 
    selectedProduct, 
    setSelectedProduct,
    employeeForm,
    setEmployeeForm,
    handleAddEmployee,
    removeWallet,
    setRemoveWallet,
    handleRemoveEmployee,
    productForm,
    setProductForm,
    handleAddProduct
}) {
    return (
        <>
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
                                            <option value="farmer">Farmer</option>
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="distributor">Distributor</option>
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
        </>
    )
}
