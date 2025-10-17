import { ReactNode } from "react";

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={"grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-6 " + (className ?? "")}>{children}</div>
  );
}

type BentoCardProps = {
  children: ReactNode;
  colSpan?: string;
};

export function BentoCard({ children, colSpan = "md:col-span-3" }: BentoCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${colSpan}`}>
      {children}
    </div>
  );
}


