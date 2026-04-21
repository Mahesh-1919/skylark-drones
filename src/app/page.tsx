"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Shield, Clock } from "lucide-react";
import AgentInvestigation from "@/components/AgentInvestigation";
import ReviewLayer from "@/components/ReviewLayer";
import MorningBriefing from "@/components/MorningBriefing";
import { SITE_EVENTS, DRONE_PATROL } from "@/data/overnight-events";
import type { AgentAnalysis, ReviewDecision, ToolCall } from "@/types";

// Leaflet must be dynamically imported (no SSR)
const SiteMap = dynamic(() => import("@/components/SiteMap"), { ssr: false });

type Stage = "investigate" | "review" | "briefing";

export default function Home() {
  const [stage, setStage] = useState<Stage>("investigate");
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [toolLog, setToolLog] = useState<ToolCall[]>([]);
  const [decisions, setDecisions] = useState<ReviewDecision[]>([]);

  const handleAgentComplete = (a: AgentAnalysis, log: ToolCall[]) => {
    setAnalysis(a);
    setToolLog(log);
    setStage("review");
  };

  const handleReviewComplete = (d: ReviewDecision[]) => {
    setDecisions(d);
    setStage("briefing");
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-400" size={22} />
            <div>
              <h1 className="text-white font-bold text-lg leading-none">6:10 Assistant</h1>
              <p className="text-gray-500 text-xs mt-0.5">Ridgeway Site · Overnight Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={14} />
            <span>6:10 AM · Morning review in 1h 50m</span>
          </div>
        </div>
      </header>

      {/* Stage pills */}
      <div className="border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {(["investigate", "review", "briefing"] as Stage[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  stage === s
                    ? "bg-blue-600 text-white"
                    : i < ["investigate", "review", "briefing"].indexOf(stage)
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < 2 && <span className="text-gray-700">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: map always visible */}
        <div className="space-y-6">
          <SiteMap
            events={SITE_EVENTS}
            droneWaypoints={DRONE_PATROL.waypoints}
            analysis={analysis ?? undefined}
          />

          {/* Event list */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Overnight Events</h3>
            <div className="space-y-2">
              {SITE_EVENTS.map((e) => {
                const classification = analysis?.classifications.find((c) => c.event_id === e.id);
                return (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-white text-sm">{e.title}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(e.timestamp).toLocaleTimeString()} · {e.zone}
                      </p>
                    </div>
                    {classification ? (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          classification.classification === "ESCALATE"
                            ? "bg-red-900/50 text-red-300"
                            : classification.classification === "WATCH"
                            ? "bg-yellow-900/50 text-yellow-300"
                            : "bg-green-900/50 text-green-300"
                        }`}
                      >
                        {classification.classification}
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          e.severity === "high"
                            ? "bg-red-900/30 text-red-400"
                            : e.severity === "medium"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {e.severity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: current stage */}
        <div>
          {stage === "investigate" && <AgentInvestigation onComplete={handleAgentComplete} />}
          {stage === "review" && analysis && (
            <ReviewLayer analysis={analysis} onReviewComplete={handleReviewComplete} />
          )}
          {stage === "briefing" && analysis && (
            <MorningBriefing analysis={analysis} decisions={decisions} />
          )}
        </div>
      </div>
    </main>
  );
}
