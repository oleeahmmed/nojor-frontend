import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://nojor.bd";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/verification`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/submit`, changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const res = await fetch(`${API}/api/sitemap/cases`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return staticRoutes;
    const rows = (await res.json()) as { slug: string; updated_at: string }[];
    return [
      ...staticRoutes,
      ...rows.map((r) => ({
        url: `${SITE}/cases/${r.slug}`,
        lastModified: r.updated_at,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
