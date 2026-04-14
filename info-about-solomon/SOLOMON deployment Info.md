## SOLOMON mainnet — canonical Solana OApp (source for Sol→EVM canaries)

| Field | Value |
|--------|--------|
| Token | SOLOMON |
| LayerZero EID | `30168` |
| Solana EndpointV2 | `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6` |
| OFT program id | `DMNergMJiPjFDB57gvVwxExirSw8J6xX6kvkw9WuUWxa` |
| OFT store (canonical peer identity) | `6Es2BNCrYC3xsmtqSkYzhTiQJkyt9AkpkQTyTsY28CTK` |
| Mint | `GoLDEDmbque3qd1xfmnzMtg7HMju8p4UoaRX1vBsehjA` |
| Mint authority | `6Es2BNCrYC3xsmtqSkYzhTiQJkyt9AkpkQTyTsY28CTK` |
| Escrow ATA | `CNquMpmgVGyE1erqZgD1angAvzXQrZUdzi6odvDcS4d6` |
| SPL program (Token-2022, used in earlier Ethereum canary) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Documented fee payer (Solana pubkey) | `GoLdERbgoL91URFoi5USKQqxYua1YVSUuBCuPtsnzKqy` |
| Min canary amount (logged batches) | `0.000001` SOLOMON (plus one older Ethereum path at `0.001`) |
| EVM recipient used in logged min canaries | `0x901dcf82db70A09d1012873c03306B00725FEa23` |
| MyOFT delegate / deployer (public, from registry) | `0x901dcf82db70A09d1012873c03306B00725FEa23` |
| Shared EndpointV2 constructor arg (most EVM MyOFT deploys) | `0x1a44076050125825900e736c501f859c50fE728c` |

---

## EVM chains — deployment + Sol→EVM canary (only rows with a recorded canary)

