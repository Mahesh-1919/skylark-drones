"use client";

import { useState } from "react";
import { Bot, ChevronDown, ChevronRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import type { AgentAnalysis, ToolCall } from "@/types";

interface Props {
  onComplete: (analysis: AgentAnalysis, toolLog: ToolCall[]) => void;
}

export default function AgentInvestigation({ onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [toolLog, setToolLog] = useState<ToolCall[]>([]);
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>("");

  const runAgent = async () => {
    setStatus("running");
    setToolLog([]);
    setError("");

    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Agent failed");
        setStatus("error");
        return;
      }

      setToolLog(data.toolCallLog);
      setStatus("done");
      onComplete(data.analysis, data.toolCallLog);
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  };

  const toggleTool = (i: number) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toolColor: Record<string, string> = {
    get_event_details: "bg-blue-900/40 border-blue-700",
    get_area_history: "bg-purple-900/40 border-purple-700",
    get_drone_patrol_report: "bg-green-900/40 border-green-700",
    get_badge_access_log: "bg-yellow-900/40 border-yellow-700",
    correlate_events: "bg-orange-900/40 border-orange-700",
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="text-blue-400" size={22} />
        <h2 className="text-white font-semibold text-lg">AI Agent Investigation</h2>
      </div>

      {status === "idle" && (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            The agent will investigate all 5 overnight events using MCP-style tools before forming any conclusions.
          </p>
          <button
            onClick={runAgent}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Bot size={16} />
            Start Investigation
          </button>
        </div>
      )}

      {status === "running" && (
        <div className="flex items-center gap-3 text-blue-300">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Agent is investigating overnight events…</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {toolLog.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">{toolLog.length} tool calls executed</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {toolLog.map((t, i) => (
              <div key={i} className={`rounded-lg border p-3 ${toolColor[t.tool] ?? "bg-gray-800 border-gray-600"}`}>
                <button
                  onClick={() => toggleTool(i)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  {expandedTools.has(i) ? (
                    <ChevronDown size={14} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-400" />
                  )}
                  <span className="text-white text-xs font-mono font-medium">{t.tool}</span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {JSON.stringify(t.input).slice(0, 50)}…
                  </span>
                </button>
                {expandedTools.has(i) && (
                  <pre className="mt-2 text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(t.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle size={16} />
          <span>Investigation complete. Scroll down to review findings.</span>
        </div>
      )}
    </div>
  );
}
