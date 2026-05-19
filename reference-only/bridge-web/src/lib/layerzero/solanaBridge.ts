import {
  fetchMint,
  findAssociatedTokenPda,
  mplToolbox,
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  publicKey,
  signerIdentity,
  transactionBuilder,
  type AddressLookupTableInput,
  type PublicKey,
  type RpcInterface,
  type Umi,
} from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { oft } from "@layerzerolabs/oft-v2-solana-sdk";
import { getAccount, TokenAccountNotFoundError } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { trySolanaWalletCancellationMessage } from "@/lib/solanaWalletUserErrorMessage";
import bs58 from "bs58";
import { parseUnits, hexToBytes, pad, type Address } from "viem";
import { SOLOMON_DEPLOYMENTS } from "@/config/solomon";
import { extraOptionsSolanaToEvm } from "@/lib/layerzero/options";

const SOL = SOLOMON_DEPLOYMENTS.solana;

async function resolveOftTokenContext(umi: Umi, owner: PublicKey) {
  const storePk = publicKey(SOL.oftStore);
  const oftStore = await oft.accounts.fetchOFTStore(umi, storePk);
  const { tokenMint, tokenEscrow } = oftStore;
  const mintAccount = await fetchMint(umi, tokenMint);
  const tokenProgramId = mintAccount.header.owner;
  const tokenAccount = findAssociatedTokenPda(umi, {
    mint: tokenMint,
    owner,
    tokenProgramId,
  });
  const decimals = Number(mintAccount.decimals);
  return {
    tokenMint,
    tokenEscrow,
    tokenProgramId,
    tokenAccountPda: tokenAccount[0],
    decimals,
  };
}

async function splTokenBalanceAtAta(
  rpcEndpoint: string,
  ata: PublicKey,
  tokenProgramId: PublicKey
): Promise<bigint> {
  const connection = new Connection(rpcEndpoint, "confirmed");
  try {
    const acc = await getAccount(
      connection,
      toWeb3JsPublicKey(ata),
      "confirmed",
      toWeb3JsPublicKey(tokenProgramId)
    );
    return acc.amount;
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      return 0n;
    }
    throw e;
  }
}

/** Read-only SOLOMON balance on Solana for a wallet (uses OFT store + mint’s token program, e.g. Token-2022). */
export async function fetchSolanaSolomonBalance(args: {
  rpcEndpoint: string;
  ownerPublicKeyBase58: string;
}): Promise<{ balance: bigint; decimals: number }> {
  const umi = createUmi(args.rpcEndpoint).use(mplToolbox());
  const owner = publicKey(args.ownerPublicKeyBase58);
  const ctx = await resolveOftTokenContext(umi, owner);
  const balance = await splTokenBalanceAtAta(
    args.rpcEndpoint,
    ctx.tokenAccountPda,
    ctx.tokenProgramId
  );
  return { balance, decimals: ctx.decimals };
}

function umiForWallet(rpcEndpoint: string, adapter: WalletAdapter) {
  const umi = createUmi(rpcEndpoint).use(mplToolbox());
  const signer = createSignerFromWalletAdapter(adapter);
  umi.use(signerIdentity(signer));
  return { umi, signer };
}

/** Web3.js `Connection` for APIs that need it directly (e.g. address lookup table fetch). */
function solanaWeb3Connection(rpcEndpoint: string): Connection {
  return new Connection(rpcEndpoint, "confirmed");
}

/**
 * OFT `quote` / `send` pass one `rpc` value to:
 * - LayerZero `fetchPeerConfig` / account codecs (need Metaplex `getAccount` / `getAccounts` / …)
 * - Endpoint + simulation (need web3 `Connection`: `getMultipleAccountsInfo`, `simulateTransaction`, …)
 *
 * A bare web3 `Connection` breaks the first; plain `umi.rpc` fails `toWeb3Connection` / is not a
 * `Connection` for the second. Proxy a real `Connection` and delegate Umi account RPC methods.
 */
const UMI_RPC_FOR_OFT = new Set([
  "getAccount",
  "getAccounts",
  "getProgramAccounts",
  // EndpointProgram.getMessageLibVersion calls `rpc.getEndpoint()` (Umi API; not on web3 Connection).
  "getEndpoint",
  "getCluster",
]);

