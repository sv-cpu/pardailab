import { ArticleRoute, articleMetadata, articleStaticParams } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articleStaticParams("news");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return articleMetadata("news", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="news" slug={slug} />;
}
