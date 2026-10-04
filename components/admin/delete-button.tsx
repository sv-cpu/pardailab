"use client";

export function ConfirmDelete() {
  return (
    <button
      type="submit"
      name="intent"
      value="delete"
      className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:border-olive hover:text-foreground"
      onClick={(event) => {
        if (!window.confirm("Удалить запись? На сайте она исчезнет.")) event.preventDefault();
      }}
    >
      Удалить
    </button>
  );
}
