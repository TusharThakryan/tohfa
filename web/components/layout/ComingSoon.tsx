import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/** Elegant placeholder for routes that ship in later phases. */
export function ComingSoon({
  eyebrow,
  title,
  description,
  phase,
}: {
  eyebrow: string;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <section className="relative flex min-h-[85svh] items-center justify-center overflow-hidden pt-[4.5rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/5 h-96 w-96 animate-blob rounded-full bg-orchid/25 blur-3xl" />
        <div className="absolute -bottom-32 right-1/5 h-96 w-96 animate-blob rounded-full bg-plum/15 blur-3xl [animation-delay:-6s]" />
      </div>
      <Reveal className="mx-auto max-w-xl px-5 py-16 text-center">
        <div className="group inline-block animate-float">
          <LogoMark className="h-16 w-16" />
        </div>
        <p className="font-button mt-8 text-sm font-bold uppercase tracking-[0.2em] text-plum">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-ink-soft">{description}</p>
        <p className="font-button mt-3 inline-block rounded-full bg-gold/15 px-4 py-1.5 text-[0.8125rem] font-bold text-ink/70">
          Arriving in {phase}
        </p>
        <div className="mt-9">
          <Button href="/" variant="outline">
            Back to home
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
