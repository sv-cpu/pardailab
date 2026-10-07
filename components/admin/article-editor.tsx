"use client";

import { useEffect, useRef, useState } from "react";

import { uploadArticleMedia } from "@/app/admin/media-actions";
import { imageMaxBytes, isStoredMedia, videoMaxBytes } from "@/lib/media-path";

export function ArticleEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const snippetRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const htmlSelRef = useRef<{ start: number; end: number } | null>(null);
  const modeRef = useRef<"visual" | "html">("visual");
  const draftRef = useRef(initialHtml);
  const onChangeRef = useRef(onChange);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [html, setHtml] = useState(initialHtml);
  const [insertOpen, setInsertOpen] = useState(false);
  const [snippet, setSnippet] = useState("");
  const [insertNote, setInsertNote] = useState("");
  const [insertReady, setInsertReady] = useState(false);
  const [sourceReady, setSourceReady] = useState(false);
  const [mediaNote, setMediaNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  function remember(next: string) {
    draftRef.current = next;
    setHtml(next);
    onChangeRef.current(next);
  }

  useEffect(() => {
    if (mode === "visual" && editorRef.current) editorRef.current.innerHTML = draftRef.current;
  }, [mode]);

  useEffect(() => {
    if (!insertOpen) return;
    const field = snippetRef.current;
    if (!field) return;
    field.focus();
    field.scrollIntoView({ block: "nearest" });
  }, [insertOpen, insertReady]);

  function read() {
    if (modeRef.current === "visual") return editorRef.current?.innerHTML ?? html;
    return htmlRef.current?.value ?? html;
  }

  function show(next: "visual" | "html") {
    if (next === "html" && modeRef.current === "html") {
      setSourceReady(true);
      htmlRef.current?.focus();
      htmlRef.current?.scrollIntoView({ block: "center" });
      return;
    }
    const value = read();
    modeRef.current = next;
    remember(value);
    setMode(next);
    setSourceReady(next === "html");
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    remember(editorRef.current?.innerHTML ?? "");
  }

  function addLink() {
    const href = window.prompt("Адрес ссылки", "https://");
    if (!href) return;
    run("createLink", href);
  }

  function rememberPlace() {
    if (modeRef.current === "visual") {
      const selection = window.getSelection();
      const editor = editorRef.current;
      rangeRef.current = null;
      if (selection && selection.rangeCount > 0 && editor?.contains(selection.anchorNode)) {
        rangeRef.current = selection.getRangeAt(0).cloneRange();
      }
      return;
    }
    if (htmlRef.current) {
      htmlSelRef.current = {
        start: htmlRef.current.selectionStart ?? 0,
        end: htmlRef.current.selectionEnd ?? 0,
      };
    }
  }

  function openInsert() {
    rememberPlace();
    setInsertOpen(true);
    setInsertNote("Поле готово принять HTML.");
    setInsertReady(false);
    requestAnimationFrame(() => setInsertReady(true));
  }

  function placeCaret() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    editor.focus();
    if (rangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(rangeRef.current);
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertSnippet() {
    const piece = snippet.trim();
    if (!piece) {
      setInsertNote("Поле готово. Сначала вставьте сюда HTML.");
      setInsertReady(false);
      requestAnimationFrame(() => setInsertReady(true));
      return;
    }
    if (modeRef.current === "visual" && editorRef.current) {
      const before = editorRef.current.innerHTML;
      placeCaret();
      const inserted = document.execCommand("insertHTML", false, piece);
      if (!inserted && editorRef.current.innerHTML === before) editorRef.current.insertAdjacentHTML("beforeend", piece);
      remember(editorRef.current.innerHTML);
      rangeRef.current = null;
    } else if (htmlRef.current) {
      const area = htmlRef.current;
      const start = area.selectionStart ?? area.value.length;
      const end = area.selectionEnd ?? start;
      const atStart = start === 0 && end === 0 && area.value.length > 0;
      const next = atStart ? `${area.value}\n${piece}` : `${area.value.slice(0, start)}${piece}${area.value.slice(end)}`;
      remember(next);
    }
    setSnippet("");
    setInsertNote("Фрагмент вставлен. Поле снова готово принять HTML.");
    setInsertReady(false);
    requestAnimationFrame(() => setInsertReady(true));
  }

  function insertPiece(piece: string, marker: string) {
    if (modeRef.current === "visual" && editorRef.current) {
      const editor = editorRef.current;
      placeCaret();
      document.execCommand("insertHTML", false, piece);
      if (!editor.innerHTML.includes(marker)) editor.insertAdjacentHTML("beforeend", piece);
      remember(editor.innerHTML);
      rangeRef.current = null;
      return;
    }
    const area = htmlRef.current;
    const value = area?.value ?? read();
    const saved = htmlSelRef.current;
    const start = saved?.start ?? value.length;
    const end = saved?.end ?? start;
    const next = `${value.slice(0, start)}${piece}${value.slice(end)}`;
    htmlSelRef.current = { start: start + piece.length, end: start + piece.length };
    remember(next);
  }

  async function takeMedia(kind: "image" | "video", file: File | null) {
    if (!file || busy) return;
    if (kind === "image" && file.size > imageMaxBytes) {
      setMediaNote("Изображение больше 8 МБ.");
      return;
    }
    if (kind === "video" && file.size > videoMaxBytes) {
      setMediaNote("Видео больше 12 МБ. Для статьи нужен короткий ролик.");
      return;
    }
    const caption = window.prompt(kind === "image" ? "Подпись к изображению. Можно оставить пустой." : "Подпись к видео. Можно оставить пустой.", "");
    if (caption === null) {
      setMediaNote("Вставка отменена.");
      return;
    }
    setBusy(true);
    setMediaNote(kind === "image" ? "Загружаю изображение…" : "Загружаю видео…");
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await uploadArticleMedia(body);
      if (!result.ok) {
        setMediaNote(result.error);
        return;
      }
      if (!isStoredMedia(result.url)) {
        setMediaNote("Сервер вернул неожиданный адрес файла.");
        return;
      }
      const text = caption.replace(/\s+/g, " ").trim().slice(0, 240);
      const markup = result.kind === "video" ? videoMarkup(result.url, text) : imageMarkup(result.url, text);
      insertPiece(markup, result.url);
      setMediaNote(result.kind === "video" ? "Видео вставлено." : "Изображение вставлено.");
    } catch {
      setMediaNote("Не удалось загрузить файл.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center gap-1 border border-border bg-card px-2 py-2">
        <Tool label="Ж" onClick={() => run("bold")} />
        <Tool label="К" onClick={() => run("italic")} />
        <Tool label="H2" onClick={() => run("formatBlock", "<h2>")} />
        <Tool label="H3" onClick={() => run("formatBlock", "<h3>")} />
        <Tool label="Список" onClick={() => run("insertUnorderedList")} />
        <Tool label="1." onClick={() => run("insertOrderedList")} />
        <Tool label="Цитата" onClick={() => run("formatBlock", "<blockquote>")} />
        <Tool label="Ссылка" onClick={addLink} />
        <Tool label="Изображение" onMouseDown={rememberPlace} onClick={() => imageRef.current?.click()} />
        <Tool label="Видео" onMouseDown={rememberPlace} onClick={() => videoRef.current?.click()} />
        <Tool label="Вставить HTML" onClick={openInsert} />
        <span className="flex gap-3 border-l border-border px-2 text-sm">
          <button type="button" className={mode === "visual" ? "text-olive" : "text-muted-foreground"} onClick={() => show("visual")}>
            Текст
          </button>
          <button type="button" className={mode === "html" ? "text-olive" : "text-muted-foreground"} onClick={() => show("html")}>
            HTML
          </button>
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Изображение и видео встают туда, где стоит курсор: в готовой статье и в режиме HTML. Изображение — до 8 МБ. Видео — MP4 или WebM, до 12 МБ.
      </p>
      {mediaNote ? (
        <p className="text-sm text-foreground" aria-live="polite">
          {mediaNote}
        </p>
      ) : null}
      <input
        ref={imageRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        aria-label="Файл изображения"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          void takeMedia("image", file);
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        aria-label="Файл видео"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          void takeMedia("video", file);
        }}
      />
      {insertOpen ? (
        <div className={`grid gap-2 border p-3 ${insertReady ? "article-ready border-olive bg-olive-soft" : "border-border"}`}>
          <p className="text-sm text-foreground" aria-live="polite">
            {insertNote || "Поле готово принять HTML."}
          </p>
          <textarea
            ref={snippetRef}
            value={snippet}
            onChange={(event) => setSnippet(event.target.value)}
            rows={5}
            placeholder="<p>Фрагмент HTML</p>"
            aria-label="Фрагмент HTML"
            className="box-border w-full max-w-full border border-olive bg-background px-3 py-2 font-mono text-sm"
          />
          <div className="flex flex-wrap gap-4">
            <button type="button" className="text-sm text-olive" onClick={insertSnippet}>
              Вставить в статью
            </button>
            <button type="button" className="text-sm text-muted-foreground" onClick={() => setInsertOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
      {mode === "visual" ? (
        <div
          ref={editorRef}
          className="article-editor min-h-64 w-full max-w-full overflow-x-auto border border-border bg-background px-4 py-4 sm:min-h-80"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Текст статьи"
          suppressContentEditableWarning
          onInput={() => remember(editorRef.current?.innerHTML ?? "")}
        />
      ) : (
        <div className="grid gap-2">
          {sourceReady ? <p className="text-sm text-foreground">Окно готово: можно вставлять HTML.</p> : null}
          <textarea
            ref={htmlRef}
            value={html}
            onChange={(event) => remember(event.target.value)}
            rows={22}
            aria-label="HTML статьи"
            className={`box-border min-h-64 w-full max-w-full border bg-background px-4 py-3 font-mono text-sm sm:min-h-80 ${sourceReady ? "article-ready border-olive" : "border-border"}`}
          />
        </div>
      )}
    </div>
  );
}

function Tool({ label, onClick, onMouseDown }: { label: string; onClick: () => void; onMouseDown?: () => void }) {
  return (
    <button
      type="button"
      className="px-2 py-1 text-sm hover:text-olive"
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.();
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function escapeText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function figure(caption: string, inner: string) {
  const cap = caption ? `<figcaption>${escapeText(caption)}</figcaption>` : "";
  return `<figure contenteditable="false">${inner}${cap}</figure>`;
}

function imageMarkup(url: string, caption: string) {
  return figure(caption, `<img src="${url}" alt="${escapeText(caption)}">`);
}

function videoMarkup(url: string, caption: string) {
  return figure(caption, `<video src="${url}" controls playsinline preload="metadata"></video>`);
}
