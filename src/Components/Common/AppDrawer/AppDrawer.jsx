import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * AppDrawer: Reusable, accessible, token-aware side drawer (Offcanvas replacement) built on Shadcn / Radix UI.
 */
export const AppDrawer = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "end", // "end" automatically flips to "left" in RTL and "right" in LTR
  showClose = true,
  className,
  contentClassName,
}) => {
  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose && onClose()}>
      <SheetContent
        side={side}
        showClose={showClose}
        className={cn("flex flex-col h-full", className)}
      >
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}

        <div className={cn("flex-1 overflow-y-auto py-4 pr-1", contentClassName)}>
          {children}
        </div>

        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
};

export default AppDrawer;
