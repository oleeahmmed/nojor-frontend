/**
 * Studio client — system (staff) users only.
 * Login → Bearer token (localStorage) → direct video upload (S3/local).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "nojor-studio-token";
const NAME_KEY = "nojor-studio-name";
const AVATAR_KEY = "nojor-studio-avatar";

/** Make media URLs absolute against API host when relative. */
export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  const base = API_BASE.replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/** @deprecated alias — prefer mediaUrl */
export const resolveMediaUrl = mediaUrl;

export function getStudioToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getStudioName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function getStudioAvatar(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AVATAR_KEY) ?? "";
}

function saveStudio(token: string, name: string, avatarUrl = "") {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, name);
  if (avatarUrl) localStorage.setItem(AVATAR_KEY, avatarUrl);
  else localStorage.removeItem(AVATAR_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nojor-studio"));
  }
}

function patchStudioProfile(name?: string, avatarUrl?: string) {
  if (name !== undefined) localStorage.setItem(NAME_KEY, name);
  if (avatarUrl !== undefined) {
    if (avatarUrl) localStorage.setItem(AVATAR_KEY, avatarUrl);
    else localStorage.removeItem(AVATAR_KEY);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nojor-studio"));
  }
}

export function clearStudio() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(AVATAR_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nojor-studio"));
  }
}

export function isStudioLoggedIn(): boolean {
  return Boolean(getStudioToken());
}

export async function studioLogin(username: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const text = await res.text();
    let data: {
      ok?: boolean;
      token?: string;
      name?: string;
      avatar_url?: string;
      error?: string;
    } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      if (res.status === 404) {
        return {
          ok: false,
          error:
            "সার্ভারে টিম লগইন API নেই — public_staff.py ও urls.py আপলোড করে Passenger রিস্টার্ট করুন।",
        };
      }
      return {
        ok: false,
        error: `লগইন ব্যর্থ (HTTP ${res.status})। সার্ভার JSON দেয়নি।`,
      };
    }
    if (data.ok && data.token) {
      saveStudio(
        data.token,
        data.name || username,
        mediaUrl(data.avatar_url || ""),
      );
    }
    if (!data.ok && !data.error) {
      data.error =
        res.status === 403
          ? "এই অ্যাকাউন্টের স্টাফ অনুমতি নেই (is_staff চালু করুন)।"
          : res.status === 401
            ? "ভুল ইউজারনেম বা পাসওয়ার্ড।"
            : "লগইন ব্যর্থ।";
    }
    return { ok: Boolean(data.ok), ...data };
  } catch {
    return {
      ok: false,
      error: "সার্ভারে সংযোগ হয়নি। নেটওয়ার্ক বা API URL চেক করুন।",
    };
  }
}

export async function studioLogout() {
  const token = getStudioToken();
  clearStudio();
  if (!token) return;
  try {
    await fetch(`${API_BASE}/api/auth/logout/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* token already cleared locally */
  }
}

/** Verify stored token is still valid; clears it if not. */
export async function studioMe(): Promise<{
  ok: boolean;
  name?: string;
  avatar_url?: string;
}> {
  const token = getStudioToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      ok: boolean;
      name?: string;
      avatar_url?: string;
    };
    if (!data.ok) clearStudio();
    else {
      patchStudioProfile(data.name, mediaUrl(data.avatar_url || ""));
    }
    return data;
  } catch {
    return { ok: false };
  }
}

export async function studioUpdateProfile(fields: {
  name?: string;
  avatar?: File | null;
}) {
  const token = getStudioToken();
  if (!token) return { ok: false as const, error: "স্টাফ লগইন প্রয়োজন।" };

  const fd = new FormData();
  if (fields.name?.trim()) fd.append("name", fields.name.trim());
  if (fields.avatar) fd.append("avatar", fields.avatar);

  try {
    const res = await fetch(`${API_BASE}/api/auth/profile/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      message?: string;
      name?: string;
      avatar_url?: string;
    };
    if (data.ok) {
      patchStudioProfile(
        data.name || fields.name?.trim(),
        mediaUrl(data.avatar_url || ""),
      );
    }
    return data;
  } catch {
    return { ok: false as const, error: "সার্ভারে সংযোগ হয়নি।" };
  }
}

export type CaseStaffEditBody = {
  title?: string;
  summary?: string;
  district?: string;
  division?: string;
  upazila?: string;
  thana?: string;
  village?: string;
  location_text?: string;
  crime_category?: string;
  accused_party?: string;
  tags?: string[] | string;
  case_number?: string;
  police_station?: string;
  verdict_summary?: string;
  legal_status?: string;
  visibility?: string;
  incident_date?: string | null;
  verdict_date?: string | null;
  sources?: { title: string; publisher?: string; url?: string }[];
  note?: string;
};

export async function staffEditCase(slug: string, body: CaseStaffEditBody) {
  const token = getStudioToken();
  if (!token) return { ok: false as const, error: "স্টাফ লগইন প্রয়োজন।" };
  const res = await fetch(
    `${API_BASE}/api/cases/${encodeURIComponent(slug)}/edit/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  return res.json() as Promise<{
    ok?: boolean;
    error?: string;
    message?: string;
    title?: string;
    summary?: string;
    district?: string;
    division?: string;
    upazila?: string;
    thana?: string;
    village?: string;
    location_text?: string;
    crime_category?: string;
    accused_party?: string;
    tags?: string[];
    case_number?: string;
    police_station?: string;
    verdict_summary?: string;
    legal_status?: string;
    visibility?: string;
    incident_date?: string | null;
    verdict_date?: string | null;
    sources?: { title: string; url?: string; publisher?: string }[];
  }>;
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
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText) as UploadResult);
      } catch {
        resolve({ ok: false, error: "আপলোড রেসপন্স পার্স হয়নি।" });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "নেটওয়ার্ক এরর।" });
    xhr.send(fd);
  });
}
