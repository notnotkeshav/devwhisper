import { describe, expect, it } from "vitest";
import { noteToPortableMarkdown } from "./export";
import type { Note } from "@/lib/db/schema";

describe("markdown export", () => {
  it("keeps markdown as the portable source of truth", () => {
    const now = new Date("2026-05-25T00:00:00.000Z");
    const note = {
      id: "note-id",
      userId: null,
      parentId: null,
      topicId: null,
      title: "WebSockets",
      slug: "websockets",
      markdown: "# WebSockets\n\n[[tcp]]",
      editorState: null,
      shortSummary: "",
      mediumSummary: "",
      deepSummary: "",
      mentalModels: [],
      analogies: [],
      keyInsights: [],
      commonFailures: [],
      debuggingStories: [],
      revisionNotes: "",
      linkedConcepts: [],
      relatedProjects: [],
      diagrams: [],
      confidenceScore: 0,
      masteryScore: 0,
      forgettingScore: 1,
      revisionCount: 0,
      revisionIntervalDays: 1,
      status: "seed",
      pinned: false,
      createdAt: now,
      updatedAt: now,
      lastReviewed: null,
      archivedAt: null,
      deletedAt: null
    } satisfies Note;

    expect(noteToPortableMarkdown(note)).toContain('---\ntitle: "WebSockets"');
    expect(noteToPortableMarkdown(note)).toContain("# WebSockets\n\n[[tcp]]");
  });
});
