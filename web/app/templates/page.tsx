import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { TemplateCard } from "@/components/scene/TemplateCard";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Designer-made bouquet and greeting card templates for birthdays, weddings, anniversaries, and every festival in between. Open one and make it yours.",
};

export default function TemplatesPage() {
  return (
    <section className="relative min-h-[85svh] overflow-hidden pt-[4.5rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/4 h-96 w-96 animate-blob rounded-full bg-orchid/15 blur-3xl" />
      </div>
      <Container className="py-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            Templates
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Beautiful beginnings
          </h1>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            Every template opens as a fully editable design - move a flower, change
            the ribbon, add your words.
          </p>
        </Reveal>

        {(
          [
            {
              giftType: "bouquet",
              heading: "Bouquets",
              blurb: "Wrapped, ribboned, and arranged - swap any flower you like.",
            },
            {
              giftType: "card",
              heading: "Greeting Cards",
              blurb: "Front, inside, and back - with the message already written for you.",
            },
          ] as const
        ).map((section) => {
          const items = TEMPLATES.filter((t) => t.giftType === section.giftType);
          return (
            <div key={section.giftType} className="mt-12">
              <Reveal>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    {section.heading}
                    <span className="ml-2 text-[0.8125rem] font-normal text-ink-soft">
                      {items.length} designs
                    </span>
                  </h2>
                  <p className="hidden text-[0.8125rem] text-ink-soft sm:block">{section.blurb}</p>
                </div>
              </Reveal>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((t, i) => (
                  <Reveal key={t.slug} delay={Math.min(i * 0.05, 0.35)}>
                    <TemplateCard template={t} />
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
