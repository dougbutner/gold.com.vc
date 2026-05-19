/**
 * Live-RPC dry runs (read-only):
 * - EVM → Solana: `quoteEvmToSolana` → OFT `quoteSend` on every configured chain.
 * - Solana leg: `fetchSolanaSolomonBalance` (OFT store + ATA) — same RPC/OFT path the bridge uses before send.
 *
 * `quoteSolanaToEvm` is not invoked here: the OFT SDK’s quote path expects a Umi RPC in this environment
 * (`context.rpc.getAccount`), while production runs in the browser bundle; exercising send/quote for Sol→EVM
 * belongs in manual or E2E tests unless `src` gains a test-friendly entry (out of scope for tests-only changes).
 *
 * Default `npm test` skips the live block. Run with:
 *   BRIDGE_DRY_RUN=1 npm test
 */
import { describe, expect, it } from "vitest";
import { createPublicClient, http, type Address } from "viem";
import {
  rpcForEvmChain,
  SOLOMON_EVM_CHAINS,
  solanaRpcUrl,
  toWagmiChain,
} from "@/config/solomon";
import { quoteEvmToSolana } from "@/lib/layerzero/evmBridge";
import { fetchSolanaSolomonBalance } from "@/lib/layerzero/solanaBridge";

const DRY_RUN = process.env.BRIDGE_DRY_RUN === "1";

/** Valid 32-byte Solana pubkey (same family as other bridge tests). */
const SOL_RECIPIENT = "6Es2BNCrYC3xsmtqSkYzhTiQJkyt9AkpkQTyTsY28CTK";

describe.skipIf(!DRY_RUN)("bridge dry-run (live RPC, BRIDGE_DRY_RUN=1)", () => {
  it(
    "quotes EVM → Solana for every configured EVM chain (OFT quoteSend)",
    async () => {
      for (const chain of SOLOMON_EVM_CHAINS) {
        const wagmiChain = toWagmiChain(chain);
        const publicClient = createPublicClient({
          chain: wagmiChain,
          transport: http(rpcForEvmChain(chain.nativeChainId)),
        });
        const { msgFee, decimals } = await quoteEvmToSolana(publicClient, {
          amountHuman: "0.000001",
          recipientSolanaBase58: SOL_RECIPIENT,
          oftAddress: chain.oftAddress as Address,
        });
        expect(decimals).toBeGreaterThan(0);
        expect(msgFee.nativeFee).toBeGreaterThanOrEqual(0n);
      }
    },
    600_000
  );

  it(
    "reads Solana SOLOMON balance (OFT store + mint + ATA path used by bridge)",
    async () => {
      const { balance, decimals } = await fetchSolanaSolomonBalance({
        rpcEndpoint: solanaRpcUrl(),
        ownerPublicKeyBase58: SOL_RECIPIENT,
      });
      expect(decimals).toBeGreaterThan(0);
      expect(balance).toBeGreaterThanOrEqual(0n);
    },
    180_000
  );
});

describe("bridge dry-run (skipped unless BRIDGE_DRY_RUN=1)", () => {
  it("documents opt-in env", () => {
    expect(DRY_RUN).toBe(process.env.BRIDGE_DRY_RUN === "1");
  });
});
