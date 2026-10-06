"use client";

import { useEffect, useRef, useState } from "react";

const size = 640;

function cropSquare(file: File) {
  return new Promise<File>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Не удалось подготовить фото."));
        return;
      }
      const scale = Math.max(size / image.width, size / image.height);
      const drawnWidth = image.width * scale;
      const drawnHeight = image.height * scale;
      context.drawImage(image, (size - drawnWidth) / 2, (size - drawnHeight) / 2, drawnWidth, drawnHeight);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Не удалось подготовить фото."));
            return;
          }
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Этот файл не открывается. Выберите JPEG, PNG или WebP."));
    };
    image.src = url;
  });
}

function initialOf(value: string) {
  const letter = value.trim().slice(0, 1);
  return letter ? letter.toLocaleUpperCase("ru-RU") : "?";
}

export function AvatarField({
  photo,
  fallback,
  onPreview,
}: {
  photo?: string;
  fallback: string;
  onPreview?: (preview: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const blob = useRef<string | null>(null);
  const [image, setImage] = useState(photo ?? "");
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (blob.current) URL.revokeObjectURL(blob.current);
    },
    [],
  );

  function show(next: string) {
    if (blob.current && blob.current !== next) URL.revokeObjectURL(blob.current);
    blob.current = next.startsWith("blob:") ? next : null;
    setImage(next);
    onPreview?.(next);
  }

  return (
    <div className="grid gap-3">
      <div className="grid size-28 place-items-center overflow-hidden rounded-full border border-border bg-olive-soft text-olive">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-heading text-3xl">{initialOf(fallback)}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm hover:border-olive"
          onClick={() => input.current?.click()}
        >
          {image ? "Заменить фото" : "Выбрать фото"}
        </button>
        {image ? (
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (input.current) input.current.value = "";
              setRemoved(true);
              setError("");
              show("");
            }}
          >
            Убрать
          </button>
        ) : null}
      </div>
      <input
        ref={input}
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const cropped = await cropSquare(file);
            const transfer = new DataTransfer();
            transfer.items.add(cropped);
            event.target.files = transfer.files;
            setRemoved(false);
            setError("");
            show(URL.createObjectURL(cropped));
          } catch (reason) {
            event.target.value = "";
            setError(reason instanceof Error ? reason.message : "Не удалось прочитать файл.");
          }
        }}
      />
      <input type="hidden" name="removePhoto" value={removed ? "1" : "0"} />
      <p className="max-w-xs text-sm text-muted-foreground">Квадрат 640×640. Подойдут JPEG, PNG и WebP, до 8 МБ.</p>
      {error ? <p className="text-sm text-olive-deep">{error}</p> : null}
    </div>
  );
}
