import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const hook = join(
  repoRoot,
  ".claude",
  "hooks",
  "enforce-agent-permissions.mjs",
);
const tempDirs: string[] = [];

function run(input: unknown, projectDir = repoRoot) {
  const stdin = typeof input === "string" ? input : JSON.stringify(input);
  const result = spawnSync(process.execPath, [hook], {
    input: stdin,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  if (result.status === 2) return "deny";
  expect(result.status).toBe(0);
  return result.stdout
    ? JSON.parse(result.stdout).hookSpecificOutput.permissionDecision
    : "none";
}

const edit = (agent: string | undefined, path: string, tool = "Edit") =>
  run({
    agent_type: agent,
    tool_name: tool,
    cwd: repoRoot,
    tool_input: { file_path: path },
  });

const shell = (agent: string | undefined, command: string) =>
  run({ agent_type: agent, tool_name: "Bash", tool_input: { command } });

function tempProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "agent-permissions-"));
  tempDirs.push(dir);
  mkdirSync(join(dir, ".claude", "agents"), { recursive: true });
  writeFileSync(join(dir, ".claude", "agents", "dev.md"), "");
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe("agent permissions hook", () => {
  it.each([
    ["qa", "src/lib/navigation.ts", "deny"],
    ["qa", "tests/integration/navigation.spec.ts", "allow"],
    ["qa", "tests/unit/agents.test.ts", "deny"],
    ["qa", "specs/031-example/tasks.md", "allow"],
    ["dev", "src/components/New.tsx", "allow"],
    ["dev", "tests/unit/agents.test.ts", "allow"],
    ["dev", "tests/a11y/home.test.ts", "deny"],
    ["dev", "specs/031-example/spec.md", "deny"],
    ["dev", "docs/constitution.md", "deny"],
    ["dev", ".claude/agents/dev.md", "deny"],
    ["dev", ".claude/agent-permissions.json", "deny"],
    ["dev", ".claude/hooks/enforce-agent-permissions.mjs", "deny"],
    ["dev", ".claude/settings.json", "deny"],
    ["dev-lead", ".claude/agent-permissions.json", "allow"],
    ["dev-lead", "AGENTS.md", "allow"],
    ["dev-lead", "specs/031-example/plan.md", "allow"],
    ["dev-lead", "src/pages/index.astro", "deny"],
    ["spec-refiner", "specs/031-example/spec.md", "allow"],
    ["spec-refiner", "specs/_template/spec.md", "deny"],
    ["spec-refiner", "src/pages/index.astro", "deny"],
  ])("%s editing %s is %s", (agent, path, expected) => {
    expect(edit(agent, join(repoRoot, path))).toBe(expected);
  });

  it("applies the same rules to Write and relative paths", () => {
    expect(edit("qa", "src/new-file.ts", "Write")).toBe("deny");
  });

  it("applies the rules to the notebook path of NotebookEdit", () => {
    expect(
      run({
        agent_type: "qa",
        tool_name: "NotebookEdit",
        cwd: repoRoot,
        tool_input: { notebook_path: "src/notebook.ipynb" },
      }),
    ).toBe("deny");
  });

  it("evaluates the symlink target, not the symlink name", () => {
    expect(edit("dev", join(repoRoot, "CLAUDE.md"))).toBe("deny");
    expect(edit("dev-lead", join(repoRoot, "CLAUDE.md"))).toBe("allow");
  });

  it("gives no decision for paths outside the repository", () => {
    expect(edit("qa", join(tmpdir(), "outside.txt"))).toBe("none");
  });

  it("denies blocked commands in every position of a compound command", () => {
    for (const command of [
      "git commit -m x",
      "git -C . commit -m x",
      "cd . && git commit -m x",
      "pnpm lint; git push origin main",
      "git status | git merge main",
      "(git switch other)",
      "echo $(git checkout other)",
      "FOO=1 git push",
      'sh -c "git branch new"',
      "git branch --show-current && git branch new",
    ]) {
      expect(shell("dev", command), command).toBe("deny");
      expect(shell("qa", command), command).toBe("deny");
    }
  });

  it("allows a command only when every segment is allowed", () => {
    expect(shell("dev", "git branch --show-current")).toBe("allow");
    expect(shell("dev", "git branch --show-current 2>&1")).toBe("allow");
    expect(shell("dev", "git branch --show-current && pnpm lint")).toBe("none");
    expect(shell("dev", "pnpm lint")).toBe("none");
    expect(shell("dev-lead", "git merge spec/031-example")).toBe("allow");
  });

  it("does not restrict sessions without a custom agent", () => {
    expect(edit(undefined, join(repoRoot, "src/pages/index.astro"))).toBe(
      "none",
    );
    expect(edit("Explore", join(repoRoot, "src/pages/index.astro"))).toBe(
      "none",
    );
    expect(shell(undefined, "git commit -m x")).toBe("none");
  });

  it("fails closed when the input or the rules cannot be read", () => {
    expect(run("not json")).toBe("deny");

    const missing = tempProject();
    const input = {
      agent_type: "dev",
      tool_name: "Bash",
      tool_input: { command: "pnpm lint" },
    };
    expect(run(input, missing)).toBe("deny");

    const invalid = tempProject();
    writeFileSync(join(invalid, ".claude", "agent-permissions.json"), "{");
    expect(run(input, invalid)).toBe("deny");

    const withoutAgent = tempProject();
    writeFileSync(
      join(withoutAgent, ".claude", "agent-permissions.json"),
      "{}",
    );
    expect(run(input, withoutAgent)).toBe("deny");
  });

  it("evaluates a new file through a symlinked directory by its real path", () => {
    const project = tempProject();
    cpSync(
      join(repoRoot, ".claude", "agent-permissions.json"),
      join(project, ".claude", "agent-permissions.json"),
    );
    mkdirSync(join(project, "docs"));
    symlinkSync(
      join(project, ".claude", "agents"),
      join(project, "docs", "link"),
    );
    expect(
      run(
        {
          agent_type: "dev",
          tool_name: "Write",
          cwd: project,
          tool_input: { file_path: "docs/link/new.md" },
        },
        project,
      ),
    ).toBe("deny");
  });
});
