# Contributing to DevWhisper

Thank you for taking the time to contribute. This document describes the standards and workflow expected for all contributions.

---

## Table of Contents

1. [Branch Strategy](#branch-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Development Workflow](#development-workflow)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Code Standards](#code-standards)
6. [Rollback & Recovery](#rollback--recovery)
7. [Release & Versioning](#release--versioning)
8. [Git Command Reference](#git-command-reference)

---

## Branch Strategy

Two permanent branches exist:

| Branch    | Purpose                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `main`    | Always deployable. Only receives merges from `develop` or hotfix branches. |
| `develop` | Integration branch. All feature branches merge here first.                 |

### Short-lived branch naming

```
feature/<feature-name>     # new functionality
fix/<bug-name>             # bug fix
refactor/<scope>           # code restructuring without behaviour change
docs/<scope>               # documentation only
chore/<scope>              # tooling, deps, CI
hotfix/<issue>             # urgent fix applied directly from main
```

**Examples**

```
feature/kb-editor
feature/revision-engine
fix/wiki-link-parser
refactor/db-schema
docs/git-workflow
hotfix/session-expiry
```

**Rules**

- Never commit directly to `main` or `develop`.
- Feature branches must be short-lived (days, not weeks).
- Rebase onto `develop` before opening a PR.
- Delete branches after merging.

---

## Commit Conventions

All commits follow [Conventional Commits](https://www.conventionalcommits.org/).

```
type(scope): short imperative description

Optional longer body explaining the WHY.

Optional footer: Closes #123
```

### Allowed types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New user-facing feature                                 |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs`     | Documentation only                                      |
| `chore`    | Build tooling, dependency updates, CI                   |
| `test`     | Adding or correcting tests                              |
| `perf`     | Performance improvement                                 |
| `style`    | Formatting, whitespace (no logic change)                |
| `build`    | Changes to build system or external dependencies        |
| `ci`       | CI/CD pipeline changes                                  |

### Scope examples (match the `src/features/` or `src/lib/` directory)

```
kb, revise, board, graph, daily, topics, blogs, auth, db, editor, search
```

### Good commit messages

```
feat(kb): add wiki-link parser for [[slug]] syntax
fix(auth): redirect to sign-in when session is missing
refactor(editor): extract markdown serialisation into lib/markdown
docs(setup): add Neon connection string instructions
chore(deps): upgrade drizzle-orm to 0.45
test(markdown): add export round-trip tests
```

### Atomic commits

Each commit should represent exactly one logical change. Avoid:

- Mixing a bug fix with an unrelated refactor.
- Committing half-finished work to shared branches.
- Using `git add .` without reviewing what is staged.

---

## Development Workflow

### 1. Start from a clean state

```bash
git switch develop
git pull --rebase origin develop
```

### 2. Create your branch

```bash
git switch -c feature/my-feature
```

### 3. Develop with small commits

```bash
git add src/features/kb/actions.ts
git commit -m "feat(kb): validate slug uniqueness before insert"
```

### 4. Keep your branch current

```bash
git fetch origin
git rebase origin/develop
```

Resolve any conflicts, then:

```bash
git add <resolved-file>
git rebase --continue
```

### 5. Clean up history before PR (optional squash)

If you have many small WIP commits, squash them into logical units:

```bash
git rebase -i origin/develop
```

Change `pick` to `squash` (or `s`) for commits you want to fold into the previous one. Rewrite the combined message.

### 6. Push and open a PR

```bash
git push -u origin feature/my-feature
```

Open a PR targeting `develop`. Fill in the PR template.

### 7. After merge

```bash
git switch develop
git pull --rebase origin develop
git branch -d feature/my-feature
```

---

## Pull Request Guidelines

### PR title

Follow the same Conventional Commits format:

```
feat(kb): add wiki-link parser
```

### PR description template

```markdown
## What

Brief description of the change and its purpose.

## Why

The motivation — what problem does this solve?

## How

Key implementation decisions, especially non-obvious ones.

## Testing

How the change was tested (unit tests, manual steps).

## Related

Closes #<issue-number> (if applicable)
```

### Review rules

- At least one approval required before merging to `develop`.
- All CI checks (lint, typecheck, tests) must pass.
- Address all review comments before marking resolved.
- Use draft PRs for work-in-progress to signal it is not ready for review.
- Squash-merge or rebase-merge into `develop`; no merge commits.

### Hotfix workflow

When a critical bug is found in production:

```bash
git switch main
git pull --rebase origin main
git switch -c hotfix/critical-auth-bug

# make the fix, commit it
git commit -m "fix(auth): prevent session token from being null on redirect"

# merge into main
git switch main
git merge --no-ff hotfix/critical-auth-bug
git tag v1.0.1

# back-merge into develop
git switch develop
git merge --no-ff hotfix/critical-auth-bug
git push origin main develop --tags

git branch -d hotfix/critical-auth-bug
```

---

## Code Standards

### General

- TypeScript strict mode is on — no `any` unless justified with a comment.
- All environment variables must go through `src/lib/env.ts` (Zod-validated).
- Server-only modules (`db`, `session`) must never be imported in client components.
- Zod validation happens in Server Actions before any DB write.
- Markdown rendering must pass through `rehype-sanitize`.

### File conventions

- Repository files (`repository.ts`) contain only DB query functions — no business logic.
- Server Actions (`actions.ts`) parse input, call the repository, then `revalidatePath` + `redirect`.
- Heavy client dependencies (TipTap, Excalidraw, React Flow) stay in their feature boundary.

### Never commit

- `.env` files or any file containing real secrets.
- Generated Drizzle migration metadata (`drizzle/meta/`).
- Build artifacts (`.next/`, `dist/`, `out/`).
- `node_modules/`.

---

## Rollback & Recovery

### Revert a merged commit (safe, adds a new commit)

```bash
git revert <commit-hash>
git push origin develop
```

Use `git revert` on shared branches — it is non-destructive.

### Undo the last local commit (not yet pushed)

```bash
git reset --soft HEAD~1   # keep changes staged
git reset --mixed HEAD~1  # keep changes unstaged (default)
git reset --hard HEAD~1   # discard changes entirely (destructive)
```

Never use `--hard` on commits that have already been pushed to a shared branch.

### Recover a deleted branch

```bash
git reflog                          # find the commit hash
git switch -c recovered-branch <hash>
```

### Recover a lost stash

```bash
git fsck --unreachable | grep commit
git stash apply <hash>
```

### Cherry-pick a specific commit from another branch

```bash
git cherry-pick <commit-hash>
```

### Safe force push (only on your own feature branch, never on main/develop)

```bash
git push --force-with-lease origin feature/my-feature
```

`--force-with-lease` refuses to overwrite if someone else has pushed to the branch since your last fetch.

---

## Release & Versioning

DevWhisper uses [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Part    | Increment when                              |
| ------- | ------------------------------------------- |
| `MAJOR` | Backwards-incompatible schema or API change |
| `MINOR` | New feature, backwards-compatible           |
| `PATCH` | Bug fix, backwards-compatible               |

### Creating a release

```bash
git switch main
git pull --rebase origin main

# tag the release
git tag -a v1.2.0 -m "release: v1.2.0 — spaced repetition scheduler"

git push origin main --tags
```

### Changelog strategy

Use `git log` with Conventional Commits to generate a changelog:

```bash
# commits since last tag, formatted for a changelog
git log v1.1.0..HEAD --pretty=format:"- %s (%h)" --no-merges
```

Paste the output into `CHANGELOG.md` under the new version heading. Group by type: `feat`, `fix`, `perf`, then `chore`/`docs`.

### Version lifecycle

```
v0.x.y  — pre-release, API unstable
v1.0.0  — first stable public release
v1.x.y  — stable, additive changes only on main
```

---

## Git Command Reference

### Setup

```bash
git init                                   # initialise a new repo
git clone <url>                            # clone a remote repo
git remote add origin <url>               # add a remote
git remote -v                              # verify remotes
```

### Branching

```bash
git switch -c feature/my-feature          # create and switch (modern)
git checkout -b feature/my-feature        # create and switch (classic)
git branch                                 # list local branches
git branch -d feature/my-feature          # delete merged branch
git branch -D feature/my-feature          # force delete
```

### Committing

```bash
git status                                 # show working tree status
git diff                                   # unstaged changes
git diff --staged                          # staged changes
git add src/features/kb/actions.ts        # stage a specific file
git add -p                                 # stage interactively (hunk by hunk)
git commit -m "feat(kb): add slug validator"
git commit --amend --no-edit              # add staged changes to last commit
git commit --amend -m "new message"       # rewrite last commit message
```

Only amend commits that have NOT been pushed to a shared branch.

### Syncing

```bash
git fetch origin                           # download without merging
git pull --rebase origin develop          # fetch + rebase (preferred over merge)
git push -u origin feature/my-feature    # push and set upstream
git push --force-with-lease               # safe force push (feature branches only)
```

### Stash

```bash
git stash                                  # stash uncommitted work
git stash push -m "WIP: note form"       # stash with a description
git stash list                             # list stashes
git stash pop                              # apply and remove top stash
git stash apply stash@{2}                 # apply specific stash (keep it)
git stash drop stash@{0}                  # remove a stash entry
```

### History inspection

```bash
git log --oneline --graph --all           # visual branch history
git log -p src/lib/db/schema.ts           # history of a specific file
git blame src/features/kb/repository.ts  # who changed each line
git diff main..develop                    # diff between branches
git show <commit-hash>                    # show a specific commit
```

### Cleanup

```bash
git clean -fd                              # remove untracked files/dirs (dry run first with -n)
git clean -nfd                             # dry run — shows what would be removed
git restore src/features/kb/actions.ts   # discard unstaged changes to a file
git restore --staged src/lib/env.ts      # unstage a file
git reset HEAD~1                           # undo last commit, keep changes staged
```

### Advanced

```bash
# Interactive rebase — squash/edit/reorder last N commits
git rebase -i HEAD~4

# Rebase feature branch onto latest develop
git fetch origin
git rebase origin/develop

# Cherry-pick a single commit onto current branch
git cherry-pick a1b2c3d

# Recover lost work via reflog
git reflog
git switch -c recovery-branch HEAD@{3}

# Tag a release
git tag -a v1.0.0 -m "release: v1.0.0"
git push origin v1.0.0

# List all tags
git tag -l
```

### Rebasing vs merging

|         | Rebase                                           | Merge                                                     |
| ------- | ------------------------------------------------ | --------------------------------------------------------- |
| History | Linear                                           | Preserves branch topology                                 |
| When    | Updating feature branches, cleaning up before PR | Back-merging hotfixes, recording intentional branch joins |
| Risk    | Rewrites history — never rebase shared branches  | Creates merge commits — can clutter log                   |

**Rule of thumb:** rebase your feature branch onto `develop`; never rebase `develop` or `main`.
