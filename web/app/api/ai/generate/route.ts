import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { composeFromPrompt } from "@/lib/ai/composer";
import { CARD_SPEC_SCHEMA, SCENE_SPEC_SCHEMA, specToScene, type SceneSpec } from "@/lib/ai/spec";
import type { GiftType } from "@/lib/scene/types";

export const maxDuration = 60;

const BOUQUET_SYSTEM = `You are Tohfa's gift designer - you compose digital bouquets as structured scenes, never flat images. You design the WHOLE arrangement from the user's description: their occasion, recipient, colors, and named flowers all shape the result.

Design principles:
- Layers paint bottom-to-top: (1) a greenery collar first - 5–7 leaves on a ring of radius ≈0.2 around the dome center (0.5, 0.35), each rotated to point OUTWARD from the center (a leaf at angle θ on the ring gets rotation ≈ 90−θ degrees); (2) ONE wrapping cone (x=0.5, y≈0.63, scale ~5.4); (3) an outer arc of 6–8 medium blooms (scale 1.3–1.6) evenly spaced on the dome from left to right, y≈0.2–0.42; (4) baby's breath fillers in the gaps; (5) a hero trio on top - two supporting blooms (scale ~1.8) flanking one focal bloom at the center (scale ~2.1); (6) 1–3 floating extras (butterflies, sparkles, hearts) near the edges; (7) ONE ribbon-bow at the wrap waist (x=0.5, y≈0.645, scale ~1.6).
- Keep the dome symmetric and dense - no stray flowers far from the arrangement, no gaps in the arc. Vary rotation (−20°..20°) slightly so it feels organic, never chaotic.
- Choose tints from one cohesive palette matched to the emotion. Luxury = silk or velvet wrap in a deep tone, double gold bow and sparkles. Cheerful = mesh wrap, balloons, confetti, warm tints. Sympathy = lilies, lavender, soft whites, no party extras.
- Match the wrapping style to the mood - wrap-classic (paper), wrap-kraft (rustic), wrap-silk (dark luxury), wrap-lace (romantic/bridal), wrap-mesh (airy, cheerful), wrap-velvet (plush luxury) - and the ribbon likewise: ribbon-bow (classic), ribbon-double-bow (celebration/luxury), ribbon-satin (elegant flowing tails), ribbon-string (rustic twine).
- Background: a soft vertical gradient that flatters the palette.
- Include a hanging gift tag written like a tiny letter: note-card first (x≈0.76, y≈0.86, scale ~3.2, rotation −10), then tag-thread OVER it (x≈0.63, y≈0.822, scale ~3) - it coils at the wrap's bottom edge, arcs upward, and drops into the tag's hole from above without crossing the card's face. Then THREE hand-font texts, all with the SAME rotation as the tag: "Dear <name or relation>," upper-left on the tag (x≈0.72, y≈0.842, size ~22), two short sweet lines centered (x≈0.759, y≈0.868, size ~21), and "Sincerely," lower-right (x≈0.805, y≈0.902, size ~21). Also write a short heartfelt greeting suited to the occasion in the greeting field.
- Honor EVERY instruction in the wish: named flowers, colors, wrap style, ribbon style, extra items, recipient. If the user asks for something specific, it must appear in the design.`;

