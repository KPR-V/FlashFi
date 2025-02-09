# ⚡ FlashFi: AI-Powered Blockchain Assistant with Cross-Chain Capabilities 

FlashFi is an AI-powered blockchain assistant that enables seamless blockchain operations, including **staking**, **swapping**, **balance checks**, **security audits**, **gas price queries**, and **USDC bridging** between networks. 

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
 git clone <repository-url>
 cd <repository-name>
```

2️⃣ **Install backend dependencies:** 

```sh
 cd backend
 npm install
```

3️⃣ **Install frontend dependencies:** 

```sh
 cd ../frontend
 npm install
```

---

### 🔑 Configuration 

📌 **Create a `.env` file inside the `backend` directory:** 
```ini
OPEN_AI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_ethereum_private_key
INTEGRATOR_ID=your_squid_integrator_id
FROM_CHAIN_RPC=your_from_chain_rpc_url
RADIANT_LENDING_POOL_ADDRESS=radiant_lending_pool_contract_address
USDC_ARBITRUM_ADDRESS=usdc_arbitrum_contract_address
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PORT=3000
```

📌 **Update the `frontend/.env` file with the backend URL:** 

```ini
VITE_BACKEND_URL=http://localhost:3000
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

- ✨ **Staking:** `Stake 100 USDT on Radiant` 
- ✨ **Swapping:** `Swap 50 ETH for USDC` 
- ✨ **Balance Check:** `What's my ETH balance?` 
- ✨ **Security Audit:** `Check my wallet for risky approvals` 
- ✨ **Gas Price Query:** `What's the current gas price?` 
- ✨ **USDC Bridging:** `Bridge 1000 USDC from Ethereum to Avalanche` 
- ✨ **Send Transaction:** `Send 0.1 ETH to 0x1234...` 

---

## 🔄 Data Flow 

1️⃣ **User sends a request via WebSocket.** 
2️⃣ **Backend processes the request using the AI agent.** 
3️⃣ **The agent determines the appropriate tool for the operation.** 
4️⃣ **The tool executes the blockchain operation (staking, swapping, etc.).** 
5️⃣ **The response is sent back via WebSocket.** 
6️⃣ **Frontend displays the response.** 

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

