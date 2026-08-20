/**
 * Template library - designer starting points, generated through the same
 * composer that powers AI Studio so every template is fully editable.
 */
import { composeFromPrompt } from "@/lib/ai/composer";
import { specToScene } from "@/lib/ai/spec";
import type { GiftType, Scene } from "@/lib/scene/types";

export interface TemplateDef {
  slug: string;
  title: string;
  occasion: string;
  giftType: GiftType;
  description: string;
  prompt: string;
}

export const TEMPLATES: TemplateDef[] = [
  // ── Bouquets ──────────────────────────────────────────────
  {
    slug: "velvet-devotion",
    title: "Velvet Devotion",
    occasion: "Anniversary",
    giftType: "bouquet",
    description: "Roses and peonies in deep romance tones, wrapped in plush velvet.",
    prompt: "A luxury anniversary bouquet of roses and peonies in velvet wrapping for my wife",
  },
  {
    slug: "confetti-bloom",
    title: "Confetti Bloom",
    occasion: "Birthday",
    giftType: "bouquet",
    description: "Daisies, tulips and balloons in airy mesh with a double bow.",
    prompt: "A cheerful birthday bouquet with balloons and confetti",
  },
  {
    slug: "ivory-promise",
    title: "Ivory Promise",
    occasion: "Wedding",
    giftType: "bouquet",
    description: "Lilies and baby's breath in bridal lace with a satin ribbon.",
    prompt: "An elegant white wedding bouquet with lilies",
  },
  {
    slug: "golden-hour",
    title: "Golden Hour",
    occasion: "Thank You",
    giftType: "bouquet",
    description: "Sunflowers in kraft paper and twine - thanks, like sunshine does.",
    prompt: "A bright sunflower bouquet to thank a dear friend",
  },
  {
    slug: "quiet-comfort",
    title: "Quiet Comfort",
    occasion: "Sympathy",
    giftType: "bouquet",
    description: "Lilies and lavender in soft whites - gentle, calm, present.",
    prompt: "A gentle sympathy bouquet with lilies and lavender",
  },
  {
    slug: "midnight-muse",
    title: "Midnight Muse",
    occasion: "Valentine",
    giftType: "bouquet",
    description: "Red roses against black silk wrapping. Bold, timeless, certain.",
    prompt: "A luxury valentine bouquet of red roses with black wrapping",
  },
  {
    slug: "sakura-drift",
    title: "Sakura Drift",
    occasion: "New Beginnings",
    giftType: "bouquet",
    description: "Cherry blossoms in sheer mesh wrap, the softest spring pinks.",
    prompt: "A dreamy pink cherry blossom bouquet in mesh wrapping for a fresh start",
  },
  {
    slug: "morning-hydrangea",
    title: "Morning Hydrangea",
    occasion: "Housewarming",
    giftType: "bouquet",
    description: "Powder-blue hydrangeas in natural kraft - calm as a new home.",
    prompt: "A calm blue hydrangea bouquet with soft greenery in natural kraft wrapping",
  },
  {
    slug: "blushing-carnations",
    title: "Blushing Carnations",
    occasion: "Mother's Day",
    giftType: "bouquet",
    description: "Pink carnations in delicate lace with a flowing satin ribbon.",
    prompt: "A mother's day bouquet of pink carnations with lace wrapping and a satin ribbon",
  },
  {
    slug: "amber-harvest",
    title: "Amber Harvest",
    occasion: "Autumn",
    giftType: "bouquet",
    description: "Golden chrysanthemums in rustic kraft, tied with twine.",
    prompt: "A rustic autumn chrysanthemum bouquet in kraft wrapping tied with twine",
  },
  {
    slug: "royal-iris",
    title: "Royal Iris",
    occasion: "Get Well",
    giftType: "bouquet",
    description: "Purple irises and daisies in airy mesh - a bright wish to feel better.",
    prompt: "A get well soon bouquet of purple irises and daisies with mesh wrapping",
  },
  {
    slug: "velvet-orchid",
    title: "Velvet Orchid",
    occasion: "Luxury",
    giftType: "bouquet",
    description: "Orchids in deep velvet with a double gold bow. Pure indulgence.",
    prompt: "An extravagant orchid bouquet in deep velvet wrapping with a double gold bow",
  },
  // ── Greeting cards ────────────────────────────────────────
  {
    slug: "birthday-sparkler",
    title: "Birthday Sparkler",
    occasion: "Birthday",
    giftType: "card",
    description: "A confetti-bright birthday card with the wishes already written.",
    prompt: "A confetti birthday card for my best friend",
  },
  {
    slug: "forever-yours",
    title: "Forever Yours",
    occasion: "Anniversary",
    giftType: "card",
    description: "A romantic anniversary card with a love letter inside.",
    prompt: "A romantic anniversary card for my wife",
  },
  {
    slug: "ivory-vows",
    title: "Ivory Vows",
    occasion: "Wedding",
    giftType: "card",
    description: "An elegant wedding card in ivory and gold, blessings included.",
    prompt: "An elegant wedding congratulations card in ivory and gold",
  },
  {
    slug: "mothers-garden",
    title: "Mother's Garden",
    occasion: "Mother's Day",
    giftType: "card",
    description: "Pink carnations and a heartfelt note for the best mom.",
    prompt: "A mother's day card full of pink carnations for mom",
  },
  {
    slug: "brightest-thanks",
    title: "Brightest Thanks",
    occasion: "Thank You",
    giftType: "card",
    description: "Sunflowers and a warm thank-you message, ready to send.",
    prompt: "A thank you card for my favorite teacher with sunflowers",
  },
  {
    slug: "gentle-days",
    title: "Gentle Days",
    occasion: "Get Well",
    giftType: "card",
    description: "Soft lavender and quiet words for a speedy recovery.",
    prompt: "A get well soon card with soft lavender",
  },
  {
    slug: "lavender-letter",
    title: "Lavender Letter",
    occasion: "Just Because",
    giftType: "card",
    description: "A card wrapped in lavender calm, for someone you miss.",
    prompt: "A calm purple lavender greeting card for someone I miss",
  },
  {
    slug: "sunshine-note",
    title: "Sunshine Note",
    occasion: "Congratulations",
    giftType: "card",
    description: "A congratulations card that beams - sunflowers and sparkle.",
    prompt: "A cheerful congratulations card with sunflowers",
  },
];

export function templateScene(template: TemplateDef): Scene {
  return specToScene(composeFromPrompt(template.prompt, template.giftType), template.giftType);
}

export function getTemplate(slug: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
