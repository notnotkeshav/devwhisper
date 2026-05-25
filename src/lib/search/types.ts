export type SearchResult = {
  id: string;
  type: "note" | "blog" | "topic" | "board";
  title: string;
  slug: string;
  excerpt: string;
  score: number;
};
