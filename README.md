# Skylark: Security Intelligence Dashboard

Skylark is a high-fidelity prototype for an autonomous security intelligence agent designed for industrial site management. It automates the investigation of overnight security events, correlating raw sensor data with historical records and drone patrol reports to produce structured briefings for operations leads.

## Core Methodology: The Intelligence Agent

The heart of Skylark is an **Autonomous ReAct (Reasoning and Acting) Agent** powered by Google's Gemini Pro.

### Tool-Use (Function Calling) Loop
Unlike traditional dashboards that simply display data, Skylark employs an agent that proactively "investigates." When a briefing is requested, the agent enters a loop:
1.  **Analyze:** Examine the initial list of overnight events.
2.  **Tool Call:** Execute specific tools (functions) to gather deep context (e.g., checking if a fence alert happened during high winds or if a failed badge swipe is a recurring pattern for that employee).
3.  **Correlate:** Use spatio-temporal analysis to see if multiple "harmless" events (like a fence vibration followed by an unregistered vehicle) indicate a coordinated incident.
4.  **Conclude:** Classify each event as `HARMLESS`, `WATCH`, or `ESCALATE` and draft a human-readable briefing.

### Security Protocol
The agent is governed by a strict **System Instruction** set that mandates:
*   Context gathering before conclusion.
*   Honesty regarding data gaps (no guessing).
*   Mandatory visual confirmation via drone patrol reports when available.

## Architecture & Tooling

### Frontend
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript).
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a modern, industrial UI.
*   **Visualizations:** [React Leaflet](https://react-leaflet.js.org/) (based on Leaflet.js) for interactive site maps, event plotting, and drone path visualization.
*   **Icons:** [Lucide React](https://lucide.dev/).

### AI Engine
*   **SDK:** `@google/generative-ai` v0.24.x.
*   **Model:** `gemini-flash-latest` (optimized for fast tool-use iterations).
*   **Backend:** Next.js API Routes serving as the bridge between the client and the Generative AI SDK.

### Investigative Tools
The agent has access to a custom library of tools defined in `src/lib/tools.ts`:
*   `get_event_details`: Retrieves raw sensor logs.
*   `get_area_history`: Provides long-term incident patterns for specific zones.
*   `get_drone_patrol_report`: Returns waypoint-by-waypoint visual observations.
*   `get_badge_access_log`: Correlates identity data with access attempts.
*   `correlate_events`: Performs geometric and temporal clustering of events.

##  Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd skylark
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API Access (Google Gemini)

This project utilizes the **Google Gemini API** (specifically the `gemini-flash-latest` model) for autonomous reasoning and tool use.

#### How to obtain your API Key:
1.  **Visit Google AI Studio:** Navigate to [aistudio.google.com](https://aistudio.google.com/).
2.  **Authentication:** Sign in using your Google account.
3.  **Generate Key:** Click on **"Get API key"** in the top-left sidebar.
4.  **Create Project Key:** Click **"Create API key in new project"**.
5.  **Copy:** Copy the generated string.

#### Environment Setup:
Create a file named `.env` in the root of the project and paste your key:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Simulation Data
The system currently runs on a high-fidelity simulation engine located in `src/data/overnight-events.ts`. This includes:
*   **Fence Vibration Sensors:** Metadata including wind speed and duration.
*   **Access Control Systems:** Badge IDs and failed attempt counters.
*   **Autonomous Drone Patrols:** Flight paths and waypoint observation notes.
*   **Historical Logs:** Multi-month records for pattern matching.

---
*Built for the Aerial Agents Founding Full Stack Engineer Assignment.*
