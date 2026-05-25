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
      href: `/board/${board.id}`
    }))
  ];

  return {
    nodes,
    edges: input.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      kind: edge.kind
    }))
  };
}
