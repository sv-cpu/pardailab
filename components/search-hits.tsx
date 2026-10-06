import Link from "next/link";

import { highlightParts, type SearchHit } from "@/lib/search";

export function Highlight({ text, query }: { text: string; query: string }) {
  return highlightParts(text, query).map((part, index) =>
    part.match ? (
      <mark key={index} className="bg-olive-soft text-inherit">
        {part.text}
      </mark>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
}

export function SearchHitList({ hits, query }: { hits: SearchHit[]; query: string }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {hits.map((hit) => (
        <li key={hit.href}>
          <Link href={hit.href} className="block py-5 hover:text-olive">
            <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{hit.kind}</p>
            <h2 className="mt-2 font-heading text-2xl">
              <Highlight text={hit.title} query={query} />
            </h2>
            {hit.snippet ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                <Highlight text={hit.snippet} query={query} />
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
