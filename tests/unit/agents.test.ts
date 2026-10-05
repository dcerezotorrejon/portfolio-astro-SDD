import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Structural verification for the custom agents in `.opencode/agents/`.
 *
 * The agent files use a small, stable subset of YAML frontmatter (top-level
 * scalars plus a flat list of permission rules), so they are parsed with a tiny
 * local parser instead of adding a YAML dependency.
 */

interface PermissionRule {
  action?: string;
  resource?: string;
  effect?: string;
}

interface AgentFile {
  id: string;
  description?: string;
  mode?: string;
  model?: string;
  permissions: PermissionRule[];
  body: string;
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const agentsDir = join(repoRoot, ".opencode", "agents");

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseAgent(id: string, raw: string): AgentFile {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`${id}: missing frontmatter`);

  const [, frontmatter, body] = match;
  const scalars: Record<string, string> = {};
  const permissions: PermissionRule[] = [];
  let inPermissions = false;
  let current: PermissionRule | undefined;

  for (const line of frontmatter.split(/\r?\n/)) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const stripped = line.trim();

    if (indent === 0) {
      const pair = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(stripped);
      if (!pair) continue;
      const [, key, value] = pair;
      inPermissions = key === "permissions";
      if (!inPermissions) scalars[key] = unquote(value);
      continue;
    }

    if (!inPermissions) continue;
    const rule = /^-?\s*(action|resource|effect):\s*(.*)$/.exec(stripped);
    if (!rule) continue;
    const [, key, value] = rule;
    if (key === "action") {
      current = { action: unquote(value) };
      permissions.push(current);
    } else if (current) {
      current[key as "resource" | "effect"] = unquote(value);
    }
  }

  return {
    id,
    description: scalars.description,
    mode: scalars.mode,
    model: scalars.model,
    permissions,
    body: body.trim(),
  };
}

function loadAgents(): Map<string, AgentFile> {
  const agents = new Map<string, AgentFile>();
  for (const file of readdirSync(agentsDir)) {
    if (!file.endsWith(".md")) continue;
    const id = file.replace(/\.md$/, "");
    agents.set(id, parseAgent(id, readFileSync(join(agentsDir, file), "utf8")));
  }
  return agents;
}

function allowsSubagent(agent: AgentFile, target: string): boolean {
  return agent.permissions.some(
    (rule) =>
      rule.action === "subagent" &&
      rule.resource === target &&
      rule.effect === "allow",
  );
}

function permissionTuples(agent: AgentFile): Array<[string, string, string]> {
  return agent.permissions.map((rule) => [
    rule.action ?? "",
    rule.resource ?? "",
    rule.effect ?? "",
  ]);
}

function matchesPermissionResource(pattern: string, resource: string): boolean {
  let expression = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];

    if (character === "*" && pattern[index + 1] === "*") {
      if (pattern[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index += 1;
      }
    } else if (character === "*") {
      expression += "[^/]*";
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }

  return new RegExp(`${expression}$`).test(resource);
}

function effectivePermission(
  agent: AgentFile,
  action: string,
  resource: string,
): string | undefined {
  return agent.permissions.reduce<string | undefined>((effect, rule) => {
    if (
      rule.action === action &&
      rule.resource &&
      matchesPermissionResource(rule.resource, resource)
    ) {
      return rule.effect;
    }

    return effect;
  }, undefined);
}

function expectPromptFragments(agent: AgentFile, fragments: string[]): void {
  const prompt = agent.body.replace(/\s+/g, " ").trim();
  for (const fragment of fragments) {
    expect(prompt, `${agent.id} prompt should include: ${fragment}`).toContain(
      fragment.replace(/\s+/g, " ").trim(),
    );
  }
}

const agents = loadAgents();

