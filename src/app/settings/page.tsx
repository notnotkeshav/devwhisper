import Link from "next/link";
import {
  BookOpen,
  FileText,
  Layers,
  Network,
  Repeat2,
  Search,
  LayoutDashboard,
  CalendarDays,
  ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { getSession } from "@/lib/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

const modules = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    href: "/kb",
    color: "text-emerald-400",
    step: "1",
    description:
      "Start here. Create notes in markdown with [[wiki-links]] to connect ideas. Every note tracks your recall scores automatically as you review.",
    actions: [
      "Create your first note at /kb/new",
      "Add [[links]] to related concepts",
      "Watch the graph grow as you link notes"
    ]
  },
  {
    icon: Layers,
    title: "Topics",
    href: "/topics",
    color: "text-purple-400",
    step: "2",
    description:
      "Organise notes into topics. A topic groups related notes, flashcards, and resources into one page — like a subject folder.",
    actions: [
      "Create a topic at /topics/new",
      "Assign notes to topics when creating/editing",
      "Add flashcards for active recall"
    ]
  },
  {
    icon: CalendarDays,
    title: "Daily Notes",
    href: "/daily",
    color: "text-sky-400",
    step: "3",
    description:
      "A daily note is your learning journal. Log what you learned, blockers, ideas, and insights each day. Use [[wiki-links]] to connect daily logs to KB notes.",
    actions: [
      "Open today's note from the sidebar",
      "Write in the editor, hit Save",
      "Switch to Preview to see rendered wiki-links"
    ]
  },
  {
    icon: FileText,
    title: "Blogs",
    href: "/blogs",
    color: "text-blue-400",
    step: "4",
    description:
      "Turn polished notes into public blog posts. Embed boards as images, use [[wiki-links]] in body text, and publish when ready. Published posts are publicly readable.",
    actions: [
      "Create a blog at /blogs/new",
      "Insert boards via the toolbar",
      "Publish with the Publish button on the post page"
    ]
  },
  {
    icon: LayoutDashboard,
    title: "Boards",
    href: "/board",
    color: "text-amber-400",
    step: "5",
    description:
      "Boards are Excalidraw canvases stored in the DB. Sketch diagrams, take a snapshot, and embed the snapshot in a blog post as an image.",
    actions: [
      "Create a board at /board/new",
      "Draw, then use Export → Save snapshot",
      "Embed in a blog via the Insert board button"
    ]
  },
  {
    icon: Repeat2,
    title: "Revise",
    href: "/revise",
    color: "text-rose-400",
    step: "6",
    description:
      "Spaced repetition queue built from your KB notes. Each note has confidence, mastery, and forgetting scores. Review notes that are due and rate your recall.",
    actions: [
      "Open /revise to see the queue",
      "Read the note, then rate your confidence",
      "Scores update and the next review is scheduled"
    ]
  },
  {
    icon: Network,
    title: "Graph",
    href: "/graph",
    color: "text-indigo-400",
    step: "7",
    description:
      "Visual map of your entire knowledge base. Nodes = notes, blogs, boards, topics. Edges = wiki-links and topic assignments. Click any node to navigate. Drag to rearrange.",
    actions: [
      "Open /graph to see all connections",
      "Click a node to navigate to it",
      "Drag nodes to arrange by theme or priority"
    ]
  },
  {
    icon: Search,
    title: "Search",
    href: "/search",
    color: "text-orange-400",
    step: "8",
    description:
      "Full-text search across all notes using PostgreSQL GIN index. Fast, no external service needed. Press ⌘K anywhere to open the command palette.",
    actions: [
      "Press ⌘K / Ctrl+K to search anywhere",
      "Or open /search for a dedicated view",
      "Results rank by text relevance"
    ]
  }
];

