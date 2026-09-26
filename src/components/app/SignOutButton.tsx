"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ButtonSize, ButtonVariant } from "@/features/design/design-tokens";
import { AppButton } from "./AppButton";

// Signs the user out and returns them to the landing page.
//
// The sign out call itself is unchanged. The props only exist so the
// same control can sit in the desktop account menu and stretch across
// the mobile drawer.
export function SignOutButton({
  variant = "secondary",
  size = "sm",
  fullWidth = false,
  onSignOut,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  // Fires before the redirect, so an open menu can close itself.
  onSignOut?: () => void;
} = {}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    onSignOut?.();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <AppButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isSigningOut}
      loadingText="Signing out..."
      onClick={handleSignOut}
    >
      Sign out
    </AppButton>
  );
}
