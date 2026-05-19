import { describe, expect, it } from "vitest";
import { buildSendParamEvmToSolana } from "@/lib/layerzero/evmBridge";
import { SOLANA_EID } from "@/config/solomon";

describe("buildSendParamEvmToSolana", () => {
  const validSolRecipient = "6Es2BNCrYC3xsmtqSkYzhTiQJkyt9AkpkQTyTsY28CTK";

  it("targets Solana EID and encodes a 32-byte recipient", () => {
    const p = buildSendParamEvmToSolana({
      amountHuman: "1.5",
      decimals: 9,
      recipientSolanaBase58: validSolRecipient,
    });
    expect(p.dstEid).toBe(SOLANA_EID);
    expect(p.to).toMatch(/^0x[a-f0-9]{64}$/i);
    expect(p.amountLD).toBe(1_500_000_000n);
    expect(p.minAmountLD).toBe(1_500_000_000n);
  });

  it("rejects non-32-byte base58 payloads", () => {
    expect(() =>
      buildSendParamEvmToSolana({
        amountHuman: "1",
        decimals: 9,
        recipientSolanaBase58: "not-a-solana-pubkey",
      })
    ).toThrow(/32 bytes|Non-base58 character/);
  });
});
