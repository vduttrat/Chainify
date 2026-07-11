"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, sepolia, hardhat } from "wagmi/chains"
import { injected } from "wagmi/connectors"

const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [hardhat.id]: http(),
  },
})

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
