/**
 * ASSETS-02 - Badge and skill icon normalization.
 *
 * The Gemini generated badge and skill artwork is stored as 2816x1536
 * landscape PNGs. The subject is centered and small, and the "transparent"
 * background is usually a painted-in checkerboard rather than a real alpha
 * channel. That makes the files unusable as UI assets.
 *
 * This script inspects those assets and writes clean square copies into
 * public/assets/normalized/. Originals are never touched.
 *
 * Usage:
 *   node scripts/normalize-badge-icon-assets.mjs
 *
 * Rules:
 * - never overwrite or delete an original
 * - preserve a real alpha channel when one exists
 * - only strip a background when it is a flat light field or a painted
 *   checkerboard, and only when the flood fill result passes safety checks
 * - never stretch, the subject is cropped then centered on a square canvas
 * - anything uncertain is reported for manual review instead of guessed
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const publicDir = path.join(projectRoot, "public");
const assetsDir = path.join(publicDir, "assets");
const normalizedDir = path.join(assetsDir, "normalized");
const reportPath = path.join(projectRoot, "docs", "product", "badge-icon-normalization-report.md");

const KB = 1024;
const SOURCE_EXTENSIONS = new Set([".png", ".webp"]);

/** One entry per asset family we normalize. */
const GROUPS = [
  {
    key: "badges",
    label: "Badges",
    sourceDir: path.join(assetsDir, "badges"),
    fallbackDir: path.join(assetsDir, "optimized", "badges"),
    outputDir: path.join(normalizedDir, "badges"),
    sizes: [1024, 512],
  },
  {
    key: "skills",
    label: "Skill icons",
    sourceDir: path.join(assetsDir, "skills"),
    fallbackDir: path.join(assetsDir, "optimized", "skills"),
    outputDir: path.join(normalizedDir, "skills"),
    sizes: [512],
  },
];

/** An image wider than this ratio counts as a landscape canvas. */
const LANDSCAPE_RATIO = 1.2;
/** Padding kept around the subject, as a share of its longest side. */
const PADDING_RATIO = 0.04;
/** Pixels of anti-aliased fringe eaten after a background flood fill. */
const FRINGE_BITE = 2;
/** A subject blob smaller than this share of the largest one is a speck. */
const SPECK_SHARE = 0.01;

function formatSize(bytes) {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes >= KB * KB) return `${(bytes / (KB * KB)).toFixed(2)} MB`;
  return `${(bytes / KB).toFixed(0)} KB`;
}

function toPublicPath(absolutePath) {
  return `/${path.relative(publicDir, absolutePath).split(path.sep).join("/")}`;
}

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

/**
 * Classifies the background from the outer frame of the image.
 *
 * Returns one of:
 * - "alpha"        real transparency, nothing to strip
 * - "checkerboard" two light neutral tones, a painted transparency grid
 * - "flat"         one near uniform light field
 * - "complex"      anything else, left alone
 */
function classifyBackground(data, width, height, channels, hasRealAlpha) {
  if (hasRealAlpha) return { kind: "alpha", tones: [] };

  const frame = Math.max(2, Math.round(Math.min(width, height) * 0.02));
  const histogram = new Int32Array(256);
  let sampled = 0;
  let neutralLight = 0;

  const visit = (x, y) => {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sampled += 1;
    // Neutral greys only. Some sheets use a dark checker around tone 90, so
    // the floor sits well below white and the flood fill checks do the rest.
    if (Math.max(r, g, b) - Math.min(r, g, b) > 14 || Math.max(r, g, b) < 60) return;
    neutralLight += 1;
    histogram[Math.round((r + g + b) / 3)] += 1;
  };

  for (let y = 0; y < height; y += 1) {
    const inTopOrBottom = y < frame || y >= height - frame;
    for (let x = 0; x < width; x += 1) {
      if (inTopOrBottom || x < frame || x >= width - frame) visit(x, y);
    }
  }

  // A background we can act on has to fill nearly the whole frame.
  if (sampled === 0 || neutralLight / sampled < 0.97) return { kind: "complex", tones: [] };

  // Cluster on a sliding window rather than fixed buckets, a checker tone
  // that straddles a bucket edge would otherwise look like two weak tones.
  const WINDOW = 10;
  const windowCount = (centre, exclude = null) => {
    let count = 0;
    for (let tone = Math.max(0, centre - WINDOW); tone <= Math.min(255, centre + WINDOW); tone += 1) {
      if (exclude !== null && Math.abs(tone - exclude) <= WINDOW) continue;
      count += histogram[tone];
    }
    return count;
  };
  const bestTone = (exclude = null) => {
    let best = -1;
    let bestCount = -1;
    for (let tone = 0; tone < 256; tone += 1) {
      if (histogram[tone] === 0) continue;
      if (exclude !== null && Math.abs(tone - exclude) <= WINDOW * 2) continue;
      const count = windowCount(tone, exclude);
      if (count > bestCount) {
        bestCount = count;
        best = tone;
      }
    }
    return { tone: best, count: bestCount };
  };

  const primary = bestTone();
  if (primary.tone < 0) return { kind: "complex", tones: [] };
  const secondary = bestTone(primary.tone);

  const primaryShare = primary.count / neutralLight;
  const secondaryShare = secondary.tone < 0 ? 0 : secondary.count / neutralLight;

  if (secondaryShare > 0.15) {
    const spread = Math.abs(primary.tone - secondary.tone);
    if (primaryShare + secondaryShare >= 0.9 && spread >= 12 && spread <= 80) {
      return { kind: "checkerboard", tones: [primary.tone, secondary.tone].sort((a, b) => a - b) };
    }
    return { kind: "complex", tones: [] };
  }

  if (primaryShare >= 0.95 && primary.tone >= 232) return { kind: "flat", tones: [primary.tone] };
  return { kind: "complex", tones: [] };
}

