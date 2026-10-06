export function formatDate(iso: string) {
  const day = iso.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function publishedParts(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::(\d{2}))?)?/);
  return { date: match?.[1] ?? "", time: match?.[2] ?? "" };
}

export function publishedKey(value: string) {
  const { date, time } = publishedParts(value);
  if (!date) return value;
  const seconds = value.match(/T\d{2}:\d{2}:(\d{2})/)?.[1] ?? "00";
  return time ? `${date}T${time}:${seconds}` : `${date}T00:00:00`;
}

export function comparePublished(a: string, b: string) {
  return publishedKey(b).localeCompare(publishedKey(a));
}

export function stampPublished(date: string, time: string, previous = "", now = new Date()) {
  if (!time) return date;
  const minute = `${date}T${time}`;
  if (previous.startsWith(`${minute}:`) || previous === minute) return previous.slice(0, 19);
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${minute}:${seconds}`;
}

export function formatPublished(iso: string) {
  const day = formatDate(iso);
  const time = publishedParts(iso).time;
  return time ? `${day}, ${time}` : day;
}

export function formatScore(value: number) {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
