/**
 * Public device identity — feels like login, but there is no account.
 *
 * Persistence (best-effort, same browser):
 *   1. localStorage  — primary
 *   2. first-party cookie (400 days) — survives some LS clears
 *   3. IndexedDB — extra copy of the same key + name
 *
 * Soft device hint (hashed, not an ID) is sent as a header so the API
 * can rate-limit a device that keeps minting new keys.
 */

const KEY_LS = "nojor-visitor-key";
const NAME_LS = "nojor-display-name";
const NAME_SET_AT_LS = "nojor-name-set-at";
const NAME_CHANGED_AT_LS = "nojor-name-changed-at";
const NAME_CHANGE_COUNT_LS = "nojor-name-change-count";
const LEGACY_KEY = "ninnoy-visitor-key";
const COOKIE = "nojor_vid";
const IDB_NAME = "nojor";
const IDB_STORE = "identity";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months (browser cap)

/** After first set: at most 1 rename, and only after this cooldown. */
export const NAME_RENAME_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const NAME_MAX_CHANGES = 1;

export type PublicIdentity = {
  key: string;
  name: string;
};

function randomKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const parts = document.cookie.split("; ");
  for (const p of parts) {
    if (p.startsWith(`${name}=`)) return decodeURIComponent(p.slice(name.length + 1));
  }
  return "";
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(k: string): Promise<string> {
  const db = await openIdb();
  if (!db) return "";
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(k);
      req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : "");
      req.onerror = () => resolve("");
    } catch {
      resolve("");
    }
  });
}

async function idbSet(k: string, v: string) {
  const db = await openIdb();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(v, k);
  } catch {
    /* ignore */
  }
}

function readLocal(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeLocal(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

/** Resolve the stable visitor key (sync — enough for API calls). */
export function getVisitorKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let v =
      readLocal(KEY_LS) ||
      readLocal(LEGACY_KEY) ||
      readCookie(COOKIE);
    if (!v) v = randomKey();
    persistKey(v);
    return v;
  } catch {
    return `v-${Date.now()}`;
  }
}

function persistKey(v: string) {
  writeLocal(KEY_LS, v);
  writeCookie(COOKIE, v);
  void idbSet("key", v);
}

export function getDisplayName(): string {
  return readLocal(NAME_LS).trim();
}

export type NameChangeGate = {
  allowed: boolean;
  /** First-time set (no name yet). */
  isFirstSet: boolean;
  reason: string;
  /** ms until next rename is allowed (0 if allowed / first set). */
  waitMs: number;
  changesUsed: number;
};

