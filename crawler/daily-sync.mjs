import path from "path";
import { spawn } from "child_process";

function parseArgs(argv) {
  const args = {
    maxAgeDays: 30,
    maxPages: 60,
    imageLimit: 4,
    delayMs: 400,
    downloadImages: false,
    sources: null,
    outDir: null,
  };

  for (const raw of argv) {
    if (raw.startsWith("--max-age-days=")) args.maxAgeDays = Number(raw.split("=")[1]) || 30;
    if (raw.startsWith("--max-pages=")) args.maxPages = Number(raw.split("=")[1]) || 60;
    if (raw.startsWith("--image-limit=")) args.imageLimit = Number(raw.split("=")[1]) || 4;
    if (raw.startsWith("--delay-ms=")) args.delayMs = Number(raw.split("=")[1]) || 400;
    if (raw === "--download-images") args.downloadImages = true;
    if (raw.startsWith("--sources=")) args.sources = raw.split("=")[1] || null;
    if (raw.startsWith("--out-dir=")) args.outDir = raw.split("=")[1] || null;
  }

  return args;
}

function runNodeScript(scriptName, scriptArgs, label) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptName, ...scriptArgs], {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.resolve(args.outDir || path.join("output", `daily-sync-${stamp}`));
  const crawlArgs = [
    "--crawl-all-recent",
    `--max-age-days=${args.maxAgeDays}`,
    `--max-pages=${args.maxPages}`,
    `--image-limit=${args.imageLimit}`,
    `--delay-ms=${args.delayMs}`,
    `--out-dir=${outDir}`,
  ];

  if (args.sources) {
    crawlArgs.push(`--sources=${args.sources}`);
  }

  if (args.downloadImages) {
    crawlArgs.push("--download-images");
  }

  await runNodeScript("multi-source-crawl.mjs", crawlArgs, "crawl step");
  await runNodeScript(
    "insert-multi-source.mjs",
    [`--input=${path.join(outDir, "multi-source-listings.json")}`],
    "insert step",
  );

  console.log(`Daily sync completed. Output: ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
