"use client";

import { useState } from "react";

const buttonClass =
  "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-olive hover:text-foreground";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      ok = document.execCommand("copy");
      field.remove();
    }
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">Поделиться</span>
      <a
        href={`https://vk.com/share.php?url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label="Поделиться во ВКонтакте"
      >
        ВК
      </a>
      <a
        href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label="Поделиться в Telegram"
      >
        ТГ
      </a>
      <button type="button" className={buttonClass} onClick={copy} aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку"}>
        {copied ? "Скопировано" : "Ссылка"}
      </button>
    </div>
  );
}
