import Link from "next/link";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export function NotFoundView() {
  return (
    <Container className="py-24">
      <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">404</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">Такой страницы в лаборатории нет</h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Проверьте адрес или вернитесь к материалам, рейтингу и каталогу.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </Container>
  );
}
