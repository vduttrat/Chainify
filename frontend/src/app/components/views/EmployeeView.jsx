import { useState } from "react"
import { DashboardCard, EmptyState } from "../dashboard/DashboardUI"
import { FiLayers, FiArrowRight, FiCheckCircle, FiUploadCloud } from "react-icons/fi"

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
    onVerifyProduct 
}) {
    const [description, setDescription] = useState("")

    const targetStage = targetStageMap[role]
    const latestStage = productHistory && productHistory.length > 0 
        ? productHistory[productHistory.length - 1].currentStage 
        : null

    const canVerify = latestStage === targetStage

    const handleVerify = async (e) => {
        e.preventDefault()
        await onVerifyProduct(selectedProduct.id, description)
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

                            {canVerify ? (
                                <form onSubmit={handleVerify} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Stage Verification Notes</label>
                                        <textarea 
                                            required
                                            placeholder={`Describe the ${role} verification details...`}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[150px] focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-6 bg-emerald-500 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3">
                                        <FiUploadCloud className="text-2xl" />
                                        Verify & Submit to Chain
                                    </button>
                                </form>
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
