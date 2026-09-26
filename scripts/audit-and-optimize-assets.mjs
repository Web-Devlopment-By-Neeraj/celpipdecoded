/**
 * ASSETS-01 - Asset audit and optimization pipeline.
 *
 * Scans public/ and public/assets/ for raster images, reports size and
 * dimensions, and creates optimized WebP copies for heavy images.
 *
 * Usage:
 *   node scripts/audit-and-optimize-assets.mjs --audit
 *   node scripts/audit-and-optimize-assets.mjs --optimize
 *
 * Rules:
 * - originals are never overwritten or deleted
 * - favicon and app icon files are never converted
 * - transparency is preserved for badges and skill icons
 */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const publicDir = path.join(projectRoot, "public");
const assetsDir = path.join(publicDir, "assets");
const optimizedDir = path.join(assetsDir, "optimized");
const reportPath = path.join(projectRoot, "docs", "product", "asset-inventory.md");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const KB = 1024;

/**
 * Category rules. threshold is the original size in bytes above which a WebP
 * copy is created. quality follows the ticket targets.
 */
const CATEGORY_RULES = {
  branding: { threshold: 250 * KB, quality: 90, keepAlpha: true, use: "Logos, wordmarks and browser icons" },
  dashboard: { threshold: 500 * KB, quality: 85, keepAlpha: true, use: "Dashboard illustrations and module cards" },
  "empty-state": { threshold: 300 * KB, quality: 85, keepAlpha: true, use: "Empty state panels in history and progress views" },
  badge: { threshold: 200 * KB, quality: 90, keepAlpha: true, use: "Achievement badges and level badges" },
  skill: { threshold: 150 * KB, quality: 90, keepAlpha: true, use: "CELPIP skill icons for module tiles" },
  "ui-icon": { threshold: 150 * KB, quality: 90, keepAlpha: true, use: "Small interface icons" },
  photo: { threshold: 800 * KB, quality: 82, keepAlpha: false, use: "Marketing and landing page photography" },
  unknown: { threshold: 800 * KB, quality: 85, keepAlpha: true, use: "Needs a manual category decision" },
};

/** Files that must never be converted, matched on the lowercased file name. */
const NEVER_CONVERT = [/favicon/, /^icon\./, /^apple-icon/, /^apple-touch-icon/, /^android-chrome/, /^manifest-icon/];

function isProtectedIcon(fileName) {
  const name = fileName.toLowerCase();
  return NEVER_CONVERT.some((pattern) => pattern.test(name));
}

function categoryFor(relativePath, fileName) {
  const segments = relativePath.split("/");
  const folder = segments.length > 1 ? segments[segments.length - 2] : "";
  const name = fileName.toLowerCase();

  if (folder === "badges" || name.startsWith("badge-")) return "badge";
  if (folder === "skills" || name.startsWith("skill-")) return "skill";
  if (folder === "empty-states" || name.startsWith("empty-")) return "empty-state";
  if (folder === "illustrations" || name.startsWith("dashboard-")) return "dashboard";
  if (folder === "branding" || name.includes("logo") || isProtectedIcon(name) || name.startsWith("georgo")) {
    return "branding";
  }
  if (folder === "ui-icons") return "ui-icon";
  if (segments.length === 1) return "photo";
  return "unknown";
}

function formatSize(bytes) {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes >= KB * KB) return `${(bytes / (KB * KB)).toFixed(2)} MB`;
  return `${(bytes / KB).toFixed(0)} KB`;
}

async function walk(dir, collected = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return collected;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === optimizedDir) continue;
      await walk(full, collected);
      continue;
    }
    if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      collected.push(full);
    }
  }
  return collected;
}

/**
 * Looks for a baked-in transparency checkerboard: a light two tone grid that
 * generators sometimes render into the image instead of real alpha.
 */
async function looksLikeCheckerboard(filePath, hasRealAlpha) {
  if (hasRealAlpha) return false;
  try {
    const { data, info } = await sharp(filePath)
      .resize(64, 64, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const tones = new Map();
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isGrey = Math.abs(r - g) < 6 && Math.abs(g - b) < 6;
      if (!isGrey || r < 170) continue;
      const bucket = Math.round(r / 8) * 8;
      tones.set(bucket, (tones.get(bucket) ?? 0) + 1);
    }
    const ranked = [...tones.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
    if (ranked.length < 2) return false;
    const total = 64 * 64;
    const covered = (ranked[0][1] + ranked[1][1]) / total;
    const spread = Math.abs(ranked[0][0] - ranked[1][0]);
    return covered > 0.45 && spread >= 16 && spread <= 72;
  } catch {
    return false;
  }
}

async function inspect(filePath) {
  const relative = path.relative(publicDir, filePath).split(path.sep).join("/");
  const fileName = path.basename(filePath);
  const stat = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);
  const hash = createHash("sha1").update(buffer).digest("hex");

  let metadata = {};
  let hasRealAlpha = false;
  try {
    const image = sharp(buffer);
    metadata = await image.metadata();
    if (metadata.hasAlpha) {
      const stats = await sharp(buffer).stats();
      hasRealAlpha = !stats.isOpaque;
    }
  } catch {
    metadata = {};
  }

  const category = categoryFor(relative, fileName);
  const rule = CATEGORY_RULES[category];
  const protectedIcon = isProtectedIcon(fileName);
  const checkerboard = await looksLikeCheckerboard(filePath, hasRealAlpha);

  return {
    filePath,
    fileName,
    relative,
    publicPath: `/${relative}`,
    hash,
    size: stat.size,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    format: metadata.format ?? path.extname(fileName).slice(1),
    declaredAlpha: Boolean(metadata.hasAlpha),
    hasRealAlpha,
    checkerboard,
    category,
    rule,
    protectedIcon,
    shouldOptimize: !protectedIcon && stat.size > rule.threshold,
    optimizedPath: null,
    optimizedSize: null,
    warnings: [],
  };
}

