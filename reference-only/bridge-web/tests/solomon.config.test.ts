import { describe, expect, it } from "vitest";
import {
  getEvmChainById,
  rpcForEvmChain,
  SOLOMON_EVM_CHAINS,
  toWagmiChain,
} from "@/config/solomon";

describe("solomon config helpers", () => {
  it("resolves Ethereum by chain id", () => {
    const eth = getEvmChainById(1);
    expect(eth?.name).toBe("Ethereum");
    expect(eth?.lzEid).toBe(30101);
  });

  it("returns an HTTP RPC URL for every configured EVM chain", () => {
    for (const c of SOLOMON_EVM_CHAINS) {
      const url = rpcForEvmChain(c.nativeChainId);
      expect(url).toMatch(/^https?:\/\//);
    }
  });

  it("builds a wagmi chain for every deployment row", () => {
    for (const c of SOLOMON_EVM_CHAINS) {
      const chain = toWagmiChain(c);
      expect(chain.id).toBe(c.nativeChainId);
      expect(chain.rpcUrls.default.http[0]).toMatch(/^https?:\/\//);
    }
  });
});
