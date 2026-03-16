import type { SiteConfig } from "./site-config.types";
import { defaultSiteConfig } from "./default-site-config";
import path from "path";
import fs from "fs";

let cachedConfig: SiteConfig | null = null;

/**
 * Deep merge source into target. Arrays and primitives from source override.
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const srcVal = source[key];
    if (srcVal === undefined) continue;
    const tgtVal = result[key];
    if (
      typeof srcVal === "object" &&
      srcVal !== null &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === "object" &&
      tgtVal !== null &&
      !Array.isArray(tgtVal)
    ) {
      (result as Record<string, unknown>)[key as string] = deepMerge(
        { ...tgtVal } as object,
        srcVal as object
      );
    } else {
      (result as Record<string, unknown>)[key as string] = srcVal;
    }
  }
  return result;
}

/**
 * Load site config from JSON file path in SITE_CONFIG_JSON_FILE, merged with default (Kudan).
 * Server-only; use in layout, API routes, and server components.
 */
export function getSiteConfig(): SiteConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = process.env.SITE_CONFIG_JSON_FILE;
  if (!configPath) {
    cachedConfig = defaultSiteConfig;
    return cachedConfig;
  }

  const resolvedPath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath);

  try {
    if (fs.existsSync(resolvedPath)) {
      const raw = fs.readFileSync(resolvedPath, "utf-8");
      const loaded = JSON.parse(raw) as Partial<SiteConfig>;
      cachedConfig = deepMerge(defaultSiteConfig, loaded);
      return cachedConfig;
    }
  } catch (e) {
    console.warn("Failed to load site config from", resolvedPath, e);
  }

  cachedConfig = defaultSiteConfig;
  return cachedConfig;
}

/**
 * Clear cached config (e.g. for tests or config hot-reload in dev).
 */
export function clearSiteConfigCache(): void {
  cachedConfig = null;
}
