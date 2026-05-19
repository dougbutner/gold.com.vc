import bs58 from "bs58";
import type { Address, PublicClient, WalletClient } from "viem";
import { isAddress, parseUnits, pad, toHex } from "viem";
import { SOLOMON_DEPLOYMENTS, SOLANA_EID, OFT_EVM_ADDRESS } from "@/config/solomon";
import { extraOptionsEvmToSolana } from "@/lib/layerzero/options";
import { oftAbi } from "@/lib/layerzero/oftAbi";
import { erc20Abi } from "@/lib/layerzero/erc20Abi";

function solanaRecipientToBytes32(base58Recipient: string): `0x${string}` {
  const raw = bs58.decode(base58Recipient);
  if (raw.length !== 32) {
    throw new Error("Solana recipient must decode to 32 bytes (public key)");
  }
  return pad(toHex(new Uint8Array(raw)), { size: 32 });
}

export function buildSendParamEvmToSolana(args: {
  amountHuman: string;
  decimals: number;
  recipientSolanaBase58: string;
  minAmountHuman?: string;
}) {
  const amountLD = parseUnits(args.amountHuman, args.decimals);
  const minAmountLD = args.minAmountHuman
    ? parseUnits(args.minAmountHuman, args.decimals)
    : amountLD;
  return {
    dstEid: SOLANA_EID,
    to: solanaRecipientToBytes32(args.recipientSolanaBase58),
    amountLD,
    minAmountLD,
    extraOptions: extraOptionsEvmToSolana(),
    composeMsg: "0x" as `0x${string}`,
    oftCmd: "0x" as `0x${string}`,
  };
}

export async function readOftTokenMeta(
  publicClient: PublicClient,
  oftAddress: Address = OFT_EVM_ADDRESS
) {
  const approvalRequired = await publicClient.readContract({
    address: oftAddress,
    abi: oftAbi,
    functionName: "approvalRequired",
  });
  let tokenAddress: Address = oftAddress;
  try {
    tokenAddress = await publicClient.readContract({
      address: oftAddress,
      abi: oftAbi,
      functionName: "token",
    });
  } catch {
    tokenAddress = oftAddress;
  }
  let decimals = 18;
  try {
    decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });
  } catch {
    try {
      decimals = await publicClient.readContract({
        address: oftAddress,
        abi: oftAbi,
        functionName: "decimals",
      });
    } catch {
      decimals = 18;
    }
  }
  return { approvalRequired, tokenAddress, decimals };
}

export async function quoteEvmToSolana(
  publicClient: PublicClient,
  args: {
    amountHuman: string;
    recipientSolanaBase58: string;
    minAmountHuman?: string;
    oftAddress?: Address;
  }
) {
  const oft = args.oftAddress ?? OFT_EVM_ADDRESS;
  const { decimals } = await readOftTokenMeta(publicClient, oft);
  const sendParam = buildSendParamEvmToSolana({
    ...args,
    decimals,
  });
  const msgFee = await publicClient.readContract({
    address: oft,
    abi: oftAbi,
    functionName: "quoteSend",
    args: [sendParam, false],
  });
  return { sendParam, msgFee, decimals };
}

export async function sendEvmToSolana(
  walletClient: WalletClient,
  publicClient: PublicClient,
  args: {
    amountHuman: string;
    recipientSolanaBase58: string;
    minAmountHuman?: string;
    oftAddress?: Address;
    account: Address;
  }
) {
  const oft = args.oftAddress ?? OFT_EVM_ADDRESS;
  const { approvalRequired, tokenAddress, decimals } = await readOftTokenMeta(
    publicClient,
    oft
  );
  const sendParam = buildSendParamEvmToSolana({
    amountHuman: args.amountHuman,
    recipientSolanaBase58: args.recipientSolanaBase58,
    minAmountHuman: args.minAmountHuman,
    decimals,
  });
  const amountLD = sendParam.amountLD;

  if (approvalRequired && tokenAddress) {
    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [args.account, oft],
    });
    if (allowance < amountLD) {
      const hashApprove = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [oft, amountLD],
        account: args.account,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash: hashApprove });
    }
  }

  const msgFee = await publicClient.readContract({
    address: oft,
    abi: oftAbi,
    functionName: "quoteSend",
    args: [sendParam, false],
  });

  const hash = await walletClient.writeContract({
    address: oft,
    abi: oftAbi,
    functionName: "send",
    args: [sendParam, msgFee, args.account],
    account: args.account,
    chain: walletClient.chain,
    value: msgFee.nativeFee,
  });
  return { hash, msgFee, sendParam };
}

export function assertEvmRecipientForSolToEvm(to: string): Address {
  if (!isAddress(to)) {
    throw new Error("Recipient must be a 0x EVM address for Solana → EVM");
  }
  return to;
}

export { SOLOMON_DEPLOYMENTS };
