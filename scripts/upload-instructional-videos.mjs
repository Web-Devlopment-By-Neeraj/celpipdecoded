import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function loadEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const name = trimmed.slice(0, trimmed.indexOf("="));
    let value = trimmed.slice(trimmed.indexOf("=") + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

loadEnvFile(resolve(".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then run this again.",
  );
  process.exit(1);
}

const files = [
  ["public/assets/instructional-thumbnails/1. Overview Instructional Video.mp4", "overview.mp4"],
  ["public/assets/instructional-thumbnails/2. Listening Instructional Video.mp4", "listening.mp4"],
  ["public/assets/instructional-thumbnails/3. Reading Instructional Video.mp4", "reading.mp4"],
  ["public/assets/instructional-thumbnails/4. Writing Instructional Video.mp4", "writing.mp4"],
  ["public/assets/instructional-thumbnails/5. Speaking Instructional Video.mp4", "speaking.mp4"],
];

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const [localPath, objectName] of files) {
  const body = await readFile(resolve(localPath));
  const { error } = await supabase.storage
    .from("instructional-videos")
    .upload(objectName, body, { contentType: "video/mp4", upsert: true });
  if (error) {
    console.error(`Upload failed for ${objectName}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Uploaded ${objectName}`);
}
