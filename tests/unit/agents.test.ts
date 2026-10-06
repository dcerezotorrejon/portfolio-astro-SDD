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

/** Later matching rules override earlier rules, as in the agent permission list. */
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

function prompt(agentId: string): string {
  return agents.get(agentId)!.body.replace(/\s+/g, " ").trim();
}

function expectPromptFragments(agentId: string, fragments: string[]): void {
  const body = prompt(agentId);
  for (const fragment of fragments) {
    expect(body, `${agentId} prompt should include: ${fragment}`).toContain(
      fragment.replace(/\s+/g, " ").trim(),
    );
  }
}

const agents = loadAgents();
const constitution = readFileSync(
  join(repoRoot, "docs", "constitution.md"),
  "utf8",
);
const agentsGuide = readFileSync(join(repoRoot, "AGENTS.md"), "utf8");

describe("custom agent definitions", () => {
  it("defines exactly the four workflow agents with descriptions", () => {
    expect([...agents.keys()].sort()).toEqual([
      "dev",
      "dev-lead",
      "qa",
      "spec-refiner",
    ]);
    for (const agent of agents.values()) {
      expect(agent.description?.length ?? 0).toBeGreaterThan(0);
      expect(agent.body.length).toBeGreaterThan(0);
    }
  });

  it("uses the approved OpenCode Go model and mode for each agent", () => {
    const expected = {
      "spec-refiner": ["primary", "opencode-go/deepseek-v4-pro"],
      "dev-lead": ["primary", "opencode-go/deepseek-v4-pro"],
      dev: ["subagent", "opencode-go/kimi-k2.7-code"],
      qa: ["subagent", "opencode-go/deepseek-v4.1-flash"],
    };

    for (const [id, [mode, model]] of Object.entries(expected)) {
      const agent = agents.get(id)!;
      expect(agent.mode).toBe(mode);
      expect(agent.model).toBe(model);
    }
  });

  it("lets only Dev Lead launch Dev and QA subagents", () => {
    const lead = agents.get("dev-lead")!;
    expect(lead.permissions).toContainEqual({
      action: "subagent",
      resource: "dev",
      effect: "allow",
    });
    expect(lead.permissions).toContainEqual({
      action: "subagent",
      resource: "qa",
      effect: "allow",
    });

    for (const id of ["spec-refiner", "dev", "qa"]) {
      expect(effectivePermission(agents.get(id)!, "subagent", "dev")).toBe(
        "deny",
      );
      expect(effectivePermission(agents.get(id)!, "subagent", "qa")).toBe(
        "deny",
      );
    }
  });

  it("preserves the role-specific write boundaries and ordered Dev/QA policies", () => {
    expect(permissionTuples(agents.get("spec-refiner")!)).toEqual([
      ["edit", "**", "deny"],
      ["edit", "specs/*/spec.md", "allow"],
      ["subagent", "*", "deny"],
    ]);

    const dev = agents.get("dev")!;
    expect(effectivePermission(dev, "edit", "docs/constitution.md")).toBe(
      "allow",
    );
    expect(
      effectivePermission(dev, "edit", "src/components/FloatingNav.tsx"),
    ).toBe("allow");
    expect(effectivePermission(dev, "edit", "tests/unit/agents.test.ts")).toBe(
      "deny",
    );
    expect(
      effectivePermission(dev, "edit", "specs/008-lib-reorganization/spec.md"),
    ).toBe("deny");
    expectPromptFragments("dev", [
      "implement exactly one task",
      "Do not write or modify tests",
      "do not merge, commit, or push",
      "Before handing off, run Prettier on every file modified for the assigned task.",
      "Report the exact formatter command, the complete list of files formatted, and the result.",
    ]);

    const qa = agents.get("qa")!;
    const qaTuples = permissionTuples(qa);
    expect(qaTuples.slice(0, 6)).toEqual([
      ["edit", "**", "deny"],
      ["edit", "tests/**", "allow"],
      ["edit", "specs/*/tasks.md", "allow"],
      ["edit", "specs/**/spec.md", "deny"],
      ["edit", "specs/*/spec.md", "allow"],
      ["shell", "git branch *", "deny"],
    ]);
    expect(effectivePermission(qa, "edit", "tests/unit/agents.test.ts")).toBe(
      "allow",
    );
    expect(
      effectivePermission(qa, "edit", "specs/009-workflow-governance/tasks.md"),
    ).toBe("allow");
    expect(
      effectivePermission(qa, "edit", "specs/004-portfolio-home/tasks.md"),
    ).toBe("allow");
    expect(
      effectivePermission(qa, "edit", "specs/009-workflow-governance/spec.md"),
    ).toBe("allow");
    expect(
      effectivePermission(
        qa,
        "edit",
        "specs/004-portfolio-home/evidence-t1.md",
      ),
    ).toBe("deny");
    expect(
      effectivePermission(qa, "edit", "specs/009-workflow-governance/plan.md"),
    ).toBe("deny");
    expect(
      effectivePermission(
        qa,
        "edit",
        "specs/004-portfolio-home/evidence-f2.md",
      ),
    ).toBe("deny");
    expect(effectivePermission(qa, "edit", "src/lib/navigation.ts")).toBe(
      "deny",
    );
    expectPromptFragments("qa", [
      "Edit only assigned tests, this spec's assigned task evidence, and the narrowly authorized acceptance checkboxes in the assigned current spec.",
      "constrain test edits to named test files",
      "evidence edits to the assigned task entry",
      "spec edits to the assigned current spec's evidence-backed `[ ]`→`[x]` checkbox changes.",
      "Never edit production files",
      "Do not edit plans, summaries, operational docs, or any unassigned spec.",
      "For modified Markdown files, the file-specific QA review checks Prettier formatting only; do not add an editorial/style review.",
      "Still verify the task's specified content requirements",
      "including the required repository format check.",
    ]);
    expect(qa.body).not.toMatch(
      /one-time (?:004 )?evidence exception|one-time evidence-maintenance|specs\/004-portfolio-home\/evidence/i,
    );

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
    }
  });

  it("keeps Dev Lead feature-spec and test edits denied and merge capability explicit", () => {
    const lead = agents.get("dev-lead")!;
    const tuples = permissionTuples(lead);
    expect(tuples).toContainEqual(["edit", "**", "deny"]);
    expect(effectivePermission(lead, "edit", "tests/unit/agents.test.ts")).toBe(
      "deny",
    );
    expect(
      effectivePermission(lead, "edit", "specs/014-feature/tasks.md"),
    ).toBe("allow");
    expect(tuples).toContainEqual(["shell", "git merge *", "allow"]);
    expect(tuples).toContainEqual(["subagent", "*", "deny"]);
    expect(tuples).toContainEqual(["subagent", "dev", "allow"]);
    expect(tuples).toContainEqual(["subagent", "qa", "allow"]);

    const staticallyAllowed = [
      "specs/014-feature/plan.md",
      "specs/014-feature/tasks.md",
      "specs/014-feature/summary.md",
      "specs/014-feature/spec.md",
    ];
    for (const resource of staticallyAllowed) {
      expect(effectivePermission(lead, "edit", resource), resource).toBe(
        "allow",
      );
    }

    for (const resource of ["tests/unit/agents.test.ts"]) {
      expect(effectivePermission(lead, "edit", resource), resource).toBe(
        "deny",
      );
    }
    expect(effectivePermission(lead, "shell", "git merge main")).toBe("allow");

    expectPromptFragments("dev-lead", [
      "Your direct edits are limited to the assigned current increment's `plan.md`, `tasks.md`, and `summary.md`",
      "Delegate all implementation, including operational Markdown and repository configuration, to Dev with exact file ownership and independent QA.",
      "Never update any file in a completed spec directory.",
    ]);

    for (const resource of [
      "AGENTS.md",
      "docs/constitution.md",
      ".opencode/agents/dev-lead.md",
      "package.json",
      "src/components/FloatingNav.tsx",
      "public/content.md",
    ]) {
      expect(effectivePermission(lead, "edit", resource), resource).toBe(
        "deny",
      );
    }
  });
});

