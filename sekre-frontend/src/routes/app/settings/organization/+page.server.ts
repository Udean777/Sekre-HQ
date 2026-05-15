import { fail } from "@sveltejs/kit";
import { ServerApiClient } from "$lib/server/api";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Get user's role in organization
  const api = new ServerApiClient(locals.token);
  try {
    const members = await api.get<any[]>("/members");
    const currentMember = members.find(
      (m: any) => m.user_id === locals.user?.id,
    );

    return {
      role: currentMember?.role || "MEMBER",
    };
  } catch (error) {
    return {
      role: "MEMBER",
    };
  }
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    // Check permission
    const api = new ServerApiClient(locals.token);
    try {
      const members = await api.get<any[]>("/members");
      const currentMember = members.find(
        (m: any) => m.user_id === locals.user?.id,
      );

      if (!["OWNER", "ADMIN"].includes(currentMember?.role)) {
        return fail(403, {
          error: "You do not have permission to modify organization settings",
        });
      }

      const formData = await request.formData();
      const name = formData.get("name") as string;

      await api.patch("/organizations/me", { name });

      return {
        success: true,
        message: "Organization settings updated successfully",
      };
    } catch (error: any) {
      return fail(400, {
        error: error.message || "Failed to update organization settings",
      });
    }
  },
  delete: async ({ locals }) => {
    const api = new ServerApiClient(locals.token);
    try {
      const members = await api.get<any[]>("/members");
      const currentMember = members.find(
        (m: any) => m.user_id === locals.user?.id,
      );

      if (currentMember?.role !== "OWNER") {
        return fail(403, {
          error: "Only organization owner can delete organization",
        });
      }

      await api.delete("/organizations/me");
      return { success: true, deleted: true };
    } catch (error: any) {
      return fail(400, {
        error: error.message || "Failed to delete organization",
      });
    }
  },
};