/**
 * Flood fills the background inwards from the border and returns a mask
 * where 1 means background. Returns null when the fill looks unsafe.
 */
function buildBackgroundMask(data, width, height, channels, background) {
  // Match the detected tones with a little slack for anti-aliasing. A flat
  // background has no upper tone, so anything lighter than it counts too.
  const floor = Math.max(40, Math.min(...background.tones) - 16);
  const ceiling = background.kind === "checkerboard" ? Math.max(...background.tones) + 18 : 255;
  const isBackgroundPixel = (i) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) > 18) return false;
    const average = (r + g + b) / 3;
    return average >= floor && average <= ceiling;
  };

  const total = width * height;
  const mask = new Uint8Array(total);
  const stack = new Int32Array(total);
  let top = 0;

  const push = (index) => {
    if (mask[index]) return;
    if (!isBackgroundPixel(index * channels)) return;
    mask[index] = 1;
    stack[top] = index;
    top += 1;
  };

  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (top > 0) {
    top -= 1;
    const index = stack[top];
    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (y > 0) push(index - width);
    if (y < height - 1) push(index + width);
  }

  let removed = 0;
  for (let i = 0; i < total; i += 1) removed += mask[i];
  const removedShare = removed / total;

  // The subject sits in the middle. If the fill reached the centre, or it
  // barely moved, the background was not what we thought it was.
  const cx0 = Math.floor(width * 0.45);
  const cx1 = Math.ceil(width * 0.55);
  const cy0 = Math.floor(height * 0.45);
  const cy1 = Math.ceil(height * 0.55);
  for (let y = cy0; y < cy1; y += 1) {
    for (let x = cx0; x < cx1; x += 1) {
      if (mask[y * width + x]) return { mask: null, removedShare, reason: "flood fill reached the centre of the image" };
    }
  }
  if (removedShare < 0.05) return { mask: null, removedShare, reason: "flood fill removed almost nothing" };
  if (removedShare > 0.95) return { mask: null, removedShare, reason: "flood fill removed almost everything" };

  // The source sheets carry faint generator watermark specks in the empty
  // area. They survive the tone test, inflate the crop box and look like
  // dirt, so drop every subject blob that is tiny next to the main one.
  const speckled = dropSmallSubjectBlobs(mask, width, height);

  // Eat the anti-aliased fringe so the cutout has no light halo.
  for (let pass = 0; pass < FRINGE_BITE; pass += 1) {
    const grown = Uint8Array.from(mask);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (mask[index]) continue;
        const neighbourIsBackground =
          (x > 0 && mask[index - 1]) ||
          (x < width - 1 && mask[index + 1]) ||
          (y > 0 && mask[index - width]) ||
          (y < height - 1 && mask[index + width]);
        if (neighbourIsBackground) grown[index] = 1;
      }
    }
    mask.set(grown);
  }

  return { mask, removedShare, reason: null, speckled };
}

