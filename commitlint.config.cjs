/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "refactor", "docs", "chore", "test", "perf", "style", "build", "ci"]
    ],
    "scope-enum": [
      1,
      "always",
      [
        "kb",
        "revise",
        "board",
        "graph",
        "daily",
        "topics",
        "blogs",
        "auth",
        "db",
        "editor",
        "search",
        "settings",
        "layout",
        "deps",
        "ci"
      ]
    ],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120]
  }
};
