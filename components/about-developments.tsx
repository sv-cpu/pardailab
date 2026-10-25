"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AboutDevelopment } from "@/lib/about.shared";
import { aboutParagraphs } from "@/lib/about.shared";

export function AboutDevelopmentGrid({ developments }: { developments: AboutDevelopment[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!developments.length) return null;

  const active = developments.find((item) => item.id === openId) ?? null;

  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="font-heading text-3xl tracking-tight">Разработки</h2>
      <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {developments.map((item) => {
          const summaryParts = aboutParagraphs(item.summary);
          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                className="group w-full cursor-pointer text-left"
                onClick={() => setOpenId(item.id)}
                aria-haspopup="dialog"
              >
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
            </li>
          );
        })}
      </ul>

      <Dialog open={Boolean(active)} onOpenChange={(next) => !next && setOpenId(null)}>
        <DialogContent
          showClose={false}
          className={[
            "flex flex-col overflow-hidden border border-border bg-background shadow-none",
            // Mobile: bottom sheet almost full-height
            "inset-x-0 bottom-0 top-[8dvh] max-h-[92dvh] w-full rounded-t-2xl",
            // Desktop: centered panel
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(80vh,720px)] sm:w-[calc(100%-3rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
          ].join(" ")}
        >
          {active ? (
            <>
              <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-3.5 sm:gap-4 sm:px-8 sm:py-5">
                <DialogTitle className="min-w-0 flex-1 font-heading text-xl leading-snug tracking-tight sm:text-2xl">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="sr-only">Подробное описание разработки</DialogDescription>
                <DialogClose className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground">
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Закрыть</span>
                </DialogClose>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pt-6 sm:pb-8">
                {active.cover ? (
                  <div className="relative mb-5 aspect-[21/9] max-h-44 overflow-hidden bg-[#f4f2ec] sm:mb-6 sm:max-h-52">
                    <Image
                      src={active.cover}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 672px, 100vw"
                      unoptimized={active.cover.startsWith("/uploads/")}
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {/* body already sanitized when saved / loaded */}
                <div className="article-html" dangerouslySetInnerHTML={{ __html: active.body }} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
