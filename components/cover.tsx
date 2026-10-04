import Image from "next/image";

import { cn } from "@/lib/utils";

export function Cover({
  id,
  alt,
  priority = false,
  className,
}: {
  id: number;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const index = ((id % 6) + 6) % 6;
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-[#f4f2ec]", className)}>
      <Image
        src={`/covers/cover-${index}.svg`}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 720px, 100vw"
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
