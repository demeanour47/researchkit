import type { Metadata, Viewport } from "next";
import { footerNavigation, primaryNavigation } from "@/config/navigation";
import { site } from "@/config/site";
import { CommandPalette, buildSearchIndex } from "@/features/search";
import { SiteFooter, SiteHeader, SiteLayout } from "@/features/site";
import { ThemeSwitcher } from "@/features/theme";
import { buttonClasses, Icon } from "@/ui";
import { DARK, LIGHT } from "@/ui/design/colors";
import { THEME_SCRIPT, themeStyleSheet } from "@/ui/design/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: LIGHT.canvas },
    { media: "(prefers-color-scheme: dark)", color: DARK.canvas },
  ],
};

const labels = {
  github: `${site.name} on GitHub`,
  version: `Version ${site.version}`,
  free: "Free to use. No account, no tracking.",
} as const;

const searchIndex = buildSearchIndex();

function GitHubLink() {
  return (
    <a href={site.repository} aria-label={labels.github} title={labels.github} className={buttonClasses("ghost", "sm", true)}>
      <Icon name="git-branch" />
    </a>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script may set data-theme before React hydrates.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <style id="design-tokens" dangerouslySetInnerHTML={{ __html: themeStyleSheet() }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="h-full">
        <SiteLayout
          header={
            <SiteHeader
              brand={{ name: site.name, href: "/", badge: `v${site.version}`, badgeLabel: labels.version }}
              navItems={primaryNavigation}
              actions={<CommandPalette items={searchIndex} />}
              secondaryActions={
                <>
                  <ThemeSwitcher name="theme-header" />
                  <GitHubLink />
                </>
              }
              menuActions={
                <>
                  <ThemeSwitcher name="theme-menu" showLabels />
                  <GitHubLink />
                </>
              }
            />
          }
          footer={
            <SiteFooter groups={footerNavigation} about={{ name: site.name, text: site.description }}>
              <p>{labels.free}</p>
              <p className="tabular-nums">{labels.version}</p>
            </SiteFooter>
          }
        >
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
