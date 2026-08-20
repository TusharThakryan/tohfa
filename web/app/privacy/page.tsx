import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Privacy Policy"
      description="Our full privacy policy will be published before accounts launch. Short version: your gifts are yours, and we will never sell your data."
      phase="Phase 3"
    />
  );
}
