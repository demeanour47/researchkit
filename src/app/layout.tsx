import type { Metadata } from "next";
import { footerNavigation, primaryNavigation } from "@/config/navigation";
import { site } from "@/config/site";
import { SiteFooter, SiteHeader, SiteLayout } from "@/features/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <SiteLayout
          header={
            <SiteHeader brand={{ name: site.name, href: "/" }} navItems={primaryNavigation} />
          }
          footer={<SiteFooter groups={footerNavigation} />}
        >
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
