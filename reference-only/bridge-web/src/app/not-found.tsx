import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">
          SOLOMON bridge
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Page not found</h1>
        <p className="text-sm text-zinc-400">
          This route does not exist. Return to the bridge to continue your transfer.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
        >
          Back to bridge
        </Link>
      </div>
    </main>
  );
}
