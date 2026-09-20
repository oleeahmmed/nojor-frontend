import { formatCount } from "./engagement";
import { normalizeStatus } from "./status";
import { formatDuration } from "./thumbnails";
import type { ArchiveCase, CaseDetail, CaseListItem } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function listToArchive(item: CaseListItem): ArchiveCase {
  const view_count = item.view_count ?? 0;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    district: item.district || "অজানা",
    division: item.division,
    upazila: item.upazila,
    thana: item.thana,
    village: item.village,
    crime_category: item.crime_category,
    accused_party: item.accused_party,
    tags: Array.isArray(item.tags) ? item.tags : [],
    date:
      formatDate(item.incident_date) !== "—"
        ? formatDate(item.incident_date)
        : "সম্প্রতি",
    dur: formatDuration(item.duration_seconds, "—"),
    status: normalizeStatus(item.legal_status),
    views: view_count ? formatCount(view_count) : "0",
    view_count,
    like_count: item.like_count ?? 0,
    dislike_count: 0,
    comment_count: item.comment_count ?? 0,
    share_count: 0,
    trend: Boolean(item.is_viral) || view_count >= 10_000,
    summary: "এই কেসের বিস্তারিত বিবরণ খুলুন।",
    timeline: [
      { s: "রিপোর্ট হয়েছে", d: formatDate(item.incident_date), done: true },
      { s: "তদন্ত চলছে", d: "—", done: false },
      { s: "অভিযোগপত্র", d: "—", done: false },
      { s: "রায়", d: "—", done: false },
    ],
    sources: [{ t: "যাচাইকৃত সূত্র", p: "Nojor" }],
    media_provider: item.media_provider,
    media_embed_id: item.media_embed_id,
    media_url: item.media_url,
    thumbnail_url: item.thumbnail_url,
    author: item.author || null,
    case_id: item.case_id || "",
    case_number: item.case_number || "",
  };
}

function detailToArchive(d: CaseDetail): ArchiveCase {
  const history = d.status_history ?? [];
  const timeline =
    history.length > 0
      ? history.map((h) => ({
          s: h.to,
          d: formatDate(h.at.slice(0, 10)),
          done: true,
        }))
      : [
          {
            s: "রিপোর্ট হয়েছে",
            d: formatDate(d.incident_date),
            done: true,
          },
        ];
  const view_count = d.view_count ?? 0;
  const first = d.media?.[0];

  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    district: d.district || "—",
    division: d.division,
    upazila: d.upazila,
    thana: d.thana,
    village: d.village,
    crime_category: d.crime_category,
    accused_party: d.accused_party,
    tags: Array.isArray(d.tags) ? d.tags : [],
    date:
      formatDate(d.incident_date) !== "—"
        ? formatDate(d.incident_date)
        : "সম্প্রতি",
    dur: formatDuration(
      d.duration_seconds ?? first?.duration_seconds,
      "—",
    ),
    status: normalizeStatus(d.legal_status),
    views: view_count ? formatCount(view_count) : "0",
    view_count,
    like_count: d.like_count ?? 0,
    dislike_count: d.dislike_count ?? 0,
    comment_count: d.comment_count ?? 0,
    share_count: d.share_count ?? 0,
    trend: Boolean(d.is_viral) || view_count >= 10_000,
    official: history.some((h) => h.source),
    summary: d.summary,
    timeline,
    sources:
      d.sources?.map((s) => ({ t: s.title, p: s.publisher, url: s.url })) ??
      [],
    media_provider: first?.provider,
    media_embed_id: first?.embed_id,
    media_url: first?.original_url,
    thumbnail_url: first?.thumbnail_url,
    case_number: d.case_number || "",
    has_verdict: Boolean(d.has_verdict),
    verdict_summary: d.verdict_summary,
    verdict_date: d.verdict_date,
    incident_date: d.incident_date,
    location_text: d.location_text,
    verdict_agree: d.verdict_agree ?? 0,
    verdict_disagree: d.verdict_disagree ?? 0,
    verdict_neutral: d.verdict_neutral ?? 0,
    author: d.author || null,
    case_id: d.case_id || "",
  };
}

