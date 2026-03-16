import type { ThemeColors } from "@/lib/site-config.types";

interface ThemeVarsStyleProps {
  colors?: ThemeColors | null;
}

/**
 * Injects CSS custom properties for brand theme from site config.
 * Renders nothing if no theme colors are provided (defaults from globals.css apply).
 */
export function ThemeVarsStyle({ colors }: ThemeVarsStyleProps) {
  if (!colors?.brand) return null;

  const vars: string[] = [];
  if (colors.brand) vars.push(`--brand: ${colors.brand};`);
  if (colors.brandHover) vars.push(`--brand-hover: ${colors.brandHover};`);
  if (colors.brandDark) vars.push(`--brand-dark: ${colors.brandDark};`);
  if (colors.brandMuted) vars.push(`--brand-muted: ${colors.brandMuted};`);
  if (colors.brandForeground) vars.push(`--brand-foreground: ${colors.brandForeground};`);
  if (colors.brandMutedForeground) vars.push(`--brand-muted-foreground: ${colors.brandMutedForeground};`);

  if (vars.length === 0) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${vars.join(" ")} }`,
      }}
    />
  );
}
