### Local Development

```bash
npx hardhat node

npm run deploy:local
```

### Sepolia Testnet

```bash
npm run deploy:sepolia

npm run verify:sepolia
```

## Contract Architecture

```
SimpleDEX
├── Constructor(tokenA, tokenB)
├── addLiquidity() - Add tokens to pool
├── swapAtoB() - Swap Token A for Token B
├── swapBtoA() - Swap Token B for Token A
├── getAmountOut() - Calculate swap output
└── getPrice() - Get current exchange rate

SimpleToken
├── Constructor(name, symbol, supply)
├── faucet() - Get 100 tokens (24h cooldown)
├── getFaucetCooldown() - Check cooldown time
└── mint() - Owner mint function
```