describe("custom agent definitions", () => {
  it("defines exactly the four workflow agents", () => {
    expect([...agents.keys()].sort()).toEqual([
      "dev",
      "dev-lead",
      "qa",
      "spec-refiner",
    ]);
  });

  it.each([...agents.values()])("$id has a description", (agent) => {
    expect(agent.description?.length ?? 0).toBeGreaterThan(0);
  });

  it.each([...agents.values()])(
    "$id has a non-empty English prompt",
    (agent) => {
      expect(agent.body.length).toBeGreaterThan(0);
    },
  );

  it("uses the pinned GPT-6 Luna model for each agent", () => {
    expect(agents.get("spec-refiner")).toMatchObject({
      mode: "primary",
      model: "openrouter/openai/gpt-6-luna#medium",
    });
    expect(agents.get("dev-lead")).toMatchObject({
      mode: "primary",
      model: "openrouter/openai/gpt-6-luna#high",
    });
    expect(agents.get("dev")).toMatchObject({
      mode: "subagent",
      model: "openrouter/openai/gpt-6-luna#medium",
    });
    expect(agents.get("qa")).toMatchObject({
      mode: "subagent",
      model: "openrouter/openai/gpt-6-luna#medium",
    });
  });

  it.each([
    ["spec-refiner", "openrouter/openai/gpt-6-luna#medium", "medium"],
    ["dev-lead", "openrouter/openai/gpt-6-luna#high", "high"],
    ["dev", "openrouter/openai/gpt-6-luna#medium", "medium"],
    ["qa", "openrouter/openai/gpt-6-luna#medium", "medium"],
  ])("%s records intent matching its pinned model", (id, model, effort) => {
    const agent = agents.get(id)!;
    expect(agent.body).toContain("## Model intent");
    expectPromptFragments(agent, [
      `Pinned to GPT-6 Luna (\`${model}\`)`,
      `${effort} reasoning effort`,
    ]);
  });

  it("lets the dev lead launch dev and qa, and no one else launch subagents", () => {
    const lead = agents.get("dev-lead")!;
    expect(allowsSubagent(lead, "dev")).toBe(true);
    expect(allowsSubagent(lead, "qa")).toBe(true);

    for (const id of ["spec-refiner", "dev", "qa"]) {
      const agent = agents.get(id)!;
      expect(allowsSubagent(agent, "*")).toBe(false);
      expect(allowsSubagent(agent, "dev")).toBe(false);
      expect(allowsSubagent(agent, "qa")).toBe(false);
    }
  });

  it("applies ordered Dev and QA edit policies without widening role authority", () => {
    expect(permissionTuples(agents.get("spec-refiner")!)).toEqual([
      ["edit", "**", "deny"],
      ["edit", "specs/*/spec.md", "allow"],
      ["subagent", "*", "deny"],
    ]);
    expect(permissionTuples(agents.get("dev-lead")!)).toEqual([
      ["edit", "**", "deny"],
      ["edit", "specs/*/plan.md", "allow"],
      ["edit", "specs/*/tasks.md", "allow"],
      ["edit", "specs/*/summary.md", "allow"],
      ["edit", "specs/**/spec.md", "deny"],
      ["subagent", "*", "deny"],
      ["subagent", "dev", "allow"],
      ["subagent", "qa", "allow"],
    ]);

    const dev = agents.get("dev")!;
    expect(permissionTuples(dev)).toEqual([
      ["edit", "**", "deny"],
      ["edit", ".opencode/agents/spec-refiner.md", "allow"],
      ["edit", ".opencode/agents/dev-lead.md", "allow"],
      ["edit", ".opencode/agents/dev.md", "allow"],
      ["edit", ".opencode/agents/qa.md", "allow"],
      ["edit", "docs/constitution.md", "allow"],
      ["edit", "AGENTS.md", "allow"],
      ["edit", "specs/README.md", "allow"],
      ["edit", "**", "allow"],
      ["edit", "specs/**/spec.md", "deny"],
      ["edit", "tests/**", "deny"],
      ["edit", "specs/**", "deny"],
      ["shell", "git branch *", "deny"],
      ["shell", "git branch --show-current", "allow"],
      ["shell", "git checkout *", "deny"],
      ["shell", "git switch *", "deny"],
      ["shell", "git merge *", "deny"],
      ["shell", "git commit *", "deny"],
      ["shell", "git push *", "deny"],
      ["subagent", "*", "deny"],
    ]);

    for (const resource of [
      "src/components/FloatingNav.tsx",
      "README.md",
      "docs/design.md",
    ]) {
      expect(effectivePermission(dev, "edit", resource), resource).toBe(
        "allow",
      );
    }
    for (const resource of [
      "tests/unit/agents.test.ts",
      "specs/008-lib-reorganization/tasks.md",
      "specs/008-lib-reorganization/spec.md",
    ]) {
      expect(effectivePermission(dev, "edit", resource), resource).toBe("deny");
    }

    expect(permissionTuples(agents.get("qa")!)).toEqual([
      ["edit", "**", "deny"],
      ["edit", "tests/**", "allow"],
      ["edit", "specs/*/tasks.md", "allow"],
      ["edit", "specs/**/spec.md", "deny"],
      ["edit", "specs/*/spec.md", "allow"],
      ["shell", "git branch *", "deny"],
      ["shell", "git branch --show-current", "allow"],
      ["shell", "git checkout *", "deny"],
      ["shell", "git switch *", "deny"],
      ["shell", "git merge *", "deny"],
      ["shell", "git commit *", "deny"],
      ["shell", "git push *", "deny"],
      ["subagent", "*", "deny"],
    ]);

    const qa = agents.get("qa")!;
    for (const resource of [
      "tests/unit/agents.test.ts",
      "tests/a11y/floating-nav.test.ts",
      "specs/008-lib-reorganization/tasks.md",
      "specs/008-lib-reorganization/spec.md",
    ]) {
      expect(effectivePermission(qa, "edit", resource), resource).toBe("allow");
    }
    for (const resource of [
      "src/lib/navigation.ts",
      "docs/design.md",
      "specs/008-lib-reorganization/plan.md",
      "specs/008-lib-reorganization/summary.md",
      "specs/008-lib-reorganization/nested/spec.md",
    ]) {
      expect(effectivePermission(qa, "edit", resource), resource).toBe("deny");
    }

    // The path-family rule also matches a sibling current spec; the prompt must
    // keep that broader tool permission constrained to the assigned spec only.
    expect(
      effectivePermission(qa, "edit", "specs/007-workflow-changes/spec.md"),
    ).toBe("allow");
    expectPromptFragments(qa, [
      "Do not edit plans, summaries, operational docs, or any unassigned spec.",
      "In the assigned current `spec.md`, edit only verified acceptance checkbox markers from `[ ]` to `[x]`, and only after recording the supporting evidence in the assigned task entry.",
      "Never change criterion wording, spec status or metadata, or any other spec content.",
      "spec edits to the assigned current spec's evidence-backed `[ ]`→`[x]` checkbox changes.",
    ]);

    for (const agent of [dev, qa]) {
      expect(
        effectivePermission(agent, "shell", "git branch --show-current"),
      ).toBe("allow");
      for (const command of [
        "git branch feature-example",
        "git checkout other-branch",
        "git switch other-branch",
        "git merge other-branch",
        "git commit -m message",
        "git push origin feature-example",
      ]) {
        expect(effectivePermission(agent, "shell", command), command).toBe(
          "deny",
        );
      }

      expect(agent.permissions).toContainEqual({
        action: "shell",
        resource: "git branch *",
        effect: "deny",
      });
      expect(agent.permissions).toContainEqual({
        action: "shell",
        resource: "git branch --show-current",
        effect: "allow",
      });
      for (const command of [
        "git checkout *",
        "git switch *",
        "git merge *",
        "git commit *",
        "git push *",
      ]) {
        expect(agent.permissions).toContainEqual({
          action: "shell",
          resource: command,
          effect: "deny",
        });
      }
      expect(agent.permissions).toContainEqual({
        action: "subagent",
        resource: "*",
        effect: "deny",
      });
    }
  });

  it("documents each role's assignment boundaries", () => {
    expectPromptFragments(agents.get("spec-refiner")!, [
      "Write only the assigned current `spec.md`",
      "does not authorize edits to any spec other than the explicitly assigned current file",
    ]);
    expectPromptFragments(agents.get("dev-lead")!, [
      "Never write or modify any `spec.md`.",
      "Limit actual edits to the current feature's named `plan.md`, `tasks.md`, and `summary.md`",
    ]);
    expectPromptFragments(agents.get("dev")!, [
      "implement exactly one task",
      "T1 owns only `.opencode/agents/{spec-refiner,dev-lead,dev,qa}.md`; T2 owns only `docs/constitution.md`, `AGENTS.md`, and `specs/README.md`.",
      "These exceptions do not authorize other docs, specs, plans, summaries, tests, or production code.",
      "Permission-family globs and the available permission exceptions are broader than the assigned task.",
    ]);
    expectPromptFragments(agents.get("qa")!, [
      "Edit only assigned tests, this spec's assigned task evidence, and the narrowly authorized acceptance checkboxes in the assigned current spec.",
      "constrain test edits to named test files",
      "evidence edits to the assigned task entry",
      "spec edits to the assigned current spec's evidence-backed `[ ]`→`[x]` checkbox changes",
      "Never change criterion wording, spec status or metadata, or any other spec content.",
      "Never edit production files",
    ]);
  });

  it("documents shared-branch work, capped task lifecycle, and QA rework", () => {
    expectPromptFragments(agents.get("spec-refiner")!, [
      "All subsequent Dev and QA work uses that shared branch",
      "without task/developer branches or per-task commits/pushes.",
    ]);
    expectPromptFragments(agents.get("dev-lead")!, [
      "All Dev and QA sessions must use this same branch",
      "Orchestrate at most four active tasks.",
      "remains active through QA verification, evidence recording, and any Dev rework.",
      "Never launch a fifth task while four are active.",
      "only independent tasks with non-overlapping files and no unresolved dependencies",
      "Serialize QA sessions when their tests or evidence files overlap.",
      "Return defects to the same Dev for correction on the same branch",
      "After every task has QA approval and recorded evidence",
      "use the repository's commit skill",
    ]);
    expectPromptFragments(agents.get("dev")!, [
      "Work directly on the Lead's shared `spec/[NNN]-[slug]` branch.",
      "if it differs, stop and notify the Lead rather than switching branches.",
      "Implement the smallest correct change that satisfies the task within the explicitly assigned file/scope ownership.",
      "the same Dev corrects them there and returns the task to QA.",
      "Do not create, switch, or use task/developer branches (`dev/...`); do not merge, commit, or push.",
      "There are no per-task commits/pushes.",
      "Do not write or modify tests",
    ]);
    expectPromptFragments(agents.get("qa")!, [
      "Verify directly on the Lead's shared `spec/[NNN]-[slug]` branch.",
      "if it differs, stop and notify the Lead instead of switching.",
      "The Lead returns defects to the same Dev for correction on the shared branch",
      "task remains active through verification, evidence recording, and rework",
      "Do not create, switch, or use task/developer branches (`dev/...`); do not merge, commit, or push.",
      "QA approval never authorizes Dev or QA to commit/push; only the Lead uses the commit skill",
    ]);
  });

  it("requires conflict escalation, maintainer approval, and Lead-owned final commit/push", () => {
    for (const id of ["spec-refiner", "dev-lead", "dev", "qa"]) {
      const body = agents.get(id)!.body;
      expect(body).toMatch(/conflict/i);
      expect(body).toMatch(/stop the affected operation/i);
      expect(body).toMatch(
        /Never overwrite|MUST NOT overwrite|Do not overwrite/i,
      );
    }
    for (const id of ["spec-refiner", "dev", "qa"]) {
      expectPromptFragments(agents.get(id)!, ["notify the Dev Lead"]);
    }
    expectPromptFragments(agents.get("dev-lead")!, [
      "Notify the maintainer when resolution requires a decision",
    ]);

    expectPromptFragments(agents.get("dev-lead")!, [
      "wait for maintainer approval before planning or delegating affected implementation.",
      "Record the approved decision in the relevant planning artifact.",
      "Only when all pass, use the repository's commit skill",
      "No per-task commit/push is allowed.",
    ]);
    expectPromptFragments(agents.get("dev")!, [
      "Only the Lead uses the commit skill for final feature commit/push",
      "the Lead escalates decisions to the maintainer.",
    ]);
    expectPromptFragments(agents.get("qa")!, [
      "only the Lead uses the commit skill after all tasks have approval/evidence and all final gates pass.",
      "the Lead escalates decisions to the maintainer.",
    ]);
  });
});

