import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/components/page/page-header";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { globalSearch } from "@/lib/search/repository";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await globalSearch(q);
  const hrefFor = (result: (typeof results)[number]): Route => {
    if (result.type === "note") return `/kb/${result.slug}` as Route;
    if (result.type === "board") return `/board/${result.id}` as Route;
    return `/${result.type}s/${result.slug}` as Route;
  };
  return (
    <>
      <PageHeader
        title="Search"
        description="PostgreSQL full-text search with a future semantic-search boundary."
      />
      <form className="mb-4">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by title, tag, concept, or content..."
        />
      </form>
      {results.length ? (
        <div className="grid gap-2">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={hrefFor(result)}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <div className="text-sm font-semibold">{result.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.excerpt}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No results"
          body="Search titles, markdown content, related concepts, tags, and topics."
        />
      )}
    </>
  );
}
