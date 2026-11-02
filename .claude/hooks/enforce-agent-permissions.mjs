#!/usr/bin/env node
/**
 * PreToolUse hook that enforces `.claude/agent-permissions.json` for the custom
 * agents in `.claude/agents/`.
 *
 * Rules are ordered and the last matching rule wins. Sessions without a custom
 * agent get no decision, so the normal Claude Code permission flow applies.
 *
 * This guards the file tools and the command text Claude writes. It is not a
 * sandbox: indirect writes through Bash remain prohibited by the agent prompts.
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const EDIT_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);

// `*` and `**` both cross `/`; a leading double-star directory also matches zero directories.
export function matchesResource(pattern, resource) {
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
      expression += ".*";
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }
  return new RegExp(`${expression}$`, "s").test(resource);
}

/** Returns the effect of the last matching rule, or undefined when none match. */
export function effectivePermission(rules, action, resource) {
  let effect;
  for (const rule of rules) {
    if (rule.action === action && matchesResource(rule.resource, resource)) {
      effect = rule.effect;
    }
  }
  return effect;
}

/**
 * Splits a command into the fragments to evaluate. Quotes and subshell markers
 * also split, so `sh -c "git commit"` is caught; a quoted mention may therefore
 * be denied too, which errs on the safe side.
 */
export function commandSegments(command) {
  return command
    .replace(/\d*>&\d+/g, " ")
    .split(/[;|&\n()`"']+/)
    .map((segment) =>
      segment
        .trim()
        .replace(/^(?:\w+=\S*\s+)+/, "")
        .replace(/^(?:(?:env|command|exec|nohup|time|sudo)\s+)+/, "")
        .replace(/^(?:\w+=\S*\s+)+/, ""),
    )
    .filter((segment) => segment.length > 0 && segment !== "$");
}

/** Resolves symlinks, using the closest existing ancestor for new files. */
function resolveRealPath(path) {
  let existing = path;
  const missing = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) break;
    missing.unshift(basename(existing));
    existing = parent;
  }
  return join(realpathSync(existing), ...missing);
}

/** Returns the repo-relative real path, or null when it is outside the repo. */
export function toRepoPath(projectDir, cwd, filePath) {
  const absolute = isAbsolute(filePath) ? filePath : resolve(cwd, filePath);
  const path = relative(realpathSync(projectDir), resolveRealPath(absolute));
  if (path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) {
    return null;
  }
  return path.split(sep).join("/");
}

/** Decides a tool call: "allow", "deny", or undefined for no decision. */
export function decide(rules, input, projectDir) {
  const { tool_name: toolName, tool_input: toolInput = {} } = input;

  if (EDIT_TOOLS.has(toolName)) {
    const filePath = toolInput.file_path ?? toolInput.notebook_path;
    if (typeof filePath !== "string") return "deny";
    const path = toRepoPath(projectDir, input.cwd ?? projectDir, filePath);
    return path === null ? undefined : effectivePermission(rules, "edit", path);
  }

  if (toolName === "Bash") {
    if (typeof toolInput.command !== "string") return "deny";
    const effects = commandSegments(toolInput.command).map((segment) =>
      effectivePermission(rules, "shell", segment),
    );
    if (effects.includes("deny")) return "deny";
    return effects.length > 0 && effects.every((effect) => effect === "allow")
      ? "allow"
      : undefined;
  }

  return undefined;
}

function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    block("Agent permissions: could not parse the hook input.");
  }

  const projectDir =
    process.env.CLAUDE_PROJECT_DIR ??
    resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const agent = input.agent_type;

  if (
    typeof agent !== "string" ||
    agent !== basename(agent) ||
    !existsSync(join(projectDir, ".claude", "agents", `${agent}.md`))
  ) {
    return;
  }

  let rules;
  try {
    rules = JSON.parse(
      readFileSync(
        join(projectDir, ".claude", "agent-permissions.json"),
        "utf8",
      ),
    )[agent];
  } catch {
    block("Agent permissions: could not read .claude/agent-permissions.json.");
  }
  if (!Array.isArray(rules)) {
    block(`Agent permissions: no rules are defined for ${agent}.`);
  }

  const decision = decide(rules, input, projectDir);
  if (decision === "deny") {
    block(
      `Agent permissions: ${agent} may not perform this ${input.tool_name} call.`,
    );
  }
  if (decision === "allow") {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "allow",
          permissionDecisionReason: `Allowed by the ${agent} rules.`,
        },
      }),
    );
  }
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
