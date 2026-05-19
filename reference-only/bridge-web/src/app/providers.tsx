"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import type { Chain } from "wagmi/chains";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { Adapter } from "@solana/wallet-adapter-base";
import * as SolanaWalletAdapters from "@solana/wallet-adapter-wallets";
import { useMemo, type ReactNode } from "react";
import { wagmiChains, solanaRpcUrl } from "@/config/solomon";

import "@rainbow-me/rainbowkit/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo_placeholder";

const wagmiConfig = getDefaultConfig({
  appName: "SOLOMON · LayerZero",
  projectId,
  chains: wagmiChains as [Chain, ...Chain[]],
  ssr: true,
});

/** Legacy adapters only — Phantom and other Wallet Standard wallets are merged by `WalletProvider`. */
const SOLANA_WALLET_ADAPTER_NAMES = [
  "SolflareWalletAdapter",
  "BackpackWalletAdapter",
  "CoinbaseWalletAdapter",
  "Coin98WalletAdapter",
  "TrustWalletAdapter",
  "NightlyWalletAdapter",
  "TorusWalletAdapter",
] as const;

type WalletAdapterCtor = new () => Adapter;

function resolveSolanaWalletConstructors(): WalletAdapterCtor[] {
  const adapterModule = SolanaWalletAdapters as Record<string, unknown>;
  return SOLANA_WALLET_ADAPTER_NAMES.map((name) => adapterModule[name])
    .filter((ctor): ctor is WalletAdapterCtor => typeof ctor === "function");
}

function buildSolanaWallets(): Adapter[] {
  const wallets: Adapter[] = [];
  const seenNames = new Set<string>();
  for (const AdapterCtor of resolveSolanaWalletConstructors()) {
    try {
      const wallet = new AdapterCtor();
      if (seenNames.has(wallet.name)) continue;
      wallets.push(wallet);
      seenNames.add(wallet.name);
    } catch {
      // Some adapters may require extra config; skip safely.
    }
  }
  return wallets;
}

export function Providers({ children }: { children: ReactNode }) {
  const solWallets = useMemo(() => buildSolanaWallets(), []);
  const solRpc = solanaRpcUrl();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#c4a574",
            accentColorForeground: "#0c0c0e",
            borderRadius: "medium",
          })}
        >
          <ConnectionProvider endpoint={solRpc}>
            <WalletProvider wallets={solWallets} autoConnect>
              <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
