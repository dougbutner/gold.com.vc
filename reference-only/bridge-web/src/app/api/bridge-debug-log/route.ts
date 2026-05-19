import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const LOG_FILE = path.join("logs", "bridge-debug.ndjson");

export async function POST(request: Request) {
  if (process.env.BRIDGE_ENABLE_FILE_LOG !== "true") {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const cwd = process.cwd();
  const dir = path.join(cwd, "logs");
  const filePath = path.join(cwd, LOG_FILE);
  try {
    await mkdir(dir, { recursive: true });
    await appendFile(filePath, `${JSON.stringify(body)}\n`, "utf8");
  } catch (e) {
    const message = e instanceof Error ? e.message : "write failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