function oftCompatRpc(umi: Umi, connection: Connection): RpcInterface {
  return new Proxy(connection, {
    get(target, prop, receiver) {
      if (
        typeof prop === "string" &&
        UMI_RPC_FOR_OFT.has(prop)
      ) {
        const fn = Reflect.get(umi.rpc as object, prop);
        if (typeof fn === "function") {
          return fn.bind(umi.rpc);
        }
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as unknown as RpcInterface;
}

/**
 * Build v0 ALT input for Metaplex transactionBuilder. Uses web3.js directly so we
 * do not depend on `umi.rpc.getAccount` (can be missing in some Next client bundles).
 */
async function addressLookupTableInputFromConnection(
  connection: Connection,
  table: PublicKey
): Promise<AddressLookupTableInput> {
  const { value } = await connection.getAddressLookupTable(toWeb3JsPublicKey(table));
  if (!value) {
    throw new Error("Missing LayerZero Solana address lookup table");
  }
  return {
    publicKey: table,
    addresses: value.state.addresses.map((key) => fromWeb3JsPublicKey(key)),
  };
}

export async function quoteSolanaToEvm(args: {
  rpcEndpoint: string;
  walletAdapter: WalletAdapter;
  dstLzEid: number;
  evmRecipient: Address;
  amountHuman: string;
  minAmountHuman?: string;
}) {
  const { umi, signer } = umiForWallet(args.rpcEndpoint, args.walletAdapter);
  const programPk = publicKey(SOL.oftProgramId);
  const { tokenMint, tokenEscrow, tokenAccountPda, decimals } =
    await resolveOftTokenContext(umi, signer.publicKey);
  const amountLd = parseUnits(args.amountHuman, decimals);
  const minAmountLd = args.minAmountHuman
    ? parseUnits(args.minAmountHuman, decimals)
    : amountLd;
  const options = hexToBytes(extraOptionsSolanaToEvm());
  const to = hexToBytes(pad(args.evmRecipient, { size: 32 }));
  const alt = publicKey(SOL.defaultAddressLookupTable);
  const connection = solanaWeb3Connection(args.rpcEndpoint);
  const rpc = oftCompatRpc(umi, connection);

  const { nativeFee, lzTokenFee } = await oft.quote(
    rpc,
    {
      payer: signer.publicKey,
      tokenMint,
      tokenEscrow,
    },
    {
      dstEid: args.dstLzEid,
      to,
      amountLd,
      minAmountLd,
      options,
      payInLzToken: false,
    },
    { oft: programPk },
    [],
    alt
  );

  return {
    nativeFee,
    lzTokenFee,
    decimals,
    tokenAccountPda,
  };
}

export async function sendSolanaToEvm(args: {
  rpcEndpoint: string;
  walletAdapter: WalletAdapter;
  dstLzEid: number;
  evmRecipient: Address;
  amountHuman: string;
  minAmountHuman?: string;
  /** Fires before the wallet signing prompt, then after broadcast while confirming on-chain. */
  onSendProgress?: (phase: "await_wallet" | "pending") => void;
}) {
  const { umi, signer } = umiForWallet(args.rpcEndpoint, args.walletAdapter);
  const programPk = publicKey(SOL.oftProgramId);
  const {
    tokenMint,
    tokenEscrow,
    tokenProgramId,
    tokenAccountPda,
    decimals,
  } = await resolveOftTokenContext(umi, signer.publicKey);
  const balance = await splTokenBalanceAtAta(
    args.rpcEndpoint,
    tokenAccountPda,
    tokenProgramId
  );
  const amountLd = parseUnits(args.amountHuman, decimals);
  const minAmountLd = args.minAmountHuman
    ? parseUnits(args.minAmountHuman, decimals)
    : amountLd;
  if (amountLd > balance) {
    throw new Error("Insufficient SOLOMON balance on Solana");
  }
  const options = hexToBytes(extraOptionsSolanaToEvm());
  const to = hexToBytes(pad(args.evmRecipient, { size: 32 }));
  const alt = publicKey(SOL.defaultAddressLookupTable);
  const connection = solanaWeb3Connection(args.rpcEndpoint);
  const rpc = oftCompatRpc(umi, connection);

  const { nativeFee, lzTokenFee } = await oft.quote(
    rpc,
    {
      payer: signer.publicKey,
      tokenMint,
      tokenEscrow,
    },
    {
      dstEid: args.dstLzEid,
      to,
      amountLd,
      minAmountLd,
      options,
      payInLzToken: false,
    },
    { oft: programPk },
    [],
    alt
  );

  const ix = await oft.send(
    rpc,
    {
      payer: signer,
      tokenMint,
      tokenEscrow,
      tokenSource: tokenAccountPda,
    },
    {
      dstEid: args.dstLzEid,
      to,
      amountLd,
      minAmountLd,
      options,
      nativeFee,
      lzTokenFee,
    },
    { oft: programPk, token: tokenProgramId }
  );

  const altInput = await addressLookupTableInputFromConnection(connection, alt);

  let txB = transactionBuilder().add([ix]);
  txB = txB.prepend(setComputeUnitLimit(umi, { units: 320_000 }));
  txB = txB.prepend(setComputeUnitPrice(umi, { microLamports: 50_000n }));
  txB = txB.setAddressLookupTables([altInput]);

  try {
    let builder = txB;
    if (!txB.getBlockhash()) {
      builder = await txB.setLatestBlockhash(umi);
    }
    args.onSendProgress?.("await_wallet");
    const signature = await builder.send(umi, {});
    args.onSendProgress?.("pending");
    await builder.confirm(umi, signature, {});
    const txHash = bs58.encode(signature);
    return { signature: txHash, explorer: `https://solscan.io/tx/${txHash}` };
  } catch (e) {
    const friendly = trySolanaWalletCancellationMessage(e);
    if (friendly) throw new Error(friendly);
    throw e;
  }
}