describe("shared and role-specific workflow guidance", () => {
  const sectionStart = constitution.indexOf(
    "### 5.1 Shared feature-branch workflow",
  );
  const sectionEnd = constitution.indexOf("## 6. Quality gates", sectionStart);
  const workflow = constitution.slice(sectionStart, sectionEnd);
  const normalizedWorkflow = workflow.replace(/\s+/g, " ");

  it("amends the constitution with an incremented version and actual amendment date", () => {
    expect(constitution).toMatch(/\*\*Version\*\*: \d+\.\d+\.\d+/);
    expect(constitution).toContain("**Last amended**: 2026-10-06");
    expect(constitution).toContain(
      "### 4.2 Historical specification access and references",
    );
  });

  it("keeps Constitution §5.1 role-neutral while retaining shared safeguards", () => {
    expect(sectionStart).toBeGreaterThanOrEqual(0);
    expect(sectionEnd).toBeGreaterThan(sectionStart);
    expect(normalizedWorkflow).toContain(
      "exactly one shared feature branch named `spec/[NNN]-[slug]` MUST be created and published",
    );
    expect(normalizedWorkflow).toContain("At most four tasks may be active");
    expect(normalizedWorkflow).toContain(
      "parallel work is permitted only for independent tasks with disjoint scopes and no unfinished dependencies",
    );
    expect(normalizedWorkflow).toContain(
      "A task remains active from assignment through verification approval, evidence, and any rework.",
    );
    expect(normalizedWorkflow).toContain(
      "It closes only after verification approval and recorded evidence.",
    );
    expect(normalizedWorkflow).toContain(
      "Verification MUST take place on the shared branch",
    );
    expect(normalizedWorkflow).toContain(
      "Verification may update assigned tests and task evidence but MUST NOT edit production code.",
    );
    expect(normalizedWorkflow).toContain(
      "participants MUST stop the affected operation",
    );
    expect(normalizedWorkflow).toContain(
      "MUST NOT overwrite work or guess a resolution",
    );
    expect(normalizedWorkflow).toContain(
      "maintainer approval MUST be obtained and recorded",
    );
    expect(normalizedWorkflow).toContain(
      "Final feature commit(s) and push MUST happen only after every task has verification approval and evidence and all §6 gates pass.",
    );
    expect(normalizedWorkflow).toContain(
      "Base-branch integration MUST require explicit affirmative maintainer approval",
    );
    expect(normalizedWorkflow).toContain(
      "the published feature branch MUST NOT be deleted",
    );
  });

  it("sets current-source precedence without making historical specs normative", () => {
    expect(normalizedWorkflow).toContain(
      "Current workflow rules are defined by this constitution and, where consistent with it, the applicable current agent prompts.",
    );
    expect(normalizedWorkflow).toContain(
      "Explicit maintainer decisions may resolve matters not specified here",
    );
    expect(normalizedWorkflow).toContain(
      "Completed specification files MUST NOT establish or override current workflow rules, permissions, role boundaries, or current behavior.",
    );
    expect(constitution).toContain(
      "Agents MUST NOT read the contents of a completed specification directory",
    );
    expect(constitution).toContain(
      "Existing completed directories and their contents MUST remain untouched",
    );

    expect(agentsGuide.replace(/\s+/g, " ")).toContain(
      "Role-specific procedures and write boundaries are defined in the applicable current agent prompts.",
    );
    expect(agentsGuide).not.toMatch(
      /Lead alone uses the commit skill|maintainer alone performs the merge|retain a full verification history/i,
    );
  });

  it("keeps agent-specific procedures in prompts and shared AGENTS guidance cross-agent", () => {
    for (const id of ["spec-refiner", "dev-lead", "dev", "qa"]) {
      expect(agents.get(id)?.body.length).toBeGreaterThan(0);
      expect(agentsGuide).toContain(id);
    }
    expect(agentsGuide.replace(/\s+/g, " ")).toContain(
      "Role-specific procedures and write boundaries are defined in the applicable current agent prompts.",
    );
    for (const roleProcedure of [
      "Clarifies the feature with you and writes `spec.md`.",
      "Turns the spec into `plan.md`/`tasks.md` and orchestrates `dev` then `qa`.",
      "Implements one task. Does not validate its own work.",
      "Tests, records evidence, marks only evidenced acceptance boxes.",
    ]) {
      expect(agentsGuide.replace(/\s+/g, " ")).not.toContain(roleProcedure);
    }
    expect(agentsGuide).not.toContain("The Lead returns defects");
    expect(agentsGuide).not.toContain("QA may change only that criterion's");
    expect(workflow).not.toContain("QA MUST");
    expect(workflow).not.toContain("Dev MUST");
  });

  it("requires explicit post-push maintainer confirmation for Lead merge and forbids Dev/QA integration", () => {
    expectPromptFragments("dev-lead", [
      "every task has QA approval and recorded evidence",
      "Run all final quality gates in Constitution §§5–6.",
      "Never run integration under the Markdown-only exception.",
      "use the repository's commit skill to create final feature commit(s) and push the shared spec branch to `origin`.",
      "After a successful final push, explicitly ask the maintainer for new affirmative permission to merge this scope into `main`",
      "Without it, leave the branch unmerged.",
      "After confirmation, merge the branch and keep it available; never delete it.",
    ]);
    for (const id of ["dev", "qa"]) {
      expectPromptFragments(id, ["do not merge, commit, or push."]);
      expect(agents.get(id)!.permissions).toContainEqual({
        action: "shell",
        resource: "git merge *",
        effect: "deny",
      });
      expect(agents.get(id)!.permissions).toContainEqual({
        action: "shell",
        resource: "git commit *",
        effect: "deny",
      });
      expect(agents.get(id)!.permissions).toContainEqual({
        action: "shell",
        resource: "git push *",
        effect: "deny",
      });
    }
    expect(agentsGuide).not.toMatch(/Lead (?:cannot|must not) merge/i);
  });

  it("requires latest-only QA task and final-gate evidence and Markdown-format-only review", () => {
    expectPromptFragments("qa", [
      "record the latest QA report for the assigned task in this spec's `tasks.md`",
      "Replace the previous report on every re-verification, including a failing run",
      "do not append run history or create a separate per-run evidence file.",
      "State the task/scope, shared-branch revision, applicable commands and their latest results, and current defects or approval.",
      "applicable commands and their latest results, and current defects or approval.",
      "Keep only the latest final-gate report as well.",
      "For modified Markdown files, the file-specific QA review checks Prettier formatting only; do not add an editorial/style review.",
      "Still verify the task's specified content requirements and run all applicable tests and quality gates",
    ]);
  });

  it("requires Spec Refiner ambiguity, verification-mapping, and feasibility review before handoff", () => {
    expectPromptFragments("spec-refiner", [
      "until every requirement and acceptance criterion is unambiguous.",
      "For every requirement, confirm there is one clear interpretation, a corresponding acceptance criterion, and a verification method.",
      "Check the current constitution, the applicable current agent prompts, their effective file/tool permissions, and the proposed named task ownership",
      "to ensure an authorized implementer and verifier can carry out the work.",
      "If anything is ambiguous, conflicts with current rules, lacks an authorized owner/verifier, or depends on an unapproved exception",
      "stop the handoff, identify the exact blocker, and resolve it with the maintainer.",
      "Do not assume new authority or infer permissions from a prior spec.",
      "Do not call a spec agreed while any requirement remains ambiguous or lacks a feasible, authorized implementation and verification path under current rules.",
    ]);
  });

  it("keeps Dev Lead's shared-branch task lifecycle, task boundary, and decision safeguards", () => {
    expectPromptFragments("dev-lead", [
      "All Dev and QA sessions must use this same branch",
      "Orchestrate at most four active tasks.",
      "Never launch a fifth task while four are active.",
      "serialize tasks with overlapping files or dependencies on unfinished work.",
      "QA may update assigned tests and task evidence but not production code.",
      "Return defects to the same Dev for correction on the same branch",
      "Record the approved decision in the relevant planning artifact.",
      "The metadata transition is the last directory edit.",
      "Delegate all implementation, including operational Markdown and repository configuration, to Dev with exact file ownership",
    ]);
  });

  it("documents task-boundary role-specific work and QA's evidence-backed checkbox exception", () => {
    expectPromptFragments("spec-refiner", [
      "Author or substantively re-anchor only the assigned current `spec.md`",
      "does not authorize edits to any spec other than the explicitly assigned current file",
    ]);
    expectPromptFragments("dev", [
      "Implement the smallest correct change that satisfies the task within the explicitly assigned file/scope ownership.",
      "Do not write or modify tests: QA owns `tests/`.",
      "Actual edits must stay within its named files",
    ]);
    expectPromptFragments("qa", [
      "after verifying an acceptance criterion and recording its supporting evidence in the assigned task entry, change only that criterion's checkbox",
      "Never change criterion wording, spec status or metadata, or any other spec content.",
    ]);
  });

  it("preserves shared-branch, capped-task, and no-task-branch workflow boundaries", () => {
    expectPromptFragments("spec-refiner", [
      "All subsequent Dev and QA work uses that shared branch, without task/developer branches or per-task commits/pushes.",
    ]);
    expectPromptFragments("dev-lead", [
      "All Dev and QA sessions must use this same branch",
      "Orchestrate at most four active tasks.",
      "Never launch a fifth task while four are active.",
      "Serialize QA sessions when their tests or evidence files overlap.",
      "Return defects to the same Dev for correction on the same branch",
      "No task-level branches, merges, commits, or pushes are performed.",
    ]);
    expectPromptFragments("dev", [
      "Work directly on the Lead's shared `spec/[NNN]-[slug]` branch.",
      "Confirm the current branch using read-only inspection; if it differs, stop and notify the Lead rather than switching branches.",
      "Implement the smallest correct change that satisfies the task within the explicitly assigned file/scope ownership.",
      "Do not create, switch, or use task/developer branches (`dev/...`); do not merge, commit, or push.",
      "the same Dev corrects them there and returns the task to QA.",
    ]);
    expectPromptFragments("qa", [
      "Verify directly on the Lead's shared `spec/[NNN]-[slug]` branch.",
      "Confirm the current branch with read-only inspection; if it differs, stop and notify the Lead instead of switching.",
      "The Lead returns defects to the same Dev for correction on the shared branch",
      "Do not create, switch, or use task/developer branches (`dev/...`); do not merge, commit, or push.",
    ]);
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
