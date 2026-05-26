"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { z } from "zod";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  mdx: z.string().default(""),
  excerpt: z.string().default(""),
  series: z.string().optional()
});

export async function saveBlogAction(formData: FormData) {
  const user = await requireUser();
  const parsed = blogFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    mdx: formData.get("mdx") || "",
    excerpt: formData.get("excerpt") || "",
    series: formData.get("series") || undefined
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog.");
  }

  const db = getDb();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const existing = await db.query.blogs.findFirst({ where: eq(blogs.slug, slug) });

  const wordCount = parsed.data.mdx.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const values = {
    userId: user.id,
    title: parsed.data.title,
    slug,
    mdx: parsed.data.mdx,
    excerpt: parsed.data.excerpt,
    series: parsed.data.series ?? null,
    readingTimeMinutes,
    updatedAt: new Date()
  };

  if (existing) {
    await db.update(blogs).set(values).where(eq(blogs.id, existing.id));
  } else {
    await db.insert(blogs).values(values);
  }

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  redirect(`/blogs/${slug}`);
}

export async function togglePublishAction(blogId: string) {
  await requireUser();
  const db = getDb();
  const blog = await db.query.blogs.findFirst({ where: eq(blogs.id, blogId) });
  if (!blog) throw new Error("Blog not found.");

  const nowPublic = !blog.isPublic;
  await db
    .update(blogs)
    .set({ isPublic: nowPublic, publishedAt: nowPublic ? new Date() : null, updatedAt: new Date() })
    .where(eq(blogs.id, blogId));

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function archiveBlogAction(blogId: string) {
  await requireUser();
  const db = getDb();
  const blog = await db.query.blogs.findFirst({ where: eq(blogs.id, blogId) });
  if (!blog) throw new Error("Blog not found.");
  await db
    .update(blogs)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(blogs.id, blogId));
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function unarchiveBlogAction(blogId: string) {
  await requireUser();
  const db = getDb();
  const blog = await db.query.blogs.findFirst({ where: eq(blogs.id, blogId) });
  if (!blog) throw new Error("Blog not found.");
  await db
    .update(blogs)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(blogs.id, blogId));
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function trashBlogAction(blogId: string) {
  await requireUser();
  const db = getDb();
  const blog = await db.query.blogs.findFirst({ where: eq(blogs.id, blogId) });
  if (!blog) throw new Error("Blog not found.");
  await db
    .update(blogs)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(blogs.id, blogId));
  revalidatePath("/blogs");
  redirect("/blogs");
}

export async function restoreBlogAction(blogId: string) {
  await requireUser();
  const db = getDb();
  await db
    .update(blogs)
    .set({ deletedAt: null, archivedAt: null, updatedAt: new Date() })
    .where(eq(blogs.id, blogId));
  revalidatePath("/blogs");
}

export async function permanentDeleteBlogAction(blogId: string) {
  await requireUser();
  const db = getDb();
  await db.delete(blogs).where(eq(blogs.id, blogId));
  revalidatePath("/blogs");
}
