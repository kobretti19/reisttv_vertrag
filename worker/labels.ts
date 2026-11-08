// The shared label archive, kept as one JSON list in Workers KV. Called by worker/index.ts for /api/labels.
// Setup: KV binding LABELS (wrangler.jsonc, created automatically on deploy) and the secret LABELS_PASSWORD (see CLAUDE.md).
import { mergeLabels, parseLabelEntries, removeLabel, upsertLabel, type LabelEntry } from "../src/lib/label";

type KV = { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };
export type Env = { LABELS?: KV; LABELS_PASSWORD?: string };
type Ctx = { request: Request; env: Env };

const KEY = "labels";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

/** Constant-time string compare, so the password can't be guessed by timing. */
function same(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return diff === 0;
}

async function read(kv: KV): Promise<LabelEntry[]> {
  const raw = await kv.get(KEY);
  if (!raw) return [];
  try {
    return parseLabelEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** GET → the list. POST {op:"save",entry} | {op:"delete",id} | {op:"import",entries} → the new list. */
export async function onRequest({ request, env }: Ctx): Promise<Response> {
  if (!env.LABELS || !env.LABELS_PASSWORD) return json({ error: "not configured" }, 500);
  const auth = request.headers.get("authorization") ?? "";
  if (!same(auth, `Bearer ${env.LABELS_PASSWORD}`)) return json({ error: "unauthorized" }, 401);

  if (request.method === "GET") return json(await read(env.LABELS));
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    const data: unknown = await request.json();
    if (!data || typeof data !== "object") throw new Error();
    body = data as Record<string, unknown>;
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const list = await read(env.LABELS);
  let next: LabelEntry[];
  if (body.op === "save") {
    const [entry] = parseLabelEntries([body.entry]);
    if (!entry) return json({ error: "bad entry" }, 400);
    next = upsertLabel(list, entry);
  } else if (body.op === "delete" && typeof body.id === "string") {
    next = removeLabel(list, body.id);
  } else if (body.op === "import" && Array.isArray(body.entries)) {
    next = mergeLabels(list, parseLabelEntries(body.entries));
  } else {
    return json({ error: "bad request" }, 400);
  }
  await env.LABELS.put(KEY, JSON.stringify(next));
  return json(next);
}
