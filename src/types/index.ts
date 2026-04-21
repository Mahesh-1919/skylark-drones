export type Severity = "low" | "medium" | "high";
export type EventType = "fence_alert" | "vehicle" | "badge_fail" | "drone_patrol" | "access_log";
export type Classification = "HARMLESS" | "WATCH" | "ESCALATE";
export type ReviewStatus = "pending" | "approved" | "overridden" | "flagged";

export interface SiteEvent {
  id: string;
  type: EventType;
  title: string;
  timestamp: string;
  zone: string;
  lat: number;
  lng: number;
  severity: Severity;
  raw: string;
  metadata: Record<string, unknown>;
}

export interface DroneWaypoint {
  lat: number;
  lng: number;
  timestamp: string;
  note: string;
}

export interface DronePatrol {
  id: string;
  startTime: string;
  endTime: string;
  waypoints: DroneWaypoint[];
  summary: string;
  areasChecked: string[];
}

export interface EventClassification {
  event_id: string;
  title: string;
  classification: Classification;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  uncertainty: string;
}

export interface AgentAnalysis {
  summary: string;
  classifications: EventClassification[];
  correlations: string[];
  drone_findings: string;
  escalations: string[];
  open_items: string[];
  briefing_draft: string;
}

export interface ReviewDecision {
  event_id: string;
  status: ReviewStatus;
  override_classification?: Classification;
  note?: string;
}

export interface ToolCall {
  tool: string;
  input: unknown;
  result: unknown;
}
