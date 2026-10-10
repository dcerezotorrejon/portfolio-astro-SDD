import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Structural verification for the GitHub Pages deployment workflow.
 *
 * The repository does not depend on a YAML parser, so the workflow is read with
 * a tiny indentation-based reader that supports the small subset used here
 * (nested mappings, block sequences, inline lists, and scalars). This mirrors
 * the local frontmatter parser already used in `agents.test.ts` instead of
 * adding a new dependency.
 */

type YamlValue = string | YamlValue[] | { [key: string]: YamlValue };
type YamlMap = { [key: string]: YamlValue };

interface Line {
  indent: number;
  content: string;
}

const KEY_VALUE = /^([^:]+):(?:\s+(.*))?$/;

function toLines(raw: string): Line[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => ({
      indent: line.length - line.trimStart().length,
      content: line.trim(),
    }))
    .filter((line) => line.content !== "" && !line.content.startsWith("#"));
}

function parseScalar(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseInline(raw: string): YamlValue {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();

    return inner === ""
      ? []
      : inner.split(",").map((item) => parseScalar(item));
  }

  return parseScalar(trimmed);
}

function parseBlock(
  lines: Line[],
  start: number,
  indent: number,
): [YamlValue, number] {
  if (lines[start]?.content.startsWith("- ")) {
    const items: YamlValue[] = [];
    let index = start;

    while (
      index < lines.length &&
      lines[index].indent === indent &&
      lines[index].content.startsWith("- ")
    ) {
      const rest = lines[index].content.slice(2);
      const itemIndent = indent + 2;
      const itemLines: Line[] = [{ indent: itemIndent, content: rest }];
      let next = index + 1;

      while (next < lines.length && lines[next].indent > indent) {
        itemLines.push(lines[next]);
        next += 1;
      }

      if (KEY_VALUE.test(rest.trim())) {
        items.push(parseBlock(itemLines, 0, itemIndent)[0]);
      } else {
        items.push(parseScalar(rest));
      }

      index = next;
    }

    return [items, index];
  }

  const map: YamlMap = {};
  let index = start;

  while (index < lines.length && lines[index].indent === indent) {
    const match = KEY_VALUE.exec(lines[index].content);
    if (!match) break;

    const key = match[1].trim();
    const rest = (match[2] ?? "").trim();
    index += 1;

    if (rest !== "") {
      map[key] = parseInline(rest);
    } else if (index < lines.length && lines[index].indent > indent) {
      const [child, next] = parseBlock(lines, index, lines[index].indent);
      map[key] = child;
      index = next;
    } else {
      map[key] = "";
    }
  }

  return [map, index];
}

function parseWorkflow(raw: string): YamlMap {
  return parseBlock(toLines(raw), 0, 0)[0] as YamlMap;
}

function asMap(value: YamlValue | undefined): YamlMap {
  return (value ?? {}) as YamlMap;
}

function asArray(value: YamlValue | undefined): YamlValue[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: YamlValue | undefined): string {
  return typeof value === "string" ? value : "";
}

const workflowText = readFileSync(
  new URL("../../.github/workflows/deploy.yml", import.meta.url),
  "utf8",
);
const workflow = parseWorkflow(workflowText);

const jobs = asMap(workflow.jobs);
const jobNames = Object.keys(jobs);
const job = asMap(jobs[jobNames[0]]);
const steps = asArray(job.steps).map((step) => asMap(step));

function withOptions(step: YamlMap): YamlMap {
  return asMap(step.with);
}

function indexOfRun(command: string): number {
  return steps.findIndex((step) => asString(step.run) === command);
}

function indexOfUses(action: string): number {
  return steps.findIndex((step) => asString(step.uses) === action);
}

const GATE_COMMANDS = [
  "pnpm lint",
  "pnpm format:check",
  "pnpm build",
  "pnpm test:run",
  "pnpm test:a11y",
  "pnpm test:integration",
] as const;

