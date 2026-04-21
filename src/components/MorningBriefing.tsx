"use client";

import { useState } from "react";
import { FileText, Copy, Check, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { AgentAnalysis, ReviewDecision } from "@/types";

interface Props {
  analysis: AgentAnalysis;
  decisions: ReviewDecision[];
}

export default function MorningBriefing({ analysis, decisions }: Props) {
  const [copied, setCopied] = useState(false);
  const [editedBriefing, setEditedBriefing] = useState(analysis.briefing_draft);

  const escalations = analysis.classifications.filter((c) => {
    const d = decisions.find((dd) => dd.event_id === c.event_id);
    const finalClass = d?.override_classification ?? c.classification;
    return finalClass === "ESCALATE";
  });

  const watchItems = analysis.classifications.filter((c) => {
    const d = decisions.find((dd) => dd.event_id === c.event_id);
    const finalClass = d?.override_classification ?? c.classification;
    return finalClass === "WATCH";
  });

  const harmless = analysis.classifications.filter((c) => {
    const d = decisions.find((dd) => dd.event_id === c.event_id);
    const finalClass = d?.override_classification ?? c.classification;
    return finalClass === "HARMLESS";
  });

  const copyBriefing = () => {
    navigator.clipboard.writeText(editedBriefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const now = new Date().toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-green-400" size={20} />
          <h2 className="text-white font-semibold text-lg">Morning Briefing</h2>
        </div>
        <span className="text-gray-500 text-xs">{now}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-center">
          <p className="text-red-300 text-2xl font-bold">{escalations.length}</p>
          <p className="text-red-400 text-xs mt-1">Escalate</p>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 text-center">
          <p className="text-yellow-300 text-2xl font-bold">{watchItems.length}</p>
          <p className="text-yellow-400 text-xs mt-1">Watch</p>
        </div>
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-3 text-center">
          <p className="text-green-300 text-2xl font-bold">{harmless.length}</p>
          <p className="text-green-400 text-xs mt-1">Harmless</p>
        </div>
      </div>

      {/* Escalations */}
      {escalations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-400" />
            <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wider">Requires Attention</h3>
          </div>
          <div className="space-y-2">
            {escalations.map((e) => (
              <div key={e.event_id} className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{e.title}</p>
                <p className="text-gray-400 text-xs mt-1">{e.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open items */}
      {analysis.open_items.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400" />
            <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Open Items</h3>
          </div>
          <ul className="space-y-1">
            {analysis.open_items.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-yellow-600 mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drone findings */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-indigo-400">🚁</span>
          <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Drone Findings</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{analysis.drone_findings}</p>
      </div>

      {/* Harmless events */}
      {harmless.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-green-400" />
            <h3 className="text-green-400 font-semibold text-sm uppercase tracking-wider">Confirmed Harmless</h3>
          </div>
          <ul className="space-y-1">
            {harmless.map((e) => (
              <li key={e.event_id} className="text-gray-400 text-sm flex gap-2">
                <span className="text-green-700 mt-0.5">✓</span> {e.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable briefing for Nisha */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm">Briefing for Nisha (8:00 AM)</h3>
          <button
            onClick={copyBriefing}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          value={editedBriefing}
          onChange={(e) => setEditedBriefing(e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-4 border border-gray-600 resize-none leading-relaxed focus:outline-none focus:border-gray-400"
          rows={7}
        />
        <p className="text-gray-500 text-xs mt-1">You can edit this before the briefing.</p>
      </div>
    </div>
  );
}
