import { redirect, fail, isRedirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createApiClient } from "$lib/server/api";
import { setAuthCookie } from "$lib/server/auth";
import type { AuthResponse, LoginRequest } from "$lib/api/types";
import { getErrorMessage } from "$lib/api/errors";

export const load: PageServerLoad = async ({ locals }) => {
  // If already authenticated, redirect to app
  if (locals.user) {
    throw redirect(303, "/app");
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();

    // Debug: log all form data
    console.log("[Login Action] FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    console.log("[Login Action] Received:", {
      email,
      password: password ? "***" : "(empty)",
    });

    // Validate required fields
    if (!email || !password) {
      console.log("[Login Action] Validation failed: missing fields");
      return fail(400, {
        error: "Email and password are required",
        email,
      });
    }

    const loginData: LoginRequest = {
      email,
      password,
    };

    try {
      // Call login API
      const api = createApiClient();
      console.log("[Login Action] Calling API with:", { email });
      const response = await api.post<AuthResponse>("/auth/login", loginData);

      console.log("[Login Action] API response received");

      // Set auth cookie with access_token
      setAuthCookie(cookies, response.tokens.access_token);

      // Redirect to app
      throw redirect(303, "/app");
    } catch (error) {
      // If it's a redirect, re-throw it (this is expected behavior)
      if (isRedirect(error)) {
        throw error;
      }

      console.log("[Login Action] Error:", error);

      return fail(401, {
        error: getErrorMessage(error),
        email,
      });
    }
  },
};
