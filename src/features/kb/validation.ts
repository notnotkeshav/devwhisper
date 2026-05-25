import { z } from "zod";

export const noteFormSchema = z.object({
  title: z.string().min(1).max(180),
  slug: z.string().max(220).optional(),
  markdown: z.string().max(250_000),
  shortSummary: z.string().max(800).optional(),
  mediumSummary: z.string().max(4_000).optional(),
  deepSummary: z.string().max(20_000).optional(),
  status: z.enum(["seed", "growing", "evergreen", "archived"]).default("seed")
});

export type NoteFormInput = z.infer<typeof noteFormSchema>;
