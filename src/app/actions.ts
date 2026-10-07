"use server";

import { signIn, signOut } from "@/auth";

/**
 * Login ด้วย Google
 */
export async function googleLoginAction() {
  await signIn("google", {
    redirectTo: "/",
  });
}

/**
 * Logout
 */
export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
