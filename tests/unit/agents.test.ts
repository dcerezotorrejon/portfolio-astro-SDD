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

function deniesEditOf(agent: AgentFile, resource: string): boolean {
  return agent.permissions.some(
    (rule) =>
      rule.action === "edit" &&
      rule.resource === resource &&
      rule.effect === "deny",
  );
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

  it("uses the expected mode and model for each agent", () => {
    expect(agents.get("spec-refiner")).toMatchObject({
      mode: "primary",
      model: "openrouter/openrouter/auto#medium",
    });
    expect(agents.get("dev-lead")).toMatchObject({
      mode: "primary",
      model: "openrouter/openrouter/auto#high",
    });
    expect(agents.get("dev")).toMatchObject({
      mode: "subagent",
      model: "openrouter/openrouter/auto#medium",
    });
    expect(agents.get("qa")).toMatchObject({
      mode: "subagent",
      model: "openrouter/openrouter/auto#medium",
    });
  });

  it.each([...agents.values()])(
    "$id routes through the Auto Router",
    (agent) => {
      expect(agent.model).toMatch(/^openrouter\/openrouter\/auto#/);
    },
  );

  it.each([...agents.values()])(
    "$id documents its reasoning intent",
    (agent) => {
      expect(agent.body).toContain("## Model intent");
      expect(agent.body).toMatch(/reasoning effort/i);
    },
  );

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

  it("restricts edits by role", () => {
    // Dev owns src, not tests; QA owns tests, not src.
    expect(deniesEditOf(agents.get("dev")!, "tests/**")).toBe(true);
    expect(deniesEditOf(agents.get("qa")!, "src/**")).toBe(true);
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

  it("amends the constitution with spec relationships and version 1.3.0", () => {
    expect(constitution).toContain("**Version**: 1.3.0");
    expect(constitution).toContain("### 4.2 Spec relationships");
    expect(constitution).toContain("Related specs");
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
