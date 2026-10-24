import React from "react";
import { cn } from "@/lib/utils";

const CustomToggle = React.forwardRef(({ children, onClick, className, ...props }, ref) => (
  <button
    {...props}
    type="button"
    ref={ref}
    aria-label={props["aria-label"] || "More actions"}
    onClick={onClick}
    className={cn("inline-flex items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]", className)}
  >
    {children}
    <span className='threedots' aria-hidden="true" />
  </button>
));

export default CustomToggle;


// const CustomToggle = React.forwardRef(({ children, onClick, ...props }, ref) => (
//   <button
//     type="button"
//     ref={ref}
//     onClick={onClick}
//     aria-label="More actions"
//     {...props}
//     style={{ background: "none", border: "none", padding: 0, ...(props.style || {}) }}
//   >
//     {children}
//     <span className="threedots" aria-hidden="true" />
//   </button>
// ));

// CustomToggle.displayName = "CustomToggle";

// export default CustomToggle;
