"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: ReactNode;
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45" />
      <DialogPrimitive.Content className={cn("fixed z-50 outline-none", className)}>
        {children}
        {showClose ? (
          <DialogPrimitive.Close className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground sm:top-4 sm:right-4">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Закрыть</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
