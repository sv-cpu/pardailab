import Link from "next/link";

import { Mark } from "@/components/mark";
import { SiteMenu, SiteNav } from "@/components/site-nav";
import { SiteSearch } from "@/components/site-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { aboutDirectionHref, getAboutLab } from "@/lib/about";
import type { MenuRubric } from "@/lib/rubrics";
import { menuRubrics } from "@/lib/rubrics";
import type { SearchRecord } from "@/lib/search";

export { Mark };

function aboutMenu(): MenuRubric {
  const about = getAboutLab();
  return {
    slug: "o-nas",
    name: "О нас",
    href: "/o-nas",
    children: about.directions.map((item) => ({
      slug: item.slug,
      name: item.title,
      href: aboutDirectionHref(item.slug),
    })),
  };
}

export function SiteHeader({ records }: { records: SearchRecord[] }) {
  const rubrics = menuRubrics();
  const about = aboutMenu();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="h-1 bg-olive" />
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-olive">
          <Mark className="size-8" />
          <span className="font-heading text-xl tracking-tight text-foreground">
            PardAi<span className="text-olive">Lab</span>
          </span>
        </Link>
        <SiteNav rubrics={rubrics} about={about} />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SiteMenu rubrics={rubrics} about={about} />
          <SiteSearch records={records} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
