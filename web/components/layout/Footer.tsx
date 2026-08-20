import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "AI Studio", href: "/studio" },
      { label: "Bouquet Builder", href: "/create" },
      { label: "Greeting Cards", href: "/create" },
      { label: "Templates", href: "/templates" },
      { label: "My Gifts", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-plum/10 bg-white/60">
      <Container className="py-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-ink-soft">
              {site.tagline}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-button text-sm font-bold uppercase tracking-wider text-ink/70">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.875rem] text-ink-soft transition-colors hover:text-plum"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-plum/10 pt-6 text-[0.8125rem] text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} Tohfa. All rights reserved.</p>
          <p>
            Made with <span aria-hidden>🌸</span> for every emotion.
          </p>
        </div>
      </Container>
    </footer>
  );
}
