export type ExplorerContractConfig = {
  explorerContract: string;
};

export function submittedTxExplorerUrl(
  cfg: ExplorerContractConfig,
  txHash: string
): string {
  const url = cfg.explorerContract;
  const origin = (() => {
    for (const marker of ["/address/", "/account/", "/token/"] as const) {
      const i = url.indexOf(marker);
      if (i !== -1) return url.slice(0, i);
    }
    return url.split("/").slice(0, -1).join("/");
  })();
  const segment = url.includes("hashscan.io") ? "transaction" : "tx";
  return `${origin}/${segment}/${txHash}`;
}
