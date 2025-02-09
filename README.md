# ⚡ FlashFi: AI-Powered Blockchain Assistant with Cross-Chain Capabilities 

FlashFi is an AI-powered blockchain assistant that enables seamless blockchain operations, including **staking**, **swapping**, **balance checks**, **contarct approvals**, **gas price queries**, and **USDC bridging** between networks. 

## 📁 Repository Structure 

📂 **backend/** - Server-side code and blockchain logic.

- 📜 `src/` - Source code for the backend.
  - 🤖 `agents/` - AI agents for different blockchain operations. 
  - 📝 `abi/` - Smart contract ABIs. 
  - 🛠 `utils/` - Utility functions. 
- 📄 `package.json` - Backend dependencies & scripts. 
- ⚙️ `tsconfig.json` - TypeScript configuration. 
📂 **frontend/** - React-based user interface.

- 🖼 `src/` - Source code for the frontend.
  - 📦 `components/` - UI components. 
  - 🔧 `utils/` - Helper functions. 
- 📄 `package.json` - Frontend dependencies & scripts. 
- ⚙️ `vite.config.ts` - Vite configuration. 

---

## 🚀 Getting Started

### 🔧 Installation 

1️⃣ **Clone the repository:**

```sh
 git clone https://github.com/KPR-V/FlashFi
 cd FlashFi
```

2️⃣ **Install backend dependencies:** 

```sh
 cd backend
 npm install
```

3️⃣ **Install frontend dependencies:** 

```sh
 cd  frontend
 npm install
```

---

### 🔑 Configuration 

📌 **Create a `.env` file inside the `backend` directory:** 
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
GOLDRUSH_API_KEY=your_goldrush_api_key
ETH_TESTNET_RPC=your_sepolia_rpc_url
AVAX_TESTNET_RPC=your_avalanche_fuji_rpc_url
ETH_PRIVATE_KEY=your_ethereum_private_key
AVAX_PRIVATE_KEY=your_avax_private_key
PORT=3000
```



---

### ▶️ Running the Application 

1️⃣ **Start the backend server:** 

```sh
 cd backend
 npm run dev
```

2️⃣ **Start the frontend development server:** 

```sh
 cd frontend
 npm run dev
```

3️⃣ **Open [http://localhost:5173](http://localhost:5173) in your browser.** 

---

## 🛠 Features & Usage ✨

You can interact with the AI-powered assistant via a **chat interface**. Here are some example prompts:

- ✨ **Staking:** `Stake my 10 usdt on binance to radiant lending pool on arbitrum in usdc` 
- ✨ **Swapping:** `Swap 0.1 usdc on eth-mainnet to eth on arbitrum` 
- ✨ **Balance Check:** `what is the balance of <wallet_address> on <chain>` 
- ✨ **Security Audit:** `check approvals for <wallet_address> on <chain>` 
- ✨ **Gas Price Query:** `gas price on <chain>` 
- ✨ **USDC Bridging:** `bridge 10 usdc from eth sepolia to avalanche fuji` 
- ✨ **Send Transaction:** `send <amount> to <wallet_address>` 

---

## 🔄 Data Flow 

- 1️⃣ **User sends a request via WebSocket.** 
- 2️⃣ **Backend processes the request using the AI agent.** 
- 3️⃣ **The agent determines the appropriate tool for the operation.** 
- 4️⃣ **The tool executes the blockchain operation (staking, swapping, etc.).** 
- 5️⃣ **The response is sent back via WebSocket.** 
- 6️⃣ **Frontend displays the response.** 

```plaintext
[User] -> [Frontend] -> [WebSocket] -> [Backend Server]
                                        |
                                 [Blockchain Agent]
                                        |
                               [Appropriate Tool]
                                        |
                              [Blockchain/API]
                                        |
[User] <- [Frontend] <- [WebSocket] <- [Backend Server]
```

---

## 🛠 Troubleshooting 

- ❌ **CORS Issues?** → Ensure the **frontend origin** is correctly set in the backend's CORS configuration. 🌐⚠️🔧
- ❌ **WebSocket Connection Problems?** → Verify the **WebSocket server URL** in the frontend matches the backend. 📡⚠️🔍
- ❌ **Transaction Failures?** → Check if you have sufficient **balance** and that the **blockchain network (e.g., Sepolia) is operational**. 💰⚠️🔗

---

## 🏗 Infrastructure 

FlashFi utilizes:

-  **Covalent's AI Agent Kit**
-  **Privy** - Wallet management & transaction signing 🏦🔏💳
-  **OpenAI** -model for agent


---

🎉 **Now you're ready to experience FlashFi!** 🚀

