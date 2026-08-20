import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

const quotes = [
  {
    quote:
      "I typed one sentence and it designed a bouquet that made my mom cry. Then I moved two flowers myself and felt like an artist.",
    name: "Priya S.",
    role: "Sent 14 gifts",
  },
  {
    quote:
      "We used Tohfa for our wedding thank-you cards. The handwriting font and voice message feature destroyed everyone, in the best way.",
    name: "Aman & Kavya",
    role: "Newlyweds",
  },
  {
    quote:
      "As a designer I expected to be unimpressed. The editor is genuinely Canva-grade and the AI edits without wrecking my layout.",
    name: "Lena M.",
    role: "Product designer",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white/50 py-16 sm:py-20">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            Loved by gifters
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Feelings, delivered
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-3xl border border-plum/8 bg-white p-7 shadow-soft">
                <div aria-hidden className="text-gold">
                  {"★★★★★"}
                </div>
                <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-plum/8 pt-4">
                  <p className="font-button font-bold text-ink">{q.name}</p>
                  <p className="text-[0.8125rem] text-ink-soft">{q.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
