"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Eye, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import type { AgentAnalysis, ReviewDecision, Classification } from "@/types";

interface Props {
  analysis: AgentAnalysis;
  onReviewComplete: (decisions: ReviewDecision[]) => void;
}

const CLASS_STYLES: Record<Classification, string> = {
  ESCALATE: "bg-red-900/40 border-red-700 text-red-300",
  WATCH: "bg-yellow-900/40 border-yellow-700 text-yellow-300",
  HARMLESS: "bg-green-900/40 border-green-700 text-green-300",
};

const CONFIDENCE_STYLES = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-red-400",
};

export default function ReviewLayer({ analysis, onReviewComplete }: Props) {
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const [overrideMode, setOverrideMode] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showCorrelations, setShowCorrelations] = useState(false);

  const approve = (event_id: string) => {
    setDecisions((prev) => ({ ...prev, [event_id]: { event_id, status: "approved" } }));
    setOverrideMode(null);
  };

  const flag = (event_id: string) => {
    setDecisions((prev) => ({
      ...prev,
      [event_id]: { event_id, status: "flagged", note: notes[event_id] },
    }));
  };

  const override = (event_id: string, classification: Classification) => {
    setDecisions((prev) => ({
      ...prev,
      [event_id]: { event_id, status: "overridden", override_classification: classification, note: notes[event_id] },
    }));
    setOverrideMode(null);
  };

  const allReviewed = analysis.classifications.every((c) => decisions[c.event_id]);

  const handleSubmit = () => {
    onReviewComplete(Object.values(decisions));
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="text-purple-400" size={20} />
          <h2 className="text-white font-semibold text-lg">Human Review</h2>
        </div>
        <span className="text-gray-400 text-sm">
          {Object.keys(decisions).length}/{analysis.classifications.length} reviewed
        </span>
      </div>

      {/* AI Summary */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Correlations toggle */}
      {analysis.correlations.length > 0 && (
        <button
          onClick={() => setShowCorrelations(!showCorrelations)}
          className="flex items-center gap-2 text-orange-400 text-sm hover:text-orange-300 transition-colors"
        >
          {showCorrelations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {analysis.correlations.length} event correlation(s) detected
        </button>
      )}
      {showCorrelations && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3 space-y-1">
          {analysis.correlations.map((c, i) => (
            <p key={i} className="text-orange-200 text-xs">• {c}</p>
          ))}
        </div>
      )}

      {/* Per-event review */}
      <div className="space-y-3">
        {analysis.classifications.map((item) => {
          const decision = decisions[item.event_id];
          const isOverriding = overrideMode === item.event_id;

          return (
            <div
              key={item.event_id}
              className={`rounded-lg border p-4 ${CLASS_STYLES[item.classification]} ${decision ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{item.event_id}</span>
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{item.reasoning}</p>
                  {item.uncertainty && (
                    <p className="text-xs italic text-gray-500">⚠ Unknown: {item.uncertainty}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium ${CONFIDENCE_STYLES[item.confidence]}`}>
                      {item.confidence} confidence
                    </span>
                    {decision && (
                      <span className="text-xs text-gray-400">
                        {decision.status === "approved" && "✓ Approved"}
                        {decision.status === "overridden" && `↩ Overridden → ${decision.override_classification}`}
                        {decision.status === "flagged" && "🚩 Flagged"}
                      </span>
                    )}
                  </div>
                </div>

                {!decision && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => approve(item.event_id)}
                      className="flex items-center gap-1 bg-green-800 hover:bg-green-700 text-green-200 text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => setOverrideMode(isOverriding ? null : item.event_id)}
                      className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Edit2 size={12} /> Override
                    </button>
                    <button
                      onClick={() => flag(item.event_id)}
                      className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-200 text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      <AlertTriangle size={12} /> Flag
                    </button>
                  </div>
                )}
              </div>

              {/* Override panel */}
              {isOverriding && (
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  <input
                    className="w-full bg-gray-800 text-white text-xs rounded px-3 py-2 border border-gray-600 placeholder-gray-500"
                    placeholder="Add note (optional)…"
                    value={notes[item.event_id] ?? ""}
                    onChange={(e) => setNotes((p) => ({ ...p, [item.event_id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    {(["HARMLESS", "WATCH", "ESCALATE"] as Classification[]).map((cls) => (
                      <button
                        key={cls}
                        onClick={() => override(item.event_id, cls)}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                          cls === "ESCALATE"
                            ? "bg-red-700 hover:bg-red-600 text-white"
                            : cls === "WATCH"
                            ? "bg-yellow-700 hover:bg-yellow-600 text-white"
                            : "bg-green-700 hover:bg-green-600 text-white"
                        }`}
                      >
                        → {cls}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {allReviewed && (
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Generate Morning Briefing →
        </button>
      )}
    </div>
  );
}
