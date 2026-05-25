import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/features/kb/repository";
import { noteToPortableMarkdown } from "@/lib/markdown/export";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return new Response(noteToPortableMarkdown(note), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${note.slug}.md"`
    }
  });
}