export async function fetchCases(params?: {
  district?: string;
  division?: string;
  status?: string;
  category?: string;
  upazila?: string;
  thana?: string;
  q?: string;
  date_from?: string;
  date_to?: string;
  /** Nojor Nest rank (default) | new | viral */
  sort?: "rank" | "new" | "viral";
  /** Soft boost for home জেলা without hiding others */
  prefer_district?: string;
  page?: number;
}): Promise<ArchiveCase[]> {
  const q = new URLSearchParams();
  if (params?.district) q.set("district", params.district);
  if (params?.division) q.set("division", params.division);
  if (params?.status) q.set("status", params.status);
  if (params?.category) q.set("category", params.category);
  if (params?.upazila) q.set("upazila", params.upazila);
  if (params?.thana) q.set("thana", params.thana);
  if (params?.q) q.set("q", params.q);
  if (params?.date_from) q.set("date_from", params.date_from);
  if (params?.date_to) q.set("date_to", params.date_to);
  q.set("sort", params?.sort || "rank");
  if (params?.prefer_district) q.set("prefer_district", params.prefer_district);
  if (params?.page) q.set("page", String(params.page));
  const res = await fetch(`${API}/api/cases/?${q}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error("api");
  const data = (await res.json()) as CaseListItem[];
  if (!Array.isArray(data)) return [];
  return data.map(listToArchive);
}

export async function fetchCase(slug: string): Promise<ArchiveCase | null> {
  try {
    const res = await fetch(`${API}/api/cases/${slug}/`, {
      next: { revalidate: 15 },
    });
    if (res.ok) {
      const data = (await res.json()) as CaseDetail;
      return detailToArchive(data);
    }
  } catch {
    /* empty */
  }
  return null;
}

export async function submitCase(body: {
  title: string;
  source_url: string;
  description?: string;
  location_text?: string;
  division?: string;
  district?: string;
  upazila?: string;
  thana?: string;
  village?: string;
  crime_category?: string;
  accused_party?: string;
  tags?: string[] | string;
}) {
  const thikana =
    body.location_text?.trim() ||
    [body.village, body.thana, body.upazila, body.district, body.division]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(", ");

  // cPanel Passenger: Bolt /api/submit নেই — Django /public/submit/ ব্যবহার
  const res = await fetch(`${API}/public/submit/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: body.title,
      url: body.source_url,
      thikana: thikana || body.district || "বাংলাদেশ",
      category: body.crime_category || "other",
      summary: body.description || "",
      division: body.division || "",
      district: body.district || "",
      upazila: body.upazila || "",
      thana: body.thana || "",
      village: body.village || "",
      accused_party: body.accused_party || "",
      tags: body.tags || "",
      visibility: "published",
    }),
  });
  if (!res.ok) {
    try {
      return await res.json();
    } catch {
      return { ok: false, error: `সাবমিট ব্যর্থ (${res.status})` };
    }
  }
  return res.json();
}

export async function submitTip(body: {
  case_id: string;
  tip_type?: string;
  body: string;
  source_url?: string;
}) {
  const res = await fetch(`${API}/api/tip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function redeemOfficial(code: string): Promise<{
  ok?: boolean;
  district?: string;
  token?: string;
  error?: string;
  message?: string;
}> {
  const res = await fetch(`${API}/api/official/redeem/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function updateCaseLegalStatus(
  slug: string,
  token: string,
  body: {
    status: string;
    note?: string;
    verdict_summary?: string;
    source_url?: string;
  },
): Promise<{
  ok?: boolean;
  legal_status?: string;
  label?: string;
  verdict_summary?: string;
  error?: string;
  message?: string;
}> {
  const res = await fetch(`${API}/api/cases/${encodeURIComponent(slug)}/status/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
