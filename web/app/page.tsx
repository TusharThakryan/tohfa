import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { AIDemo } from "@/components/sections/AIDemo";
import { Templates } from "@/components/sections/Templates";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { faqs } from "@/components/sections/faq-data";
import { Newsletter } from "@/components/sections/Newsletter";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <Features />
      <AIDemo />
      <Templates />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </>
  );
}
