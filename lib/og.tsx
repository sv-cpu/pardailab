import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { getArticles } from "@/lib/cms";
import { kindLabel } from "@/lib/paths";
import type { ArticleKind } from "@/lib/types";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

let fontPromise: Promise<Buffer> | null = null;

function font() {
  fontPromise ??= readFile(path.join(process.cwd(), "assets/fonts/IBMPlexSans-Medium.ttf"));
  return fontPromise;
}

function shorten(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export async function renderOg(kicker: string, title: string) {
  const plex = await font();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6f5f2",
          color: "#1a1c19",
          padding: "72px",
          fontFamily: "Plex",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 3, color: "#3f4f28" }}>{kicker}</div>
          <div style={{ display: "flex", width: 28, height: 28, background: "#3f4f28" }} />
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, letterSpacing: -1 }}>{shorten(title, 110)}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#5c6158" }}>PardAiLabs</div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [{ name: "Plex", data: plex, weight: 500, style: "normal" }],
    },
  );
}

export async function articleOg(kind: ArticleKind, slug: string) {
  const articles = await getArticles();
  const article = articles.find((item) => item.kind === kind && item.slug === slug);
  if (!article) return renderOg("PARDAILABS", "Практический искусственный интеллект");
  const kicker = article.research ? `ИССЛЕДОВАНИЕ №${article.research.number}` : kindLabel[kind].toUpperCase();
  return renderOg(kicker, article.title);
}
