import { aboutParagraphs } from "@/lib/about.shared";

export function AboutCopy({ text, className }: { text: string; className?: string }) {
  const parts = aboutParagraphs(text);
  if (!parts.length) return null;
  return (
    <div className={className}>
      {parts.map((part, index) => (
        <p key={`${index}-${part.slice(0, 24)}`} className="mt-5 font-serif text-lg leading-8 text-pretty first:mt-0">
          {part}
        </p>
      ))}
    </div>
  );
}
