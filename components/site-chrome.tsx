import { ConsultantSlot } from "@/components/consultant-slot";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { websiteJsonLd } from "@/lib/seo";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-olive focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        К содержанию
      </a>
      <SiteHeader />
      <main id="content">{children}</main>
      <SiteFooter />
      <ConsultantSlot />
    </>
  );
}
