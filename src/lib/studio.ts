/**
 * Studio client — system (staff) users only.
 * Login → Bearer token (localStorage) → direct video upload (S3/local).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "nojor-studio-token";
const NAME_KEY = "nojor-studio-name";

export function getStudioToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getStudioName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

function saveStudio(token: string, name: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, name);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nojor-studio"));
  }
}

export function clearStudio() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nojor-studio"));
  }
}

export function isStudioLoggedIn(): boolean {
  return Boolean(getStudioToken());
}

export async function studioLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json()) as {
    ok: boolean;
    token?: string;
    name?: string;
    error?: string;
  };
  if (data.ok && data.token) saveStudio(data.token, data.name || username);
  return data;
}

export async function studioLogout() {
  const token = getStudioToken();
  clearStudio();
  if (!token) return;
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* token already cleared locally */
  }
}

/** Verify stored token is still valid; clears it if not. */
export async function studioMe(): Promise<{ ok: boolean; name?: string }> {
  const token = getStudioToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { ok: boolean; name?: string };
    if (!data.ok) clearStudio();
    return data;
  } catch {
    return { ok: false };
  }
}

export type UploadResult = {
  ok: boolean;
  slug?: string;
  message?: string;
  error?: string;
};

/** XHR upload so we get real progress events (fetch can't). */
export function uploadVideo(
  fields: {
    video: File;
    title: string;
    district: string;
    summary?: string;
    division?: string;
    upazila?: string;
    thana?: string;
    village?: string;
    crime_category?: string;
    thumbnail?: File | null;
  },
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const token = getStudioToken();
    const fd = new FormData();
    fd.append("video", fields.video);
    fd.append("title", fields.title);
    fd.append("district", fields.district);
    if (fields.summary) fd.append("summary", fields.summary);
    if (fields.division) fd.append("division", fields.division);
    if (fields.upazila) fd.append("upazila", fields.upazila);
    if (fields.thana) fd.append("thana", fields.thana);
    if (fields.village) fd.append("village", fields.village);
    if (fields.crime_category) fd.append("crime_category", fields.crime_category);
    if (fields.thumbnail) fd.append("thumbnail", fields.thumbnail);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/studio/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText) as UploadResult);
      } catch {
        resolve({ ok: false, error: "আপলোড ব্যর্থ — আবার চেষ্টা করুন।" });
      }
    };
    xhr.onerror = () =>
      resolve({ ok: false, error: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।" });
    xhr.send(fd);
  });
}

/** Resolve a media URL that may be relative to the API host (local dev storage). */
export function resolveMediaUrl(url?: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return u;
}
