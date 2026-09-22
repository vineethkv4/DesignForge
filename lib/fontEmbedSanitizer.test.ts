/**
 * Manual runner — npx tsx lib/fontEmbedSanitizer.test.ts
 */
import assert from "node:assert/strict";
import {
  sanitizeFontFaceEmbed,
  sanitizeLinkEmbed,
} from "./fontEmbedSanitizer";

function run() {
  {
    const r = sanitizeLinkEmbed(
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">'
    );
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.match(r.href, /fonts\.googleapis\.com/);
    }
  }

  {
    const r = sanitizeLinkEmbed(
      '<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet" onerror="alert(1)">'
    );
    assert.equal(r.ok, false);
  }

  {
    const r = sanitizeLinkEmbed(
      '<link href="http://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">'
    );
    assert.equal(r.ok, false);
  }

  {
    const r = sanitizeFontFaceEmbed(`
      @font-face {
        font-family: "Roboto";
        src: url("https://fonts.gstatic.com/s/roboto/v30/roboto.woff2") format("woff2");
      }
    `);
    assert.equal(r.ok, true);
  }

  {
    const r = sanitizeFontFaceEmbed(`
      @font-face {
        font-family: "Evil";
        src: url("https://evil.example/x.woff2");
      }
    `);
    assert.equal(r.ok, false);
  }

  {
    const r = sanitizeFontFaceEmbed(`
      @font-face {
        font-family: "X";
        src: url("https://fonts.gstatic.com/x.woff2");
      }
      expression(alert(1))
    `);
    assert.equal(r.ok, false);
  }

  console.log("fontEmbedSanitizer.test.ts: all assertions passed");
}

run();
