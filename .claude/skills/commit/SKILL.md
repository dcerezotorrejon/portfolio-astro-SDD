---
name: commit
description: Use when the user asks to commit changes (commit, "haz commit", "guarda los cambios"). Creates atomic git commits that follow the Conventional Commits specification, using the current spec identifier as the scope in the form "spec-<NNN>".
---

# Commit

Create git commits that follow **Conventional Commits**. Each commit is one
logical change, and its scope MUST be the identifier of the spec the work belongs
to, written as `spec-<NNN>` (e.g. `spec-001`). If no spec is associated with the
change, omit the scope.

This project is spec-anchored: commits are the trace that links code back to a
spec. See [`docs/constitution.md`](../../../docs/constitution.md).

## Message format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Use for                                              |
| ---------- | ---------------------------------------------------- |
| `feat`     | A new feature for the user or system.                |
| `fix`      | A bug fix.                                           |
| `refactor` | Code change that neither fixes a bug nor adds one.   |
| `style`    | Formatting or whitespace only (no behavior change).  |
| `docs`     | Documentation only.                                  |
| `test`     | Adding or correcting tests.                          |
| `chore`    | Maintenance, build, or dependency updates.           |
| `perf`     | Performance improvement.                             |
| `ci`       | CI/CD configuration or scripts.                      |

### Scope

- The scope is the spec identifier prefixed with `spec-`: `spec-<NNN>`, where
  `<NNN>` is the zero-padded number of the spec folder (e.g. `spec-001`).
- Use exactly one scope per commit. Do not combine specs; split the work into
  separate commits instead.
- If the change is not tied to a spec (repo setup, tooling, docs), **omit the
  scope**: `chore: initialize repo`.
- The scope is lowercase, without spaces.

### Summary

- Imperative, present tense: `add`, not `added`/`adds`.
- Lowercase first letter.
- No trailing period.
- Maximum 72 characters for the full subject line.

## Determining the spec id

Pick the spec the change belongs to, in this order:

1. The spec explicitly being worked on in the conversation.
2. The most recently modified folder under `specs/` (ignore `_template`).
3. If neither applies, there is no spec: omit the scope.

Read `specs/README.md` for the spec naming convention
(`[NNN]-[feature-slug]`); the scope uses only the `NNN` part.

## Workflow

1. **Inspect** the repository state:

   ```bash
   git status --short
   git diff
   git diff --cached
   ```

2. **Group** changes into atomic, logical units. Never mix unrelated changes
   (e.g. a refactor and a feature) in one commit.

3. For each group:
   - Stage only the relevant files:
     ```bash
     git add <file1> <file2> ...
     ```
   - Review the staged diff:
     ```bash
     git diff --cached --stat
     ```
   - Commit:
     ```bash
     git commit -m "<type>(spec-<NNN>): <summary>"
     ```
     Add a body (or footer, e.g. `BREAKING CHANGE:`) when extra context is needed.

4. **Keep the spec in sync** (spec-anchored rule): if the change touches a spec,
   make sure that spec's `tasks.md` and `summary.md` (date, files, and
   functions changed) reflect it, and include those updates in the commit.

5. **Verify** the result:

   ```bash
   git status
   git log --oneline -n <number of commits created>
   ```

## Output

After committing, print a concise breakdown:

- Each created commit: hash + subject.
- Any remaining uncommitted or untracked files that were intentionally left out.
