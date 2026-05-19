import { describe, expect, it } from "vitest";
import { submittedTxExplorerUrl } from "@/lib/submittedTxExplorerUrl";

describe("submittedTxExplorerUrl", () => {
  it("uses /tx/ for Etherscan-style /address/ explorers", () => {
    const hash =
      "0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcd";
    expect(
      submittedTxExplorerUrl(
        {
          explorerContract:
            "https://etherscan.io/address/0x94b354665e70fD2A74594595197CEb4527c36d7C",
        },
        hash
      )
    ).toBe(`https://etherscan.io/tx/${hash}`);
  });

  it("uses /transaction/ for HashScan /account/ URLs", () => {
    const hash =
      "0xdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdef";
    expect(
      submittedTxExplorerUrl(
        {
          explorerContract:
            "https://hashscan.io/mainnet/account/0x00000000000000000000000000000000009f224e",
        },
        hash
      )
    ).toBe(`https://hashscan.io/mainnet/transaction/${hash}`);
  });
});
