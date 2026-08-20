export const site = {
  name: "Tohfa",
  tagline: "Every Emotion, Beautifully Gifted.",
  description:
    "Design beautiful digital bouquets, greeting cards, and gifts in minutes - with AI or by hand in a delightful drag-and-drop studio.",
  url: "https://tohfa.app",
  twitter: "@tohfahq",
  /** Where "support the studio" buttons send people (BuyMeACoffee, UPI page,
   *  Stripe link…). Leave empty to show a warm thank-you instead. */
  supportUrl: "",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "AI Studio", href: "/studio" },
  { label: "Create", href: "/create" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
] as const;
