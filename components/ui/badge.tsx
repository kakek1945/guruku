import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[#e4d7ba] bg-[#fff9ec] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#725827] dark:border-[#5b5548] dark:bg-[#2b2a24] dark:text-[#e7d49d]",
        className,
      )}
      {...props}
    />
  );
}
