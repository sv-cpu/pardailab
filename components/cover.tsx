import Image from "next/image";

import { cn } from "@/lib/utils";

export function Cover({
  id,
  src,
  alt,
  priority = false,
  className,
}: {
  id: number;
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const index = ((id % 6) + 6) % 6;
  const image = src || `/covers/cover-${index}.svg`;
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-[#f4f2ec]", className)}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 720px, 100vw"
        priority={priority}
        unoptimized={image.startsWith("/uploads/")}
        className="object-cover"
      />
    </div>
  );
}
