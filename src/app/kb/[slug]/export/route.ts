import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/features/kb/repository";
import { noteToPortableMarkdown } from "@/lib/markdown/export";
import { requireUser } from "@/lib/auth/session";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const note = await getNoteBySlug(slug, user.id);
  if (!note) notFound();

  return new Response(noteToPortableMarkdown(note), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${note.slug}.md"`
    }
  });
}
