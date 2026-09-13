import {
  copyFile,
  lstat,
  mkdir,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const portfolioRoot = dirname(scriptDirectory);
const outputDirectory = join(portfolioRoot, "dist");

const SITE_FILES = [
  "index.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "_redirects",
];

const CASE_PAGES = [
  { slug: "index", file: "index.html" },
  { slug: "procys", file: "procys.html" },
  { slug: "openprovider", file: "openprovider.html" },
  { slug: "kore-labs", file: "kore-labs.html" },
  { slug: "laurastar", file: "laurastar.html" },
  { slug: "profinda", file: "profinda.html" },
  { slug: "shopsavvy", file: "shopsavvy.html" },
  { slug: "people-element", file: "people-element.html" },
  { slug: "shamrock-marketing", file: "shamrock-marketing.html" },
  { slug: "sai-global", file: "sai-global.html" },
  { slug: "trialhaus", file: "trialhaus.html" },
  { slug: "martek-global", file: "martek-global.html" },
];

async function requireRegularFile(path) {
  const status = await lstat(path).catch(() => null);
  if (!status?.isFile()) {
    throw new Error(`Required site file is missing or invalid: ${relative(portfolioRoot, path)}`);
  }
}

async function copyAssetTree(source, destination) {
  const status = await lstat(source).catch(() => null);
  if (!status) {
    throw new Error(`Required asset path is missing: ${relative(portfolioRoot, source)}`);
  }

  if (status.isSymbolicLink()) {
    throw new Error(`Asset symlinks are not allowed: ${relative(portfolioRoot, source)}`);
  }

  if (status.isDirectory()) {
    await mkdir(destination, { recursive: true });
    const entries = await readdir(source, { withFileTypes: true });
    for (const entry of entries) {
      await copyAssetTree(join(source, entry.name), join(destination, entry.name));
    }
    return;
  }

  if (!status.isFile()) {
    throw new Error(`Unsupported asset type: ${relative(portfolioRoot, source)}`);
  }

  await copyFile(source, destination);
}

async function resetOutputDirectory() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
}

export async function buildPortfolioSite() {
  const assetDirectory = join(portfolioRoot, "portfolio-assets");

  for (const file of SITE_FILES) {
    await requireRegularFile(join(portfolioRoot, file));
  }

  const assetStatus = await lstat(assetDirectory).catch(() => null);
  if (!assetStatus?.isDirectory() || assetStatus.isSymbolicLink()) {
    throw new Error("Required portfolio-assets directory is missing or invalid");
  }

  for (const page of CASE_PAGES) {
    await requireRegularFile(join(portfolioRoot, "case", page.file));
  }

  await resetOutputDirectory();

  for (const file of SITE_FILES) {
    await copyFile(join(portfolioRoot, file), join(outputDirectory, file));
  }

  await copyAssetTree(assetDirectory, join(outputDirectory, "portfolio-assets"));
  await mkdir(join(outputDirectory, "case"), { recursive: true });
  for (const page of CASE_PAGES) {
    await copyFile(
      join(portfolioRoot, "case", page.file),
      join(outputDirectory, "case", page.file),
    );
  }
  return outputDirectory;
}

export function normalizeNetlifyTarget(rawTarget) {
  let target;
  try {
    target = new URL(rawTarget);
  } catch {
    throw new Error("Redirect target must be a valid URL");
  }

  const isNetlifyHost = target.hostname.endsWith(".netlify.app") && target.hostname !== "netlify.app";
  if (
    target.protocol !== "https:" ||
    !isNetlifyHost ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    target.pathname !== "/"
  ) {
    throw new Error("Redirect target must be an HTTPS netlify.app site root");
  }

  return target.toString();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function redirectDocument(target, title) {
  const escapedTarget = escapeHtml(target);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=${escapedTarget}">
    <link rel="canonical" href="${escapedTarget}">
    <title>${title}</title>
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <p>This portfolio has moved to <a href="${escapedTarget}">${escapedTarget}</a>.</p>
  </body>
</html>
`;
}

export async function buildGithubPagesRedirect(rawTarget) {
  const target = normalizeNetlifyTarget(rawTarget);

  await resetOutputDirectory();
  await mkdir(join(outputDirectory, "case"), { recursive: true });

  await Promise.all([
    writeFile(join(outputDirectory, "index.html"), redirectDocument(target, "Kapil Chauhan portfolio")),
    writeFile(join(outputDirectory, "404.html"), redirectDocument(target, "Portfolio moved")),
    writeFile(join(outputDirectory, "robots.txt"), "User-agent: *\nAllow: /\n"),
    ...CASE_PAGES.map((page) =>
      writeFile(
        join(outputDirectory, "case", page.file),
        redirectDocument(
          new URL(page.slug === "index" ? "case/" : `case/${page.file}`, target).toString(),
          "Selected work moved",
        ),
      ),
    ),
  ]);

  return outputDirectory;
}

function readTargetArgument(args) {
  const targetIndex = args.indexOf("--target");
  if (targetIndex === -1 || !args[targetIndex + 1]) {
    throw new Error("GitHub Pages redirect mode requires --target <https://name.netlify.app/>");
  }
  return args[targetIndex + 1];
}

async function main(args) {
  if (args.includes("--github-pages-redirect")) {
    const target = readTargetArgument(args);
    await buildGithubPagesRedirect(target);
    console.log(`Built GitHub Pages redirect artifact for ${normalizeNetlifyTarget(target)}`);
    return;
  }

  await buildPortfolioSite();
  console.log("Built allowlisted portfolio artifact in dist/");
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
