"use client";

export function ResumePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="underline decoration-border underline-offset-4 hover:decoration-olive"
    >
      Печать / PDF
    </button>
  );
}
