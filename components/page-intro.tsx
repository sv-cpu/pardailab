export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.12] tracking-tight text-balance sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{lede}</p>
    </div>
  );
}
