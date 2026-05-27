import { slugify } from "@/lib/utils/slug";

// Matches [[label]] and also TipTap-escaped \[\[label\]\]
const wikiLinkPattern = /\\?\[\\?\[([^\]\\|]+)(?:\|([^\]\\]+))?\\?\]\\?\]/g;

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

export type MarkdownLink = { label: string; href: string; isExternal: boolean };

// Matches [label](url) for http/https AND relative /path links, but not images (![...])
const markdownLinkPattern = /(?<!!)\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g;

export function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  const seen = new Set<string>();
  const links: MarkdownLink[] = [];
  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const href = match[2]!.trim();
    if (!seen.has(href)) {
      seen.add(href);
      links.push({ label: match[1]!.trim(), href, isExternal: href.startsWith("http") });
    }
  }
  return links;
}

/** @deprecated use extractMarkdownLinks */
export type ExternalLink = { label: string; href: string };
export function extractExternalLinks(markdown: string): ExternalLink[] {
  return extractMarkdownLinks(markdown).filter((l) => l.isExternal);
}

export function replaceWikiLinks(markdown: string, hrefs: Map<string, string> = new Map()) {
  return markdown.replace(wikiLinkPattern, (_, label: string, alias?: string) => {
    const slug = slugify(label.trim());
    const href = hrefs.get(slug) ?? `/kb/${slug}`;
    return `[${alias?.trim() || label.trim()}](${href})`;
  });
}
