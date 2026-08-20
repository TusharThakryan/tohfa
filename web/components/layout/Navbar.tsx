"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass shadow-soft" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ label, href }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[0.875rem] font-medium transition-colors",
                    active ? "text-plum" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-plum/8"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Login
          </Button>
          <Button href="/create" variant="primary" size="sm">
            Get Started
          </Button>
        </div>

        <button
          className="rounded-full p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass overflow-hidden border-t border-plum/10 lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 text-[0.9375rem] font-medium text-ink hover:bg-plum/5"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-2 px-2 pb-2">
                <Button href="/login" variant="outline" size="md" className="flex-1">
                  Login
                </Button>
                <Button href="/create" variant="primary" size="md" className="flex-1">
                  Get Started
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
