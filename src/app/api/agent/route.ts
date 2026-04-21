import { GoogleGenerativeAI } from "@google/generative-ai";
import { TOOL_DEFINITIONS, executeTool } from "@/lib/tools";
import { SITE_EVENTS } from "@/data/overnight-events";
import type { ToolCall } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const SYSTEM_PROMPT = `You are an overnight security intelligence agent for Ridgeway Industrial Site.
It is 6:10 AM. Maya, the operations lead, needs your help before the 8 AM leadership briefing.

Your job is to investigate all overnight events using your tools, then produce a structured assessment.

INVESTIGATION RULES:
1. Call tools to gather full context on EVERY event before forming conclusions
2. Use get_area_history to check if events are patterns or first occurrences
3. Use correlate_events to check if multiple events are connected
4. Use get_drone_patrol_report to see what was visually confirmed
5. Be honest about uncertainty — do NOT guess when data is missing
6. Classify each event: HARMLESS / WATCH / ESCALATE

CLASSIFICATION GUIDE:
- HARMLESS: Confirmed benign, no further action needed
- WATCH: Anomalous but not immediately dangerous, monitor/log
- ESCALATE: Requires immediate human decision or follow-up action

Available event IDs: ${SITE_EVENTS.map((e) => e.id).join(", ")}
Drone patrol ID: PATROL-A3-20240115

After completing your investigation, respond with ONLY this JSON (no markdown, no preamble):
{
  "summary": "2-3 sentence overview of the night",
  "classifications": [
    {
      "event_id": "EVT-XXX",
      "title": "...",
      "classification": "HARMLESS|WATCH|ESCALATE",
      "reasoning": "1-2 sentence explanation",
      "confidence": "high|medium|low",
      "uncertainty": "what is still unknown"
    }
  ],
  "correlations": ["any linked event patterns as strings"],
  "drone_findings": "What the drone confirmed or did not confirm",
  "escalations": ["items needing immediate attention"],
  "open_items": ["things still needing follow-up"],
  "briefing_draft": "Full paragraph briefing suitable for Nisha at 8 AM, covering what happened, what was harmless, what needs attention, and any open questions"
}`;

export async function POST() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: TOOL_DEFINITIONS as any }],
    });

    const chat = model.startChat();
    const toolCallLog: ToolCall[] = [];
    
    let result = await chat.sendMessage("Investigate all overnight events at Ridgeway Site and prepare Maya's morning briefing. Use your tools thoroughly before drawing conclusions.");
    let response = result.response;

    let iterations = 0;
    const MAX_ITERATIONS = 15;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const functionCalls = response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        // No more tool calls, attempt to parse JSON response
        const rawText = response.text();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return Response.json({ success: false, error: "Could not parse agent response", raw: rawText });
        }
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          return Response.json({ success: true, analysis, toolCallLog });
        } catch (e) {
          return Response.json({ success: false, error: "JSON parse error", raw: rawText });
        }
      }

      // Handle tool calls
      const functionResponses = [];

      for (const call of functionCalls) {
        const toolResult = executeTool(call.name, call.args);
        toolCallLog.push({ tool: call.name, input: call.args, result: toolResult });
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { content: toolResult },
          },
        });
      }

      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    return Response.json({ success: false, error: "Max iterations reached without conclusion" });
  } catch (err) {
    console.error("Agent error:", err);
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
