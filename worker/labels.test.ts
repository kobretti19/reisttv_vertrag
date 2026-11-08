import { describe, expect, it } from "vitest";
import { emptyLabel, newLabelEntry } from "../src/lib/label";
import { onRequest, type Env } from "./labels";

function setup(password = "geheim") {
  const store = new Map<string, string>();
  const env: Env = {
    LABELS: { get: async (k) => store.get(k) ?? null, put: async (k, v) => void store.set(k, v) },
    LABELS_PASSWORD: password,
  };
  const call = async (method: string, body?: unknown, pw = password) => {
    const res = await onRequest({
      env,
      request: new Request("https://x/api/labels", {
        method,
        headers: { authorization: `Bearer ${pw}`, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    });
    return { status: res.status, data: await res.json() };
  };
  return { call, store, env };
}

const metz = newLabelEntry({ ...emptyLabel(), marke: "Metz", preis: "499" }, null);

describe("/api/labels", () => {
  it("rejects a wrong or missing password", async () => {
    const { call } = setup();
    expect((await call("GET", undefined, "falsch")).status).toBe(401);
    expect((await call("GET", undefined, "")).status).toBe(401);
  });

  it("refuses to run without KV and password configured", async () => {
    const res = await onRequest({ env: {}, request: new Request("https://x/api/labels") });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "not configured", missing: ["LABELS", "LABELS_PASSWORD"] });
    const noPw = await onRequest({ env: { LABELS: setup().env.LABELS }, request: new Request("https://x/api/labels") });
    expect(await noPw.json()).toEqual({ error: "not configured", missing: ["LABELS_PASSWORD"] });
  });

  it("saves, updates, deletes and lists", async () => {
    const { call } = setup();
    expect((await call("GET")).data).toEqual([]);
    expect((await call("POST", { op: "save", entry: metz })).data).toEqual([metz]);
    const updated = { ...metz, savedAt: new Date(Date.now() + 1000).toISOString(), label: { ...metz.label, preis: "449" } };
    await call("POST", { op: "save", entry: updated });
    expect((await call("GET")).data).toEqual([updated]);
    expect((await call("POST", { op: "delete", id: metz.id })).data).toEqual([]);
  });

  it("imports by merging (newer savedAt wins)", async () => {
    const { call } = setup();
    await call("POST", { op: "save", entry: metz });
    const sony = newLabelEntry({ ...emptyLabel(), marke: "Sony" }, null);
    const old = { ...metz, savedAt: "2020-01-01T00:00:00.000Z", label: { ...metz.label, preis: "1" } };
    const { data } = await call("POST", { op: "import", entries: [old, sony] });
    expect(data.map((e: { label: { marke: string; preis: string } }) => e.label.marke + e.label.preis).sort()).toEqual([
      "Metz499",
      "Sony",
    ]);
  });

  it("rejects malformed requests", async () => {
    const { call } = setup();
    expect((await call("POST", { op: "save", entry: { nope: 1 } })).status).toBe(400);
    expect((await call("POST", { op: "what" })).status).toBe(400);
    expect((await call("PUT", {})).status).toBe(405);
  });
});
