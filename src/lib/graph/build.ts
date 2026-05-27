import type { Board, Blog, Note, Topic } from "@/lib/db/schema";

export type KnowledgeGraphNode = {
  id: string;
  type: "note" | "blog" | "topic" | "board";
  label: string;
  href: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: string;
};

const BOARD_EMBED_RE = /\/api\/boards\/([a-f0-9-]{36})\/preview/g;

export function buildGraph(input: {
  notes: Note[];
  blogs: Blog[];
  topics: Topic[];
  boards: Board[];
  edges: Array<{ id: string; sourceId: string; targetId: string; kind: string }>;
}) {
  const nodes: KnowledgeGraphNode[] = [
    ...input.notes.map((note) => ({
      id: note.id,
      type: "note" as const,
      label: note.title,
      href: `/kb/${note.slug}`
    })),
    ...input.blogs.map((blog) => ({
      id: blog.id,
      type: "blog" as const,
      label: blog.title,
      href: `/blogs/${blog.slug}`
    })),
    ...input.topics.map((topic) => ({
      id: topic.id,
      type: "topic" as const,
      label: topic.title,
      href: `/topics/${topic.slug}`
    })),
    ...input.boards.map((board) => ({
      id: board.id,
      type: "board" as const,
      label: board.title,
      href: `/boards/${board.id}`
    }))
  ];

  const boardIds = new Set(input.boards.map((b) => b.id));

  const edges: KnowledgeGraphEdge[] = input.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    kind: edge.kind
  }));

  // Auto-detect board embeds inside blog markdown and create edges
  for (const blog of input.blogs) {
    BOARD_EMBED_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BOARD_EMBED_RE.exec(blog.mdx)) !== null) {
      const boardId = match[1];
      if (boardIds.has(boardId)) {
        const edgeId = `auto-blog-board-${blog.id}-${boardId}`;
        if (!edges.some((e) => e.id === edgeId)) {
          edges.push({ id: edgeId, source: blog.id, target: boardId, kind: "reference" });
        }
      }
    }
  }

  // note → topic edges
  for (const note of input.notes) {
    if (note.topicId) {
      const edgeId = `auto-note-topic-${note.id}-${note.topicId}`;
      if (!edges.some((e) => e.id === edgeId)) {
        edges.push({ id: edgeId, source: note.id, target: note.topicId, kind: "related" });
      }
    }
  }

  return { nodes, edges };
}
