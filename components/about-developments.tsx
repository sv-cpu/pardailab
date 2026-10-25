"use client";

import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AboutDevelopment } from "@/lib/about.shared";
import { aboutParagraphs } from "@/lib/about.shared";

export function AboutDevelopmentGrid({ developments }: { developments: AboutDevelopment[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!developments.length) return null;

  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="font-heading text-3xl tracking-tight">Разработки</h2>
      <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {developments.map((item) => {
          const open = openId === item.id;
          const summaryParts = aboutParagraphs(item.summary);
          return (
            <li key={item.id} className="min-w-0">
              <Dialog open={open} onOpenChange={(next) => setOpenId(next ? item.id : null)}>
                <DialogTrigger asChild>
                  <button type="button" className="group w-full cursor-pointer text-left">
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f2ec]">
                      <Image
                        src={item.cover}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                        unoptimized={item.cover.startsWith("/uploads/")}
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <h3 className="mt-4 font-heading text-2xl tracking-tight group-hover:text-olive">{item.title}</h3>
                    <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {summaryParts.map((part, index) => (
                        <p key={`${item.id}-s-${index}`}>{part}</p>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-olive">Подробнее</p>
                  </button>
                </DialogTrigger>
                <DialogContent className="inset-x-4 top-[8vh] mx-auto max-h-[84vh] w-full max-w-3xl p-6 sm:inset-x-auto sm:p-10">
                  <DialogTitle className="pr-12 font-heading text-3xl tracking-tight sm:text-4xl">{item.title}</DialogTitle>
                  <DialogDescription className="sr-only">Подробное описание разработки</DialogDescription>
                  {item.cover ? (
                    <div className="relative mt-6 aspect-[16/9] overflow-hidden bg-[#f4f2ec]">
                      <Image
                        src={item.cover}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 720px, 100vw"
                        unoptimized={item.cover.startsWith("/uploads/")}
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  {/* body already sanitized when saved / loaded */}
                  <div className="article-html mt-6" dangerouslySetInnerHTML={{ __html: item.body }} />
                </DialogContent>
              </Dialog>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
