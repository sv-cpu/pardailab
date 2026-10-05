import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
