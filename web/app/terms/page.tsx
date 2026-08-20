import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Terms of Service"
      description="Our terms of service will be published before accounts launch."
      phase="Phase 3"
    />
  );
}
