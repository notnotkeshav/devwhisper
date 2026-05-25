import type { Note } from "@/lib/db/schema";

export function noteToPortableMarkdown(note: Note) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(note.title)}`,
    `slug: ${JSON.stringify(note.slug)}`,
    `status: ${note.status}`,
    `confidenceScore: ${note.confidenceScore}`,
    `masteryScore: ${note.masteryScore}`,
    `forgettingScore: ${note.forgettingScore}`,
    `createdAt: ${note.createdAt.toISOString()}`,
    `updatedAt: ${note.updatedAt.toISOString()}`,
    note.lastReviewed ? `lastReviewed: ${note.lastReviewed.toISOString()}` : "lastReviewed: null",
    "---"
  ].join("\n");

  return `${frontmatter}\n\n${note.markdown}`;
}

export function noteToPortableJson(note: Note) {
  return JSON.stringify(note, null, 2);
}
