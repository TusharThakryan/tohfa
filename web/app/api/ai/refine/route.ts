import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { refineFromMessage } from "@/lib/ai/composer";
import { REFINE_OPS_SCHEMA, type RefineOp } from "@/lib/ai/spec";
import { ASSET_MAP } from "@/lib/assets";
import type { Scene } from "@/lib/scene/types";

export const maxDuration = 30;

/** Compact semantic summary of the scene - the model reads this, not raw JSON. */
function summarizeScene(scene: Scene): string {
  const page = scene.pages[0];
  const counts = new Map<string, number>();
  for (const l of page.layers) {
    const key =
      l.type === "text"
        ? `text "${(l.text ?? "").slice(0, 30)}"`
        : `${l.assetId}${l.tint ? ` (tint ${l.tint})` : ""}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const lines = [...counts.entries()].map(([k, n]) => (n > 1 ? `${n}× ${k}` : k));
  return `Background: ${page.background}\nGreeting: ${scene.greeting ?? "(none)"}\nLayers:\n${lines.join("\n")}`;
}

const SYSTEM = `You edit an existing Tohfa gift design by emitting patch operations. For small tweaks you patch - the user's manual edits must survive. Only when the user describes a whole NEW design do you rebuild.

Ops: remove (match = asset id like "flower-rose", a category like "flower"/"wrapping"/"ribbon", or "all"), add (asset + count + optional tint), retint (match + tint), background (value = hex or linear-gradient), greeting (text), recompose (prompt).
Interpret the user's intent generously: "more luxury" → retint wrapping to a deep silk tone + ribbon to gold + add gold sparkles; "pastel colors" → retint flowers to soft tints; "replace X with Y" → remove X then add Y.
Use recompose ALONE (no other ops) when the request is a fresh description of what the design should be - a new occasion, theme, or arrangement (e.g. "make it a sunflower birthday bouquet for my best friend") - putting the user's full description in "prompt". Never use recompose for a tweak to the existing design.`;

export async function POST(request: Request) {
  let scene: Scene | null = null;
  let message = "";
  try {
    const body = await request.json();
    scene = body.scene as Scene;
    message = String(body.message ?? "").slice(0, 500);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!scene?.pages || !message.trim()) {
    return NextResponse.json({ error: "scene and message are required" }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming = {
        model: "claude-opus-5",
        max_tokens: 2000,
        betas: ["server-side-fallback-2026-07-01"],
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: REFINE_OPS_SCHEMA } },
        messages: [
          {
            role: "user",
            content: `Current design:\n${summarizeScene(scene)}\n\nUser request: "${message}"`,
          },
        ],
      };
      (params as unknown as Record<string, unknown>).fallbacks = "default";
      const response = await client.beta.messages.create(params);

      if (response.stop_reason !== "refusal") {
        const textBlock = response.content.find((b) => b.type === "text");
        if (textBlock && "text" in textBlock) {
          const parsed = JSON.parse(textBlock.text) as { reply: string; ops: RefineOp[] };
          const ops = (parsed.ops ?? []).filter(
            (op) => op.op !== "add" || ASSET_MAP[(op as { asset?: string }).asset ?? ""]
          );
          return NextResponse.json({ reply: parsed.reply, ops, source: "claude" });
        }
      }
    } catch (err) {
      console.error("AI refine failed, using local parser:", err);
    }
  }

  const { reply, ops } = refineFromMessage(message);
  return NextResponse.json({ reply, ops, source: "local" });
}
