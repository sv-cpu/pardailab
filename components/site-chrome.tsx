import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { toSearchRecords } from "@/lib/search";
import { websiteJsonLd } from "@/lib/seo";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [articles, services, models] = await Promise.all([getArticles(), getServices(), getModels()]);
  const records = toSearchRecords({ articles, services, models });
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-olive focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        К содержанию
      </a>
      <SiteHeader records={records} />
      <main id="content">{children}</main>
      <SiteFooter />
    </>
  );
}
