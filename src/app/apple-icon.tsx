import { ImageResponse } from "next/og";

// CELPIP Decoded home screen icon (BRAND-01).
//
// Generated rather than shipped as a raster, so the mark is defined once
// in code and the previous brand's PNG could be dropped. The tab icon is
// the SVG beside this file; this one exists because an Apple touch icon
// has to be a PNG.

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12314F",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 32 32" fill="none">
          <path
            d="M12 7.5H9a2 2 0 0 0-2 2v4.5a2 2 0 0 1-2 2 2 2 0 0 1 2 2V22.5a2 2 0 0 0 2 2h3"
            stroke="#F4F1EA"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 7.5h3a2 2 0 0 1 2 2v4.5a2 2 0 0 0 2 2 2 2 0 0 0-2 2V22.5a2 2 0 0 1-2 2h-3"
            stroke="#F4F1EA"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="3.4" fill="#0E9F6E" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
