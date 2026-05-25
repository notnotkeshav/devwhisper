import { PageHeader } from "@/components/page/page-header";
import { requireUser } from "@/lib/auth/session";
import { BlogForm } from "@/features/blogs/blog-form";

export default async function NewBlogPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="New blog"
        description="Write a durable learning output from a stabilized concept."
      />
      <BlogForm />
    </>
  );
}