const CARD_SYSTEM = `You are Tohfa's greeting-card designer - you compose real multi-page cards as structured scenes, never flat images. The canvas is 800×1000. You MUST return exactly three pages: Front, Inside, Back.

Front - the cover. Pick ONE of two structured layouts and keep every element symmetric about x=0.5:
(a) Center-frame layout: a frame (frame-wreath for love/weddings, frame-scallop for celebrations, frame-arch for quiet occasions) at x=0.5, y≈0.36, scale ~5.6, holding a tidy mirrored posy INSIDE it: one focal bloom (scale ~1.55) at the center, two supporting blooms (~1.15) mirrored at x≈0.43/0.57, two leaves mirrored behind, two baby's-breath sprigs mirrored above. Title in display font (size ~56) at y≈0.73, one-line subtitle at y≈0.81, both clear of the frame.
(b) Border layout: a full-card border (frame-border-classic, frame-border-floral, or frame-corners) at x=0.5, y=0.5, scale 10, with a symmetric five-bloom swag garland across y≈0.26 (center bloom largest, ends rotated outward, leaves tucked between), the title centered mid-card (y≈0.55), subtitle at y≈0.635, and a small mirrored leaf-and-bloom accent at y≈0.8.
Never scatter flowers loosely: arrangements are mirrored, evenly spaced, and deliberate.

Inside - the message, laid out like a real letter on a near-white background with minimal decoration (one small motif at top, delicate sprigs in two corners):
1. "Dear <name or relation>," salutation in hand font, LEFT-aligned (x≈0.13, y≈0.17, align "left").
2. The FULL message: TWO substantial paragraphs (5-8 sentences total), personal and heartfelt, composed from the user's description - address the recipient by name inside the text and weave in the occasion and any details they mentioned. Separate paragraphs with a blank line, break lines at ~40 characters with \\n, body font size ~25, LEFT-aligned (x≈0.13, y≈0.46, align "left").
3. A hand-font signature RIGHT-aligned near the bottom (x≈0.87, y≈0.73, align "right"), with the sender's name or a soft placeholder on a second right-aligned line below it (y≈0.785).
Put the same two paragraphs in the top-level "message" field.

Back - quiet and simple: the mood background, one small flower motif with leaves at the center, and "Made with love · Tohfa" in small body text near the bottom (y≈0.9).

Layout discipline: keep the front arrangement INSIDE the frame (frame at y≈0.36 scale ~5.6; title at y≈0.73 clear below it), never let elements overlap text, and choose one cohesive palette across all three pages.

Honor EVERY instruction in the wish: named flowers, colors, styles, the recipient, specific phrases they want written, tone. If they ask for something specific, it must appear in the design.`;

export async function POST(request: Request) {
  let prompt = "";
  let giftType: GiftType = "bouquet";
  try {
    const body = await request.json();
    prompt = String(body.prompt ?? "").slice(0, 500);
    giftType = body.giftType === "card" ? "card" : "bouquet";
    // The wish itself outranks the toggle: "make a card for..." makes a card.
    const p = prompt.toLowerCase();
    if (/\b(card|greeting card|postcard)\b/.test(p) && !/\bbouquet\b/.test(p)) giftType = "card";
    else if (/\bbouquet\b/.test(p) && !/\bcard\b/.test(p)) giftType = "bouquet";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const isCard = giftType === "card";
      const params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming = {
        model: "claude-opus-5",
        max_tokens: 8000,
        betas: ["server-side-fallback-2026-07-01"],
        system: isCard ? CARD_SYSTEM : BOUQUET_SYSTEM,
        output_config: {
          format: { type: "json_schema", schema: isCard ? CARD_SPEC_SCHEMA : SCENE_SPEC_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: `Design a ${isCard ? "three-page greeting card" : "bouquet"} for this wish: "${prompt}"`,
          },
        ],
      };
      // Server-side refusal fallback (typings may lag the beta param)
      (params as unknown as Record<string, unknown>).fallbacks = "default";
      const response = await client.beta.messages.create(params);

      if (response.stop_reason !== "refusal") {
        const textBlock = response.content.find((b) => b.type === "text");
        if (textBlock && "text" in textBlock) {
          const spec = JSON.parse(textBlock.text) as SceneSpec;
          const scene = specToScene(spec, giftType);
          if (scene.pages[0].layers.length > 0) {
            return NextResponse.json({ scene, title: spec.title, source: "claude" });
          }
        }
      }
    } catch (err) {
      console.error("AI generate failed, using local composer:", err);
    }
  }

  const spec = composeFromPrompt(prompt, giftType);
  const scene = specToScene(spec, giftType);
  return NextResponse.json({ scene, title: spec.title, source: "local" });
}
