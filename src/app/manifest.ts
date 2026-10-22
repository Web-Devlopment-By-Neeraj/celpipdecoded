import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CELPIP Decoded",
    short_name: "CELPIP Decoded",
    description: "CELPIP practice for listening, reading, writing, and speaking.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F1EA",
    theme_color: "#12314F",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
