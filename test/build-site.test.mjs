import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { join } from "node:path";
import {
  buildGithubPagesRedirect,
  buildPortfolioSite,
  normalizeNetlifyTarget,
} from "../scripts/build-site.mjs";

const root = new URL("../", import.meta.url).pathname;
const output = join(root, "dist");
const caseFiles = [
  "index.html",
  "procys.html",
  "openprovider.html",
  "kore-labs.html",
  "laurastar.html",
  "profinda.html",
  "shopsavvy.html",
  "people-element.html",
  "shamrock-marketing.html",
  "sai-global.html",
  "trialhaus.html",
  "martek-global.html",
];

test("regular build copies exactly the allowlisted case pages", async () => {
  await buildPortfolioSite();
  const files = (await readdir(join(output, "case"))).sort();
  assert.deepEqual(files, [...caseFiles].sort());
  assert.ok(!files.includes("_template.html"));
  assert.ok(!files.includes("README.md"));
  assert.ok(!files.some((file) => file.startsWith("_drafts")));
});

test("GitHub Pages redirects preserve each matching Netlify case path", async () => {
  const target = "https://example.netlify.app/";
  await buildGithubPagesRedirect(target);
  const index = await readFile(join(output, "case", "index.html"), "utf8");
  assert.match(index, /https:\/\/example\.netlify\.app\/case\//);
  for (const file of caseFiles.slice(1)) {
    const page = await readFile(join(output, "case", file), "utf8");
    assert.match(page, new RegExp(`https://example\\.netlify\\.app/case/${file}`));
    assert.doesNotMatch(page, /#work/);
  }
});

test("redirect target validation rejects unsafe targets", () => {
  for (const target of [
    "http://example.netlify.app/",
    "https://netlify.app/",
    "https://example.netlify.app/other",
    "https://example.netlify.app/?next=elsewhere",
    "https://user:pass@example.netlify.app/",
  ]) {
    assert.throws(() => normalizeNetlifyTarget(target), /valid URL|HTTPS netlify\.app site root/);
  }
});
