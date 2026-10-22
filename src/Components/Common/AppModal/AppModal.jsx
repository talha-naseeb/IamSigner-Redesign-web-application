import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] h-[90vh]",
};

/**
 * AppModal: Reusable, accessible, token-aware Modal built on Shadcn / Radix UI.
 */
export const AppModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showClose = true,
  className,
  contentClassName,
}) => {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose && onClose()}>
      <DialogContent
        showClose={showClose}
        className={cn(sizeClasses[size] || sizeClasses.md, className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className={cn("py-2 overflow-y-auto max-h-[75vh]", contentClassName)}>
          {children}
        </div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default AppModal;
