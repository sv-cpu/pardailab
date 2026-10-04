import { RecordList } from "@/components/admin/ui";
import { listServices } from "@/lib/db";

export default function ServicesPage() {
  const rows = listServices()
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, "ru"))
    .map((service) => ({ slug: service.slug, title: service.name, meta: String(service.rating) }));
  return <RecordList title="Сервисы" href="/admin/services/new" rows={rows} />;
}
