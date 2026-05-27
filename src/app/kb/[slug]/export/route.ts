import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/features/kb/repository";
import { noteToPortableMarkdown } from "@/lib/markdown/export";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { requireUser } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const note = await getNoteBySlug(slug, user.id);
  if (!note) notFound();

  const base = env.NEXT_PUBLIC_APP_URL ?? "https://devwhisper.vercel.app";
  const relativeHrefs = await resolveWikiLinks(note.markdown);
  const hrefs = new Map([...relativeHrefs].map(([k, v]) => [k, `${base}${v}`]));

  return new Response(noteToPortableMarkdown(note, hrefs), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${note.slug}.md"`
    }
  });
}
