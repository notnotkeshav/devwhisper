import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const noteStatus = pgEnum("note_status", ["seed", "growing", "evergreen", "archived"]);
export const edgeKind = pgEnum("edge_kind", [
  "reference",
  "backlink",
  "dependency",
  "related",
  "published_from"
]);
export const revisionMode = pgEnum("revision_mode", [
  "quick",
  "deep",
  "interview",
  "architecture",
  "flash"
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").default("").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    slugIdx: uniqueIndex("topics_user_slug_idx").on(table.userId, table.slug)
  })
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    markdown: text("markdown").notNull().default(""),
    editorState: jsonb("editor_state").$type<Record<string, unknown>>(),
    shortSummary: text("short_summary").default("").notNull(),
    mediumSummary: text("medium_summary").default("").notNull(),
    deepSummary: text("deep_summary").default("").notNull(),
    mentalModels: jsonb("mental_models").$type<string[]>().default([]).notNull(),
    analogies: jsonb("analogies").$type<string[]>().default([]).notNull(),
    keyInsights: jsonb("key_insights").$type<string[]>().default([]).notNull(),
    commonFailures: jsonb("common_failures").$type<string[]>().default([]).notNull(),
    debuggingStories: jsonb("debugging_stories").$type<string[]>().default([]).notNull(),
    revisionNotes: text("revision_notes").default("").notNull(),
    linkedConcepts: jsonb("linked_concepts").$type<string[]>().default([]).notNull(),
    relatedProjects: jsonb("related_projects").$type<string[]>().default([]).notNull(),
    diagrams: jsonb("diagrams").$type<string[]>().default([]).notNull(),
    confidenceScore: real("confidence_score").default(0).notNull(),
    masteryScore: real("mastery_score").default(0).notNull(),
    forgettingScore: real("forgetting_score").default(1).notNull(),
    revisionCount: integer("revision_count").default(0).notNull(),
    revisionIntervalDays: integer("revision_interval_days").default(1).notNull(),
    status: noteStatus("status").default("seed").notNull(),
    pinned: boolean("pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    lastReviewed: timestamp("last_reviewed", { withTimezone: true })
  },
  (table) => ({
    slugIdx: uniqueIndex("notes_user_slug_idx").on(table.userId, table.slug),
    titleIdx: index("notes_title_idx").on(table.title),
    searchIdx: index("notes_search_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.markdown})`
    )
  })
);

export const noteLinks = pgTable(
  "note_links",
  {
    sourceNoteId: uuid("source_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    targetSlug: text("target_slug").notNull(),
    targetNoteId: uuid("target_note_id").references(() => notes.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sourceNoteId, table.targetSlug] }),
    targetIdx: index("note_links_target_idx").on(table.targetSlug)
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull()
  },
  (table) => ({
    slugIdx: uniqueIndex("tags_user_slug_idx").on(table.userId, table.slug)
  })
);

export const noteTags = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.noteId, table.tagId] })
  })
);

export const blogs = pgTable(
  "blogs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    sourceNoteId: uuid("source_note_id").references(() => notes.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    mdx: text("mdx").notNull().default(""),
    excerpt: text("excerpt").default("").notNull(),
    series: text("series"),
    isPublic: boolean("is_public").default(false).notNull(),
    seo: jsonb("seo").$type<Record<string, unknown>>().default({}).notNull(),
    readingTimeMinutes: integer("reading_time_minutes").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true })
  },
  (table) => ({
    slugIdx: uniqueIndex("blogs_user_slug_idx").on(table.userId, table.slug)
  })
);

export const boards = pgTable("boards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  scene: jsonb("scene").$type<Record<string, unknown>>().default({}).notNull(),
  linkedNoteIds: jsonb("linked_note_ids").$type<string[]>().default([]).notNull(),
  linkedBlogIds: jsonb("linked_blog_ids").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  url: text("url"),
  kind: text("kind").default("link").notNull(),
  notes: text("notes").default("").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  noteId: uuid("note_id").references(() => notes.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  question: text("question").notNull(),
  hint: text("hint").default("").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation").default("").notNull(),
  confidence: real("confidence").default(0).notNull(),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const dailyNotes = pgTable(
  "daily_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    markdown: text("markdown").notNull().default(""),
    learningLogs: jsonb("learning_logs").$type<string[]>().default([]).notNull(),
    blockers: jsonb("blockers").$type<string[]>().default([]).notNull(),
    ideas: jsonb("ideas").$type<string[]>().default([]).notNull(),
    insights: jsonb("insights").$type<string[]>().default([]).notNull(),
    linkedConcepts: jsonb("linked_concepts").$type<string[]>().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    dayIdx: uniqueIndex("daily_notes_user_day_idx").on(table.userId, table.day)
  })
);

export const revisionLogs = pgTable("revision_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  mode: revisionMode("mode").notNull(),
  confidence: real("confidence").notNull(),
  forgettingScore: real("forgetting_score").notNull(),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  notes: text("notes").default("").notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull()
});

export const graphEdges = pgTable("graph_edges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  kind: edgeKind("kind").notNull(),
  weight: real("weight").default(1).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const notesRelations = relations(notes, ({ many, one }) => ({
  topic: one(topics, { fields: [notes.topicId], references: [topics.id] }),
  outgoingLinks: many(noteLinks, { relationName: "outgoingLinks" }),
  tags: many(noteTags),
  flashcards: many(flashcards)
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  notes: many(notes),
  resources: many(resources),
  flashcards: many(flashcards)
}));

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type Blog = typeof blogs.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
