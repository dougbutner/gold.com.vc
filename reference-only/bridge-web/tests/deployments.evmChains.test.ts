import { describe, expect, it } from "vitest";
import {
  SOLOMON_DEPLOYMENTS,
  SOLOMON_EVM_CHAINS,
  SOLANA_EID,
} from "@/config/solomon";

const HEX_ADDR = /^0x[a-fA-F0-9]{40}$/;
const HEX_TX = /^0x[a-fA-F0-9]{64}$/;

describe("SOLOMON_OFT_DEPLOYMENTS evmChains", () => {
  it("lists the expected omnichain EVM count", () => {
    expect(SOLOMON_EVM_CHAINS.length).toBe(19);
  });

  it("uses unique nativeChainId values", () => {
    const ids = SOLOMON_EVM_CHAINS.map((c) => c.nativeChainId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps Solana LayerZero EID in sync with deployment file", () => {
    expect(SOLANA_EID).toBe(30168);
    expect(SOLOMON_DEPLOYMENTS.solana.layerZeroEid).toBe(30168);
  });

  it("marks Blast with a distinct OFT address from the shared default", () => {
    const shared = SOLOMON_DEPLOYMENTS.shared.evmOftAddress.toLowerCase();
    const blast = SOLOMON_EVM_CHAINS.find((c) => c.name === "Blast");
    expect(blast).toBeDefined();
    expect(blast!.oftAddress.toLowerCase()).not.toBe(shared);
    expect(blast!.oftAddress.toLowerCase()).toBe(
      "0xd6562e260f5626fb2345e82baad4e15352e6695f"
    );
  });

  it("requires valid-looking OFT addresses and explorer URLs on each chain", () => {
    for (const c of SOLOMON_EVM_CHAINS) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.lzEid).toBeGreaterThan(0);
      expect(c.oftAddress).toMatch(HEX_ADDR);
      expect(c.explorerContract).toMatch(/^https:\/\//);
      expect(c.deploymentTx).toMatch(HEX_TX);
      expect(c.explorerTx).toMatch(/^https:\/\//);
    }
  });
});
