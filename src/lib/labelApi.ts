import { parseLabelEntries, type LabelEntry } from "./label";

// Client for the shared label archive (functions/api/labels.ts on Cloudflare Pages).

const PASSWORD_KEY = "reist-etiketten-passwort";

export function getPassword(): string | null {
  try {
    return localStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function setPassword(pw: string | null): void {
  try {
    if (pw === null) localStorage.removeItem(PASSWORD_KEY);
    else localStorage.setItem(PASSWORD_KEY, pw);
  } catch {
    // Ignore: then the user has to log in again next time.
  }
}

/** "auth": wrong password. "offline": no connection, or no server (e.g. `npm run dev`). */
export class LabelApiError extends Error {
  constructor(readonly kind: "auth" | "offline" | "server") {
    super(kind);
  }
}

export type LabelOp =
  | { op: "save"; entry: LabelEntry }
  | { op: "delete"; id: string }
  | { op: "import"; entries: LabelEntry[] };

/** Without `op`: fetch the list. With `op`: apply it on the server and get the new list. */
export async function labelApi(password: string, op?: LabelOp): Promise<LabelEntry[]> {
  let res: Response;
  try {
    res = await fetch("/api/labels", {
      method: op ? "POST" : "GET",
      headers: { authorization: `Bearer ${password}`, ...(op ? { "content-type": "application/json" } : {}) },
      body: op ? JSON.stringify(op) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new LabelApiError("offline");
  }
  if (res.status === 401) throw new LabelApiError("auth");
  if (res.status === 404) throw new LabelApiError("offline");
  if (!res.ok) throw new LabelApiError("server");
  try {
    return parseLabelEntries(await res.json());
  } catch {
    throw new LabelApiError("server");
  }
}
