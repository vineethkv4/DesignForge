/**
 * Manual test runner for parseFontEmbed (no Jest/Vitest in package.json).
 * Run: npx tsx lib/fontEmbedParser.test.ts
 */
import assert from "node:assert/strict";
import { parseFontEmbed } from "./fontEmbedParser";

function run() {
  // Valid Google Fonts <link> — one weight
  {
    const raw =
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">';
    const r = parseFontEmbed(raw);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.family, "Roboto");
      assert.equal(r.kind, "link");
    }
  }

  // Valid Google Fonts <link> — multiple weights
  {
    const raw =
      '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">';
    const r = parseFontEmbed(raw);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.family, "Open Sans");
      assert.equal(r.kind, "link");
    }
  }

  // Valid raw @font-face block
  {
    const raw = `
      @font-face {
        font-family: "Acme Display";
        src: url("/fonts/acme.woff2") format("woff2");
        font-weight: 400;
      }
    `;
    const r = parseFontEmbed(raw);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.family, "Acme Display");
      assert.equal(r.kind, "font-face");
    }
  }

  // Garbage input
  {
    const r = parseFontEmbed("not a font embed at all");
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.match(r.error, /Could not recognize|Paste a/i);
    }
  }

  // @font-face missing font-family
  {
    const raw = `
      @font-face {
        src: url("/fonts/orphan.woff2") format("woff2");
        font-weight: 700;
      }
    `;
    const r = parseFontEmbed(raw);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.match(r.error, /missing a font-family/i);
    }
  }

  console.log("fontEmbedParser.test.ts: all assertions passed");
}

run();
