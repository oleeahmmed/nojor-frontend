import { getDeviceHint, getDisplayName, getVisitorKey } from "./identity";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type CommentItem = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
};

export type CommentPage = {
  items: CommentItem[];
  next_cursor: string | null;
  total: number;
};

export type EngagementStats = {
  ok?: boolean;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  share_count: number;
  my_reaction?: "like" | "dislike" | null;
  shared?: boolean;
  counted?: boolean;
};

async function headers(): Promise<Record<string, string>> {
  const hint = await getDeviceHint();
  return {
    "Content-Type": "application/json",
    "X-Visitor-Key": getVisitorKey(),
    ...(hint ? { "X-Device-Hint": hint } : {}),
  };
}

async function post(path: string, body: unknown) {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(body),
    });
    return res.json();
  } catch {
    return { ok: false, error: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।" };
  }
}

export async function recordView(slug: string) {
  return post(`/api/cases/${slug}/view`, { visitor_key: getVisitorKey() });
}

export async function reactToCase(
  slug: string,
  action: "like" | "dislike" | "none",
) {
  return post(`/api/cases/${slug}/react`, {
    visitor_key: getVisitorKey(),
    action,
  });
}

export async function shareCase(slug: string) {
  return post(`/api/cases/${slug}/share`, { visitor_key: getVisitorKey() });
}

export async function fetchMyEngagement(
  slug: string,
): Promise<EngagementStats | null> {
  try {
    const q = new URLSearchParams({ visitor_key: getVisitorKey() });
    const res = await fetch(`${API}/api/cases/${slug}/me?${q}`, {
      cache: "no-store",
      headers: await headers(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Lazy comments — small pages only (YouTube-style). */
export async function fetchComments(
  slug: string,
  opts?: { cursor?: string; limit?: number },
): Promise<CommentPage> {
  const q = new URLSearchParams();
  if (opts?.cursor) q.set("cursor", opts.cursor);
  q.set("limit", String(opts?.limit ?? 20));
  const res = await fetch(`${API}/api/cases/${slug}/comments?${q}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { items: [], next_cursor: null, total: 0 };
  }
  return res.json();
}

export async function postComment(
  slug: string,
  body: string,
  author_name = "",
) {
  return post(`/api/cases/${slug}/comments`, {
    body,
    author_name: author_name || getDisplayName(),
    visitor_key: getVisitorKey(),
  });
}

export type VerdictPoll = {
  ok: boolean;
  has_verdict: boolean;
  status: string;
  summary: string;
  date: string | null;
  case_number: string;
  agree: number;
  disagree: number;
  neutral: number;
  my: "agree" | "disagree" | "neutral" | null;
  error?: string;
};

export async function fetchVerdict(slug: string): Promise<VerdictPoll> {
  const empty: VerdictPoll = {
    ok: false,
    has_verdict: false,
    status: "",
    summary: "",
    date: null,
    case_number: "",
    agree: 0,
    disagree: 0,
    neutral: 0,
    my: null,
  };
  try {
    const res = await fetch(`${API}/api/cases/${slug}/verdict`, {
      cache: "no-store",
      headers: await headers(),
    });
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

export async function voteVerdict(
  slug: string,
  action: "agree" | "disagree" | "neutral" | "clear",
) {
  return post(`/api/cases/${slug}/verdict-opinion`, {
    visitor_key: getVisitorKey(),
    action,
    display_name: getDisplayName(),
  }) as Promise<VerdictPoll>;
}

export function formatCount(n: number): string {
  if (!n || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 100_000) {
    const v = n / 1000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  if (n < 10_000_000) {
    const v = n / 100_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}L`;
  }
  return `${(n / 1_000_000).toFixed(1)}M`;
}
