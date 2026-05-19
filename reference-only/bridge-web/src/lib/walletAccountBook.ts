export type WalletFamily = "evm" | "solana";

export type WalletAccountEntry = {
  type: WalletFamily;
  address: string;
  label?: string;
  walletName?: string;
  connectorId?: string;
  addedAt: number;
  updatedAt: number;
  lastUsedAt: number;
};

export type WalletAccountBook = {
  evm: WalletAccountEntry[];
  solana: WalletAccountEntry[];
};

export const WALLET_ACCOUNT_BOOK_KEY = "solomon.bridge.accounts.v1";

export const EMPTY_WALLET_ACCOUNT_BOOK: WalletAccountBook = {
  evm: [],
  solana: [],
};

function keyForType(type: WalletFamily): keyof WalletAccountBook {
  return type === "evm" ? "evm" : "solana";
}

function normalizeAddress(type: WalletFamily, address: string): string {
  return type === "evm" ? address.toLowerCase() : address;
}

function cloneBook(book: WalletAccountBook): WalletAccountBook {
  return {
    evm: [...book.evm],
    solana: [...book.solana],
  };
}

function safeParseBook(raw: string): WalletAccountBook {
  try {
    const parsed = JSON.parse(raw) as Partial<WalletAccountBook>;
    return {
      evm: Array.isArray(parsed.evm) ? parsed.evm : [],
      solana: Array.isArray(parsed.solana) ? parsed.solana : [],
    };
  } catch {
    return EMPTY_WALLET_ACCOUNT_BOOK;
  }
}

export function loadWalletAccountBook(): WalletAccountBook {
  if (typeof window === "undefined") return EMPTY_WALLET_ACCOUNT_BOOK;
  const raw = window.localStorage.getItem(WALLET_ACCOUNT_BOOK_KEY);
  if (!raw) return EMPTY_WALLET_ACCOUNT_BOOK;
  return safeParseBook(raw);
}

export function saveWalletAccountBook(book: WalletAccountBook): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_ACCOUNT_BOOK_KEY, JSON.stringify(book));
}

type UpsertInput = {
  type: WalletFamily;
  address: string;
  label?: string;
  walletName?: string;
  connectorId?: string;
};

export function upsertWalletAccount(
  book: WalletAccountBook,
  input: UpsertInput
): WalletAccountBook {
  const typeKey = keyForType(input.type);
  const normalizedAddress = normalizeAddress(input.type, input.address.trim());
  if (!normalizedAddress) return book;

  const now = Date.now();
  const nextBook = cloneBook(book);
  const rows = nextBook[typeKey];
  const rowIndex = rows.findIndex(
    (row) => normalizeAddress(row.type, row.address) === normalizedAddress
  );

  if (rowIndex >= 0) {
    const current = rows[rowIndex];
    rows[rowIndex] = {
      ...current,
      address: input.address.trim(),
      label: input.label ?? current.label,
      walletName: input.walletName ?? current.walletName,
      connectorId: input.connectorId ?? current.connectorId,
      updatedAt: now,
      lastUsedAt: now,
    };
    return nextBook;
  }

  rows.unshift({
    type: input.type,
    address: input.address.trim(),
    label: input.label,
    walletName: input.walletName,
    connectorId: input.connectorId,
    addedAt: now,
    updatedAt: now,
    lastUsedAt: now,
  });
  return nextBook;
}

export function removeWalletAccount(
  book: WalletAccountBook,
  type: WalletFamily,
  address: string
): WalletAccountBook {
  const normalizedAddress = normalizeAddress(type, address.trim());
  const typeKey = keyForType(type);
  const nextBook = cloneBook(book);
  nextBook[typeKey] = nextBook[typeKey].filter(
    (row) => normalizeAddress(row.type, row.address) !== normalizedAddress
  );
  return nextBook;
}
