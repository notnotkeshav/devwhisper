export type RevisionMode = "quick" | "deep" | "interview" | "architecture" | "flash";

export type EditorSavePayload = {
  title: string;
  slug?: string;
  markdown: string;
  shortSummary?: string;
  mediumSummary?: string;
  deepSummary?: string;
};
