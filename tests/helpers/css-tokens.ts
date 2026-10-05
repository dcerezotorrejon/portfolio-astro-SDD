import { readFileSync } from "node:fs";

/**
 * Minimal CSS custom-property engine used by the source-contract tests.
 *
 * It parses `:root` token declarations (including the overrides inside media
 * queries) and recursively resolves `var()` references so tests can assert
 * the *actual* values a token chain produces — instead of fragile literal
 * hex/length regexes. Resolution fails loudly on missing tokens and cycles,
 * which is exactly the failure mode the T10 three-layer refactor must not
 * introduce.
 */

export type TokenMap = Map<string, string>;

export interface StylesheetTokens {
  /** `:root` declarations outside media queries (later wins). */
  base: TokenMap;
  /** Media-query condition → `:root` declarations declared inside it. */
  media: Map<string, TokenMap>;
}

/** Collapses whitespace and trims, so `1px  solid` and `1px solid` compare equal. */
export function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Extracts `--name: value;` declarations from a declaration block. */
function parseDeclarations(block: string): TokenMap {
  const tokens: TokenMap = new Map();
  // Strip comments first: they contain no ';' so they would otherwise glue
  // themselves to the declaration that follows and break the anchor match.
  const declarations = block.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const declaration of declarations.split(";")) {
    const match = declaration.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]*)$/);

    if (match) {
      tokens.set(match[1], match[2].trim());
    }
  }

  return tokens;
}

/**
 * Scans `css` for `opener`-prefixed blocks and returns their inner text,
 * skipping nested braces (media blocks contain rule blocks).
 */
function findBlocks(css: string, opener: RegExp): string[] {
  const blocks: string[] = [];
  let index = 0;

  while (index < css.length) {
    const opening = css.slice(index).search(opener);

    if (opening === -1) break;

    const start = index + opening;
    const openBrace = css.indexOf("{", start);

    if (openBrace === -1) break;

    let depth = 1;
    let cursor = openBrace + 1;

    while (depth > 0 && cursor < css.length) {
      const char = css[cursor];

      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      cursor += 1;
    }

    blocks.push(css.slice(openBrace + 1, cursor - 1));

    index = cursor;
  }

  return blocks;
}

export function extractTokens(css: string): StylesheetTokens {
  const base: TokenMap = new Map();
  const media = new Map<string, TokenMap>();

  // Remove media blocks first so their `:root` overrides stay out of `base`.
  let topLevel = "";
  let index = 0;

  while (index < css.length) {
    const atMedia = css.slice(index).search(/@media[^{]*\{/);

    if (atMedia === -1) {
      topLevel += css.slice(index);
      break;
    }

    const start = index + atMedia;
    const openBrace = css.indexOf("{", start);
    const condition = css.slice(start, openBrace).trim();
    let depth = 1;
    let cursor = openBrace + 1;

    while (depth > 0 && cursor < css.length) {
      const char = css[cursor];

      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      cursor += 1;
    }

    const body = css.slice(openBrace + 1, cursor - 1);
    const overrides: TokenMap = media.get(condition) ?? new Map();

    for (const rootBlock of findBlocks(body, /:root\b/)) {
      for (const [name, value] of parseDeclarations(rootBlock)) {
        overrides.set(name, value);
      }
    }

    if (overrides.size > 0) {
      media.set(condition, overrides);
    }

    topLevel += css.slice(index, start);
    index = cursor;
  }

  for (const rootBlock of findBlocks(topLevel, /:root\b/)) {
    for (const [name, value] of parseDeclarations(rootBlock)) {
      base.set(name, value);
    }
  }

  return { base, media };
}

export function readStylesheetTokens(path: string): StylesheetTokens {
  return extractTokens(readFileSync(path, "utf8"));
}

/**
 * Recursively substitutes `var(--token)` references in `value`.
 *
 * `stack` carries the chain currently being resolved; re-entering a token
 * throws (cycle). Referencing an unknown token throws unless the `var()`
 * carries its own fallback literal.
 */
export function resolveValue(
  value: string,
  tokens: TokenMap,
  stack: string[] = [],
): string {
  return value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g,
    (_match, name: string, fallback?: string) => {
      if (stack.includes(name)) {
        throw new Error(
          `Token cycle detected: ${[...stack, name].join(" → ")}`,
        );
      }

      const declared = tokens.get(name);

      if (declared === undefined) {
        if (fallback !== undefined) {
          return resolveValue(fallback.trim(), tokens, [...stack, name]);
        }

        throw new Error(
          `Unresolved token: ${name} (chain: ${
            stack.length > 0 ? stack.join(" → ") : "root"
          })`,
        );
      }

      return resolveValue(declared, tokens, [...stack, name]);
    },
  );
}

/** Resolves a named token to its final value, failing on missing tokens/cycles. */
export function resolveToken(name: string, tokens: StylesheetTokens): string {
  const declared = tokens.base.get(name);

  if (declared === undefined) {
    throw new Error(`Token not declared in :root: ${name}`);
  }

  return normalizeSpaces(resolveValue(declared, tokens.base));
}

/**
 * Resolves a declaration found in a rule body (e.g. `width` inside
 * `.site-container`) against the token map, so tests can compare against
 * the value the browser would compute.
 */
export function resolveDeclaration(
  ruleBody: string,
  property: string,
  tokens: StylesheetTokens,
): string {
  const match = ruleBody.match(
    new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;]+);`),
  );

  if (!match) {
    throw new Error(`Declaration not found: ${property}`);
  }

  return normalizeSpaces(resolveValue(match[1], tokens.base));
}

/** Resolves a token under a media query's overrides (e.g. the 768px gutter). */
export function resolveMediaToken(
  name: string,
  condition: string,
  tokens: StylesheetTokens,
): string {
  const overrides = tokens.media.get(condition);

  if (!overrides?.has(name)) {
    throw new Error(
      `Token ${name} is not overridden in media query: ${condition}`,
    );
  }

  const merged: TokenMap = new Map([...tokens.base, ...overrides]);

  return normalizeSpaces(resolveValue(overrides.get(name)!, merged));
}
