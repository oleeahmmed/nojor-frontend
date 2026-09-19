/** Normalize user hashtag input → clean tag list (no #). */
export function normalizeTags(raw: unknown): string[] {
  const parts: string[] = [];
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    for (const item of raw) parts.push(...String(item || "").split(/[,;\n#]+|\s+/));
  } else {
    parts.push(...String(raw).split(/[,;\n#]+|\s+/));
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const t = p.trim().replace(/^#+/, "").trim();
    if (!t || t.length > 40) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 20) break;
  }
  return out;
}

export function tagsToInput(tags?: string[] | null): string {
  return (tags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
}

export function displayTag(tag: string): string {
  const t = tag.replace(/^#+/, "").trim();
  return t ? `#${t}` : "";
}
