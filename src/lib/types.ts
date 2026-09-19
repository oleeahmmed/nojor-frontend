export type LegalStatusKey =
  | "reported"
  | "under_investigation"
  | "charged"
  | "trial_ongoing"
  | "convicted"
  | "acquitted"
  | "dismissed"
  | "no_action";

export type CaseListItem = {
  id: string;
  slug: string;
  title: string;
  legal_status: string;
  district: string;
  incident_date: string | null;
  division?: string;
  upazila?: string;
  thana?: string;
  village?: string;
  crime_category?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  is_viral?: boolean;
  media_provider?: string;
  media_embed_id?: string;
  media_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number | null;
};

export type CaseDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  legal_status: string;
  case_number: string;
  district: string;
  incident_date: string | null;
  division?: string;
  upazila?: string;
  thana?: string;
  village?: string;
  location_text?: string;
  crime_category?: string;
  media: {
    provider: string;
    embed_id: string;
    original_status: string;
    original_url?: string;
    thumbnail_url?: string;
  }[];
  sources: { title: string; url: string; publisher: string }[];
  status_history: {
    from: string;
    to: string;
    at: string;
    source: string;
  }[];
  view_count?: number;
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
  share_count?: number;
  is_viral?: boolean;
  has_verdict?: boolean;
  verdict_summary?: string;
  verdict_date?: string | null;
  verdict_agree?: number;
  verdict_disagree?: number;
  verdict_neutral?: number;
};

/** UI-enriched case used across pages (API + local demos). */
export type ArchiveCase = {
  id: string;
  slug: string;
  title: string;
  district: string;
  division?: string;
  upazila?: string;
  thana?: string;
  village?: string;
  crime_category?: string;
  date: string;
  dur: string;
  status: LegalStatusKey;
  views: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  share_count: number;
  trend?: boolean;
  official?: boolean;
  summary: string;
  timeline: { s: string; d: string; done: boolean }[];
  sources: { t: string; p: string; url?: string }[];
  media_provider?: string;
  media_embed_id?: string;
  media_url?: string;
  thumbnail_url?: string;
  case_number?: string;
  has_verdict?: boolean;
  verdict_summary?: string;
  verdict_date?: string | null;
  verdict_agree?: number;
  verdict_disagree?: number;
  verdict_neutral?: number;
};
