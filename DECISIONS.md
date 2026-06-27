# Decisions

## M0

- Initialized a Git repository in this workspace because only `plan.md` existed and milestone
  commits are required by the runbook.
- Kept numeric prefixes in part route slugs (`/parts/0-hook`, etc.) so the filesystem,
  content collection, and descent order stay aligned.
- Made `ScrollScene.render` optional for M0. MDX stubs use serializable step data and the
  built-in placeholder visual; later React-owned interactives can pass render callbacks inside
  sandbox components.
- Set a repository-local Git author identity (`Codex <codex@example.local>`) because the
  workspace had no commit identity configured.
