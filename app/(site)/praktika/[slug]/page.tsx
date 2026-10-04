import { ArticleRoute, articleMetadata, articleStaticParams } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articleStaticParams("practice");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return articleMetadata("practice", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="practice" slug={slug} />;
}
