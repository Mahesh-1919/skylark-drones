import { SITE_EVENTS, DRONE_PATROL, AREA_HISTORY } from "@/data/overnight-events";

export const TOOL_DEFINITIONS = [
  {
    name: "get_event_details",
    description: "Get full details about a specific overnight event by its ID including raw sensor data and metadata",
    parameters: {
      type: "OBJECT",
      properties: {
        event_id: { type: "STRING", description: "The event ID e.g. EVT-001" },
      },
      required: ["event_id"],
    },
  },
  {
    name: "get_area_history",
    description: "Get the historical incident record for a specific zone or area on site. Use this to understand if an event is a pattern or a first occurrence.",
    parameters: {
      type: "OBJECT",
      properties: {
        zone: { type: "STRING", description: "Zone name e.g. 'Gate 3 North' or 'Block C'" },
      },
      required: ["zone"],
    },
  },
  {
    name: "get_drone_patrol_report",
    description: "Get the full drone patrol summary — what areas were checked, what was observed at each waypoint, and the overall findings",
    parameters: {
      type: "OBJECT",
      properties: {
        patrol_id: { type: "STRING", description: "Patrol ID — use PATROL-A3-20240115" },
      },
      required: ["patrol_id"],
    },
  },
  {
    name: "get_badge_access_log",
    description: "Get badge swipe history and employee/contractor details for an access control event",
    parameters: {
      type: "OBJECT",
      properties: {
        event_id: { type: "STRING", description: "The badge-related event ID" },
      },
      required: ["event_id"],
    },
  },
  {
    name: "correlate_events",
    description: "Check whether multiple events are spatially or temporally related. Use this to find connections between events that may look unrelated on the surface.",
    parameters: {
      type: "OBJECT",
      properties: {
        event_ids: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of event IDs to correlate",
        },
      },
      required: ["event_ids"],
    },
  },
];

export function executeTool(name: string, input: any): any {
  switch (name) {
    case "get_event_details": {
      const event = SITE_EVENTS.find((e) => e.id === input.event_id);
      return event ?? { error: `Event ${input.event_id} not found` };
    }
    case "get_area_history": {
      const zone = input.zone as string;
      const history = AREA_HISTORY[zone] ?? [];
      return { zone, history, total_incidents: history.length };
    }
    case "get_drone_patrol_report": {
      return DRONE_PATROL;
    }
    case "get_badge_access_log": {
      const event = SITE_EVENTS.find((e) => e.id === input.event_id);
      if (!event) return { error: "Event not found" };
      return {
        event_id: event.id,
        badge_details: event.metadata,
        raw_log: event.raw,
        timestamp: event.timestamp,
        zone: event.zone,
      };
    }
    case "correlate_events": {
      const ids = input.event_ids as string[];
      const events = SITE_EVENTS.filter((e) => ids.includes(e.id));
      const zones = [...new Set(events.map((e) => e.zone))];
      const times = events.map((e) => new Date(e.timestamp).getTime());
      const timeSpanMinutes = times.length > 1 ? Math.round((Math.max(...times) - Math.min(...times)) / 60000) : 0;
      const blockCEvents = events.filter((e) => e.zone.includes("Block C") || e.zone.includes("Gate 3"));
      return {
        events_found: events.length,
        zones_involved: zones,
        time_span_minutes: timeSpanMinutes,
        spatial_overlap: blockCEvents.length > 1,
        events_in_cluster: blockCEvents.map((e) => ({ id: e.id, title: e.title, time: e.timestamp })),
        note:
          timeSpanMinutes < 120
            ? "Events occurred within a 2-hour window — possible correlation"
            : "Events are temporally distant — likely independent",
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
