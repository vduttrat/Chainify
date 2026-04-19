# Chainify - Decentralized Supply Chain & AI Anomaly Detection

Chainify is a modern, blockchain-based supply chain management platform integrated with AI-powered anomaly detection. It enables end-to-end transparency, zero-knowledge verification for employees, and automated fraud probability scoring for supply chain logs.

## Star Features

### Zero-Knowledge Privacy (Web3)
Chainify leverages **ZK-Snarks (Plonk Verifiers)** to authorize supply chain actions. This allows employees to prove they have the necessary protocol permissions without revealing their private identities or sensitive credentials on the public ledger.

### Enterprise AI Scaling (GenAI)
The core AI Anomaly Detection engine is deployed on **Azure Web Services**, providing high-availability and low-latency inference. This ensures that every supply chain update is scanned against global compliance standards in real-time.
(Note -> Inform @IronKommander to test the Azure deployed GenAI server on https://chainify-anomaly-detection.azurewebsites.net/docs)

### Probabilistic Compliance (AI)
Utilizing a **LangGraph-based agentic workflow**, the system doesn't just flag anomalies; it provides detailed **compliance reasoning** and fraud probability scores (0-100%), helping inspectors make data-driven decisions.

### Hybrid Hybrid Architecture (Fullstack)
A seamless integration of **Next.js 16**, **Supabase**, and **Ethereum**, creating a privacy-first distributed dashboard that bridges the gap between traditional enterprise databases and decentralized trust.


## Project Structure

The project is divided into three main components:

## Detailed File Breakdown

### Frontend (`/frontend`)
- `src/app/`
    - `auth/callback/route.js`: Server-side OAuth handling.
    - `discover/page.js`: The main dashboard containing all role-specific logic.
    - `onboarding/page.js`: Role selection and profile initialization.
    - `login/page.js`: Google OAuth entry point.
- `src/app/components/`
    - `views/`: Specific UI layouts for Company, Employee, and Consumer.
    - `AnomalyInsight.jsx`: AI scoring visualization component.
- `lib/`
    - `supabase.js`: Global Supabase client configuration.
    - `auth.js`: OAuth sign-in triggers and origin detection.
    - `zkUtils.js`: Cryptographic helpers for ZK commitments.

### Smart Contracts (`/contracts`)
- `contracts/`
    - `Roles.sol`: The core identity and RBAC (Role-Based Access Control) engine.
    - `product.sol`: The supply chain ledger contract.
    - `Verifier.sol`: Plonk verifier for ZK-Snarks.
- `ignition/modules/`: Deployment scripts for the protocol.
- `hardhat.config.ts`: Network configuration (Sepolia, Hardhat nodes).

### Backend AI (`/backend/model`)
- `main.py`: FastAPI routes and endpoint definitions.
- `requirements.txt`: Python dependency lockfile.
- `.langgraph_api/`: AI reasoning graph definitions.
- `docs/`: API and architectural documentation for the anomaly service.
- `src/`: Core AI logic and Qdrant retrieval systems.


## Key Features

- **Decentralized Roles**: Companies can manage their own on-chain profiles and authorize employees.
- **ZK Employee Verification**: Zero-Knowledge commitments ensure that only authorized personnel can update product history.
- **AI Insights**: Real-time fraud probability scoring and legal reasoning for every supply chain step.
- **Immutable Audit Trail**: Every stage of the product lifecycle (Farmer -> Manufacturer -> Distributor -> Retailer) is recorded on-chain with IPFS-stored metadata (via Pinata).

## Deployment Infrastructure

| Layer | Deployment Platform |
|---|---|
| **Frontend** | [Vercel](https://vercel.com) |
| **GenAI Backend** | [Azure Web Apps](https://azure.microsoft.com) |
| **Smart Contracts** | [Ethereum Sepolia Testnet](https://sepolia.etherscan.io) |
| **Database & Auth** | [Supabase](https://supabase.com) |

## Tech Summary

| Layer | Technology |
|---|---|
| **Web** | Next.js, React, Tailwind CSS |
| **Blockchain** | Solidity, Ethers, Wagmi, ZK-Snarks |
| **Backend** | FastAPI, Python 3.12, LangGraph |
| **AI Models** | Groq (LLAMA 3), Cohere, HuggingFace |
| **Storage** | Supabase (PostgreSQL), Qdrant (Vector DB), Pinata (IPFS) |

## Getting Started

1.  **Frontend**: Navigate to `frontend/`, run `npm install` and `npm run dev`.
2.  **Contracts**: Navigate to `contracts/`, run `npm install`, then use `npx hardhat compile`.
3.  **Local Dev**: Currently optimized for Ethereum Sepolia testnet. ensure your `.env` files are configured with valid RPC URLs and Pinata/Supabase keys.
