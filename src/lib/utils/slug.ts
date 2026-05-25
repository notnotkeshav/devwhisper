import GithubSlugger from "github-slugger";

const slugger = new GithubSlugger();

export function slugify(input: string) {
  slugger.reset();
  return slugger.slug(input.trim().toLowerCase());
}
