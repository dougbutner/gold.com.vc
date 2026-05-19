# SOLOMON bridge (`bridge-web`)

Next.js UI for bridging SOLOMON between Solana and EVM chains via LayerZero. Deployment addresses and EIDs: see [`../SETUP_FOR_SOLOMON.md`](../SETUP_FOR_SOLOMON.md) and `SOLOMON_OFT_DEPLOYMENTS.json`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For production WalletConnect traffic, set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local` (see `src/app/providers.tsx`).

## Documentation and resources

Curated links (WalletConnect / Reown, RainbowKit, wagmi, viem, LayerZero, Solana wallet adapter, and each supported Solana wallet) live in **[`../docs/RESOURCES.md`](../docs/RESOURCES.md)**. The bridge page also includes a **Documentation and resources** panel with the same outbound links.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Next.js reference

- [Next.js documentation](https://nextjs.org/docs)
- [Deploying to Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
