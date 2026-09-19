import type { LegalStatusKey } from "./types";

export const STATUS_META: Record<
  LegalStatusKey,
  { label: string; tone: string; soft: string }
> = {
  reported: { label: "রিপোর্ট", tone: "#7A5900", soft: "#FFF3CD" },
  no_action: { label: "বিচার হয়নি", tone: "#7A5900", soft: "#FFF3CD" },
  under_investigation: { label: "তদন্ত", tone: "#C92A2A", soft: "#FFE3E3" },
  charged: { label: "অভিযোগপত্র", tone: "#1862C6", soft: "#E7F3FF" },
  trial_ongoing: { label: "বিচারাধীন", tone: "#1862C6", soft: "#E7F3FF" },
  convicted: { label: "দণ্ডিত", tone: "#1B7A36", soft: "#E2F6E9" },
  acquitted: { label: "খালাস", tone: "#4B4F56", soft: "#E4E6EB" },
  dismissed: { label: "খারিজ", tone: "#4B4F56", soft: "#E4E6EB" },
};

const ALIASES: Record<string, LegalStatusKey> = {
  reported: "reported",
  no_action: "no_action",
  under_investigation: "under_investigation",
  investigation: "under_investigation",
  charged: "charged",
  trial_ongoing: "trial_ongoing",
  trial: "trial_ongoing",
  convicted: "convicted",
  acquitted: "acquitted",
  dismissed: "dismissed",
};

export function normalizeStatus(raw: string): LegalStatusKey {
  return ALIASES[raw] ?? "reported";
}

export const VERDICT_KEYS: LegalStatusKey[] = [
  "convicted",
  "acquitted",
  "dismissed",
];

export function hasVerdict(status: string): boolean {
  return VERDICT_KEYS.includes(normalizeStatus(status));
}

export const VERDICT_FALLBACK: Record<string, string> = {
  convicted: "আদালত আসামিকে দোষী সাব্যস্ত করে দণ্ড দিয়েছে।",
  acquitted: "আদালত আসামিকে খালাস দিয়েছে।",
  dismissed: "আদালত মামলা খারিজ করেছে।",
};

export const FILTERS = [
  { key: "all", label: "সব স্ট্যাটাস" },
  { key: "under_investigation", label: "তদন্ত চলছে" },
  { key: "trial_ongoing", label: "বিচারাধীন" },
  { key: "convicted", label: "দণ্ডিত" },
  { key: "no_action", label: "বিচার হয়নি" },
] as const;
