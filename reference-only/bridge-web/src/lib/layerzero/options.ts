import { Options } from "@layerzerolabs/lz-v2-utilities";
import { SOLOMON_DEPLOYMENTS } from "@/config/solomon";

const evmToSol = SOLOMON_DEPLOYMENTS.pathway.enforcedOptions.evmToSolana.lzReceive;
const solToEvm = SOLOMON_DEPLOYMENTS.pathway.enforcedOptions.solanaToEvm.lzReceive;

/** Pathway wiring: LZ_RECEIVE for EVM → Solana (compute units + lamports). */
export function extraOptionsEvmToSolana(): `0x${string}` {
  const opts = Options.newOptions().addExecutorLzReceiveOption(
    evmToSol.computeUnits,
    evmToSol.valueLamports
  );
  return opts.toHex() as `0x${string}`;
}

/** Pathway wiring: LZ_RECEIVE for Solana → EVM (gas + value). */
export function extraOptionsSolanaToEvm(): `0x${string}` {
  const opts = Options.newOptions().addExecutorLzReceiveOption(
    solToEvm.gas,
    solToEvm.value
  );
  return opts.toHex() as `0x${string}`;
}
