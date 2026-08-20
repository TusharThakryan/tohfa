import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "font-button inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-plum to-plum-soft text-white shadow-soft hover:shadow-lift hover:-translate-y-0.5",
  gold: "bg-gradient-to-r from-gold to-gold-soft text-ink shadow-gold hover:shadow-lift hover:-translate-y-0.5",
  outline:
    "border border-plum/25 bg-white/60 text-plum backdrop-blur hover:border-plum/50 hover:bg-white hover:-translate-y-0.5",
  ghost: "text-ink-soft hover:text-plum hover:bg-plum/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-13 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = CommonProps & { href: string };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps | LinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link href={rest.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<ButtonProps, keyof CommonProps>)}>
      {children}
    </button>
  );
}
