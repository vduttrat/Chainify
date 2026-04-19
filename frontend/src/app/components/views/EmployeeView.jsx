import { useState } from "react"
import { DashboardCard, EmptyState } from "../dashboard/DashboardUI"
import { FiLayers, FiArrowRight, FiCheckCircle, FiUploadCloud, FiClock, FiXCircle } from "react-icons/fi"

const targetStageMap = {
  farmer: 0,
  manufacturer: 1,
  distributor: 2,
  retailer: 3
}

export default function EmployeeView({ 
    role, 
    products, 
    selectedProduct, 
    setSelectedProduct, 
    productHistory,
    onVerifyProduct,
    STAGES 
}) {
    const [description, setDescription] = useState("")

    const targetStage = targetStageMap[role]
    const latestStage = productHistory && productHistory.length > 0 
        ? productHistory[productHistory.length - 1].currentStage 
        : null

    const isPreviousStageApproved = productHistory && productHistory.length > 0 
        ? productHistory[productHistory.length - 1].verified 
        : false

    const canVerify = latestStage === targetStage && isPreviousStageApproved

    const handleVerify = async (isVerified) => {
        if (!description.trim()) return;
        await onVerifyProduct(selectedProduct.id, description, isVerified)
        setDescription("")
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Products List */}
            <div className="space-y-10">
                <DashboardCard title="Assigned Inventory" icon={FiLayers}>
                    <p className="text-slate-400 text-sm mb-6">Select a product to view its audit trail and perform your verification step.</p>
                    {products.length === 0 ? <EmptyState message="No products assigned yet." /> : (
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
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>

            {/* Verification Form */}
            <div className="space-y-10">
                <DashboardCard title="Action Required" icon={FiCheckCircle}>
                    {!selectedProduct ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <FiArrowRight className="text-4xl mb-4 opacity-50" />
                            <p>Select a product to view options</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <h3 className="font-black text-xl text-white mb-2">{selectedProduct.name}</h3>
                                <p className="text-slate-400 font-mono text-sm">Product ID: {selectedProduct.id}</p>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">On-Chain Audit Trail</h3>
                                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                    {productHistory && productHistory.length > 0 ? productHistory.map((h, idx) => (
                                        <div key={idx} className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0a0a0a] border-2 border-emerald-500 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-lg text-white">{STAGES && STAGES[h.currentStage] ? STAGES[h.currentStage] : "UNKNOWN"}</span>
                                                    {h.verified && <FiCheckCircle className="text-emerald-400" />}
                                                </div>
                                                <p className="text-slate-500 text-xs mt-1">Timestamp: {new Date(Number(h.timestamp) * 1000).toLocaleString()}</p>
                                                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all">
                                                    CID: {h.cid}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-6 opacity-50">
                                            <FiClock className="text-4xl mb-4" />
                                            <p className="text-sm font-bold">Awaiting first stage verification...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {canVerify ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Stage Verification Notes (Required)</label>
                                        <textarea 
                                            required
                                            placeholder={`Describe the ${role} verification details...`}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[150px] focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleVerify(true)} 
                                            disabled={!description.trim()}
                                            className="w-full py-5 bg-emerald-500 text-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                            <FiUploadCloud className="text-xl" />
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(false)} 
                                            disabled={!description.trim()}
                                            className="w-full py-5 bg-red-500 text-white font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                            <FiXCircle className="text-xl" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                                    <FiCheckCircle className="text-4xl text-red-400 mx-auto mb-3" />
                                    <h4 className="text-red-400 font-bold mb-1">Not Ready for Verification</h4>
                                    <p className="text-sm text-red-400/80">This product is either already verified by you, or is awaiting verification from a previous supply chain stage.</p>
                                </div>
                            )}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </div>
    )
}
