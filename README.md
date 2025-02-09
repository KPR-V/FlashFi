# ⚡ FlashFi: AI-Powered Blockchain Assistant with Cross-Chain Capabilities 

FlashFi is an **agentic AI assistant** made using **Covalent's AI Agent Kit** and **Privy's server wallets**. It enables seamless blockchain operations like **staking**, **swapping**, **balance checks**, **security audits**, **gas price queries**, and **USDC bridging** between networks. 

## 📁 Repository Structure 

📂 **backend/** - Server-side code and blockchain logic.

- 📜 `src/`
  - 🤖 `agents/` - AI agents for blockchain operations. 
  - 📝 `abi/` - Smart contract ABIs. 
  - 🛠 `utils/` - Utility functions. 
- 📄 `package.json` - Backend dependencies & scripts. 

📂 **frontend/** - React-based user interface.

- 🖼 `src/`
  - 📦 `components/` - UI components. 
  - 🔧 `utils/` - Helper functions. 
- 📄 `package.json` - Frontend dependencies & scripts. 

## 🚀 Getting Started

### 🔧 Installation 

```sh
 git clone https://github.com/KPR-V/FlashFi
 cd https://github.com/KPR-V/FlashFi
 cd backend && npm install
 cd ../frontend && npm install
```

### 🔑 Configuration 

📌 **Create `.env` file in `backend/`:** 
```ini
OPEN_AI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_ethereum_private_key
INTEGRATOR_ID=your_squid_integrator_id
FROM_CHAIN_RPC=your_eth-mainnet_rpc_url
RADIANT_LENDING_POOL_ADDRESS=radiant_lending_pool_contract_address
USDC_ARBITRUM_ADDRESS=usdc_arbitrum_contract_address
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETH_TESTNET_RPC=<ETH_TESTNET_RPC_URL>
AVAX_TESTNET_RPC=<AVAX_TESTNET_RPC_URL>
ETH_PRIVATE_KEY=<ADD_ORIGINATING_ADDRESS_PRIVATE_KEY>
AVAX_PRIVATE_KEY=<ADD_RECEIPIENT_ADDRESS_PRIVATE_KEY>
PORT=3000
```

📌 **Create `.env` file in `frontend/`:** 
```ini
VITE_BACKEND_URL=http://localhost:3000
```

### ▶️ Running the Application 
```sh
 cd backend && npm run dev
 cd frontend && npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

## 🛠 Features & Usage ✨

Interact with the AI assistant via chat:

- ✨ `Stake 100 USDT on Radiant` 
- ✨ `Swap 50 ETH for USDC` 
- ✨ `What's my ETH balance?` 
- ✨ `Check my wallet for risky approvals` 
- ✨ `What's the current gas price?` 
- ✨ `Bridge 1000 USDC from Ethereum to Avalanche` 
- ✨ `Send 0.1 ETH to 0x1234...` 

## 🔄 Data Flow 

```plaintext
[User] -> [Frontend] -> [WebSocket] -> [Backend Server]
                                        |
                                 [Blockchain Agent]
                                        |
                               [Blockchain/API]
                                        |
[User] <- [Frontend] <- [WebSocket] <- [Backend Server]
```

## 🏗 Infrastructure 

FlashFi utilizes:

- **Covalent's AI Agent Kit** 
- **Privy Server Wallets** 
- **OpenAI** for intelligent agent decisions 🧠

🎉 **Now you're ready to experience FlashFi!** 🚀
