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

export function CoverField({ preview, uploaded }: { preview: string; uploaded: boolean }) {
  const [image, setImage] = useState(preview);
  const [error, setError] = useState("");

  return (
    <div className="grid gap-3 sm:col-span-2">
      <span className="text-sm text-muted-foreground">Обложка, 16:9</span>
      <div className="relative aspect-video overflow-hidden border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="size-full object-cover" />
      </div>
      <input
        name="coverFile"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="text-sm"
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
      {uploaded ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="clearCover" />
          Убрать загруженную обложку и вернуть готовую
        </label>
      ) : null}
      {error ? <p className="text-sm text-olive-deep">{error}</p> : null}
    </div>
  );
}
