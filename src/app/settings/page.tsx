import { PageHeader } from "@/components/page/page-header";
import { getSession } from "@/lib/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

export default async function SettingsPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <>
      <PageHeader title="Settings" description="Account, environment, and app configuration." />
      <div className="grid max-w-2xl gap-6">
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

        {/* Stack */}
        <section className="rounded-lg border p-5">
          <h2 className="mb-4 text-sm font-semibold">Stack</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            {[
              ["Database", "Neon PostgreSQL via Drizzle ORM"],
              ["Auth", "Better Auth — email/password + GitHub OAuth"],
              ["Editor", "TipTap (markdown + wiki-links)"],
              ["Board", "Excalidraw (scene JSON stored in DB)"],
              ["Graph", "React Flow (nodes built from notes/blogs/topics)"],
              ["Search", "PostgreSQL full-text (GIN index on markdown)"],
              ["Deploy", "Vercel Hobby + Neon Serverless"]
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <span className="w-20 shrink-0 font-medium text-foreground">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data portability */}
        <section className="rounded-lg border p-5">
          <h2 className="mb-4 text-sm font-semibold">Portability</h2>
          <p className="text-sm text-muted-foreground">
            Notes export to markdown via <code className="text-xs">/kb/[slug]/export</code>. TipTap
            editor state is optional JSONB — markdown is always the source of truth. Board scenes
            are stored as Excalidraw JSON and can be exported directly from the canvas.
          </p>
        </section>
      </div>
    </>
  );
}