function addWarnings(assets) {
  const byHash = new Map();
  for (const asset of assets) {
    const list = byHash.get(asset.hash) ?? [];
    list.push(asset);
    byHash.set(asset.hash, list);
  }

  for (const asset of assets) {
    const duplicates = byHash.get(asset.hash).filter((other) => other !== asset);
    if (duplicates.length > 0) {
      asset.warnings.push(`possible duplicate of ${duplicates.map((d) => d.publicPath).join(", ")}`);
    }
    if (asset.size > 2 * KB * KB) {
      asset.warnings.push("very large file");
    }
    if (asset.width && asset.width > 2000 && asset.category !== "photo") {
      asset.warnings.push(`oversized dimensions (${asset.width}px wide), consider a downscaled source`);
    }
    if (asset.category === "unknown") {
      asset.warnings.push("unclear category, move into a named assets folder");
    }
    if (!asset.relative.startsWith("assets/")) {
      asset.warnings.push("image is in public root but should be organized under public/assets");
    }
    if (asset.declaredAlpha && !asset.hasRealAlpha && (asset.category === "badge" || asset.category === "skill")) {
      asset.warnings.push("alpha channel is fully opaque, transparency may be painted in");
    }
    if (asset.checkerboard) {
      asset.warnings.push("possible fake transparency or checkerboard background");
    }
    if (asset.category === "branding" && !asset.protectedIcon) {
      if (asset.format === "jpeg" || asset.format === "jpg") {
        asset.warnings.push("logo stored as JPG, an SVG or transparent PNG would look cleaner");
      } else if (asset.width && asset.width < 512) {
        asset.warnings.push("logo may need SVG or a higher-resolution PNG");
      }
    }
  }
}

async function optimize(asset) {
  const targetRelative = asset.relative.startsWith("assets/")
    ? asset.relative.slice("assets/".length)
    : path.posix.join("root", asset.relative);
  const targetPath = path.join(optimizedDir, path.dirname(targetRelative), `${path.basename(targetRelative, path.extname(targetRelative))}.webp`);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  const keepAlpha = asset.rule.keepAlpha && asset.hasRealAlpha;
  const pipeline = sharp(asset.filePath);
  if (!keepAlpha) {
    // No usable alpha, drop the empty channel instead of paying for it.
    pipeline.flatten({ background: "#ffffff" });
  }
  await pipeline
    .webp({ quality: asset.rule.quality, alphaQuality: 100, effort: 5 })
    .toFile(targetPath);

  const stat = await fs.stat(targetPath);
  asset.optimizedPath = `/${path.relative(publicDir, targetPath).split(path.sep).join("/")}`;
  asset.optimizedSize = stat.size;
}

async function readExistingOptimized(asset) {
  const targetRelative = asset.relative.startsWith("assets/")
    ? asset.relative.slice("assets/".length)
    : path.posix.join("root", asset.relative);
  const targetPath = path.join(optimizedDir, path.dirname(targetRelative), `${path.basename(targetRelative, path.extname(targetRelative))}.webp`);
  try {
    const stat = await fs.stat(targetPath);
    asset.optimizedPath = `/${path.relative(publicDir, targetPath).split(path.sep).join("/")}`;
    asset.optimizedSize = stat.size;
  } catch {
    // no optimized copy yet
  }
}

function percentSaved(asset) {
  if (!asset.optimizedSize) return null;
  return Math.round(((asset.size - asset.optimizedSize) / asset.size) * 100);
}

