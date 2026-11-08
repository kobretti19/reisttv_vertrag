import { parseLabelEntries, type LabelEntry } from "./label";

// File System Access API (Chrome/Edge desktop). Not in TypeScript's DOM lib yet, so only what we use is typed here.
type Perm = "granted" | "denied" | "prompt";
export type LabelFileHandle = {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }>;
  queryPermission(o: { mode: "readwrite" }): Promise<Perm>;
  requestPermission(o: { mode: "readwrite" }): Promise<Perm>;
};
type PickerOptions = {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
};
type FsWindow = {
  showSaveFilePicker(o: PickerOptions): Promise<LabelFileHandle>;
  showOpenFilePicker(o: PickerOptions): Promise<LabelFileHandle[]>;
};

const PICKER: PickerOptions = {
  suggestedName: "reist-etiketten.json",
  types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
};

export function fileApiSupported(): boolean {
  return typeof window !== "undefined" && "showSaveFilePicker" in window && "indexedDB" in window;
}

/** The user closed the file picker without choosing a file. */
export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

// The chosen file handle survives reloads in IndexedDB (localStorage can't hold it).
function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("reist-etiketten", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("handles");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const req = run(db.transaction("handles", mode).objectStore("handles"));
      req.onsuccess = () => {
        db.close();
        resolve(req.result as T);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    };
  });
}

export async function storedLabelFile(): Promise<LabelFileHandle | null> {
  try {
    return (await idb<LabelFileHandle | undefined>("readonly", (s) => s.get("file"))) ?? null;
  } catch {
    return null;
  }
}

const remember = (h: LabelFileHandle) => idb("readwrite", (s) => s.put(h, "file"));

export async function forgetLabelFile(): Promise<void> {
  await idb("readwrite", (s) => s.delete("file"));
}

/** Asks where to create a new JSON file. Throws AbortError if the user cancels. */
export async function createLabelFile(): Promise<LabelFileHandle> {
  const h = await (window as unknown as FsWindow).showSaveFilePicker(PICKER);
  await remember(h);
  return h;
}

/** Asks for an existing JSON file. Throws AbortError if the user cancels. */
export async function openLabelFile(): Promise<LabelFileHandle> {
  const [h] = await (window as unknown as FsWindow).showOpenFilePicker(PICKER);
  await remember(h);
  return h;
}

/** Whether we may read and write the file. With `ask`, the browser may show its permission prompt (needs a click). */
export async function hasPermission(h: LabelFileHandle, ask: boolean): Promise<boolean> {
  if ((await h.queryPermission({ mode: "readwrite" })) === "granted") return true;
  return ask && (await h.requestPermission({ mode: "readwrite" })) === "granted";
}

/** Parses the text of a label JSON file. Empty text is an empty list; anything that isn't a JSON array throws. */
export function parseLabelFile(text: string): LabelEntry[] {
  if (!text.trim()) return [];
  const data: unknown = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("not a label file");
  return parseLabelEntries(data);
}

export async function readLabelFile(h: LabelFileHandle): Promise<LabelEntry[]> {
  return parseLabelFile(await (await h.getFile()).text());
}

export const labelsJson = (list: LabelEntry[]) => JSON.stringify(list, null, 2);

export async function writeLabelFile(h: LabelFileHandle, list: LabelEntry[]): Promise<void> {
  const w = await h.createWritable();
  await w.write(labelsJson(list));
  await w.close();
}
