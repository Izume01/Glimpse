import { rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const entry = join(root, "index.js");
const outdir = join(root, "dist");

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

async function runBuild(label, options) {
  const result = await Bun.build(options);
  if (!result.success) {
    console.error(`${label} build failed`);
    for (const msg of result.logs) console.error(msg);
    process.exit(1);
  }
}

const base = {
  entrypoints: [entry],
  outdir,
  target: "browser",
  minify: true
};

await runBuild("ESM", {
  ...base,
  format: "esm",
  naming: "index.esm.js"
});

await runBuild("CJS", {
  ...base,
  format: "cjs",
  naming: "index.cjs.js"
});

await runBuild("UMD", {
  ...base,
  format: "iife",
  globalName: "Glimpse",
  naming: "glimpse.umd.js"
});