"use client";

import { useEffect } from "react";

// Recovery emails sometimes return to the site root, with the session in the
// address hash. Move that hash to the new-password page before it is dropped.
export function AuthEmailRedirect() {
  useEffect(() => {
    if (window.location.pathname === "/reset-password") return;
    const hash = window.location.hash;
    const type = new URLSearchParams(hash.replace(/^#/, "")).get("type");
    if (type !== "recovery") return;
    window.location.replace(`/reset-password${hash}`);
  }, []);

  return null;
}
