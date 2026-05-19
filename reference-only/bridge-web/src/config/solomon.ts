import type { Address, Chain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  blast,
  bsc,
  celo,
  fraxtal,
  gnosis,
  harmonyOne,
  kava,
  linea,
  mainnet,
  manta,
  mantle,
  moonbeam,
  opBNB,
  optimism,
  polygon,
  scroll,
} from "viem/chains";
import deployments from "../../SOLOMON_OFT_DEPLOYMENTS.json";

export const SOLOMON_DEPLOYMENTS = deployments;

export type EvmChainConfig = (typeof deployments.evmChains)[number];

export const SOLANA_EID = deployments.solana.layerZeroEid;
export const OFT_EVM_ADDRESS = deployments.shared.evmOftAddress as Address;

export const SOLOMON_EVM_CHAINS = deployments.evmChains;

const viemChains: Chain[] = [
  mainnet,
  arbitrum,
  optimism,
  base,
  bsc,
  polygon,
  avalanche,
  linea,
  mantle,
  blast,
  scroll,
  manta,
  opBNB,
  fraxtal,
  gnosis,
  celo,
  moonbeam,
  harmonyOne,
  kava,
];

const viemChainById: Record<number, Chain> = {};
for (const c of viemChains) {
  viemChainById[c.id] = c;
}

function nonEmptyEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function rpcForEvmChain(nativeChainId: number): string {
  const envMap: Record<number, string | undefined> = {
    1: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM),
    42161: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM),
    10: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM),
    8453: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_BASE),
    56: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_BSC),
    137: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_POLYGON),
    43114: nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_AVALANCHE),
  };
  const d = deployments.publicRpcDefaults;
  const legacyDefaults: Record<number, string | undefined> = {
    1: d.RPC_URL_ETHEREUM,
    42161: d.RPC_URL_ARBITRUM,
    10: d.RPC_URL_OPTIMISM,
    8453: d.RPC_URL_BASE,
    56: d.RPC_URL_BSC,
    137: d.RPC_URL_POLYGON,
    43114: d.RPC_URL_AVALANCHE,
  };
  const chain = viemChainById[nativeChainId];
  return (
    envMap[nativeChainId] ??
    legacyDefaults[nativeChainId] ??
    chain?.rpcUrls.default.http[0] ??
    mainnet.rpcUrls.default.http[0]
  );
}

export function toWagmiChain(cfg: EvmChainConfig): Chain {
  const baseChain = viemChainById[cfg.nativeChainId];
  if (!baseChain) throw new Error(`Unknown chain ${cfg.nativeChainId}`);
  const rpc = rpcForEvmChain(cfg.nativeChainId);
  return {
    ...baseChain,
    rpcUrls: { ...baseChain.rpcUrls, default: { http: [rpc] } },
  };
}

export const wagmiChains = SOLOMON_EVM_CHAINS.map(toWagmiChain);

export function getEvmChainById(id: number): EvmChainConfig | undefined {
  return SOLOMON_EVM_CHAINS.find((c) => c.nativeChainId === id);
}

export function solanaRpcUrl(): string {
  return (
    nonEmptyEnv(process.env.NEXT_PUBLIC_RPC_URL_SOLANA) ??
    deployments.publicRpcDefaults.RPC_URL_SOLANA
  );
}
