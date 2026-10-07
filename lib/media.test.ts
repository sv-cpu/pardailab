import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { describe, it } from "node:test";

import { detectMedia, dropRemovedMedia, mediaUrlsInBody, removeArticleMedia, storeArticleMedia } from "./media";
import { isStoredMedia } from "./media-path";
import type { Block } from "./types";

const sample = "6f1b1c2a-3d4e-4f50-8a61-1234567890ab";

describe("article media paths", () => {
  it("accepts only files saved into the media folder", () => {
    assert.equal(isStoredMedia(`/uploads/media/${sample}.jpg`), true);
    assert.equal(isStoredMedia(`/uploads/media/${sample}.mp4`), true);
    assert.equal(isStoredMedia(`/uploads/media/${sample}.webm`), true);
    assert.equal(isStoredMedia("/uploads/media/../../etc/passwd"), false);
    assert.equal(isStoredMedia("https://cdn.example/clip.mp4"), false);
    assert.equal(isStoredMedia(`/uploads/covers/${sample}.jpg`), false);
  });

  it("collects media urls from the html of an article", () => {
    const body: Block[] = [
      { type: "p", text: `упоминание /uploads/media/${sample}.jpg в тексте` },
      { type: "html", html: `<p>Текст</p><img src="/uploads/media/${sample}.png" alt=""><video src="/uploads/media/${sample}.mp4"></video>` },
    ];
    assert.deepEqual(mediaUrlsInBody(body), [`/uploads/media/${sample}.png`, `/uploads/media/${sample}.mp4`]);
  });

  it("recognises image and video bytes", () => {
    assert.equal(detectMedia(Buffer.from([0xff, 0xd8, 0xff, 0x00]))?.ext, "jpg");
    assert.equal(detectMedia(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext, "png");
    assert.equal(detectMedia(Buffer.from("GIF89a", "ascii"))?.ext, "gif");
    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0, "ascii");
    webp.write("WEBP", 8, "ascii");
    assert.equal(detectMedia(webp)?.ext, "webp");
    const mp4 = Buffer.alloc(12);
    mp4.write("ftyp", 4, "ascii");
    assert.equal(detectMedia(mp4)?.kind, "video");
    assert.equal(detectMedia(mp4)?.ext, "mp4");
    const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d]);
    assert.equal(detectMedia(webm)?.ext, "webm");
    assert.equal(detectMedia(Buffer.from("not-a-picture")), null);
  });

  it("rejects a file that is not a real image or video", async () => {
    const file = new File(["not-a-picture"], "photo.jpg", { type: "image/jpeg" });
    await assert.rejects(() => storeArticleMedia(file), /JPEG, PNG, WebP, GIF, MP4 или WebM/);
  });

  it("rejects an image over 8 MB before writing it", async () => {
    const bytes = Buffer.alloc(imageOverLimit());
    bytes[0] = 0xff;
    bytes[1] = 0xd8;
    bytes[2] = 0xff;
    const file = new File([bytes], "huge.jpg", { type: "image/jpeg" });
    await assert.rejects(() => storeArticleMedia(file), /Изображение больше 8 МБ/);
  });

  it("stores a real image and removes it with the article", async () => {
    const file = new File([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], "frame.jpg", { type: "image/jpeg" });
    const stored = await storeArticleMedia(file);
    assert.equal(stored.kind, "image");
    assert.equal(isStoredMedia(stored.url), true);
    await access(filePath(stored.url));
    const previous: Block[] = [{ type: "html", html: `<img src="${stored.url}" alt="">` }];
    await dropRemovedMedia(previous, []);
    await assert.rejects(() => access(filePath(stored.url)));
  });

  it("keeps a file that is still in the article", async () => {
    const file = new File([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], "stay.jpg", { type: "image/jpeg" });
    const stored = await storeArticleMedia(file);
    const body: Block[] = [{ type: "html", html: `<img src="${stored.url}" alt="">` }];
    await dropRemovedMedia(body, body);
    await access(filePath(stored.url));
    await removeArticleMedia(stored.url);
  });

  it("does not delete a path outside the media folder", async () => {
    await removeArticleMedia("/uploads/covers/../../package.json");
    await access(new URL("../package.json", import.meta.url));
  });
});

function imageOverLimit() {
  return 8 * 1024 * 1024 + 1;
}

function filePath(url: string) {
  return new URL(`../public${url}`, import.meta.url);
}
