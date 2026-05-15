import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createApiClient } from "$lib/server/api";

export const load: PageServerLoad = async ({ locals }) => {
  // Protect route
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const apiClient = createApiClient(locals.token);

  try {
    // For now, we'll get members from divisions
    // In future, we can add dedicated organization members endpoint
    const divisions = await apiClient.get<any[]>("/divisions");

    // Get unique members from all divisions
    const memberPromises = divisions.map((div) =>
      apiClient.get<any[]>(`/divisions/${div.id}/members`).catch(() => []),
    );

    const divisionMembers = await Promise.all(memberPromises);

    // Flatten and deduplicate members
    const allMembers = divisionMembers.flat();
    const uniqueMembers = Array.from(
      new Map(allMembers.map((m) => [m.user?.id || m.user_id, m])).values(),
    );

    console.log("[Members Page] Loaded members:", uniqueMembers.length);

    return {
      members: uniqueMembers,
      divisions,
    };
  } catch (error: any) {
    console.error("[Members Page] Failed to load:", error);
    return {
      members: [],
      divisions: [],
      error: "Failed to load members",
    };
  }
};