function buildReport(assets, mode) {
  const scanned = assets.length;
  const optimizedAssets = assets.filter((a) => a.optimizedSize !== null);
  const originalTotal = assets.reduce((sum, a) => sum + a.size, 0);
  const originalOfOptimized = optimizedAssets.reduce((sum, a) => sum + a.size, 0);
  const optimizedTotal = optimizedAssets.reduce((sum, a) => sum + a.optimizedSize, 0);
  const saved = originalOfOptimized - optimizedTotal;

  const lines = [];
  lines.push("# Asset inventory");
  lines.push("");
  lines.push("Generated by `npm run assets:audit` and `npm run assets:optimize`.");
  lines.push("Do not edit by hand, the script rewrites this file.");
  lines.push("");
  lines.push(`Last run mode: ${mode}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total assets scanned: ${scanned}`);
  lines.push(`- Assets with optimized WebP copies: ${optimizedAssets.length}`);
  lines.push(`- Total original size (all assets): ${formatSize(originalTotal)}`);
  lines.push(`- Original size of optimized assets: ${formatSize(originalOfOptimized)}`);
  lines.push(`- Optimized size of those assets: ${formatSize(optimizedTotal)}`);
  lines.push(`- Estimated savings when the app serves WebP: ${formatSize(saved)}` + (originalOfOptimized > 0 ? ` (${Math.round((saved / originalOfOptimized) * 100)}%)` : ""));
  lines.push("");
  lines.push("Originals are kept in place. Optimized copies live under `public/assets/optimized/`.");
  lines.push("");

  lines.push("## Top 10 largest originals");
  lines.push("");
  lines.push("| # | File | Size | Dimensions | Optimized size |");
  lines.push("| --- | --- | --- | --- | --- |");
  [...assets]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((asset, index) => {
      const dims = asset.width ? `${asset.width}x${asset.height}` : "-";
      lines.push(`| ${index + 1} | \`${asset.publicPath}\` | ${formatSize(asset.size)} | ${dims} | ${formatSize(asset.optimizedSize)} |`);
    });
  lines.push("");

  const categories = [...new Set(assets.map((a) => a.category))].sort();
  for (const category of categories) {
    const group = assets.filter((a) => a.category === category).sort((a, b) => b.size - a.size);
    lines.push(`## Category: ${category}`);
    lines.push("");
    lines.push(`Recommended use: ${CATEGORY_RULES[category].use}`);
    lines.push("");
    lines.push("| File | Path | Dimensions | Original | Optimized path | Optimized | Saved | Notes |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const asset of group) {
      const dims = asset.width ? `${asset.width}x${asset.height}` : "-";
      const saving = percentSaved(asset);
      const notes = [];
      if (asset.protectedIcon) notes.push("protected icon, never converted");
      notes.push(...asset.warnings);
      lines.push(
        `| ${asset.fileName} | \`${asset.publicPath}\` | ${dims} | ${formatSize(asset.size)} | ${asset.optimizedPath ? `\`${asset.optimizedPath}\`` : "-"} | ${formatSize(asset.optimizedSize)} | ${saving === null ? "-" : `${saving}%`} | ${notes.length ? notes.join("; ") : "none"} |`,
      );
    }
    lines.push("");
  }

  const flagged = assets.filter((a) => a.warnings.length > 0);
  lines.push("## Manual review list");
  lines.push("");
  if (flagged.length === 0) {
    lines.push("No warnings.");
  } else {
    for (const asset of flagged) {
      lines.push(`- \`${asset.publicPath}\`: ${asset.warnings.join("; ")}`);
    }
  }
  lines.push("");

  return { report: lines.join("\n"), scanned, optimizedAssets, originalTotal, optimizedTotal, saved };
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--optimize") ? "optimize" : "audit";

  const files = await walk(publicDir);
  const assets = [];
  for (const file of files) {
    assets.push(await inspect(file));
  }
  assets.sort((a, b) => a.relative.localeCompare(b.relative));
  addWarnings(assets);

  if (mode === "optimize") {
    await fs.mkdir(optimizedDir, { recursive: true });
    for (const asset of assets) {
      if (!asset.shouldOptimize) continue;
      await optimize(asset);
      console.log(`optimized ${asset.publicPath} -> ${asset.optimizedPath} (${formatSize(asset.size)} -> ${formatSize(asset.optimizedSize)})`);
    }
  } else {
    for (const asset of assets) {
      await readExistingOptimized(asset);
    }
  }

  const summary = buildReport(assets, mode);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, summary.report, "utf8");

  console.log("");
  console.log(`Mode: ${mode}`);
  console.log(`Assets scanned: ${summary.scanned}`);
  console.log(`Assets with optimized copies: ${summary.optimizedAssets.length}`);
  console.log(`Total original size: ${formatSize(summary.originalTotal)}`);
  console.log(`Total optimized size: ${formatSize(summary.optimizedTotal)}`);
  console.log(`Estimated savings: ${formatSize(summary.saved)}`);
  if (mode === "audit") {
    const pending = assets.filter((a) => a.shouldOptimize && a.optimizedSize === null);
    console.log(`Assets recommended for optimization: ${pending.length}`);
    for (const asset of pending) {
      console.log(`  ${asset.publicPath} (${formatSize(asset.size)}, ${asset.category})`);
    }
  }
  console.log(`Report written to ${path.relative(projectRoot, reportPath).split(path.sep).join("/")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
