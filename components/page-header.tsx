import { Badge } from "@/components/ui/badge";
import { AppIcon, IconName } from "@/components/app-icon";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  icon?: IconName;
  align?: "left" | "between";
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  badge,
  icon,
  align = "between",
  actions,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[24px] border border-[#e4dccb] bg-white p-4 shadow-[0_14px_34px_rgba(63,52,28,0.06)] dark:border-border dark:bg-card dark:shadow-[0_14px_34px_rgba(0,0,0,0.24)] md:p-5",
        align === "between" && "lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div className="max-w-2xl space-y-1.5">
        {badge ? <Badge className="bg-secondary text-secondary-foreground">{badge}</Badge> : null}
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-secondary text-primary">
              <AppIcon name={icon} className="h-4 w-4" />
            </div>
          ) : null}
          <h1 className="text-[1.55rem] font-semibold tracking-tight text-foreground md:text-[1.85rem]">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="text-[13px] leading-5 text-muted-foreground md:text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}