describe("agent workflow documentation", () => {
  const agentsGuide = readFileSync(join(repoRoot, "AGENTS.md"), "utf8");
  const constitution = readFileSync(
    join(repoRoot, "docs", "constitution.md"),
    "utf8",
  );

  it.each(["spec-refiner", "dev-lead", "dev", "qa"])(
    "AGENTS.md mentions %s",
    (id) => {
      expect(agentsGuide).toContain(id);
    },
  );

  it("amends the constitution with spec relationships and version 1.5.0", () => {
    expect(constitution).toContain("**Version**: 1.5.0");
    expect(constitution).toContain("**Last amended**: 2026-10-06");
    expect(constitution).toContain("### 4.2 Spec relationships");
    expect(constitution).toContain("Related specs");
  });

  it("retains the concise normative shared-branch safeguards", () => {
    const guide = readFileSync(join(repoRoot, "AGENTS.md"), "utf8");
    const specsReadme = readFileSync(
      join(repoRoot, "specs", "README.md"),
      "utf8",
    );
    const sectionStart = constitution.indexOf(
      "### 5.1 Shared feature-branch workflow",
    );
    const sectionEnd = constitution.indexOf(
      "## 6. Quality gates",
      sectionStart,
    );
    const workflowPolicy = constitution
      .slice(sectionStart, sectionEnd)
      .replace(/\s+/g, " ");

    expect(sectionStart).toBeGreaterThanOrEqual(0);
    expect(sectionEnd).toBeGreaterThan(sectionStart);
    expect(workflowPolicy.length).toBeLessThan(2000);
    expect(workflowPolicy).toContain("exactly one shared feature branch");
    expect(workflowPolicy).toContain(
      "no task/developer branches may be created or used",
    );
    expect(workflowPolicy).toContain("At most four tasks may be active");
    expect(workflowPolicy).toContain(
      "parallel work is permitted only for independent tasks with disjoint scopes and no unfinished dependencies",
    );
    expect(workflowPolicy).toContain(
      "A task stays active from assignment through QA approval, evidence, and any rework",
    );
    expect(workflowPolicy).toContain(
      "the task closes only after QA approval and recorded evidence",
    );
    expect(workflowPolicy).toContain("and may update tests and task evidence");
    expect(workflowPolicy).toContain("MUST NOT edit production code");
    expect(workflowPolicy).toContain(
      "defects return to the same Dev on that branch",
    );
    expect(workflowPolicy).toContain(
      "Dev and QA MUST NOT create branches, merge, commit, or push",
    );
    expect(workflowPolicy).toContain(
      "agents MUST stop the affected operation and notify the Dev Lead",
    );
    expect(workflowPolicy).toContain(
      "MUST NOT overwrite work or guess a resolution",
    );
    expect(workflowPolicy).toContain(
      "The Lead escalates decisions requiring judgment to the maintainer, and work resumes only after an agreed resolution",
    );
    expect(workflowPolicy).toContain(
      "Before planning or delegating work affected by a material technical decision",
    );
    expect(workflowPolicy).toContain(
      "the Lead MUST obtain maintainer approval and record it",
    );
    expect(workflowPolicy).toContain(
      "Only the Dev Lead may use the repository's commit skill",
    );
    expect(workflowPolicy).toContain(
      "only after every task has QA approval and evidence and all §6 gates pass",
    );
    expect(workflowPolicy).toContain("The Lead MUST NOT merge or delete");
    expect(workflowPolicy).toContain(
      "After a successful final push, the Lead MUST ask the maintainer to merge",
    );
    expect(workflowPolicy).toContain("that branch into `main`");

    for (const guidance of [guide, specsReadme]) {
      expect(guidance).toContain("spec/[NNN]-[slug]");
    }
    expect(guide).toContain("up to four active tasks");
    expect(guide).toContain("overlapping or dependent tasks are serialized");
    expect(guide).toContain("reworks them on that branch");
    expect(guide).toContain("Lead alone uses the commit skill");
    expect(guide).toContain(
      "After a successful final push, the Lead explicitly asks the maintainer to merge",
    );
    expect(guide).toContain(
      "does not merge the feature branch into the base branch or delete it",
    );
    expect(specsReadme).toContain("task/developer branches are not created");
    expect(specsReadme).toContain(
      "preserve earlier, historical `spec.md` files unchanged",
    );
  });

  it("requires QA to verify tasks on the shared feature branch", () => {
    const workflowPolicy = constitution
      .slice(
        constitution.indexOf("### 5.1 Shared feature-branch workflow"),
        constitution.indexOf("## 6. Quality gates"),
      )
      .replace(/\s+/g, " ");

    expect(workflowPolicy).toContain(
      "QA MUST verify each task on the shared feature branch",
    );
  });

  it("prohibits Dev and QA from creating branches", () => {
    const workflowPolicy = constitution
      .slice(
        constitution.indexOf("### 5.1 Shared feature-branch workflow"),
        constitution.indexOf("## 6. Quality gates"),
      )
      .replace(/\s+/g, " ");

    expect(workflowPolicy).toContain("Dev and QA MUST NOT create branches");
  });

  it("keeps all four agent role boundaries and the generic QA evidence path", () => {
    const specRefiner = agents.get("spec-refiner")!;
    const lead = agents.get("dev-lead")!;
    const dev = agents.get("dev")!;
    const qa = agents.get("qa")!;

    expectPromptFragments(specRefiner, [
      "Write only the assigned current `spec.md`",
      "All subsequent Dev and QA work uses that shared branch",
      "Only the Lead performs final commit/push",
    ]);
    expectPromptFragments(lead, [
      "Never write or modify any `spec.md`.",
      "Limit actual edits to the current feature's named `plan.md`, `tasks.md`, and `summary.md`",
      "After a successful final push, explicitly ask the maintainer to merge",
      "do not merge it yourself or delete it",
    ]);
    expectPromptFragments(dev, [
      "implement exactly one task",
      "Do not write or modify tests",
      "do not merge, commit, or push",
      "Only the Lead uses the commit skill for final feature commit/push",
    ]);
    expectPromptFragments(qa, [
      "Edit only assigned tests, this spec's assigned task evidence, and the narrowly authorized acceptance checkboxes in the assigned current spec.",
      "in this spec's `tasks.md`",
      "Never edit production files",
      "do not merge, commit, or push",
    ]);
    expectPromptFragments(qa, [
      "After verifying an acceptance criterion and recording its supporting evidence",
      "change only that criterion's checkbox from `[ ]` to `[x]` in the assigned current `spec.md`",
    ]);
    const guide = readFileSync(join(repoRoot, "AGENTS.md"), "utf8").replace(
      /\s+/g,
      " ",
    );
    expect(guide).toContain(
      "QA completes verification before the Lead's final commit and push; no post-push QA task is introduced.",
    );
    expectPromptFragments(qa, ["operational docs, or any unassigned spec."]);
    expect(qa.body).toContain("spec status or metadata");
    expect(qa.body).not.toContain("specs/007-workflow-changes/tasks.md");

    expect(
      effectivePermission(lead, "edit", "specs/008-lib-reorganization/spec.md"),
    ).toBe("deny");
  });

  it("requires the Lead's maintainer merge request only after the final push", () => {
    const leadPrompt = agents.get("dev-lead")!.body.replace(/\s+/g, " ");
    const sharedGuidance = readFileSync(join(repoRoot, "AGENTS.md"), "utf8");
    const normalizedGuidance = sharedGuidance.replace(/\s+/g, " ");

    expect(leadPrompt).toMatch(
      /After every task has QA approval and recorded evidence[\s\S]*?all final quality gates[\s\S]*?commit skill[\s\S]*?push the shared spec branch[\s\S]*?After a successful final push, explicitly ask the maintainer to merge/,
    );
    expect(leadPrompt).toContain("do not merge it yourself or delete it");
    expect(normalizedGuidance).toMatch(
      /After all task QA approvals and evidence are recorded and final gates pass[\s\S]*?Lead alone uses the commit skill[\s\S]*?push[\s\S]*?After a successful final push, the Lead explicitly asks the maintainer to merge/,
    );
    expect(normalizedGuidance).toContain(
      "the Lead explicitly asks the maintainer to merge the published feature branch into `main`",
    );
  });

  it("establishes the global design document under constitutional precedence", () => {
    expect(constitution).toContain("### 2.1 Global design");
    expect(constitution).toContain("[`docs/design.md`](./design.md)");
    expect(constitution).toContain(
      "Specs, technical plans, and UI implementations MUST reference",
    );
    expect(constitution).toContain(
      "The design document is subordinate to this constitution, including the",
    );
    expect(constitution).toContain("accessibility requirements in §7");
    expect(constitution).toContain(
      "When a practice is not covered here, use the Astro documentation",
    );
  });

  it("documents Related specs in the spec template and README", () => {
    const template = readFileSync(
      join(repoRoot, "specs", "_template", "summary.md"),
      "utf8",
    );
    const readme = readFileSync(join(repoRoot, "specs", "README.md"), "utf8");
    expect(template).toContain("## Related specs");
    expect(readme).toContain("Related specs");
  });
});

describe("auto router model variants", () => {
  const config = JSON.parse(
    readFileSync(join(repoRoot, "opencode.json"), "utf8"),
  ) as {
    providers?: {
      openrouter?: {
        models?: Record<
          string,
          {
            variants?: Array<{
              id?: string;
              settings?: Record<string, unknown>;
            }>;
          }
        >;
      };
    };
  };

  const auto = config.providers?.openrouter?.models?.["openrouter/auto"];

  it("defines the Auto Router with high and medium reasoning variants", () => {
    expect(auto).toBeDefined();
    const variants = auto?.variants ?? [];
    const effort = Object.fromEntries(
      variants.map((variant) => [
        variant.id,
        variant.settings?.reasoningEffort,
      ]),
    );
    expect(effort.high).toBe("high");
    expect(effort.medium).toBe("medium");
  });

  it("controls reasoning effort, not cost, in the variants", () => {
    for (const variant of auto?.variants ?? []) {
      expect(variant.settings).toHaveProperty("reasoningEffort");
      expect(variant.settings).not.toHaveProperty("cost_tier");
    }
  });
});
