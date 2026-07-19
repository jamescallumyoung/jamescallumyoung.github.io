import * as esbuild from "esbuild";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const ssrTmpDir = path.join(rootDir, ".ssr-tmp");
const tsconfigPath = path.join(rootDir, "tsconfig.json");
const SIZE_BUDGET_BYTES = 256_000;

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });
await fs.rm(ssrTmpDir, { recursive: true, force: true });
await fs.mkdir(ssrTmpDir, { recursive: true });

// 1. Client bundle: browser-bound, bundles everything (including `lit`)
// since this is what ships to users. `splitting` + `outdir` (rather than
// `outfile`) is required so the dynamic imports in client/main.ts (the
// polyfill and hydration-support modules) become their own lazily-fetched
// chunks instead of being inlined into the main bundle.
await esbuild.build({
  entryPoints: [{ in: path.join(srcDir, "client/main.ts"), out: "site" }],
  bundle: true,
  format: "esm",
  splitting: true,
  outdir: distDir,
  minify: true,
  tsconfig: tsconfigPath,
});

// 2. A Node-loadable copy of the component definitions, used only to
// register custom elements for the SSR/DSD prerender step below. `lit` (and
// any other npm dependency) is kept external and resolved via this
// project's own node_modules -- if it were bundled here it would create a
// second, distinct copy of the `lit` module, and @lit-labs/ssr's
// `instanceof LitElement` checks against classes from *this* bundle would
// silently fail to match.
const ssrComponentsEntry = path.join(ssrTmpDir, "components.mjs");
await esbuild.build({
  entryPoints: [path.join(srcDir, "components/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: ssrComponentsEntry,
  tsconfig: tsconfigPath,
});

// Must be imported before the components module below: it defines
// HTMLElement/customElements/ShadowRoot etc. in Node, which the components'
// module-scope `customElements.define()` calls need to already exist.
await import("@lit-labs/ssr/lib/install-global-dom-shim.js");
const { html, unsafeStatic } = await import("lit/static-html.js");
const { render } = await import("@lit-labs/ssr");
const { collectResult } = await import("@lit-labs/ssr/lib/render-result.js");
await import(pathToFileURL(ssrComponentsEntry).href);

const { parseHTML } = await import("linkedom");

const KNOWN_CUSTOM_ELEMENT_TAGS = [
  "page-header",
  "link-list",
  "content-list",
  "list-entry",
  "work-history-entry",
];

// None of the components above ever read slotted/light-DOM content in
// render() -- only attributes -- so a given tag+attributes combination
// always produces byte-identical shadow output. It's therefore safe to
// render each distinct combination once and clone the result into every
// matching instance below, rather than re-invoking SSR per instance. If a
// future component starts branching on light-DOM/slotted content, it must
// either be excluded from this cache or the cache key widened to include
// that content.
const shadowTemplateCache = new Map();

async function getShadowTemplateHtml(tagName, attributePairs) {
  const cacheKey = `${tagName}|${attributePairs.map(([name, value]) => `${name}=${value}`).join(",")}`;
  const cached = shadowTemplateCache.get(cacheKey);
  if (cached) return cached;

  const attrString = attributePairs
    .map(([name, value]) => (value === "" ? name : `${name}="${value}"`))
    .join(" ");
  const markup = `<${tagName}${attrString ? ` ${attrString}` : ""}></${tagName}>`;
  const rendered = await collectResult(render(html`${unsafeStatic(markup)}`));

  const match = rendered.match(
    /<template[^>]*shadowrootmode="open"[^>]*>[\s\S]*?<\/template>/,
  );
  if (!match) {
    throw new Error(`No declarative shadow root produced for <${tagName}>`);
  }

  shadowTemplateCache.set(cacheKey, match[0]);
  return match[0];
}

const sourceHtml = await fs.readFile(path.join(srcDir, "index.html"), "utf8");
const { document } = parseHTML(sourceHtml);

for (const tagName of KNOWN_CUSTOM_ELEMENT_TAGS) {
  for (const element of document.querySelectorAll(tagName)) {
    const attributePairs = element
      .getAttributeNames()
      .map((name) => [name, element.getAttribute(name)])
      .sort(([a], [b]) => a.localeCompare(b));
    const templateHtml = await getShadowTemplateHtml(tagName, attributePairs);
    element.insertAdjacentHTML("afterbegin", templateHtml);
  }
}

document
  .querySelector("body")
  .insertAdjacentHTML(
    "beforeend",
    '<script type="module" src="site.js"></script>',
  );

await fs.writeFile(path.join(distDir, "index.html"), document.toString());

// 3. Copy passthrough files.
await fs.mkdir(path.join(distDir, "styles"), { recursive: true });
await fs.copyFile(
  path.join(srcDir, "styles/base.css"),
  path.join(distDir, "styles/base.css"),
);
await fs.copyFile(
  path.join(srcDir, "humans.txt"),
  path.join(distDir, "humans.txt"),
);
await fs.copyFile(
  path.join(srcDir, "publickey.asc"),
  path.join(distDir, "publickey.asc"),
);
await fs.copyFile(path.join(rootDir, "CNAME"), path.join(distDir, "CNAME"));

await fs.rm(ssrTmpDir, { recursive: true, force: true });

// 4. Size-budget check.
const distFiles = await fs.readdir(distDir, { recursive: true });
const distFilePaths = [];
for (const entry of distFiles) {
  const fullPath = path.join(distDir, entry);
  if ((await fs.stat(fullPath)).isFile()) {
    distFilePaths.push(fullPath);
  }
}
const gzippedSize = Number(
  execSync(`gzip -c ${distFilePaths.map((p) => `"${p}"`).join(" ")} | wc -c`)
    .toString()
    .trim(),
);
console.log(
  `dist/ gzipped size: ${gzippedSize} bytes (budget: ${SIZE_BUDGET_BYTES} bytes)`,
);
if (gzippedSize > SIZE_BUDGET_BYTES) {
  throw new Error(
    `Size budget exceeded: ${gzippedSize} bytes > ${SIZE_BUDGET_BYTES} bytes`,
  );
}
