import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sessionCookieSecure } from "./session";

describe("session cookie secure flag", () => {
  it("stays off for plain HTTP, including a production stand without TLS", () => {
    assert.equal(sessionCookieSecure(null), false);
    assert.equal(sessionCookieSecure("http"), false);
    assert.equal(sessionCookieSecure("http,https"), false);
  });

  it("turns on when the proxy says the client used HTTPS", () => {
    assert.equal(sessionCookieSecure("https"), true);
    assert.equal(sessionCookieSecure("https,http"), true);
  });
});