export default async function SettingsPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <>
      <PageHeader
        title="Getting Started"
        description="A guided tour of every module — follow the steps to build your connected knowledge OS."
      />
      <div className="grid gap-8">
        {/* Workflow overview */}
        <section className="rounded-lg border p-5">
          <h2 className="mb-3 text-sm font-semibold">The recommended flow</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            DevWhisper is a personal knowledge OS. Everything is connected: notes link to topics,
            blogs embed boards, daily logs reference KB notes, and the graph shows it all. Start
            small — one note, one topic — and let the graph grow.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {["KB Note", "Topic", "Daily Log", "Blog", "Board", "Revise", "Graph"].map(
              (s, i, arr) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                    {s}
                  </span>
                  {i < arr.length - 1 && <ArrowRight className="size-3 shrink-0" />}
                </span>
              )
            )}
          </div>
        </section>

        {/* Module guide */}
        <section>
          <h2 className="mb-4 text-sm font-semibold">Modules</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.href} className="rounded-lg border p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {mod.step}
                    </span>
                    <Icon className={`size-4 ${mod.color}`} aria-hidden />
                    <Link
                      href={mod.href as never}
                      className="text-sm font-semibold hover:underline"
                    >
                      {mod.title}
                    </Link>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{mod.description}</p>
                  <ul className="grid gap-1">
                    {mod.actions.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Explainers side-by-side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Wiki-links explainer */}
          <section className="rounded-lg border p-5">
            <h2 className="mb-3 text-sm font-semibold">How wiki-links work</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Type <code className="rounded bg-muted px-1 text-xs">[[Note Title]]</code> anywhere in
              a note, blog, or daily entry. On save, DevWhisper looks up the slug across notes,
              blogs, and topics — in that priority order — and turns the link into a real hyperlink.
              Graph edges are created automatically.
            </p>
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex gap-3">
                <code className="shrink-0 rounded bg-muted px-1">[[TypeScript]]</code>
                <span>→ links to /kb/typescript if a note exists</span>
              </div>
              <div className="flex gap-3">
                <code className="shrink-0 rounded bg-muted px-1">[[My Blog|blog post]]</code>
                <span>→ renders as &quot;blog post&quot;, links to the blog if slug matches</span>
              </div>
            </div>
          </section>

          {/* Recall scores explainer */}
          <section className="rounded-lg border p-5">
            <h2 className="mb-3 text-sm font-semibold">How recall scores work</h2>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="w-24 shrink-0 font-medium text-emerald-400">Confidence</span>
                <span>
                  Self-reported rating after each review (0–5 scale, normalised to 0–1). Reflects
                  how well you felt you knew the material.
                </span>
              </div>
              <div className="flex gap-3">
                <span className="w-24 shrink-0 font-medium text-blue-400">Mastery</span>
                <span>
                  Long-term weighted average of past confidence scores. Decays slowly so consistent
                  review matters more than one good session.
                </span>
              </div>
              <div className="flex gap-3">
                <span className="w-24 shrink-0 font-medium text-amber-400">Forgetting</span>
                <span>
                  Rises over time since last review using an exponential decay model. High
                  forgetting score = overdue for review.
                </span>
              </div>
              <p className="text-xs">
                The revision queue in{" "}
                <Link href="/revise" className="text-primary hover:underline">
                  /revise
                </Link>{" "}
                orders notes by forgetting score — most overdue first. After rating, the next
                interval is scheduled using SM-2.
              </p>
            </div>
          </section>
        </div>

        {/* Account + Portability side-by-side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account */}
          <section className="rounded-lg border p-5">
            <h2 className="mb-4 text-sm font-semibold">Account</h2>
            {user ? (
              <div className="grid gap-3">
                <div className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span>{user.name || "—"}</span>
                </div>
                <div className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="mt-2">
                  <SignOutButton />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not signed in.</p>
            )}
          </section>

          {/* Data portability */}
          <section className="rounded-lg border p-5">
            <h2 className="mb-4 text-sm font-semibold">Data portability</h2>
            <p className="text-sm text-muted-foreground">
              Notes export to markdown via <code className="text-xs">/kb/[slug]/export</code>.
              TipTap editor state is optional JSONB — markdown is always the source of truth. Board
              scenes are Excalidraw JSON and can be exported directly from the canvas.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