/**
 * Labels the subject blobs left by the flood fill and pushes every blob
 * smaller than SPECK_SHARE of the largest one back into the background.
 * Returns how many blobs were dropped.
 */
function dropSmallSubjectBlobs(mask, width, height) {
  const total = width * height;
  const label = new Int32Array(total).fill(-1);
  const stack = new Int32Array(total);
  const blobs = [];

  for (let start = 0; start < total; start += 1) {
    if (mask[start] || label[start] !== -1) continue;
    const id = blobs.length;
    let size = 0;
    let top = 0;
    label[start] = id;
    stack[top] = start;
    top += 1;

    while (top > 0) {
      top -= 1;
      const index = stack[top];
      size += 1;
      const x = index % width;
      const y = (index - x) / width;
      const push = (next) => {
        if (mask[next] || label[next] !== -1) return;
        label[next] = id;
        stack[top] = next;
        top += 1;
      };
      if (x > 0) push(index - 1);
      if (x < width - 1) push(index + 1);
      if (y > 0) push(index - width);
      if (y < height - 1) push(index + width);
    }
    blobs.push(size);
  }

  if (blobs.length <= 1) return 0;
  const largest = Math.max(...blobs);
  const minimum = Math.max(400, largest * SPECK_SHARE);
  const dropped = new Set();
  blobs.forEach((size, id) => {
    if (size < minimum) dropped.add(id);
  });
  if (dropped.size === 0) return 0;

  for (let i = 0; i < total; i += 1) {
    if (!mask[i] && dropped.has(label[i])) mask[i] = 1;
  }
  return dropped.size;
}

/** Bounding box of every pixel with alpha above the threshold. */
function alphaBoundingBox(rgba, width, height, threshold = 8) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] <= threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Bounding box of every pixel that differs from a reference colour. */
function contrastBoundingBox(data, width, height, channels, reference, tolerance = 26) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const delta =
        Math.abs(data[i] - reference[0]) + Math.abs(data[i + 1] - reference[1]) + Math.abs(data[i + 2] - reference[2]);
      if (delta <= tolerance) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function inspect(filePath, group) {
  const stat = await fs.stat(filePath);
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const stats = await image.stats();
  const hasRealAlpha = Boolean(metadata.hasAlpha) && !stats.isOpaque;

  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const background = classifyBackground(data, info.width, info.height, info.channels, hasRealAlpha);

  return {
    group,
    filePath,
    fileName: path.basename(filePath),
    baseName: path.basename(filePath, path.extname(filePath)),
    publicPath: toPublicPath(filePath),
    size: stat.size,
    width: info.width,
    height: info.height,
    channels: info.channels,
    format: metadata.format,
    declaredAlpha: Boolean(metadata.hasAlpha),
    hasRealAlpha,
    background,
    isLandscape: info.width / info.height >= LANDSCAPE_RATIO,
    raw: data,
    warnings: [],
    manualReview: [],
    outputs: [],
    transparency: hasRealAlpha ? "real alpha preserved" : "none",
    crop: null,
  };
}

/**
 * Turns the inspected asset into an RGBA buffer with the background made
 * transparent when that is safe, plus the crop box around the subject.
 */
function prepareSubject(asset) {
  const { raw, width, height, channels } = asset;
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i += 1, j += channels) {
    rgba[i * 4] = raw[j];
    rgba[i * 4 + 1] = raw[j + 1];
    rgba[i * 4 + 2] = raw[j + 2];
    rgba[i * 4 + 3] = channels === 4 ? raw[j + 3] : 255;
  }

  if (asset.hasRealAlpha) {
    const box = alphaBoundingBox(rgba, width, height);
    return { rgba, box, transparent: true };
  }

  const kind = asset.background.kind;
  if (kind === "checkerboard" || kind === "flat") {
    const { mask, removedShare, reason, speckled } = buildBackgroundMask(
      raw,
      width,
      height,
      channels,
      asset.background,
    );
    if (mask) {
      for (let i = 0; i < width * height; i += 1) {
        if (mask[i]) rgba[i * 4 + 3] = 0;
      }
      asset.removedShare = removedShare;
      asset.speckled = speckled;
      const box = alphaBoundingBox(rgba, width, height);
      return { rgba, box, transparent: true };
    }
    asset.manualReview.push(`background left in place, ${reason}`);
  } else {
    asset.manualReview.push("background is complex or not a clean light field, left in place");
  }

  // No safe cutout. Keep every pixel opaque and crop against the corner colour.
  const cornerIndex = 0;
  const reference = [raw[cornerIndex], raw[cornerIndex + 1], raw[cornerIndex + 2]];
  const box = contrastBoundingBox(raw, width, height, channels, reference);
  return { rgba, box, transparent: false };
}

