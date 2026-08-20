"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/** Site chrome - hidden on immersive routes (editor, share view). */
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = /^\/create\/[^/]+/.test(pathname) || pathname.startsWith("/g/");

  if (immersive) return <main className="flex-1">{children}</main>;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
