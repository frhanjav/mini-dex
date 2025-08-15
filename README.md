# Mini DEX

**A full-stack decentralized exchange (DEX) built with Hardhat and Next.js, featuring token faucets and AMM swapping.**

<img src="https://media.frhn.me/homepage.png" alt="Mini DEX Interface" style="max-width:300px; width:100%; display:block; margin:auto;" />

## Features

- **Token Swapping**: AMM-based swapping using constant product formula (x \* y = k)
- **Token Faucet**: Built-in faucet for easy testing (100 tokens every 24 hours)
- **Liquidity Management**: Add liquidity to the pool
- **Multi-Network**: Local development and Sepolia testnet support
- **Blockchain Explorer**: Integrated Blockscout for transaction monitoring
- **Responsive UI**: Modern interface with wallet connection
- **Verified Contracts**: Source code verified on Etherscan

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/frhanjav/mini-dex.git
cd mini-dex

cd blockchain && npm install

cd ../frontend && npm install
```

### 2. Local Development Setup

#### Start Local Blockchain

```bash
cd blockchain
npx hardhat node
```

#### Deploy Contracts (New Terminal)

```bash
cd blockchain
npm run deploy:local
```

#### Start Blockchain Explorer (Optional)

```bash
git clone https://github.com/blockscout/blockscout.git
cd blockscout/docker-compose

docker-compose -f hardhat-network.yml up -d
```

Access at: http://localhost:80

#### Configure Frontend

```bash
cd frontend
cp .env.local.example .env
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

### 3. MetaMask Configuration

1. **Add Hardhat Network**:

   - Network: Hardhat Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337

2. **Import Test Account**: Use any private key from Hardhat node output

## Live Deployment (Sepolia Testnet)

### Verified and Deployed Contracts

- **[TOM Token](https://sepolia.etherscan.io/address/0xFda6691C96F1b48819EE16A782aAecC720237E2b#code)**: `0xFda6691C96F1b48819EE16A782aAecC720237E2b`
- **[BEN Token](https://sepolia.etherscan.io/address/0x16D3f4D3631E275b4D3c89Fa80DcCdd360E5d3Bc#code)**: `0x16D3f4D3631E275b4D3c89Fa80DcCdd360E5d3Bc`
- **[SimpleDEX](https://sepolia.etherscan.io/address/0x5Ed6038971F5a7Cd05a5BC2b37a2eFa7547eeB8B#code)**: `0x5Ed6038971F5a7Cd05a5BC2b37a2eFa7547eeB8B`

### Using the Live DEX

1. Switch MetaMask to Sepolia Testnet
2. Get Sepolia ETH from faucet
3. Visit the dex faucet tab to get test tokens
4. Start swapping!