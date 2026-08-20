import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Tohfa account.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <ComingSoon
      eyebrow="Accounts"
      title="Your studio awaits"
      description="Accounts, projects, collections, and version history arrive with our accounts release - everything you make will have a home."
      phase="Phase 3"
    />
  );
}