async function writeOutputs(asset, subject) {
  const { rgba, box, transparent } = subject;
  const { width, height } = asset;
  const crop = box ?? { left: 0, top: 0, width, height };

  const longest = Math.max(crop.width, crop.height);
  const padding = Math.round(longest * PADDING_RATIO);
  const side = longest + padding * 2;
  const extendLeft = Math.round((side - crop.width) / 2);
  const extendTop = Math.round((side - crop.height) / 2);

  asset.crop = { ...crop, side };

  const background = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 };

  await fs.mkdir(asset.group.outputDir, { recursive: true });

  // Crop and pad in their own pass. sharp runs extend after resize inside a
  // single pipeline, which would make the result non square.
  const square = await sharp(Buffer.from(rgba), { raw: { width, height, channels: 4 } })
    .extract(crop)
    .extend({
      top: extendTop,
      bottom: side - crop.height - extendTop,
      left: extendLeft,
      right: side - crop.width - extendLeft,
      background,
    })
    .raw()
    .toBuffer();

  for (const size of asset.group.sizes) {
    // Source and target are both square, so this scales without distortion.
    const scaled = sharp(square, { raw: { width: side, height: side, channels: 4 } }).resize(size, size);

    const pngPath = path.join(asset.group.outputDir, `${asset.baseName}-${size}.png`);
    const webpPath = path.join(asset.group.outputDir, `${asset.baseName}-${size}.webp`);

    await scaled.clone().png({ compressionLevel: 9 }).toFile(pngPath);
    await scaled.clone().webp({ quality: 90, alphaQuality: 100, effort: 5 }).toFile(webpPath);

    const [pngStat, webpStat] = await Promise.all([fs.stat(pngPath), fs.stat(webpPath)]);
    asset.outputs.push({
      size,
      pngPath: toPublicPath(pngPath),
      pngSize: pngStat.size,
      webpPath: toPublicPath(webpPath),
      webpSize: webpStat.size,
    });
  }
}

function describeTransparency(asset, subject) {
  if (asset.hasRealAlpha) return "real alpha channel, preserved";
  if (!subject.transparent) {
    if (asset.background.kind === "flat") return "opaque, flat light background kept";
    return "opaque, background kept";
  }
  if (asset.background.kind === "checkerboard") {
    return `painted checkerboard removed, alpha rebuilt (${Math.round((asset.removedShare ?? 0) * 100)}% of pixels)`;
  }
  return `flat background removed, alpha rebuilt (${Math.round((asset.removedShare ?? 0) * 100)}% of pixels)`;
}

function addWarnings(asset, subject) {
  if (asset.isLandscape) {
    asset.warnings.push(`landscape source canvas ${asset.width}x${asset.height}, cropped to the subject`);
  }
  if (asset.declaredAlpha && !asset.hasRealAlpha) {
    asset.warnings.push("declared alpha channel was fully opaque, transparency was painted in");
  }
  if (asset.background.kind === "checkerboard") {
    asset.warnings.push("checkerboard background detected, treated as intended transparency");
    asset.manualReview.push("check the rebuilt cutout edges before shipping in UI");
  }
  if (asset.speckled) {
    asset.warnings.push(`${asset.speckled} stray speck(s) dropped, likely generator watermark fragments`);
  }
  if (asset.background.kind === "flat" && subject.transparent) {
    asset.manualReview.push("flat background removed automatically, confirm no soft edges were lost");
  }
  if (asset.background.kind === "flat" && !subject.transparent) {
    asset.warnings.push("clean light background, a transparent version needs a manual pass");
  }
  if (asset.crop) {
    const share = Math.round((asset.crop.width * asset.crop.height * 100) / (asset.width * asset.height));
    if (share < 12) {
      asset.warnings.push(`subject filled only ${share}% of the canvas, most of the source was padding`);
    }
  }
  if (!subject.transparent) {
    asset.warnings.push("normalized output is opaque, it will show a background box on coloured surfaces");
  }
}

