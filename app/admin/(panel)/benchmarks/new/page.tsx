import { BenchmarkEditor } from "@/components/admin/benchmark-editor";
import { Notice } from "@/components/admin/ui";
import { draftFromLatest } from "@/lib/benchmarks";
import { listModels } from "@/lib/db";
import { requireEditor } from "@/lib/users";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  return (
    <div className="grid gap-5">
      <h1 className="font-heading text-4xl tracking-tight">Новый бенчмарк</h1>
      <Notice error={query.error} />
      <BenchmarkEditor issue={draftFromLatest()} catalog={listModels()} />
    </div>
  );
}
