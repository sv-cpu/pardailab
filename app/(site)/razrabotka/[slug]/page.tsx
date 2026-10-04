import { ArticleRoute, articleMetadata, articleStaticParams } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articleStaticParams("development");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return articleMetadata("development", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="development" slug={slug} />;
}
