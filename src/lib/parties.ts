export type AccusedPartyKey =
  | ""
  | "unknown"
  | "awami_league"
  | "bnp"
  | "jamaat"
  | "jatiya"
  | "other_party";

export const ACCUSED_PARTIES: { key: AccusedPartyKey; label: string }[] = [
  { key: "", label: "প্রযোজ্য নয়" },
  { key: "unknown", label: "অজানা / উল্লেখ নেই" },
  { key: "awami_league", label: "আওয়ামী লীগ" },
  { key: "bnp", label: "বিএনপি" },
  { key: "jamaat", label: "জামায়াতে ইসলামী" },
  { key: "jatiya", label: "জাতীয় পার্টি" },
  { key: "other_party", label: "অন্য দল / জোট" },
];

export function partyLabel(key?: string | null) {
  if (!key) return "";
  return ACCUSED_PARTIES.find((p) => p.key === key)?.label || key;
}
