"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, formatUnits, isAddress, type Address } from "viem";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getWalletClient } from "@wagmi/core";
import {
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { documentationResourceGroups } from "@/config/documentationResources";
import {
  SOLOMON_EVM_CHAINS,
  SOLOMON_DEPLOYMENTS,
  solanaRpcUrl,
  type EvmChainConfig,
  wagmiChains,
} from "@/config/solomon";
import { oftAbi } from "@/lib/layerzero/oftAbi";
import { quoteEvmToSolana, sendEvmToSolana } from "@/lib/layerzero/evmBridge";
import {
  fetchSolanaSolomonBalance,
  quoteSolanaToEvm,
  sendSolanaToEvm,
} from "@/lib/layerzero/solanaBridge";
import { submittedTxExplorerUrl } from "@/lib/submittedTxExplorerUrl";
import { bridgeDebugLog } from "@/lib/bridgeDebugLog";
import {
  EMPTY_WALLET_ACCOUNT_BOOK,
  loadWalletAccountBook,
  removeWalletAccount,
  saveWalletAccountBook,
  upsertWalletAccount,
} from "@/lib/walletAccountBook";

type Direction = "evmToSol" | "solToEvm";
type ChainModalTarget = "source" | "destination" | null;
type WalletTab = "evm" | "solana";

/** User-facing send progress below the Send button (Solana: sign → confirm; EVM: wallet → submitted). */
type SendFlowStatus =
  | { chain: "solana"; stage: "await_wallet" | "pending" | "confirmed" }
  | { chain: "evm"; stage: "await_wallet" | "confirmed"; txHash?: string };

function BridgeSendFlowStatus({ status }: { status: SendFlowStatus }) {
  if (status.chain === "solana") {
    if (status.stage === "await_wallet") {
      return (
        <p className="text-sm leading-relaxed text-zinc-300">
          Check your wallet to{" "}
          <span className="font-semibold text-amber-200">approve</span> the transaction.
        </p>
      );
    }
    if (status.stage === "pending") {
      return (
        <p className="text-sm leading-relaxed text-zinc-300">
          Transaction <span className="font-semibold text-yellow-400">pending</span>—waiting for
          confirmation on Solana.
        </p>
      );
    }
    return (
      <p className="text-sm leading-relaxed text-zinc-300">
        Solana transaction <span className="font-semibold text-emerald-400">confirmed</span>.
      </p>
    );
  }
  if (status.stage === "await_wallet") {
    return (
      <p className="text-sm leading-relaxed text-zinc-300">
        Check your wallet to <span className="font-semibold text-amber-200">confirm</span> the
        transaction.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-sm leading-relaxed text-zinc-300">
        Transaction <span className="font-semibold text-emerald-400">submitted</span>.
      </p>
      {status.txHash ? (
        <p className="break-all font-mono text-[11px] text-zinc-500">{status.txHash}</p>
      ) : null}
    </div>
  );
}

const pathway = SOLOMON_DEPLOYMENTS.pathway;
const solMeta = SOLOMON_DEPLOYMENTS.solana;
const refs = SOLOMON_DEPLOYMENTS.references;
const DEFAULT_DIRECTION: Direction = "evmToSol";
const DEFAULT_EVM_CHAIN = SOLOMON_EVM_CHAINS[0];
const POPULAR_CHAIN_IDS = [1, 42161, 10, 8453, 56, 137, 43114];

function findEvmChainByNativeChainId(value: string | null): EvmChainConfig | undefined {
  if (!value) return undefined;
  const chainId = Number(value);
  if (!Number.isInteger(chainId)) return undefined;
  return SOLOMON_EVM_CHAINS.find((chain) => chain.nativeChainId === chainId);
}

function isValidSolanaPubkeyBase58(value: string): boolean {
  if (!value) return false;
  try {
    return bs58.decode(value).length === 32;
  } catch {
    return false;
  }
}

function shortenAddress(value: string, left = 6, right = 4): string {
  if (value.length <= left + right + 1) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
}

function addressEquals(a: string, b: string, type: WalletTab): boolean {
  if (type === "evm") return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

function evmAddressExplorerUrl(chainId: number, address: string): string | null {
  const chain = wagmiChains.find((item) => item.id === chainId);
  const base = chain?.blockExplorers?.default?.url;
  return base ? `${base}/address/${address}` : null;
}

/** SOLOMON amount field: at most this many digits after the decimal. */
const SOLOMON_INPUT_MAX_DECIMALS = 6;

function sanitizeSolomonAmountInput(raw: string): string {
  if (raw === "") return "";
  const s = raw.replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot === -1) return s;
  const intPart = s.slice(0, firstDot) || "0";
  let frac = s.slice(firstDot + 1).replace(/\./g, "");
  frac = frac.slice(0, SOLOMON_INPUT_MAX_DECIMALS);
  if (frac.length === 0) return `${intPart}.`;
  return `${intPart}.${frac}`;
}

/** Truncate a human decimal string to at most `maxFrac` fractional digits (no rounding). */
function truncateHumanAmountToDecimals(human: string, maxFrac: number): string {
  const [intPart = "0", frac = ""] = human.split(".");
  const ft = frac.slice(0, maxFrac);
  return ft.length ? `${intPart}.${ft}` : intPart;
}

export function BridgeApp() {
  const [direction, setDirection] = useState<Direction>(DEFAULT_DIRECTION);
  const [evmSource, setEvmSource] = useState<EvmChainConfig>(DEFAULT_EVM_CHAIN);
  const [evmDest, setEvmDest] = useState<EvmChainConfig>(DEFAULT_EVM_CHAIN);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [quoteMsg, setQuoteMsg] = useState<string | null>(null);
  const [sendFlowStatus, setSendFlowStatus] = useState<SendFlowStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [txLink, setTxLink] = useState<string | null>(null);
  const [routeStateReady, setRouteStateReady] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [chainModalTarget, setChainModalTarget] = useState<ChainModalTarget>(null);
  const [chainSearch, setChainSearch] = useState("");
  const [chainModalSelection, setChainModalSelection] =
    useState<EvmChainConfig>(DEFAULT_EVM_CHAIN);
  const [walletDrawerOpen, setWalletDrawerOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>("evm");
  const [accountBook, setAccountBook] = useState(EMPTY_WALLET_ACCOUNT_BOOK);
  const [selectedEvmAddress, setSelectedEvmAddress] = useState<string | null>(null);
  const [selectedSolAddress, setSelectedSolAddress] = useState<string | null>(null);
  const [recipientBookOpen, setRecipientBookOpen] = useState(false);
  const initializedFromSearchParamsRef = useRef(false);
  const hydratedAccountBookRef = useRef(false);
  const openEvmConnectModalRef = useRef<(() => void) | null>(null);
  const openEvmAccountModalRef = useRef<(() => void) | null>(null);
  const recipientBookRef = useRef<HTMLDivElement>(null);

  const { address, isConnected, chainId, connector } = useAccount();
  const config = useConfig();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync: disconnectEvm } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: evmSource.nativeChainId });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const solWallet = useWallet();
  const { setVisible: openSolModal } = useWalletModal();
  const queryClient = useQueryClient();
  const recipientTrimmed = recipient.trim();
  const evmToSolRecipientValid = isValidSolanaPubkeyBase58(recipientTrimmed);
  const solToEvmRecipientValid = isAddress(recipientTrimmed);
  const activeDirectionWalletConnected =
    direction === "evmToSol" ? isConnected : solWallet.connected;

  const evmAccounts = useMemo(
    () => [...accountBook.evm].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [accountBook.evm]
  );
  const availableEvmConnectors = useMemo(
    () =>
      connectors.filter(
        (item, index, all) =>
          all.findIndex(
            (candidate) => candidate.id === item.id && candidate.name === item.name
          ) === index
      ),
    [connectors]
  );
  const solAccounts = useMemo(
    () => [...accountBook.solana].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [accountBook.solana]
  );

  const filteredChains = useMemo(() => {
    const trimmed = chainSearch.trim().toLowerCase();
    if (!trimmed) return SOLOMON_EVM_CHAINS;
    return SOLOMON_EVM_CHAINS.filter((chain) =>
      `${chain.name} ${chain.nativeChainId}`.toLowerCase().includes(trimmed)
    );
  }, [chainSearch]);

  const popularChains = useMemo(
    () => SOLOMON_EVM_CHAINS.filter((chain) => POPULAR_CHAIN_IDS.includes(chain.nativeChainId)),
    []
  );

  const activeEvmAddress = address ?? null;
  const activeSolAddress = solWallet.publicKey?.toBase58() ?? null;
  const evmSignerMismatch =
    direction === "evmToSol" &&
    Boolean(
      selectedEvmAddress &&
        activeEvmAddress &&
        !addressEquals(selectedEvmAddress, activeEvmAddress, "evm")
    );
  const solSignerMismatch =
    direction === "solToEvm" &&
    Boolean(
      selectedSolAddress &&
        activeSolAddress &&
        !addressEquals(selectedSolAddress, activeSolAddress, "solana")
    );

  const recipientBookEntries = useMemo(() => {
    if (direction === "solToEvm") {
      const out: { value: string; label: string }[] = [];
      const seen = new Set<string>();
      const push = (value: string, label: string) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ value, label });
      };
      if (activeEvmAddress && isAddress(activeEvmAddress)) {
        push(activeEvmAddress, `${shortenAddress(activeEvmAddress)} · connected`);
      }
      for (const row of evmAccounts) {
        if (isAddress(row.address)) push(row.address, shortenAddress(row.address));
      }
      return out;
    }
    const out: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    const push = (value: string, label: string) => {
      if (seen.has(value)) return;
      seen.add(value);
      out.push({ value, label });
    };
    if (activeSolAddress && isValidSolanaPubkeyBase58(activeSolAddress)) {
      push(activeSolAddress, `${shortenAddress(activeSolAddress)} · connected`);
    }
    for (const row of solAccounts) {
      if (isValidSolanaPubkeyBase58(row.address)) push(row.address, shortenAddress(row.address));
    }
    return out;
  }, [direction, activeEvmAddress, evmAccounts, activeSolAddress, solAccounts]);

  useEffect(() => {
    setRecipientBookOpen(false);
  }, [direction]);

  useEffect(() => {
    if (!recipientBookOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const root = recipientBookRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setRecipientBookOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [recipientBookOpen]);

  useEffect(() => {
    if (initializedFromSearchParamsRef.current) return;
    initializedFromSearchParamsRef.current = true;

    const directionParam = searchParams.get("dir");
    if (directionParam === "evmToSol" || directionParam === "solToEvm") {
      setDirection(directionParam);
    }

    const sourceChain = findEvmChainByNativeChainId(searchParams.get("src"));
    if (sourceChain) setEvmSource(sourceChain);

    const destinationChain = findEvmChainByNativeChainId(searchParams.get("dst"));
    if (destinationChain) setEvmDest(destinationChain);

    setRouteStateReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (!routeStateReady) return;

    const nextParams = new URLSearchParams();
    if (direction !== DEFAULT_DIRECTION) nextParams.set("dir", direction);
    if (evmSource.nativeChainId !== DEFAULT_EVM_CHAIN.nativeChainId) {
      nextParams.set("src", String(evmSource.nativeChainId));
    }
    if (evmDest.nativeChainId !== DEFAULT_EVM_CHAIN.nativeChainId) {
      nextParams.set("dst", String(evmDest.nativeChainId));
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextHref, { scroll: false });
  }, [
    direction,
    evmDest.nativeChainId,
    evmSource.nativeChainId,
    pathname,
    routeStateReady,
    router,
    searchParams,
  ]);

  useEffect(() => {
    setAccountBook(loadWalletAccountBook());
    hydratedAccountBookRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedAccountBookRef.current) return;
    saveWalletAccountBook(accountBook);
  }, [accountBook]);

  useEffect(() => {
    if (!address) return;
    setAccountBook((prev) =>
      upsertWalletAccount(prev, {
        type: "evm",
        address,
        walletName: connector?.name,
        connectorId: connector?.id,
      })
    );
    setSelectedEvmAddress((prev) => prev ?? address);
  }, [address, connector?.id, connector?.name]);

  useEffect(() => {
    if (!solWallet.publicKey) return;
    const pubkey = solWallet.publicKey.toBase58();
    setAccountBook((prev) =>
      upsertWalletAccount(prev, {
        type: "solana",
        address: pubkey,
        walletName: solWallet.wallet?.adapter.name,
      })
    );
    setSelectedSolAddress((prev) => prev ?? pubkey);
  }, [solWallet.publicKey, solWallet.wallet?.adapter.name]);

  useEffect(() => {
    if (selectedEvmAddress) return;
    if (address) {
      setSelectedEvmAddress(address);
      return;
    }
    if (evmAccounts.length > 0) {
      setSelectedEvmAddress(evmAccounts[0].address);
    }
  }, [address, evmAccounts, selectedEvmAddress]);

  useEffect(() => {
    if (selectedSolAddress) return;
    if (activeSolAddress) {
      setSelectedSolAddress(activeSolAddress);
      return;
    }
    if (solAccounts.length > 0) {
      setSelectedSolAddress(solAccounts[0].address);
    }
  }, [activeSolAddress, selectedSolAddress, solAccounts]);

  const solanaBalanceQuery = useQuery({
    queryKey: ["solomonSolBalance", solWallet.publicKey?.toBase58(), solanaRpcUrl()] as const,
    queryFn: () =>
      fetchSolanaSolomonBalance({
        rpcEndpoint: solanaRpcUrl(),
        ownerPublicKeyBase58: solWallet.publicKey!.toBase58(),
      }),
    enabled: Boolean(solWallet.publicKey),
  });

  const wrongEvmNetwork =
    direction === "evmToSol" && isConnected && chainId !== evmSource.nativeChainId;

  const quoteEvm = useCallback(async () => {
    if (!evmToSolRecipientValid) {
      setQuoteMsg("Recipient must be a valid Solana base58 public key.");
      return;
    }
    if (!publicClient) {
      setQuoteMsg("Connect an EVM wallet and select a source chain.");
      return;
    }
    setBusy(true);
    setQuoteMsg(null);
    setSendFlowStatus(null);
    try {
      const { msgFee, decimals } = await quoteEvmToSolana(publicClient, {
        amountHuman: amount,
        recipientSolanaBase58: recipientTrimmed,
        oftAddress: evmSource.oftAddress as Address,
      });
      setQuoteMsg(
        `Quote (EVM → Solana): native fee ≈ ${formatEther(msgFee.nativeFee)} (source chain native gas token). Decimals used: ${decimals}.`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Quote failed";
      setQuoteMsg(msg);
      void bridgeDebugLog("error", "quoteEvm failed", {
        direction: "evmToSol",
        evmSourceChainId: evmSource.nativeChainId,
        chainId: chainId ?? null,
        connectorId: connector?.id ?? null,
        message: msg,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setBusy(false);
    }
  }, [
    amount,
    chainId,
    connector?.id,
    evmSource,
    evmToSolRecipientValid,
    publicClient,
    recipientTrimmed,
  ]);

  const sendEvm = useCallback(async () => {
    if (!evmToSolRecipientValid) {
      setQuoteMsg("Recipient must be a valid Solana base58 public key.");
      return;
    }
    if (evmSignerMismatch) {
      setQuoteMsg(
        "The selected EVM account is not your active signer. Switch in your wallet and retry."
      );
      return;
    }
    if (!address || !publicClient) {
      setQuoteMsg("Connect an EVM wallet and select a source chain.");
      return;
    }
    setBusy(true);
    setTxLink(null);
    setSendFlowStatus({ chain: "evm", stage: "await_wallet" });
    try {
      if (chainId !== evmSource.nativeChainId) {
        await switchChainAsync({ chainId: evmSource.nativeChainId });
      }
      const wc = await getWalletClient(config, { chainId: evmSource.nativeChainId });
      if (!wc) {
        setSendFlowStatus(null);
        const msg =
          "Wallet not available on the selected network. Approve the network switch in your wallet and try again.";
        setQuoteMsg(msg);
        void bridgeDebugLog("error", "sendEvm: no wallet client after switch", {
          direction: "evmToSol",
          evmSourceChainId: evmSource.nativeChainId,
          chainId: chainId ?? null,
          connectorId: connector?.id ?? null,
          message: msg,
        });
        return;
      }
      const { hash } = await sendEvmToSolana(wc, publicClient, {
        account: address,
        amountHuman: amount,
        recipientSolanaBase58: recipientTrimmed,
        oftAddress: evmSource.oftAddress as Address,
      });
      setTxLink(submittedTxExplorerUrl(evmSource, hash));
      setSendFlowStatus({ chain: "evm", stage: "confirmed", txHash: hash });
      setQuoteMsg(null);
    } catch (error) {
      setSendFlowStatus(null);
      const msg = error instanceof Error ? error.message : "Send failed";
      setQuoteMsg(msg);
      void bridgeDebugLog("error", "sendEvm failed", {
        direction: "evmToSol",
        evmSourceChainId: evmSource.nativeChainId,
        chainId: chainId ?? null,
        connectorId: connector?.id ?? null,
        message: msg,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setBusy(false);
    }
  }, [
    address,
    amount,
    chainId,
    config,
    connector?.id,
    evmSignerMismatch,
    evmSource,
    evmToSolRecipientValid,
    publicClient,
    recipientTrimmed,
    switchChainAsync,
  ]);

  const quoteSol = useCallback(async () => {
    if (!solWallet.publicKey || !solWallet.wallet?.adapter) {
      setQuoteMsg("Connect a Solana wallet first.");
      return;
    }
    if (!solToEvmRecipientValid) {
      setQuoteMsg("Recipient must be a valid 0x EVM address.");
      return;
    }
    setBusy(true);
    setQuoteMsg(null);
    setSendFlowStatus(null);
    try {
      const { nativeFee, decimals } = await quoteSolanaToEvm({
        rpcEndpoint: solanaRpcUrl(),
        walletAdapter: solWallet.wallet.adapter,
        dstLzEid: evmDest.lzEid,
        evmRecipient: recipientTrimmed as `0x${string}`,
        amountHuman: amount,
      });
      setQuoteMsg(
        `Quote (Solana → ${evmDest.name}): LayerZero native fee ≈ ${Number(nativeFee) / 1e9} SOL (lamports ${nativeFee}). Decimals: ${decimals}.`
      );
    } catch (error) {
      setQuoteMsg(error instanceof Error ? error.message : "Quote failed");
    } finally {
      setBusy(false);
    }
  }, [amount, evmDest, recipientTrimmed, solToEvmRecipientValid, solWallet.publicKey, solWallet.wallet]);

  const sendSol = useCallback(async () => {
    if (!solWallet.publicKey || !solWallet.wallet?.adapter) return;
    if (!solToEvmRecipientValid) return;
    if (solSignerMismatch) {
      setQuoteMsg(
        "The selected Solana account is not your active signer. Switch in your wallet and retry."
      );
      return;
    }
    setBusy(true);
    setTxLink(null);
    setSendFlowStatus({ chain: "solana", stage: "await_wallet" });
    try {
      const { explorer } = await sendSolanaToEvm({
        rpcEndpoint: solanaRpcUrl(),
        walletAdapter: solWallet.wallet.adapter,
        dstLzEid: evmDest.lzEid,
        evmRecipient: recipientTrimmed as `0x${string}`,
        amountHuman: amount,
        onSendProgress: (phase) =>
          setSendFlowStatus({ chain: "solana", stage: phase }),
      });
      setTxLink(explorer);
      setSendFlowStatus({ chain: "solana", stage: "confirmed" });
      void queryClient.invalidateQueries({ queryKey: ["solomonSolBalance"] });
    } catch (error) {
      setSendFlowStatus(null);
      setQuoteMsg(error instanceof Error ? error.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }, [
    amount,
    evmDest,
    queryClient,
    recipientTrimmed,
    solSignerMismatch,
    solToEvmRecipientValid,
    solWallet.publicKey,
    solWallet.wallet,
  ]);

  const { data: oftBalance, refetch: refetchOftBalance } = useReadContract({
    address: evmSource.oftAddress as Address,
    abi: oftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: evmSource.nativeChainId,
    query: {
      enabled: Boolean(address),
    },
  });

  const { data: oftDecimals } = useReadContract({
    address: evmSource.oftAddress as Address,
    abi: oftAbi,
    functionName: "decimals",
    chainId: evmSource.nativeChainId,
    query: {
      enabled: Boolean(address),
    },
  });

  const setMaxSolomonAmount = useCallback(() => {
    if (direction === "evmToSol") {
      if (oftBalance === undefined || oftDecimals === undefined) return;
      const human = formatUnits(oftBalance, oftDecimals);
      setAmount(
        truncateHumanAmountToDecimals(human, SOLOMON_INPUT_MAX_DECIMALS)
      );
      return;
    }
    const solBal = solanaBalanceQuery.data;
    if (!solBal) return;
    const human = formatUnits(solBal.balance, solBal.decimals);
    setAmount(truncateHumanAmountToDecimals(human, SOLOMON_INPUT_MAX_DECIMALS));
  }, [
    direction,
    oftBalance,
    oftDecimals,
    solanaBalanceQuery.data,
  ]);

  const maxAmountDisabled =
    direction === "evmToSol"
      ? !address || oftBalance === undefined || oftDecimals === undefined
      : !solWallet.publicKey || !solanaBalanceQuery.data;

  const openChainPicker = useCallback(
    (target: Exclude<ChainModalTarget, null>) => {
      setChainSearch("");
      setChainModalTarget(target);
      setChainModalSelection(target === "source" ? evmSource : evmDest);
    },
    [evmDest, evmSource]
  );

  const applySelectedChain = useCallback(() => {
    if (chainModalTarget === "source") setEvmSource(chainModalSelection);
    if (chainModalTarget === "destination") setEvmDest(chainModalSelection);
    setChainModalTarget(null);
  }, [chainModalSelection, chainModalTarget]);

  const copyToClipboard = useCallback((value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(value);
  }, []);

  const removeSavedAccount = useCallback(
    (type: WalletTab, accountAddress: string) => {
      setAccountBook((prev) => removeWalletAccount(prev, type, accountAddress));
      if (type === "evm" && selectedEvmAddress && addressEquals(selectedEvmAddress, accountAddress, "evm")) {
        setSelectedEvmAddress(activeEvmAddress ?? null);
      }
      if (
        type === "solana" &&
        selectedSolAddress &&
        addressEquals(selectedSolAddress, accountAddress, "solana")
      ) {
        setSelectedSolAddress(activeSolAddress ?? null);
      }
    },
    [activeEvmAddress, activeSolAddress, selectedEvmAddress, selectedSolAddress]
  );

  const startEvmConnection = useCallback(async () => {
    if (openEvmConnectModalRef.current) {
      openEvmConnectModalRef.current();
      return;
    }
    const firstConnector = availableEvmConnectors[0];
    if (!firstConnector) return;
    await connectAsync({ connector: firstConnector });
  }, [availableEvmConnectors, connectAsync]);

  const promptSignerSwitch = useCallback(() => {
    if (direction === "evmToSol") {
      if (openEvmAccountModalRef.current) {
        openEvmAccountModalRef.current();
      } else {
        void startEvmConnection();
      }
      return;
    }
    openSolModal(true);
  }, [direction, openSolModal, startEvmConnection]);

  const mainWalletPillLabel =
    direction === "evmToSol"
      ? isConnected && activeEvmAddress
        ? shortenAddress(activeEvmAddress)
        : "Connect"
      : solWallet.connected && activeSolAddress
        ? shortenAddress(activeSolAddress)
        : "Connect";

  const fromChainLabel = direction === "evmToSol" ? evmSource.name : "Solana";
  const toChainLabel = direction === "evmToSol" ? "Solana" : evmDest.name;
  const connectPrimaryClass =
    direction === "evmToSol"
      ? "bg-amber-500/90 text-zinc-950 hover:bg-amber-400"
      : "bg-violet-600 text-white hover:bg-violet-500";
  const sendDisabled =
    busy ||
    !amount ||
    (direction === "evmToSol" ? !evmToSolRecipientValid : !solToEvmRecipientValid) ||
    evmSignerMismatch ||
    solSignerMismatch;

  return (
    <ConnectButton.Custom>
      {({ mounted, openConnectModal, openAccountModal }) => {
        openEvmConnectModalRef.current = openConnectModal ?? null;
        openEvmAccountModalRef.current = openAccountModal ?? null;

        return (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">
                  Powered by LayerZero
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  SOLOMON bridge
                </h1>
                <p className="text-sm text-zinc-400">
                  Bridge SOLOMON between Solana and supported EVM networks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWalletDrawerOpen(true)}
                className="rounded-full border border-emerald-300/40 px-5 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-200/60"
              >
                {mounted ? mainWalletPillLabel : "Connect"}
              </button>
            </header>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl shadow-black/30 sm:p-6">
              <div className="flex rounded-xl bg-zinc-950/70 p-1 ring-1 ring-zinc-800">
                <button
                  type="button"
                  onClick={() => setDirection("evmToSol")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                    direction === "evmToSol"
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  EVM to Solana
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("solToEvm")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                    direction === "solToEvm"
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Solana to EVM
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-300">From</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (direction === "evmToSol") openChainPicker("source");
                      }}
                      disabled={direction !== "evmToSol"}
                      className={`inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm ${
                        direction === "evmToSol"
                          ? "hover:border-zinc-500"
                          : "cursor-default opacity-80"
                      }`}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[11px] font-semibold text-zinc-100">
                        {fromChainLabel.slice(0, 1)}
                      </span>
                      SOLOMON
                      <span className="text-zinc-500">{fromChainLabel}</span>
                    </button>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <input
                      value={amount}
                      onChange={(event) =>
                        setAmount(sanitizeSolomonAmountInput(event.target.value))
                      }
                      placeholder="0.00"
                      inputMode="decimal"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent text-5xl font-semibold tracking-tight text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={maxAmountDisabled}
                      onClick={setMaxSolomonAmount}
                      className="shrink-0 rounded-lg border border-zinc-600 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setDirection((prev) => (prev === "evmToSol" ? "solToEvm" : "evmToSol"))
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white"
                    aria-label="Swap direction"
                  >
                    ↓
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-emerald-300">To</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (direction === "solToEvm") openChainPicker("destination");
                      }}
                      disabled={direction !== "solToEvm"}
                      className={`inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm ${
                        direction === "solToEvm"
                          ? "hover:border-zinc-500"
                          : "cursor-default opacity-80"
                      }`}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[11px] font-semibold text-zinc-100">
                        {toChainLabel.slice(0, 1)}
                      </span>
                      SOLOMON
                      <span className="text-zinc-500">{toChainLabel}</span>
                    </button>
                  </div>
                  <div ref={recipientBookRef} className="relative">
                    <input
                      value={recipient}
                      onChange={(event) => setRecipient(event.target.value)}
                      placeholder={
                        direction === "evmToSol" ? "Set Solana recipient" : "Set EVM recipient"
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-4 pr-11 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-expanded={recipientBookOpen}
                      aria-haspopup="listbox"
                      aria-label={
                        direction === "evmToSol"
                          ? "Choose Solana address from connected or saved"
                          : "Choose EVM address from connected or saved"
                      }
                      onClick={() => setRecipientBookOpen((open) => !open)}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    >
                      <span className="text-xs" aria-hidden>
                        ▼
                      </span>
                    </button>
                    {recipientBookOpen && (
                      <ul
                        role="listbox"
                        className="absolute right-0 z-30 mt-1 max-h-52 w-full min-w-[220px] overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-lg ring-1 ring-black/40"
                      >
                        {recipientBookEntries.length === 0 ? (
                          <li className="px-3 py-2 text-xs text-zinc-500">
                            {direction === "solToEvm"
                              ? "Connect an EVM wallet or add one in Wallets to pick an address."
                              : "Connect a Solana wallet or add one in Wallets to pick an address."}
                          </li>
                        ) : (
                          recipientBookEntries.map((entry) => (
                            <li key={entry.value} className="list-none">
                              <button
                                type="button"
                                role="option"
                                aria-selected={
                                  direction === "solToEvm"
                                    ? recipientTrimmed.toLowerCase() === entry.value.trim().toLowerCase()
                                    : recipientTrimmed === entry.value.trim()
                                }
                                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-zinc-800"
                                onClick={() => {
                                  setRecipient(entry.value);
                                  setRecipientBookOpen(false);
                                }}
                              >
                                <span className="text-sm text-zinc-100">{entry.label}</span>
                                <span className="font-mono text-[11px] text-zinc-500">
                                  {shortenAddress(entry.value, 10, 8)}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="mb-4 text-sm">
                  <span className="font-medium text-emerald-300">Fast and secure</span>
                </div>

                {direction === "evmToSol" && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                    {oftBalance !== undefined && oftDecimals !== undefined ? (
                      <span>
                        Balance:{" "}
                        <span className="font-medium text-white">
                          {formatUnits(oftBalance, oftDecimals)} SOLOMON
                        </span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">Balance unavailable</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void refetchOftBalance()}
                      className="rounded border border-zinc-600 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
                    >
                      Refresh
                    </button>
                  </div>
                )}

                {direction === "solToEvm" && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                    {solanaBalanceQuery.isPending ? (
                      <span className="text-zinc-500">Loading balance...</span>
                    ) : solanaBalanceQuery.data ? (
                      <span>
                        Balance:{" "}
                        <span className="font-medium text-white">
                          {formatUnits(
                            solanaBalanceQuery.data.balance,
                            solanaBalanceQuery.data.decimals
                          )}{" "}
                          SOLOMON
                        </span>
                      </span>
                    ) : solanaBalanceQuery.isError ? (
                      <span className="text-red-400/90">
                        {(solanaBalanceQuery.error as Error).message}
                      </span>
                    ) : (
                      <span className="text-zinc-500">Connect wallet for balance</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void solanaBalanceQuery.refetch()}
                      className="rounded border border-zinc-600 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
                    >
                      Refresh
                    </button>
                  </div>
                )}

                {wrongEvmNetwork && (
                  <p className="mb-3 text-sm text-amber-400">
                    Your wallet is not on {evmSource.name}. Send will prompt you to switch to{" "}
                    {evmSource.name} first, then continue with the transaction.
                  </p>
                )}
                {(evmSignerMismatch || solSignerMismatch) && (
                  <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                    <span>
                      Selected saved account is not your active signer for this direction.
                    </span>
                    <button
                      type="button"
                      onClick={promptSignerSwitch}
                      className="rounded-md border border-amber-300/40 px-2 py-1 text-amber-100 hover:bg-amber-500/20"
                    >
                      Connect or switch
                    </button>
                  </div>
                )}

                {!activeDirectionWalletConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (direction === "evmToSol") {
                        void startEvmConnection();
                        return;
                      }
                      openSolModal(true);
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${connectPrimaryClass}`}
                  >
                    Connect wallet
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        busy ||
                        (direction === "evmToSol" ? !evmToSolRecipientValid : !solToEvmRecipientValid)
                      }
                      onClick={() =>
                        direction === "evmToSol" ? void quoteEvm() : void quoteSol()
                      }
                      className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
                    >
                      Quote fee
                    </button>
                    <button
                      type="button"
                      disabled={sendDisabled}
                      onClick={() =>
                        direction === "evmToSol" ? void sendEvm() : void sendSol()
                      }
                      className="rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                )}

                {(quoteMsg || sendFlowStatus) && (
                  <div className="mt-3 space-y-2 rounded-lg bg-zinc-950/80 p-3">
                    {quoteMsg ? (
                      <p className="text-sm text-zinc-300">{quoteMsg}</p>
                    ) : null}
                    {sendFlowStatus ? (
                      <BridgeSendFlowStatus status={sendFlowStatus} />
                    ) : null}
                  </div>
                )}
                {txLink && (
                  <a
                    href={txLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-sm text-amber-400 underline"
                  >
                    View transaction
                  </a>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
              <button
                type="button"
                onClick={() => setAdvancedOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-zinc-300">Advanced details</span>
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                  {advancedOpen ? "Hide" : "Show"}
                </span>
              </button>
              {advancedOpen && (
                <div className="mt-4 space-y-3 text-xs text-zinc-500">
                  <ul className="list-inside list-disc space-y-1">
                    <li>Required DVN: {pathway.dvnRequiredLabel}</li>
                    <li>
                      Confirmations (blocks, verify on-chain):{" "}
                      {pathway.confirmations.blocks.join(" / ")}
                    </li>
                    <li>
                      EVM to Solana LZ_RECEIVE:{" "}
                      {pathway.enforcedOptions.evmToSolana.lzReceive.computeUnits} CU,{" "}
                      {pathway.enforcedOptions.evmToSolana.lzReceive.valueLamports} lamports
                    </li>
                    <li>
                      Solana to EVM LZ_RECEIVE:{" "}
                      {pathway.enforcedOptions.solanaToEvm.lzReceive.gas} gas, value{" "}
                      {pathway.enforcedOptions.solanaToEvm.lzReceive.value}
                    </li>
                  </ul>
                  <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
                    OFT store {solMeta.oftStore} · EVM OFT{" "}
                    {(direction === "evmToSol" ? evmSource : evmDest).oftAddress}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <a
                      className="text-amber-500/90 hover:underline"
                      href={refs.layerZeroMetadataApi}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Metadata API
                    </a>
                    <a
                      className="text-amber-500/90 hover:underline"
                      href={solMeta.explorers.oftStore}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Solscan OFT store
                    </a>
                    <a
                      className="text-amber-500/90 hover:underline"
                      href={refs.docsSolanaOapp}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Solana OApp docs
                    </a>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
              <button
                type="button"
                onClick={() => setResourcesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-zinc-300">
                  Documentation and resources
                </span>
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                  {resourcesOpen ? "Hide" : "Show"}
                </span>
              </button>
              {resourcesOpen && (
                <div className="mt-4 space-y-5 text-xs text-zinc-500">
                  <p>
                    Official docs for WalletConnect, LayerZero, the EVM stack (RainbowKit / wagmi /
                    viem), Solana wallet adapters, and each Solana wallet we surface in the connect
                    modal. The same list lives in the repo at{" "}
                    <code className="text-zinc-400">docs/RESOURCES.md</code>.
                  </p>
                  {documentationResourceGroups.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        {group.title}
                      </p>
                      <ul className="list-inside list-disc space-y-1.5">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-500/90 hover:underline"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {chainModalTarget && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
                <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-100">Select origin token</p>
                    <button
                      type="button"
                      onClick={() => setChainModalTarget(null)}
                      className="text-lg leading-none text-zinc-400 hover:text-zinc-200"
                      aria-label="Close chain picker"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-[320px_1fr]">
                    <div className="border-r border-zinc-800 p-3">
                      <input
                        value={chainSearch}
                        onChange={(event) => setChainSearch(event.target.value)}
                        placeholder="Search chains"
                        className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
                      />
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Popular Chains
                      </p>
                      <div className="mb-4 space-y-1">
                        {popularChains.map((chain) => (
                          <button
                            key={`popular-${chain.nativeChainId}`}
                            type="button"
                            onClick={() => setChainModalSelection(chain)}
                            className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                              chainModalSelection.nativeChainId === chain.nativeChainId
                                ? "bg-emerald-400/10 text-emerald-200"
                                : "text-zinc-200 hover:bg-zinc-800/80"
                            }`}
                          >
                            <span>{chain.name}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        All Chains
                      </p>
                      <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1">
                        {filteredChains.map((chain) => (
                          <button
                            key={chain.nativeChainId}
                            type="button"
                            onClick={() => setChainModalSelection(chain)}
                            className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                              chainModalSelection.nativeChainId === chain.nativeChainId
                                ? "bg-emerald-400/10 text-emerald-200"
                                : "text-zinc-200 hover:bg-zinc-800/80"
                            }`}
                          >
                            <span>{chain.name}</span>
                          </button>
                        ))}
                        {filteredChains.length === 0 && (
                          <p className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
                            No chains matched your search.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Token</p>
                      <div className="mt-2 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
                        <p className="text-lg font-semibold text-zinc-100">SOLOMON</p>
                        <p className="mt-1 text-sm text-zinc-400">{chainModalSelection.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={applySelectedChain}
                        className="mt-auto rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-200"
                      >
                        Use SOLOMON on {chainModalSelection.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {walletDrawerOpen && (
              <div className="fixed inset-0 z-50 bg-black/70">
                <div className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/40">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-2xl font-semibold text-zinc-100">Wallets</p>
                    <button
                      type="button"
                      onClick={() => setWalletDrawerOpen(false)}
                      className="text-lg leading-none text-zinc-400 hover:text-zinc-200"
                      aria-label="Close wallet drawer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4 flex rounded-xl bg-zinc-950/80 p-1 ring-1 ring-zinc-800">
                    <button
                      type="button"
                      onClick={() => setWalletTab("evm")}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                        walletTab === "evm"
                          ? "bg-zinc-100 text-zinc-950"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      EVM wallets
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletTab("solana")}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                        walletTab === "solana"
                          ? "bg-zinc-100 text-zinc-950"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Solana wallets
                    </button>
                  </div>

                  {walletTab === "evm" ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Connected signer
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-100">
                          {activeEvmAddress ? shortenAddress(activeEvmAddress) : "Not connected"}
                        </p>
                        {activeEvmAddress && (
                          <button
                            type="button"
                            onClick={() => void disconnectEvm()}
                            className="mt-2 rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => void startEvmConnection()}
                        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                      >
                        Add account
                      </button>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Saved EVM accounts
                        </p>
                        {evmAccounts.length === 0 ? (
                          <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-500">
                            No saved EVM addresses yet.
                          </p>
                        ) : (
                          evmAccounts.map((item) => {
                            const isSelected = Boolean(
                              selectedEvmAddress &&
                                addressEquals(selectedEvmAddress, item.address, "evm")
                            );
                            const isActive = Boolean(
                              activeEvmAddress &&
                                addressEquals(activeEvmAddress, item.address, "evm")
                            );
                            const explorer = evmAddressExplorerUrl(
                              (direction === "evmToSol" ? evmSource : evmDest).nativeChainId,
                              item.address
                            );
                            return (
                              <div
                                key={`evm-${item.address}`}
                                className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedEvmAddress(item.address)}
                                  className="w-full text-left"
                                >
                                  <p className="text-sm font-medium text-zinc-100">
                                    {shortenAddress(item.address)}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {isSelected ? "Selected" : "Tap to select"}
                                    {isActive ? " · Active signer" : ""}
                                  </p>
                                </button>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.address)}
                                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                  >
                                    Copy
                                  </button>
                                  {explorer && (
                                    <a
                                      href={explorer}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                    >
                                      Explorer
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeSavedAccount("evm", item.address)}
                                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Connected signer
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-100">
                          {activeSolAddress ? shortenAddress(activeSolAddress) : "Not connected"}
                        </p>
                        {activeSolAddress && (
                          <button
                            type="button"
                            onClick={() => void solWallet.disconnect()}
                            className="mt-2 rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openSolModal(true)}
                        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                      >
                        Add account
                      </button>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Saved Solana accounts
                        </p>
                        {solAccounts.length === 0 ? (
                          <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-500">
                            No saved Solana addresses yet.
                          </p>
                        ) : (
                          solAccounts.map((item) => {
                            const isSelected = Boolean(
                              selectedSolAddress &&
                                addressEquals(selectedSolAddress, item.address, "solana")
                            );
                            const isActive = Boolean(
                              activeSolAddress &&
                                addressEquals(activeSolAddress, item.address, "solana")
                            );
                            return (
                              <div
                                key={`solana-${item.address}`}
                                className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedSolAddress(item.address)}
                                  className="w-full text-left"
                                >
                                  <p className="text-sm font-medium text-zinc-100">
                                    {shortenAddress(item.address)}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {isSelected ? "Selected" : "Tap to select"}
                                    {isActive ? " · Active signer" : ""}
                                  </p>
                                </button>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.address)}
                                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                  >
                                    Copy
                                  </button>
                                  <a
                                    href={`https://solscan.io/account/${item.address}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                  >
                                    Explorer
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeSavedAccount("solana", item.address)}
                                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
