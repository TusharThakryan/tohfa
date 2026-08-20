import {
  Wand2,
  MousePointerClick,
  Mail,
  Share2,
  Download,
  LayoutTemplate,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

const features = [
  {
    icon: Wand2,
    title: "AI Studio",
    body: "Describe the moment - “a luxury bouquet for my wife” - and watch a fully editable design bloom. Never a flat image.",
    accent: "from-plum/10 to-orchid/20 text-plum",
  },
  {
    icon: MousePointerClick,
    title: "Canvas Editor",
    body: "Drag, resize, rotate, layer, and group every element on an infinite canvas - with snapping, shortcuts, undo, and autosave.",
    accent: "from-gold/10 to-gold/20 text-gold",
  },
  {
    icon: Mail,
    title: "Greeting Cards",
    body: "Front, inside, and back - with handwriting fonts, stickers, voice messages, and QR codes that make paper jealous.",
    accent: "from-sage/15 to-sage/25 text-sage",
  },
  {
    icon: Share2,
    title: "Share Anywhere",
    body: "Every gift gets its own beautiful link with a preview image and QR code. Public, private, or just for one person.",
    accent: "from-orchid/15 to-petal text-orchid",
  },
  {
    icon: Download,
    title: "Export in 4K",
    body: "PNG, SVG, PDF, Instagram, WhatsApp, or print-ready files. Your gift looks flawless everywhere it lands.",
    accent: "from-plum/10 to-plum/15 text-plum-soft",
  },
  {
    icon: LayoutTemplate,
    title: "Curated Templates",
    body: "Start from designer-made bouquets and cards for birthdays, weddings, anniversaries, and every festival in between.",
    accent: "from-gold/10 to-petal text-gold",
  },
];

export function Features() {
  return (
    <section className="relative py-16 sm:py-20">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            Why Tohfa
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Everything a feeling needs
            <br className="hidden sm:block" /> to become a gift
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <article className="group h-full rounded-3xl border border-plum/8 bg-white/70 p-7 shadow-soft backdrop-blur transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:shadow-lift">
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br p-3.5 ${f.accent} transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <f.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
