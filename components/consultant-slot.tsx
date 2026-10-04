import { Consultant } from "@/components/consultant";
import { getArticles, getModels, getServices, toIndex } from "@/lib/cms";

export async function ConsultantSlot() {
  const [models, services, articles] = await Promise.all([getModels(), getServices(), getArticles()]);
  return <Consultant catalog={{ models, services, articles: toIndex(articles) }} />;
}
