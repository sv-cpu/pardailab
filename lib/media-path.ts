export const imageMaxBytes = 8 * 1024 * 1024;
export const videoMaxBytes = 12 * 1024 * 1024;

const storedMedia = /^\/uploads\/media\/[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm)$/;

export function isStoredMedia(value: string) {
  return storedMedia.test(value);
}

export function mediaUrlsInHtml(html: string) {
  const found: string[] = [];
  const pattern = /\/uploads\/media\/[0-9a-f-]{36}\.(?:jpg|png|webp|gif|mp4|webm)/g;
  for (const match of html.matchAll(pattern)) {
    if (!found.includes(match[0])) found.push(match[0]);
  }
  return found;
}
