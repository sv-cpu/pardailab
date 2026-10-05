"use client";

import { useState } from "react";

const width = 1600;
const height = 900;

function cropToWide(file: File) {
  return new Promise<File>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Не удалось подготовить кадр."));
        return;
      }
      const scale = Math.max(width / image.width, height / image.height);
      const drawnWidth = image.width * scale;
      const drawnHeight = image.height * scale;
      context.drawImage(image, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Не удалось подготовить кадр."));
            return;
          }
          resolve(new File([blob], "cover.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Файл не открывается как изображение."));
    };
    image.src = url;
  });
}

export function CoverField({ preview }: { preview: string }) {
  const [image, setImage] = useState(preview);
  const [error, setError] = useState("");

  return (
    <div className="grid min-w-0 gap-3">
      <span className="text-sm text-muted-foreground">Обложка, 16:9</span>
      <div className="relative aspect-video w-40 overflow-hidden border border-border bg-card sm:w-52">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">Обложка не загружена</p>
        )}
      </div>
      <input
        name="coverFile"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="max-w-full text-sm"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const cropped = await cropToWide(file);
            const transfer = new DataTransfer();
            transfer.items.add(cropped);
            event.target.files = transfer.files;
            setImage(URL.createObjectURL(cropped));
            setError("");
          } catch (reason) {
            event.target.value = "";
            setError(reason instanceof Error ? reason.message : "Не удалось прочитать файл.");
          }
        }}
      />
      <p className="text-sm text-muted-foreground">Кадр сохранится как 1600×900. Лишнее по краям обрежется.</p>
      {error ? <p className="text-sm text-olive-deep">{error}</p> : null}
    </div>
  );
}