function buildReport(assets) {
  const lines = [];
  const created = assets.reduce((sum, asset) => sum + asset.outputs.length * 2, 0);
  const transparentCount = assets.filter((asset) => asset.usableTransparency).length;

  lines.push("# Badge and skill icon normalization report");
  lines.push("");
  lines.push("Generated by `npm run assets:normalize-badges`.");
  lines.push("Do not edit by hand, the script rewrites this file.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  for (const group of GROUPS) {
    const groupAssets = assets.filter((asset) => asset.group.key === group.key);
    lines.push(`- ${group.label} inspected: ${groupAssets.length}`);
  }
  lines.push(`- Normalized files created: ${created}`);
  lines.push(`- Assets with usable transparency after normalization: ${transparentCount} of ${assets.length}`);
  lines.push(
    `- Assets needing manual review: ${assets.filter((asset) => asset.manualReview.length > 0).length}`,
  );
  lines.push("");
  lines.push("Originals under `public/assets/badges/` and `public/assets/skills/` are untouched.");
  lines.push("Normalized copies live under `public/assets/normalized/`.");
  lines.push("");

  for (const group of GROUPS) {
    const groupAssets = assets.filter((asset) => asset.group.key === group.key);
    if (groupAssets.length === 0) continue;

    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push("| Original | Original size | Original bytes | Alpha declared | Meaningful transparency | Cropped subject |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const asset of groupAssets) {
      const crop = asset.crop ? `${asset.crop.width}x${asset.crop.height}` : "-";
      lines.push(
        `| \`${asset.publicPath}\` | ${asset.width}x${asset.height} | ${formatSize(asset.size)} | ${asset.declaredAlpha ? "yes" : "no"} | ${asset.transparency} | ${crop} |`,
      );
    }
    lines.push("");
    lines.push("| Original | Normalized PNG | PNG size | Normalized WebP | WebP size | Dimensions |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const asset of groupAssets) {
      for (const output of asset.outputs) {
        lines.push(
          `| \`${asset.fileName}\` | \`${output.pngPath}\` | ${formatSize(output.pngSize)} | \`${output.webpPath}\` | ${formatSize(output.webpSize)} | ${output.size}x${output.size} |`,
        );
      }
    }
    lines.push("");
  }

  lines.push("## Warnings");
  lines.push("");
  const warned = assets.filter((asset) => asset.warnings.length > 0);
  if (warned.length === 0) {
    lines.push("No warnings.");
  } else {
    for (const asset of warned) {
      lines.push(`- \`${asset.publicPath}\`: ${asset.warnings.join("; ")}`);
    }
  }
  lines.push("");

  lines.push("## Manual review");
  lines.push("");
  const review = assets.filter((asset) => asset.manualReview.length > 0);
  if (review.length === 0) {
    lines.push("Nothing needs a manual pass.");
  } else {
    for (const asset of review) {
      lines.push(`- \`${asset.publicPath}\`: ${asset.manualReview.join("; ")}`);
    }
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const assets = [];

  for (const group of GROUPS) {
    let files = await listImages(group.sourceDir);
    if (files.length === 0) {
      // Fall back to the ASSETS-01 optimized copies when no original exists.
      files = await listImages(group.fallbackDir);
    }
    for (const file of files) {
      assets.push(await inspect(file, group));
    }
  }

  for (const asset of assets) {
    const subject = prepareSubject(asset);
    await writeOutputs(asset, subject);
    asset.transparency = describeTransparency(asset, subject);
    asset.usableTransparency = subject.transparent;
    addWarnings(asset, subject);
    // The raw buffer is large, drop it once the outputs are on disk.
    asset.raw = null;
    const largest = asset.outputs[0];
    console.log(
      `normalized ${asset.publicPath} (${asset.width}x${asset.height}, ${formatSize(asset.size)}) -> ${largest.webpPath} (${largest.size}x${largest.size}, ${formatSize(largest.webpSize)})`,
    );
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, buildReport(assets), "utf8");

  console.log("");
  for (const group of GROUPS) {
    const groupAssets = assets.filter((asset) => asset.group.key === group.key);
    console.log(`${group.label} inspected: ${groupAssets.length}`);
  }
  console.log(`Normalized files created: ${assets.reduce((sum, asset) => sum + asset.outputs.length * 2, 0)}`);
  console.log(`Assets needing manual review: ${assets.filter((asset) => asset.manualReview.length > 0).length}`);
  console.log(`Report written to ${path.relative(projectRoot, reportPath).split(path.sep).join("/")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
