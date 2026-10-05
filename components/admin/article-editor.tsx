"use client";

import { useEffect, useRef, useState } from "react";

export function ArticleEditor({ initialHtml }: { initialHtml: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const storedRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef<"visual" | "html">("visual");
  const draftRef = useRef(initialHtml);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [html, setHtml] = useState(initialHtml);
  const [insertOpen, setInsertOpen] = useState(false);
  const [snippet, setSnippet] = useState("");

  function read() {
    if (modeRef.current === "visual") return editorRef.current?.innerHTML ?? html;
    return htmlRef.current?.value ?? html;
  }

  function remember(next: string) {
    draftRef.current = next;
    setHtml(next);
    if (storedRef.current) storedRef.current.value = next;
  }

  useEffect(() => {
    const form = storedRef.current?.form;
    if (!form) return;
    const sync = () => {
      const value = modeRef.current === "visual" ? (editorRef.current?.innerHTML ?? "") : (htmlRef.current?.value ?? "");
      if (storedRef.current) storedRef.current.value = value;
    };
    form.addEventListener("submit", sync);
    return () => form.removeEventListener("submit", sync);
  }, []);

  useEffect(() => {
    if (mode === "visual" && editorRef.current) editorRef.current.innerHTML = draftRef.current;
  }, [mode]);

  function show(next: "visual" | "html") {
    const value = read();
    modeRef.current = next;
    remember(value);
    setMode(next);
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

  function insertSnippet() {
    const piece = snippet.trim();
    if (!piece) return;
    if (modeRef.current === "visual" && editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, piece);
      remember(editorRef.current.innerHTML);
    } else {
      const next = `${read()}\n${piece}`;
      remember(next);
    }
    setSnippet("");
    setInsertOpen(false);
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
        <Tool label="Вставить HTML" onClick={() => setInsertOpen((open) => !open)} />
        <span className="flex gap-3 border-l border-border px-2 text-sm">
          <button type="button" className={mode === "visual" ? "text-olive" : "text-muted-foreground"} onClick={() => show("visual")}>
            Текст
          </button>
          <button type="button" className={mode === "html" ? "text-olive" : "text-muted-foreground"} onClick={() => show("html")}>
            HTML
          </button>
        </span>
      </div>
      {insertOpen ? (
        <div className="grid gap-2 border border-border p-3">
          <textarea
            value={snippet}
            onChange={(event) => setSnippet(event.target.value)}
            rows={5}
            placeholder="<p>Фрагмент HTML</p>"
            className="box-border w-full max-w-full border border-border bg-background px-3 py-2 font-mono text-sm"
          />
          <button type="button" className="justify-self-start text-sm text-olive" onClick={insertSnippet}>
            Вставить в статью
          </button>
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
        <textarea
          ref={htmlRef}
          value={html}
          onChange={(event) => remember(event.target.value)}
          rows={22}
          aria-label="HTML статьи"
          className="box-border min-h-64 w-full max-w-full border border-border bg-background px-4 py-3 font-mono text-sm sm:min-h-80"
        />
      )}
      <input ref={storedRef} type="hidden" name="bodyHtml" defaultValue={initialHtml} />
    </div>
  );
}

function Tool({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="px-2 py-1 text-sm hover:text-olive" onMouseDown={(event) => event.preventDefault()} onClick={onClick}>
      {label}
    </button>
  );
}
