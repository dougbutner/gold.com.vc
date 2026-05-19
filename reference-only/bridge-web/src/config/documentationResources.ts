/** Curated external docs; keep in sync with ../../docs/RESOURCES.md */

export type DocumentationLink = { label: string; href: string };

export type DocumentationResourceGroup = {
  title: string;
  links: DocumentationLink[];
};

export const documentationResourceGroups: DocumentationResourceGroup[] = [
  {
    title: "WalletConnect (EVM)",
    links: [
      { label: "Reown dashboard (project ID)", href: "https://dashboard.reown.com/" },
      { label: "Reown docs", href: "https://docs.reown.com/" },
      { label: "WalletConnect Network docs", href: "https://docs.walletconnect.network/" },
      {
        label: "RainbowKit installation (projectId)",
        href: "https://www.rainbowkit.com/docs/installation",
      },
    ],
  },
  {
    title: "EVM stack (this app)",
    links: [
      { label: "RainbowKit", href: "https://www.rainbowkit.com/docs/introduction" },
      { label: "wagmi", href: "https://wagmi.sh/react/getting-started" },
      { label: "viem", href: "https://viem.sh/docs/getting-started" },
    ],
  },
  {
    title: "LayerZero",
    links: [
      {
        label: "LayerZero V2 docs (EVM OApp)",
        href: "https://docs.layerzero.network/v2/developers/evm/oapp/overview",
      },
      {
        label: "Solana OApp overview",
        href: "https://docs.layerzero.network/v2/developers/solana/oapp/overview",
      },
      {
        label: "Configuring pathways",
        href: "https://docs.layerzero.network/v2/get-started/create-lz-oapp/configuring-pathways",
      },
      {
        label: "Deployed contracts",
        href: "https://docs.layerzero.network/v2/deployments/deployed-contracts",
      },
      { label: "LayerZero Scan", href: "https://layerzeroscan.com/" },
      {
        label: "Metadata API",
        href: "https://metadata.layerzero-api.com/v1/metadata",
      },
    ],
  },
  {
    title: "Solana wallet adapter",
    links: [
      {
        label: "anza-xyz/wallet-adapter",
        href: "https://github.com/anza-xyz/wallet-adapter",
      },
    ],
  },
  {
    title: "Solana wallets (supported in UI)",
    links: [
      { label: "Phantom", href: "https://docs.phantom.app/" },
      { label: "Solflare", href: "https://docs.solflare.com/" },
      { label: "Backpack", href: "https://support.backpack.app/" },
      {
        label: "Coinbase Wallet SDK",
        href: "https://docs.cloud.coinbase.com/wallet-sdk/docs/welcome",
      },
      { label: "Coin98", href: "https://docs.coin98.com/" },
      { label: "Trust Wallet developers", href: "https://developer.trustwallet.com/" },
      { label: "Nightly", href: "https://docs.nightly.app/" },
      { label: "Torus", href: "https://docs.tor.us/" },
    ],
  },
  {
    title: "Solana platform",
    links: [
      { label: "Solana docs", href: "https://solana.com/docs" },
      { label: "SPL Token", href: "https://spl.solana.com/token" },
    ],
  },
];
