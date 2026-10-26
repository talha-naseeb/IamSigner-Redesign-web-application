import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DialogContext = createContext(null);

function useDialogContext() {
  return useContext(DialogContext);
}

const Root = ({ open: controlledOpen, defaultOpen = false, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : uncontrolledOpen;

  const baseId = useId();
  const titleId = `dialog-title-${baseId}`;
  const descriptionId = `dialog-desc-${baseId}`;
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const setOpen = useCallback(
    (nextOpen) => {
      const resolved = typeof nextOpen === "function" ? nextOpen(open) : Boolean(nextOpen);
      if (!isControlled) {
        setUncontrolledOpen(resolved);
      }
      onOpenChange?.(resolved);
    },
    [isControlled, onOpenChange, open]
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      titleId,
      descriptionId,
      hasTitle,
      setHasTitle,
      hasDescription,
      setHasDescription,
    }),
    [open, setOpen, titleId, descriptionId, hasTitle, hasDescription]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

const Trigger = forwardRef(function DialogTrigger({ asChild, onClick, children, ...props }, ref) {
  const ctx = useDialogContext();
  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      ctx?.setOpen(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: (event) => {
        children.props.onClick?.(event);
        handleClick(event);
      },
    });
  }

  return (
    <button type="button" ref={ref} data-state={ctx?.open ? "open" : "closed"} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
Trigger.displayName = "DialogTrigger";

const Portal = ({ children, container }) => {
  const ctx = useDialogContext();
  if (!ctx?.open || typeof document === "undefined") return null;
  return createPortal(children, container || document.body);
};
Portal.displayName = "DialogPortal";

const Overlay = forwardRef(function DialogOverlay({ onClick, ...props }, ref) {
  const ctx = useDialogContext();
  if (!ctx?.open) return null;
  return <div ref={ref} data-state="open" onClick={onClick} {...props} />;
});
Overlay.displayName = "DialogOverlay";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Content = forwardRef(function DialogContent(
  {
    onEscapeKeyDown,
    onPointerDownOutside,
    onKeyDown,
    children,
    "aria-labelledby": ariaLabelledByProp,
    "aria-describedby": ariaDescribedByProp,
    ...props
  },
  forwardedRef
) {
  const ctx = useDialogContext();
  const contentRef = useRef(null);

  const setRefs = useCallback(
    (node) => {
      contentRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  // Lock body scroll and manage focus on open/unmount
  useEffect(() => {
    if (!ctx?.open || typeof document === "undefined") return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = contentRef.current;
    if (node && !node.contains(document.activeElement)) {
      const autoFocusTarget = node.querySelector("[autofocus]") || node;
      autoFocusTarget?.focus?.({ preventScroll: true });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [ctx?.open]);

  // Escape key & outside pointer dismissal
  useEffect(() => {
    if (!ctx?.open || typeof document === "undefined") return undefined;

    const handleDocumentKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          event.stopPropagation();
          ctx.setOpen(false);
        }
      } else if (event.key === "Tab" && contentRef.current) {
        const focusables = Array.from(contentRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
        if (focusables.length === 0) {
          event.preventDefault();
          contentRef.current.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const handlePointerDown = (event) => {
      const node = contentRef.current;
      if (!node || node.contains(event.target)) return;
      onPointerDownOutside?.(event);
      if (!event.defaultPrevented) {
        ctx.setOpen(false);
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [ctx, onEscapeKeyDown, onPointerDownOutside]);

  if (!ctx?.open) return null;

  const labelledBy = ariaLabelledByProp !== undefined ? ariaLabelledByProp : ctx.hasTitle ? ctx.titleId : undefined;
  const describedBy =
    ariaDescribedByProp !== undefined ? ariaDescribedByProp : ctx.hasDescription ? ctx.descriptionId : undefined;

  return (
    <div
      ref={setRefs}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      data-state="open"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  );
});
Content.displayName = "DialogContent";

const Close = forwardRef(function DialogClose({ asChild, onClick, children, ...props }, ref) {
  const ctx = useDialogContext();
  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      ctx?.setOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: (event) => {
        children.props.onClick?.(event);
        handleClick(event);
      },
    });
  }

  return (
    <button type="button" ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
Close.displayName = "DialogClose";

const Title = forwardRef(function DialogTitle({ id, children, ...props }, ref) {
  const ctx = useDialogContext();
  useEffect(() => {
    ctx?.setHasTitle?.(true);
    return () => ctx?.setHasTitle?.(false);
  }, [ctx]);

  return (
    <h2 ref={ref} id={id || ctx?.titleId} {...props}>
      {children}
    </h2>
  );
});
Title.displayName = "DialogTitle";

const Description = forwardRef(function DialogDescription({ id, children, ...props }, ref) {
  const ctx = useDialogContext();
  useEffect(() => {
    ctx?.setHasDescription?.(true);
    return () => ctx?.setHasDescription?.(false);
  }, [ctx]);

  return (
    <p ref={ref} id={id || ctx?.descriptionId} {...props}>
      {children}
    </p>
  );
});
Description.displayName = "DialogDescription";

export { Root, Trigger, Portal, Overlay, Content, Close, Title, Description };
