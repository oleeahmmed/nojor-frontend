export type ThemeId = "youtube" | "facebook" | "instagram" | "nojor";
export type ColorMode = "light" | "dark";

export const THEMES: {
  id: ThemeId;
  label: string;
  hint: string;
}[] = [
  { id: "youtube", label: "YouTube", hint: "Red accent" },
  { id: "facebook", label: "Facebook", hint: "Blue accent" },
  { id: "instagram", label: "Instagram", hint: "Gradient" },
  { id: "nojor", label: "নজর", hint: "Emerald green" },
];

/** থিম পিকারের সোয়াচ — প্রতিটি থিমের নিজস্ব gradient */
export const THEME_SWATCH: Record<ThemeId, string> = {
  youtube: "linear-gradient(135deg, #ff0000, #ff4e45)",
  facebook: "linear-gradient(135deg, #1877f2, #00c6ff)",
  instagram:
    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
  nojor: "linear-gradient(135deg, #059669, #14b8a6)",
};

export const DEFAULT_THEME: ThemeId = "youtube";
export const DEFAULT_COLOR_MODE: ColorMode = "light";
