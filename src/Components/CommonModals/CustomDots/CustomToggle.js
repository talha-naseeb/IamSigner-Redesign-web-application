import React from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomToggle = React.forwardRef(({ children, onClick, className, ...props }, ref) => (
  <button
    {...props}
    type="button"
    ref={ref}
    data-dropdown-align="end"
    aria-label={props["aria-label"] || "More actions"}
    onClick={onClick}
    className={cn(
      "custom-dots-toggle inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-[var(--modern-muted,#64748b)] cursor-pointer transition-colors hover:bg-[var(--modern-raised,#f1f5f9)] hover:text-[var(--modern-text,#0f172a)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]",
      className
    )}
  >
    {children}
    <MoreVertical className="h-4 w-4 shrink-0" aria-hidden="true" />
  </button>
));

CustomToggle.displayName = "CustomToggle";

export default CustomToggle;
