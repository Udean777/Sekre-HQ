import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createTaskApiClient } from "$lib/api/clients/task.client";
import { createEventApiClient } from "$lib/api/clients/event.client";

export const load: PageServerLoad = async ({ locals }) => {
  // Protect route
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  try {
    // Create API clients
    const taskClient = createTaskApiClient(locals.token);
    const eventClient = createEventApiClient(locals.token);

    // Fetch data using NEW architecture
    const [tasks, events] = await Promise.all([
      taskClient.list(),
      eventClient.list(),
    ]);

    console.log("[Dashboard] Tasks response type:", typeof tasks);
    console.log("[Dashboard] Tasks is array:", Array.isArray(tasks));
    console.log("[Dashboard] Tasks:", tasks);
    console.log("[Dashboard] Events response type:", typeof events);
    console.log("[Dashboard] Events is array:", Array.isArray(events));
    console.log("[Dashboard] Events:", events);

    // Ensure we have arrays
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const eventArray = Array.isArray(events) ? events : [];

    console.log("[Dashboard] Tasks loaded:", taskArray.length);
    console.log("[Dashboard] Events loaded:", eventArray.length);

    // Calculate stats
    const now = new Date();
    const activeTasks = taskArray.filter((t) => t.task.status !== "DONE");
    const upcomingEvents = eventArray.filter((e) => new Date(e.start_time) > now);

    // Get recent items (last 5)
    const recentTasks = taskArray.slice(0, 5);
    const recentEvents = eventArray.slice(0, 5);

    return {
      stats: {
        activeTasks: activeTasks.length,
        upcomingEvents: upcomingEvents.length,
        totalTasks: taskArray.length,
        totalEvents: eventArray.length,
      },
      recentTasks,
      recentEvents,
    };
  } catch (error: any) {
    console.error("[Dashboard] Failed to load data:", error);
    console.error("[Dashboard] Error stack:", error.stack);

    // If token is invalid, redirect to login
    if (error.statusCode === 401 || error.message?.includes("401")) {
      throw redirect(303, "/login");
    }

    return {
      stats: {
        activeTasks: 0,
        upcomingEvents: 0,
        totalTasks: 0,
        totalEvents: 0,
      },
      recentTasks: [],
      recentEvents: [],
      error: "Failed to load dashboard data. Please refresh the page.",
    };
  }
};
