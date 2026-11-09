// Byte ranges for large lesson files, and duration read from the mp4 header.
// The files stay on disk. Nothing in here loads a whole video into memory.

import { open } from "node:fs/promises";

export const MEDIA_CHUNK_BYTES = 8 * 1024 * 1024;

export type ByteRange = { start: number; end: number };

export function parseByteRange(
  header: string | null,
  size: number,
): ByteRange | "unsatisfiable" | null {
  if (size <= 0) return "unsatisfiable";
  if (!header) return null;

  const value = header.trim();
  if (!value.toLowerCase().startsWith("bytes=")) return "unsatisfiable";
  const spec = value.slice("bytes=".length);
  if (!spec || spec.includes(",")) return "unsatisfiable";

  const match = /^(\d*)-(\d*)$/.exec(spec);
  if (!match) return "unsatisfiable";

  const startText = match[1] ?? "";
  const endText = match[2] ?? "";

  if (!startText && !endText) return "unsatisfiable";

  let start: number;
  let end: number;

  if (!startText) {
    const suffix = Number(endText);
    if (!Number.isFinite(suffix) || suffix <= 0) return "unsatisfiable";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(startText);
    if (!Number.isFinite(start) || start < 0) return "unsatisfiable";
    if (start >= size) return "unsatisfiable";
    end = endText ? Number(endText) : Math.min(size - 1, start + MEDIA_CHUNK_BYTES - 1);
    if (!Number.isFinite(end)) return "unsatisfiable";
    end = Math.min(end, size - 1);
  }

  if (end < start) return "unsatisfiable";
  if (end - start + 1 > MEDIA_CHUNK_BYTES) {
    end = start + MEDIA_CHUNK_BYTES - 1;
  }
  return { start, end };
}

function readMvhd(buf: Buffer, payloadStart: number, atomEnd: number): number | null {
  if (payloadStart >= atomEnd) return null;
  const version = buf[payloadStart];
  if (version === 0) {
    if (payloadStart + 20 > atomEnd) return null;
    const timescale = buf.readUInt32BE(payloadStart + 12);
    const duration = buf.readUInt32BE(payloadStart + 16);
    if (timescale === 0 || duration === 0xffffffff) return null;
    return duration / timescale;
  }
  if (version === 1) {
    if (payloadStart + 32 > atomEnd) return null;
    const timescale = buf.readUInt32BE(payloadStart + 20);
    const duration = Number(buf.readBigUInt64BE(payloadStart + 24));
    if (timescale === 0) return null;
    return duration / timescale;
  }
  return null;
}

function walkForMvhd(buf: Buffer, start: number, end: number): number | null {
  let offset = start;
  while (offset + 8 <= end) {
    let size = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      if (offset + 16 > end) return null;
      size = Number(buf.readBigUInt64BE(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (!Number.isFinite(size) || size < header) return null;
    const next = offset + size;
    if (next > end) return null;
    const payload = offset + header;
    if (type === "mvhd") {
      const duration = readMvhd(buf, payload, next);
      if (duration != null && duration > 0) return duration;
    } else if (type === "moov" || type === "trak" || type === "mdia") {
      const nested = walkForMvhd(buf, payload, next);
      if (nested != null) return nested;
    }
    offset = next;
  }
  return null;
}

// Finds an mvhd atom inside a buffer that may be only the start or the end
// of a file. A moov atom is parsed only when its declared size fits.
export function durationSecondsFromBuffer(buf: Buffer): number | null {
  const direct = walkForMvhd(buf, 0, buf.length);
  if (direct != null) return direct;

  let searchFrom = 0;
  while (searchFrom < buf.length) {
    const index = buf.indexOf("moov", searchFrom);
    if (index < 4) return null;
    const size = buf.readUInt32BE(index - 4);
    const start = index - 4;
    if (size > 8 && start >= 0 && start + size <= buf.length) {
      const duration = walkForMvhd(buf, start, start + size);
      if (duration != null) return duration;
    }
    searchFrom = index + 4;
  }
  return null;
}

async function readSlice(filePath: string, position: number, length: number): Promise<Buffer> {
  const handle = await open(filePath, "r");
  try {
    const buf = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buf, 0, length, position);
    return buf.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

export async function readVideoDurationSeconds(filePath: string): Promise<number | null> {
  const handle = await open(filePath, "r");
  let size = 0;
  try {
    size = (await handle.stat()).size;
  } finally {
    await handle.close();
  }
  if (size <= 0) return null;

  const headLength = Math.min(size, 512 * 1024);
  const head = await readSlice(filePath, 0, headLength);
  const fromHead = durationSecondsFromBuffer(head);
  if (fromHead != null) return fromHead;

  const tailLength = Math.min(size, 12 * 1024 * 1024);
  if (tailLength <= headLength) return null;
  const tail = await readSlice(filePath, size - tailLength, tailLength);
  return durationSecondsFromBuffer(tail);
}