describe("GitHub Pages deployment workflow", () => {
  it("declares a single job that deploys to the github-pages environment", () => {
    expect(jobNames).toEqual(["build"]);
    const environment = asMap(job.environment);
    expect(asString(environment.name)).toBe("github-pages");
  });

  it("triggers only on push to main and no other event", () => {
    const on = asMap(workflow.on);
    const push = asMap(on.push);

    expect(Object.keys(on)).toEqual(["push"]);
    expect(Object.keys(push)).toEqual(["branches"]);
    expect(asArray(push.branches)).toEqual(["main"]);
    expect(workflowText).not.toMatch(
      /pull_request|workflow_dispatch|schedule:|repository_dispatch|workflow_call/,
    );
  });

  it("declares the exact Pages permissions", () => {
    expect(asMap(workflow.permissions)).toEqual({
      contents: "read",
      pages: "write",
      "id-token": "write",
    });
  });

  it("uses a non-cancelling Pages concurrency group", () => {
    const concurrency = asMap(workflow.concurrency);
    expect(asString(concurrency.group)).toBe("pages");
    expect(asString(concurrency["cancel-in-progress"])).toBe("false");
  });

  it("installs with the frozen lockfile and Chromium before the gates", () => {
    expect(steps.map((step) => asString(step.run))).toContain(
      "pnpm install --frozen-lockfile",
    );

    const chromiumIndex = indexOfRun(
      "pnpm exec playwright install --with-deps chromium",
    );
    expect(chromiumIndex).toBeGreaterThanOrEqual(0);
    expect(chromiumIndex).toBeLessThan(indexOfRun("pnpm lint"));
  });

  it("sets up pnpm 10 and Node 22 with the pnpm cache", () => {
    const pnpmSetup = steps.find(
      (step) => asString(step.uses) === "pnpm/action-setup@v4",
    );
    const setupNode = steps.find(
      (step) => asString(step.uses) === "actions/setup-node@v4",
    );

    expect(pnpmSetup, "pnpm/action-setup step").toBeDefined();
    expect(asString(withOptions(pnpmSetup as YamlMap).version)).toBe("10");
    expect(setupNode, "actions/setup-node step").toBeDefined();
    expect(asString(withOptions(setupNode as YamlMap)["node-version"])).toBe(
      "22",
    );
    expect(asString(withOptions(setupNode as YamlMap).cache)).toBe("pnpm");
  });

  it("runs every quality gate in order with build before test:run", () => {
    for (const command of GATE_COMMANDS) {
      expect(indexOfRun(command), command).toBeGreaterThanOrEqual(0);
    }

    for (let index = 1; index < GATE_COMMANDS.length; index += 1) {
      const previous = GATE_COMMANDS[index - 1];
      const current = GATE_COMMANDS[index];

      expect(
        indexOfRun(previous),
        `${previous} must run before ${current}`,
      ).toBeLessThan(indexOfRun(current));
    }

    expect(indexOfRun("pnpm build")).toBeLessThan(indexOfRun("pnpm test:run"));
  });

  it("pins every action to a major tag in the required order", () => {
    const uses = steps
      .map((step) => asString(step.uses))
      .filter((value) => value !== "");

    expect(uses).toEqual([
      "actions/checkout@v4",
      "pnpm/action-setup@v4",
      "actions/setup-node@v4",
      "actions/configure-pages@v5",
      "actions/upload-pages-artifact@v3",
      "actions/deploy-pages@v4",
    ]);

    for (const action of uses) {
      expect(action, `${action} must pin a major version tag`).toMatch(
        /@v\d+$/,
      );
    }
  });

  it("enables Pages and uploads dist only after all gates pass", () => {
    const configureIndex = indexOfUses("actions/configure-pages@v5");
    const uploadIndex = indexOfUses("actions/upload-pages-artifact@v3");

    expect(configureIndex).toBeGreaterThan(indexOfRun("pnpm test:integration"));
    expect(withOptions(steps[configureIndex]).enablement).toBe("true");
    expect(uploadIndex).toBeGreaterThan(configureIndex);
    expect(asString(withOptions(steps[uploadIndex]).path)).toBe("./dist");
  });

  it("deploys with actions/deploy-pages and exposes the deployed URL", () => {
    const deployIndex = indexOfUses("actions/deploy-pages@v4");
    const uploadIndex = indexOfUses("actions/upload-pages-artifact@v3");

    expect(deployIndex).toBeGreaterThan(uploadIndex);
    expect(asString(steps[deployIndex].id)).toBe("deployment");
    expect(
      asString(asMap(job.environment).url),
      "environment url must expose the deployed URL",
    ).toBe("${{ steps.deployment.outputs.page_url }}");
    expect(asString(asMap(job.outputs).page_url)).toBe(
      "${{ steps.deployment.outputs.page_url }}",
    );
  });
});
