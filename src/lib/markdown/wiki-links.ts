import { slugify } from "@/lib/utils/slug";

const wikiLinkPattern = /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g;

export type WikiLink = {
  label: string;
  slug: string;
  alias?: string;
};

export function extractWikiLinks(markdown: string): WikiLink[] {
  const links = new Map<string, WikiLink>();

  for (const match of markdown.matchAll(wikiLinkPattern)) {
    const rawLabel = match[1]?.trim();
    if (!rawLabel) continue;
    const alias = match[2]?.trim();
    const slug = slugify(rawLabel);
    links.set(slug, { label: rawLabel, slug, alias });
  }

  return [...links.values()];
}

export function replaceWikiLinks(markdown: string) {
  return markdown.replace(wikiLinkPattern, (_, label: string, alias?: string) => {
    const slug = slugify(label);
    return `[${alias?.trim() || label.trim()}](/kb/${slug})`;
  });
}
