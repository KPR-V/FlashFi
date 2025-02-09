<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://flashfi.gitbook.io/flashfi/">
    <img src="frontend/Images/Untitled.png" alt="Logo" width="200" height="200">
  </a>


# ⚡ FlashFi: AI-Powered Blockchain Assistant with Cross-Chain Capabilities 

FlashFi is an **agentic AI assistant** made using **Covalent's AI Agent Kit** and **Privy's server wallets**. It enables seamless blockchain operations like **staking**, **swapping**, **balance checks**, **security audits**, **gas price queries**, and **USDC bridging** between networks. 
<p align="center">
    <a href="https://flashfi.gitbook.io/flashfi/">📖 View Docs</a>
    ·
    <a href="https://github.com/KPR-V/FlashFi/issues/new?labels=bug&template=bug-report.md">🐛 Report Bug</a>
    ·
    <a href="https://github.com/KPR-V/FlashFi/issues/new?labels=enhancement&template=feature-request.md">✨ Request Feature</a>
  </p>

</div>

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

### ▶️ Running the Application 
```sh
 cd backend && npm run dev
 cd frontend && npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

## 🛠 Features & Usage ✨
:
You can interact with the AI-powered assistant via a **chat interface**. Here are some example prompts:

- ✨ **Staking:** `Stake my 10 usdt on binance to radiant lending pool on arbitrum in usdc` 
- ✨ **Swapping:** `Swap 0.1 usdc on eth-mainnet to eth on arbitrum` 
- ✨ **Balance Check:** `what is the balance of <wallet_address> on <chain>` 
- ✨ **Security Audit:** `check approvals for <wallet_address> on <chain>` 
- ✨ **Gas Price Query:** `gas price on <chain>` 
- ✨ **USDC Bridging:** `bridge 10 usdc from eth sepolia to avalanche fuji` 
- ✨ **Send Transaction:** `send <amount> to <wallet_address>` 


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

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/KPR-V/FlashFi.svg?style=for-the-badge
[contributors-url]: https://github.com/KPR-V/FlashFi/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/KPR-V/FlashFi.svg?style=for-the-badge
[forks-url]: https://github.com/KPR-V/FlashFi/network/members
[stars-shield]: https://img.shields.io/github/stars/KPR-V/FlashFi.svg?style=for-the-badge
[stars-url]: https://github.com/KPR-V/FlashFi/stargazers
[issues-shield]: https://img.shields.io/github/issues/KPR-V/FlashFi.svg?style=for-the-badge
[issues-url]: https://github.com/KPR-V/FlashFi/issues
[license-shield]: https://img.shields.io/github/license/KPR-V/FlashFi.svg?style=for-the-badge
[license-url]: https://github.com/KPR-V/FlashFi/blob/master/LICENSE.txt