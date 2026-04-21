import type { SiteEvent, DronePatrol } from "@/types";

export const SITE_EVENTS: SiteEvent[] = [
  {
    id: "EVT-001",
    type: "fence_alert",
    title: "Perimeter Fence Vibration — Gate 3 North",
    timestamp: "2024-01-15T02:14:00Z",
    zone: "Gate 3 North",
    lat: 51.505,
    lng: -0.09,
    severity: "medium",
    raw: "FENCE_SENSOR_007: vibration_threshold_exceeded duration=4.2s wind_speed=12kmh adjacent_sensors=normal",
    metadata: {
      sensor_id: "FENCE_SENSOR_007",
      duration_seconds: 4.2,
      wind_speed_kmh: 12,
      adjacent_sensors_triggered: false,
      repeat_alerts: 1,
    },
  },
  {
    id: "EVT-002",
    type: "vehicle",
    title: "Unregistered Vehicle Path — Block C Storage Yard",
    timestamp: "2024-01-15T03:41:00Z",
    zone: "Block C",
    lat: 51.507,
    lng: -0.087,
    severity: "high",
    raw: "VEHICLE_TRACK_12: unregistered plate=UNKNOWN path=storage_yard_C duration=18min last_seen=exit_road_7",
    metadata: {
      plate: "UNKNOWN",
      entry_point: "Service Road 4",
      exit_point: "Exit Road 7",
      duration_minutes: 18,
      speed_kmh_avg: 8,
      registered: false,
    },
  },
  {
    id: "EVT-003",
    type: "badge_fail",
    title: "3x Failed Badge Swipe — Access Point Delta",
    timestamp: "2024-01-15T04:22:00Z",
    zone: "Access Point Delta",
    lat: 51.503,
    lng: -0.092,
    severity: "high",
    raw: "ACCESS_CTRL_D: badge_fail count=3 badge_id=B-4471 interval=90s lockout_triggered=false",
    metadata: {
      badge_id: "B-4471",
      employee_name: "T. Reeves",
      shift: "night",
      attempts: 3,
      interval_seconds: 90,
      lockout_triggered: false,
      last_successful_entry: "2024-01-14T22:05:00Z",
    },
  },
  {
    id: "EVT-004",
    type: "drone_patrol",
    title: "Scheduled Drone Patrol — Alpha Route",
    timestamp: "2024-01-15T04:45:00Z",
    zone: "Block C / Gate 3",
    lat: 51.506,
    lng: -0.089,
    severity: "low",
    raw: "DRONE_OP_A3: patrol_complete route=alpha duration=22min anomalies=0 battery=74%",
    metadata: {
      drone_id: "DRONE-A3",
      route: "alpha",
      duration_minutes: 22,
      battery_remaining_pct: 74,
      anomalies_detected: 0,
      areas_covered: ["Gate 3", "Block C", "Storage Yard C", "Access Point Delta"],
    },
  },
  {
    id: "EVT-005",
    type: "access_log",
    title: "Late Entry — Contractor Badge, Zone B",
    timestamp: "2024-01-15T01:55:00Z",
    zone: "Zone B",
    lat: 51.504,
    lng: -0.094,
    severity: "low",
    raw: "ACCESS_CTRL_B: entry badge_id=C-9921 type=contractor zone=B time=01:55 authorized=true",
    metadata: {
      badge_id: "C-9921",
      type: "contractor",
      authorized: true,
      company: "Meridian Electrical",
      work_order: "WO-2241",
      scheduled_window: "00:00-06:00",
    },
  },
];

export const DRONE_PATROL: DronePatrol = {
  id: "PATROL-A3-20240115",
  startTime: "2024-01-15T04:45:00Z",
  endTime: "2024-01-15T05:07:00Z",
  areasChecked: ["Gate 3 North", "Block C Storage Yard", "Access Point Delta", "Service Road 4"],
  summary:
    "Patrol completed without anomaly flags. Block C visually clear at 04:51. Gate 3 perimeter intact. No personnel observed near failed badge access point. Vehicle no longer present at storage yard.",
  waypoints: [
    { lat: 51.505, lng: -0.091, timestamp: "2024-01-15T04:45:00Z", note: "Patrol start — base" },
    { lat: 51.505, lng: -0.09, timestamp: "2024-01-15T04:48:00Z", note: "Gate 3 North — fence intact, no breach" },
    { lat: 51.507, lng: -0.087, timestamp: "2024-01-15T04:51:00Z", note: "Block C Storage — yard clear, no vehicle" },
    { lat: 51.503, lng: -0.092, timestamp: "2024-01-15T04:58:00Z", note: "Access Point Delta — no persons present" },
    { lat: 51.504, lng: -0.094, timestamp: "2024-01-15T05:03:00Z", note: "Zone B — contractor vehicle noted, authorized" },
    { lat: 51.505, lng: -0.091, timestamp: "2024-01-15T05:07:00Z", note: "Patrol complete — return to base" },
  ],
};

export const AREA_HISTORY: Record<string, { date: string; summary: string }[]> = {
  "Gate 3 North": [
    { date: "2024-01-08", summary: "Fence alert — confirmed wind event, no breach" },
    { date: "2023-12-21", summary: "Sensor malfunction, replaced unit" },
  ],
  "Block C": [
    { date: "2024-01-10", summary: "Contractor vehicle after hours — authorized, logged late" },
    { date: "2023-11-30", summary: "Unauthorized access attempt — escalated, investigated" },
  ],
  "Access Point Delta": [
    { date: "2024-01-12", summary: "Single badge fail — employee error" },
    { date: "2023-12-05", summary: "System reboot caused 2 false fails" },
  ],
  "Zone B": [
    { date: "2024-01-05", summary: "Meridian Electrical routine work — authorized" },
  ],
};
