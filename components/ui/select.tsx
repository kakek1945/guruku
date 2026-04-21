import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