| Chain | LZ EID | Native chain ID | LayerZero EndpointV2 on chain | MyOFT_SOLOMON | Deploy tx | Deploy block | Canary date | Canary amount | Sol→EVM canary (Solscan) | Older / extra canary proof |
|--------|--------|-----------------|-------------------------------|---------------|-----------|--------------|-------------|---------------|---------------------------|-----------------------------|
| Ethereum | 30101 | 1 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x8c700f6e553bb0a7c18d1aa2513fbaf8a1b09dff4e2ce7b255e508cd0d0be12a` | 24758667 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/25F5WixeQtZMV6pWT8qJSCR4CP8y7qURhSY28PUZoe9f4FPNuzg4pNFz6duqmrTeMa3Zhn9H8t7VSDgRQt7gfwzY` | Earlier 0.001 Sol→ETH: `https://solscan.io/tx/3Djfig598ffihNocCjDJeVsMATHUBJLBrESpNSzTCnZfFC6eTRkTrpEaz2ybm65v7m46RTN9v47yJBknBJSBhFiC` — LZ Scan: `https://layerzeroscan.com/tx/3Djfig598ffihNocCjDJeVsMATHUBJLBrESpNSzTCnZfFC6eTRkTrpEaz2ybm65v7m46RTN9v47yJBknBJSBhFiC` |
| Arbitrum | 30110 | 42161 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x43a25fa38fa482da7c4b3a6130da9664ee901752f21632d56184a5cabbb73a7f` | 446663823 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/5LgdxTbA1vfUahmaS4GsdS86vb8bMHZ1Kx9iJ82npGuHJEpjQHEQ4jQ52yngThJYv2QzNAMQsTgfCpwg8f6Utvpg` | — |
| Optimism | 30111 | 10 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0xfab1ad0659dd39c9606385726d7351fc203afa9004705bda94df6d1a0374a15a` | 149566705 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/3xH5rkxszXTLrLMVx65tnW5Mjq8gPQYuS3DUVdygBbuTjJpfbgRoBdUXYwfA9po2LviEydYYbUgJvg1gV9B4SMDi` | — |
| Base | 30184 | 8453 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x028388a46a4fdc70586f8ef324118f4c58c60f23cc360d08330af0c1f3ec79bd` | 43971426 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/25dkXnD1hPcD6YqRx7LiX64WJy87vkUjbBTDtkWeCvC84pKVp9DyEVfATutsnKs85AvV8P8eYJDx5An2vgXbmYS6` | — |
| BSC | 30102 | 56 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0xc76a3cca44d9ea0335c9f0d4cdf79b8f6c3f45e1911ffbebfbdd44310b823798` | 89297242 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/2t66sUigvjfSYAwzmMbKvPjSAbbyxc5DHakAGhhJa2YrwdqVAC1Co3rc3nBDbT18z72muQQx464GND8xuMMYBb6W` | — |
| Polygon | 30109 | 137 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x129289f4a95dad94a58381d072ad8d969c991810fb93fd4aa7fafa8158a9582f` | 84806141 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/2MXjPfk81mVk39ahNZXCmpNB1SZ6pjkioPbuktatgbbT9KjiHBQaa7dWDKHerFiWtiSsSirpr2pPtZssZhXbWPec` | — |
| Avalanche | 30106 | 43114 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x1a9f335a0d8283d357acb6d6d848f1af048009d3cff7067a1633ded0cba0044f` | 81526388 | 2026-04-13 | 0.000001 | `https://solscan.io/tx/2W1nBuZLHaX8i5yH1L9ns6TVrh76gFn51CLdeNKEi12dxRyLWfz81aJFSjrniVX8cG1m2Ck1DjgdZLHMAoaRCnpr` | — |
| Linea | 30183 | 59144 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x7b4b3ce23fb095ac31efcbb9451b9a740e0ea5d5adffeed82c3418b514e1744b` | 30092890 | 2026-04-14 | 0.000001 | `https://solscan.io/tx/uRpJeZMEM1QDwpUxeDixXkw55kkJdvFYjspHdk2ppwWf6YihAmkJdgFvZEiLD82uxrfEmBhcPHmPwc8MtQj9fxu` | Logged as **1/12** successful dsts in same batch (Linea→Kava); middle-chain Solscan URLs not individually pasted in runbook |
| Mantle | 30181 | 5000 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x5a8ddcf7646eaf68d1d9ea326d1f7ecd47b31679ba53ea31c9ea8846223fbdb4` | 93690855 | 2026-04-14 | 0.000001 | *(same batch; no per-chain URL in runbook)* | — |
| Blast | 30243 | 81457 | `0x1a44076050125825900e736c501f859c50fE728c` | `0xd6562E260F5626Fb2345E82baad4E15352e6695F` | `0x749ae51ead03a321a2330df8c7216cef8c637b61516b6247d8ee42961a80d252` | 33351109 | 2026-04-14 | 0.000001 | *(same batch; no per-chain URL in runbook)* | **Different MyOFT address** vs most other EVMs |
| Scroll | 30214 | 534352 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x28eb7e407d9444cd18ab7268ace60d8489e7410a374211701c6517093f9ca778` | 33164870 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Manta Pacific | 30217 | 169 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x6895751e6068b4a9c725158878aff1abe8b98cf0287cd59e2a90d1c88f86f1c7` | 8128811 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| opBNB | 30202 | 204 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x57f8e1c1b3afe6dc9ff70e19a81c85ef6233a144aded0537c779a6450736c10c` | 129580610 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Fraxtal | 30255 | 252 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0xadcd1dac1e16f7bc1d55d1d9d64fd94af69c958e6d8960dcb5d4e4032d4b9179` | 34479357 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Gnosis | 30145 | 100 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x95fae2fa859f703c0489d9d77bedc2c2305495c391974c63ce30dbded77cd64a` | 45592054 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Celo | 30125 | 42220 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x9fd703e8ae483a088ddb529030a70fde964e9beda2395f8a3c1cb63392598ba8` | 63614769 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Moonbeam | 30126 | 1284 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0xe6e9f84f2dfec23900b018175a92ab7582c967cdffdc42fdfca6abf12a986126` | 15118522 | 2026-04-14 | 0.000001 | *(same batch)* | Solana init-config for dst `30126` completed same window (1 tx) before batch |
| Harmony | 30116 | 1666600000 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x49cdb957e43f1b25b6d723cde7347d8789363d77a9002526e43a3ccf3e3f36f8` | 87269476 | 2026-04-14 | 0.000001 | *(same batch)* | — |
| Kava | 30177 | 2222 | `0x1a44076050125825900e736c501f859c50fE728c` | `0x94b354665e70fD2A74594595197CEb4527c36d7C` | `0x735cc3689be5729326f689c17f12874b685b7c9aa9020ab78d016171b2b405cb` | 20145046 | 2026-04-14 | 0.000001 | `https://solscan.io/tx/5UzT9ebbSoQuRz64gbbqHYNNP2aufHRxxgqB1EnSGZVW4nSxgriC7sRnbsSMiJCZAWeokNDfxdEUQHz4Bq3MWNEQ` | Logged as **12/12** successful dst in Linea→Kava batch |

---

#