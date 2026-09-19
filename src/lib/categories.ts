export type CrimeCategoryKey =
  | "snatching"
  | "theft"
  | "robbery"
  | "murder"
  | "assault"
  | "harassment"
  | "sexual_violence"
  | "kidnapping"
  | "fraud"
  | "drugs"
  | "corruption"
  | "cyber"
  | "accident"
  | "political"
  | "other";

export const CRIME_CATEGORIES: {
  key: CrimeCategoryKey | "all";
  label: string;
}[] = [
  { key: "all", label: "সব অপরাধ" },
  { key: "snatching", label: "ছিনতাই" },
  { key: "theft", label: "চুরি" },
  { key: "robbery", label: "ডাকাতি" },
  { key: "murder", label: "হত্যা" },
  { key: "assault", label: "হামলা / মারামারি" },
  { key: "harassment", label: "হয়রানি" },
  { key: "sexual_violence", label: "যৌন সহিংসতা" },
  { key: "kidnapping", label: "অপহরণ" },
  { key: "fraud", label: "প্রতারণা" },
  { key: "drugs", label: "মাদক" },
  { key: "corruption", label: "দুর্নীতি" },
  { key: "cyber", label: "সাইবার অপরাধ" },
  { key: "accident", label: "সড়ক দুর্ঘটনা" },
  { key: "political", label: "রাজনৈতিক সহিংসতা" },
  { key: "other", label: "অন্যান্য" },
];

export function categoryLabel(key?: string) {
  if (!key) return "";
  return CRIME_CATEGORIES.find((c) => c.key === key)?.label || key;
}
