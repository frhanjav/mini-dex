# Mini DEX Documentation

Mini DEX is a complete AMM (Automated Market Maker) implementation featuring:

- **Two Custom ERC-20 Tokens**: TOM and BEN with built-in faucets
- **AMM Pool**: Single liquidity pool using constant product formula
- **Modern Frontend**: Next.js application with wallet integration
- **Local Development**: Complete Hardhat environment with explorer
- **Testnet Ready**: Deployed and verified on Sepolia

## Live Deployment (Sepolia Testnet)

### Verified and Deployed Contracts

- **[TOM Token](https://sepolia.etherscan.io/address/0xFda6691C96F1b48819EE16A782aAecC720237E2b#code)**: `0xFda6691C96F1b48819EE16A782aAecC720237E2b`
- **[BEN Token](https://sepolia.etherscan.io/address/0x16D3f4D3631E275b4D3c89Fa80DcCdd360E5d3Bc#code)**: `0x16D3f4D3631E275b4D3c89Fa80DcCdd360E5d3Bc`
- **[SimpleDEX](https://sepolia.etherscan.io/address/0x5Ed6038971F5a7Cd05a5BC2b37a2eFa7547eeB8B#code)**: `0x5Ed6038971F5a7Cd05a5BC2b37a2eFa7547eeB8B`

## Clone and Install

```bash
git clone https://github.com/your-username/mini-dex.git
cd mini-dex

cd blockchain && npm install
cd ../frontend && npm install
```

## Local Development Setup

### 1. Start Local Blockchain

```bash
cd blockchain
npx hardhat node
```

This starts a local Ethereum network on `http://127.0.0.1:8545`

### 2. Deploy Smart Contracts

```bash
cd blockchain
npm run deploy:local
```

### 3. Start Blockscout Explorer (Optional)

<img src="https://media.frhn.me/blockscout.png" alt="Blockscout Explorer" style="max-width:500px; width:100%; display:block; margin:auto;" />

<br />

```bash
git clone https://github.com/blockscout/blockscout.git
cd blockscout/docker-compose

docker-compose -f hardhat-network.yml up -d
```

Access at: http://localhost:80

### 4. Configure & Start Frontend

```bash
cd frontend

cp .env.local.example .env.local

npm run dev
```

Access at: http://localhost:3000

### 5. Configure MetaMask

1. **Add Hardhat Network**:

   - Network: Hardhat Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337

2. **Import Test Account**: Use any private key from Hardhat output

## Testnet Deployment

### Deploy to Sepolia

1. **Setup Environment**:

```bash
cd blockchain
cp .env.example .env
```

2. **Deploy Contracts**:

```bash
npm run deploy:sepolia
```

3. **Verify Contracts**:

```bash
npm run verify:sepolia
```

4. **Update Frontend**:
   Update `frontend/src/contracts/addresses.ts` with new contract addresses.

## Smart Contracts

### SimpleToken.sol

ERC-20 token with built-in faucet functionality:

**Key Features:**

- Standard ERC-20 implementation
- `faucet()` function: Get 100 tokens every 24 hours
- `getFaucetCooldown()`: Check remaining cooldown time
- Owner minting capabilities
- Event logging for faucet usage

### SimpleDEX.sol

Automated Market Maker implementation:

**Key Features:**

- Constant product formula (x \* y = k)
- 0.3% trading fee
- Slippage protection with deadlines
- `swapAtoB()` / `swapBtoA()` functions
- `addLiquidity()` for pool management
- `getAmountOut()` for price calculation
- `getPrice()` for current exchange rates

## Frontend Application

### Technology Stack

- **Next.js**: React framework with App Router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first styling framework
- **Reown AppKit**: Wallet connection and Web3 integration
- **Ethers.js v6**: Blockchain interaction library