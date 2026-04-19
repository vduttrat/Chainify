import { DashboardCard, EmptyState } from "../dashboard/DashboardUI"
import { FiLayers, FiArrowRight } from "react-icons/fi"

export default function ConsumerView({ products, selectedProduct, setSelectedProduct }) {
    return (
        <div className="w-full">
            <DashboardCard title="On-Chain Inventory" icon={FiLayers}>
                {products.length === 0 ? <EmptyState message="No products registered yet." /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardCard>
        </div>
    )
}
