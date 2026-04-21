import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border bg-card text-card-foreground shadow-[0_14px_36px_rgba(63,52,28,0.07)] backdrop-blur dark:shadow-[0_14px_36px_rgba(0,0,0,0.24)]",
        className,
      )}
      {...props}
    />
  );
}
