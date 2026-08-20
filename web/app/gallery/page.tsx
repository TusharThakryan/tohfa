import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { composeFromPrompt } from "@/lib/ai/composer";
import { specToScene } from "@/lib/ai/spec";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A gallery of gifts designed with Tohfa - bouquets and cards composed by AI and finished by hand.",
};

const SHOWCASES = [
  { by: "Priya · Mumbai", prompt: "A luxury anniversary bouquet of roses for my wife" },
  { by: "Marta · Lisbon", prompt: "A cheerful birthday bouquet with balloons and confetti" },
  { by: "Ken · Osaka", prompt: "An elegant white wedding bouquet with lilies" },
  { by: "Amara · Lagos", prompt: "A sunflower thank you bouquet for a friend" },
  { by: "Louis · Lyon", prompt: "Red roses with black wrapping for valentine" },
  { by: "Sofia · Bogotá", prompt: "A gentle sympathy bouquet with lavender" },
  { by: "Noor · Dubai", prompt: "A luxury purple orchid bouquet, extravagant" },
  { by: "Ella · Berlin", prompt: "A pastel tulip bouquet for my mother" },
];

export default function GalleryPage() {
  return (
    <section className="min-h-[85svh] pt-[4.5rem]">
      <Container className="py-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            Gallery
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Feelings, on display
          </h1>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            A wall of gifts made with Tohfa. Every one began as a sentence.
          </p>
        </Reveal>

        <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {SHOWCASES.map((s, i) => (
            <Reveal key={i} delay={Math.min(i * 0.05, 0.35)}>
              <figure className="overflow-hidden rounded-3xl border border-plum/8 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <SceneSVG scene={specToScene(composeFromPrompt(s.prompt), "bouquet")} className="w-full" />
                <figcaption className="px-4 py-3">
                  <p className="text-[0.75rem] italic leading-relaxed text-ink-soft">“{s.prompt}”</p>
                  <p className="font-button mt-1.5 text-[0.6875rem] font-bold text-plum">{s.by}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href="/studio" variant="gold" size="lg">
            Make yours
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