function readTs(key: string): number {
  const raw = readLocal(key);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readChangeCount(): number {
  const n = Number(readLocal(NAME_CHANGE_COUNT_LS) || "0");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Whether this device may set or rename the display name. */
export function getNameChangeGate(): NameChangeGate {
  const current = getDisplayName();
  if (!current) {
    return {
      allowed: true,
      isFirstSet: true,
      reason: "",
      waitMs: 0,
      changesUsed: 0,
    };
  }

  const changesUsed = readChangeCount();
  if (changesUsed >= NAME_MAX_CHANGES) {
    return {
      allowed: false,
      isFirstSet: false,
      reason:
        "এই ডিভাইসে নাম আর বদলানো যাবে না। পরিচয় চুরি/অপব্যবহার রোধে নাম লক করা আছে।",
      waitMs: 0,
      changesUsed,
    };
  }

  const last =
    readTs(NAME_CHANGED_AT_LS) || readTs(NAME_SET_AT_LS) || 0;
  const elapsed = Date.now() - last;
  if (last && elapsed < NAME_RENAME_COOLDOWN_MS) {
    const waitMs = NAME_RENAME_COOLDOWN_MS - elapsed;
    const days = Math.max(1, Math.ceil(waitMs / (1000 * 60 * 60 * 24)));
    return {
      allowed: false,
      isFirstSet: false,
      reason: `নাম বদলাতে আরও প্রায় ${days} দিন অপেক্ষা করতে হবে। ঘন ঘন নাম বদলানো থেকে এই ডিভাইস সুরক্ষিত।`,
      waitMs,
      changesUsed,
    };
  }

  return {
    allowed: true,
    isFirstSet: false,
    reason: "",
    waitMs: 0,
    changesUsed,
  };
}

/**
 * Persist display name. Enforces device rename lock.
 * Throws nothing — returns { ok, name, error }.
 */
export function setDisplayName(
  name: string,
): { ok: true; name: string } | { ok: false; error: string } {
  const clean = sanitizeName(name);
  const gate = getNameChangeGate();
  if (!gate.allowed) {
    return { ok: false, error: gate.reason };
  }

  const prev = getDisplayName();
  if (prev && sanitizeName(prev) === clean) {
    return { ok: true, name: clean };
  }

  const now = String(Date.now());
  writeLocal(NAME_LS, clean);
  void idbSet("name", clean);

  if (!prev) {
    writeLocal(NAME_SET_AT_LS, now);
    void idbSet("nameSetAt", now);
  } else {
    const nextCount = readChangeCount() + 1;
    writeLocal(NAME_CHANGE_COUNT_LS, String(nextCount));
    writeLocal(NAME_CHANGED_AT_LS, now);
    void idbSet("nameChangeCount", String(nextCount));
    void idbSet("nameChangedAt", now);
  }

  return { ok: true, name: clean };
}

export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 40);
}

export function isValidName(raw: string): string {
  const n = sanitizeName(raw);
  if (n.length < 2) return "নাম কমপক্ষে ২ অক্ষর হতে হবে।";
  if (/https?:\/\//i.test(n) || /www\./i.test(n)) return "লিংক নাম হিসেবে চলবে না।";
  return "";
}

/** Hydrate name/key from IndexedDB if LS was wiped. Call once on boot. */
export async function hydrateIdentity(): Promise<PublicIdentity> {
  let key = getVisitorKey();
  let name = getDisplayName();
  if (!name) {
    const fromIdb = await idbGet("name");
    if (fromIdb) {
      writeLocal(NAME_LS, fromIdb);
      name = fromIdb;
    }
  }
  if (!readLocal(KEY_LS)) {
    const fromIdb = await idbGet("key");
    if (fromIdb) {
      persistKey(fromIdb);
      key = fromIdb;
    }
  }
  // Restore rename-lock metadata so clearing only LS can't unlock rename
  for (const [ls, idb] of [
    [NAME_SET_AT_LS, "nameSetAt"],
    [NAME_CHANGED_AT_LS, "nameChangedAt"],
    [NAME_CHANGE_COUNT_LS, "nameChangeCount"],
  ] as const) {
    if (!readLocal(ls)) {
      const v = await idbGet(idb);
      if (v) writeLocal(ls, v);
    }
  }
  // Legacy: name exists but no set-at → treat as already locked (no free renames)
  if (name && !readTs(NAME_SET_AT_LS)) {
    const now = String(Date.now());
    writeLocal(NAME_SET_AT_LS, now);
    writeLocal(NAME_CHANGE_COUNT_LS, String(NAME_MAX_CHANGES));
    void idbSet("nameSetAt", now);
    void idbSet("nameChangeCount", String(NAME_MAX_CHANGES));
  }
  return { key, name };
}

let hintCache = "";

/** Soft hashed device hint — not an identity, only abuse signal. */
export async function getDeviceHint(): Promise<string> {
  if (hintCache) return hintCache;
  if (typeof window === "undefined" || !crypto?.subtle) return "";
  try {
    const raw = [
      navigator.language,
      (navigator.languages || []).join(","),
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      String(navigator.hardwareConcurrency || 0),
      navigator.platform || "",
      String(navigator.maxTouchPoints || 0),
    ].join("|");
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(raw),
    );
    hintCache = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);
    return hintCache;
  } catch {
    return "";
  }
}
