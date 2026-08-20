import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tohfa means “gift” in Hindi and Urdu. We're building the most beautiful way to turn a feeling into something you can give.",
};

export default function AboutPage() {
  return (
    <section className="relative overflow-hidden pt-[4.5rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/5 h-96 w-96 animate-blob rounded-full bg-orchid/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/6 h-96 w-96 animate-blob rounded-full bg-gold/10 blur-3xl [animation-delay:-7s]" />
      </div>
      <Container className="max-w-3xl py-16 sm:py-20">
        <Reveal className="text-center">
          <div className="group inline-block">
            <LogoMark className="h-14 w-14" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Tohfa means <span className="text-gradient">gift</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 space-y-6 text-[1.0625rem] leading-relaxed text-ink-soft">
            <p>
              In Hindi and Urdu, a <em>tohfa</em> is more than an object - it is
              the moment someone realizes you were thinking of them. We started
              Tohfa because that moment deserved better than a rushed text
              message or a generic e-card.
            </p>
            <p>
              Tohfa is a design studio for feelings. Describe the person and the
              occasion, and our AI composes a bouquet or card as a real,
              structured design - then hands you the brush. Move a flower.
              Change the ribbon. Add your voice. Nothing is flattened, nothing
              is final until you say so.
            </p>
            <p>
              We’re beginning with bouquets and greeting cards, but the canvas
              is built for everything gifting will become: gift boxes,
              invitations, memory books, wedding suites - every emotion,
              beautifully gifted.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12 rounded-3xl border border-plum/10 bg-white/70 px-8 py-8 text-center shadow-soft">
            <p className="font-button text-[0.75rem] font-bold uppercase tracking-[0.2em] text-plum">
              A note from the maker
            </p>
            <p className="mx-auto mt-4 max-w-md font-display text-2xl leading-snug text-ink">
              This project is dedicated to someone special.
            </p>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
              Every flower drawn here, every word it helps you write - it all
              began with one person worth making something beautiful for. You
              know who you are.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="mt-8 text-center">
          <Button href="/create" size="lg">
            Make someone’s day
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
