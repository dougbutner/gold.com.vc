import {
  WalletSendTransactionError,
  WalletSignTransactionError,
  WalletWindowClosedError,
} from "@solana/wallet-adapter-base";

const CANCELLED_MSG =
  "Transaction was cancelled in your wallet. Nothing was sent—you can try again when ready.";

/** Maps wallet reject / close to a calm UI string; otherwise returns null (use raw message). */
export function trySolanaWalletCancellationMessage(error: unknown): string | null {
  if (
    error instanceof WalletSignTransactionError ||
    error instanceof WalletSendTransactionError ||
    error instanceof WalletWindowClosedError
  ) {
    return CANCELLED_MSG;
  }
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    if (
      m.includes("user rejected") ||
      m.includes("rejected the request") ||
      m.includes("user declined") ||
      m.includes("cancelled by user")
    ) {
      return CANCELLED_MSG;
    }
  }
  return null;
}
