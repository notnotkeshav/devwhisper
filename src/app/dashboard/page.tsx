import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listNotes, listPinnedNotes } from "@/features/kb/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [recent, pinned] = await Promise.all([listNotes(8), listPinnedNotes()]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        eyebrow="Memory OS"
        description="A compressed view of what you are learning, what is decaying, and what needs reconstruction."
        actions={
          <Button asChild>
            <Link href="/kb/new">
              <Plus className="size-4" aria-hidden />
              New note
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recall load</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{recent.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pinned concepts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pinned.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next revision</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Queue uses forgetting score + review age.
          </CardContent>
        </Card>
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Recent notes</h2>
        {recent.length ? (
          <div className="grid gap-2">
            {recent.map((note) => (
              <Link
                key={note.id}
                href={`/kb/${note.slug}`}
                className="rounded-lg border p-3 hover:bg-muted"
              >
                <div className="text-sm font-medium">{note.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {note.shortSummary}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notes yet"
            body="Attach Neon and capture the first concept to start building recall structure."
          />
        )}
      </section>
    </>
  );
}
