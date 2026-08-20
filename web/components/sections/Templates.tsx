import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

const templates = [
  {
    occasion: "Birthday",
    title: "Confetti Bloom",
    gradient: "from-orchid/60 via-petal to-gold/30",
    emoji: "🎂",
  },
  {
    occasion: "Anniversary",
    title: "Golden Decade",
    gradient: "from-gold/50 via-petal to-orchid/40",
    emoji: "💍",
  },
  {
    occasion: "Valentine",
    title: "Velvet Whisper",
    gradient: "from-plum/40 via-orchid/40 to-petal",
    emoji: "💌",
  },
  {
    occasion: "Wedding",
    title: "Ivory Promise",
    gradient: "from-sage/40 via-mist to-gold/25",
    emoji: "🕊️",
  },
];

export function Templates() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
              Templates
            </p>
            <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Begin with something beautiful
            </h2>
          </div>
          <Link
            href="/templates"
            className="font-button group inline-flex items-center gap-2 font-bold text-plum"
          >
            Browse all templates
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08}>
              <Link
                href="/templates"
                className="group block overflow-hidden rounded-3xl border border-plum/8 bg-white shadow-soft transition-all duration-500 ease-spring hover:-translate-y-2 hover:shadow-lift"
              >
                <div
                  className={`relative flex aspect-[4/5] items-center justify-center bg-gradient-to-br ${t.gradient}`}
                >
                  <span className="text-6xl transition-transform duration-500 ease-spring group-hover:scale-125 group-hover:-rotate-6">
                    {t.emoji}
                  </span>
                  <span className="font-button absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[0.75rem] font-bold text-plum backdrop-blur">
                    {t.occasion}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {t.title}
                  </h3>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                    Customize in one click
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
