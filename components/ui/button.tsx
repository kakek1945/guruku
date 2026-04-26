import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";
type ButtonSize = "default" | "lg";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

function buttonClasses(variant: ButtonVariant = "default", size: ButtonSize = "default") {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    size === "lg" ? "h-11 px-5.5 text-sm" : "h-9 px-4 text-[13px]",
    variant === "default" &&
      "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:brightness-105",
    variant === "secondary" &&
      "border border-primary/15 bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
    variant === "outline" &&
      "border border-border bg-background text-foreground hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
    variant === "ghost" &&
      "border border-primary/10 bg-card text-foreground hover:bg-card/90",
  );
}

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  if ("href" in props && typeof props.href === "string") {
    const { href, ...linkProps } = props;

    return (
      <Link href={href} className={cn(buttonClasses(variant, size), className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(buttonClasses(variant, size), className)} {...props}>
      {children}
    </button>
  );
}
