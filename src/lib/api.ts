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
    date:
      formatDate(d.incident_date) !== "—"
        ? formatDate(d.incident_date)
        : "সম্প্রতি",
    dur: "—",
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
    case_number: d.case_number,
    has_verdict: Boolean(d.has_verdict),
    verdict_summary: d.verdict_summary,
    verdict_date: d.verdict_date,
    verdict_agree: d.verdict_agree ?? 0,
    verdict_disagree: d.verdict_disagree ?? 0,
    verdict_neutral: d.verdict_neutral ?? 0,
  };
}

export async function fetchCases(params?: {
  district?: string;
  division?: string;
  status?: string;
  category?: string;
  upazila?: string;
}): Promise<ArchiveCase[]> {
  const q = new URLSearchParams();
  if (params?.district) q.set("district", params.district);
  if (params?.division) q.set("division", params.division);
  if (params?.status) q.set("status", params.status);
  if (params?.category) q.set("category", params.category);
  if (params?.upazila) q.set("upazila", params.upazila);
  const res = await fetch(`${API}/api/cases?${q}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error("api");
  const data = (await res.json()) as CaseListItem[];
  if (!Array.isArray(data)) return [];
  return data.map(listToArchive);
}

export async function fetchCase(slug: string): Promise<ArchiveCase | null> {
  try {
    const res = await fetch(`${API}/api/cases/${slug}`, {
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
}) {
  const res = await fetch(`${API}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

export async function redeemOfficial(code: string) {
  const res = await fetch(`${API}/api/official/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json();
}
