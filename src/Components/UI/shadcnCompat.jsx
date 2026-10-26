import React, { createContext, forwardRef, useContext, useEffect, useId, useMemo, useState } from "react";
import * as DialogPrimitive from "./dialogPrimitive";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const modernSurface = "border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)]";
const modernControl = "rounded-md border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] text-[var(--modern-text,#0f172a)] placeholder:text-[var(--modern-muted,#64748b)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)] disabled:cursor-not-allowed disabled:opacity-60";

const element = (as, fallbackOrProps, propsOrChildren, maybeChildren) => {
  if (fallbackOrProps && typeof fallbackOrProps === "object" && !React.isValidElement(fallbackOrProps)) {
    return React.createElement(as || "div", fallbackOrProps, propsOrChildren);
  }
  return React.createElement(as || fallbackOrProps, propsOrChildren, maybeChildren);
};

export const Button = forwardRef(function ShadcnButton(
  { as, variant = "primary", size = "md", className, type, href, children, ...props },
  ref
) {
  const Component = as || (href ? "a" : "button");
  const variantClass = {
    primary: "bg-[var(--modern-primary,#6366f1)] text-white hover:opacity-90",
    success: "bg-[var(--modern-success,#16a34a)] text-white hover:opacity-90",
    danger: "bg-[var(--modern-danger,#ef4444)] text-white hover:opacity-90",
    destructive: "bg-[var(--modern-danger,#ef4444)] text-white hover:opacity-90",
    warning: "bg-[var(--modern-warning,#f59e0b)] text-[var(--modern-text,#0f172a)] hover:opacity-90",
    info: "bg-[var(--modern-primary,#6366f1)] text-white hover:opacity-90",
    secondary: "bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-text,#0f172a)] hover:brightness-95",
    light: "bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-text,#0f172a)] hover:brightness-95",
    dark: "bg-[var(--modern-text,#0f172a)] text-[var(--modern-card,#fff)] hover:opacity-90",
    outline: "border border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)]",
    "outline-secondary": "border border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)]",
    link: "bg-transparent text-[var(--modern-primary,#6366f1)] underline-offset-4 hover:underline",
    text: "bg-transparent text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)]",
    none: "bg-transparent text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)]",
  }[variant] || "bg-[var(--modern-primary,#6366f1)] text-white hover:opacity-90";
  const sizeClass = { sm: "min-h-8 px-3 text-sm", lg: "min-h-11 px-5", md: "min-h-9 px-4" }[size] || "min-h-9 px-4";
  return element(Component, "button", {
    ...props,
    ref,
    href,
    type: Component === "button" ? (type || "button") : undefined,
    className: cn("btn", `btn-${variant}`, "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)] disabled:pointer-events-none disabled:opacity-60", sizeClass, variantClass, className),
  }, children);
});

export const Container = forwardRef(function ShadcnContainer({ as, fluid, className, ...props }, ref) {
  return element(as, "div", { ...props, ref, className: cn(fluid ? "w-full px-4" : "container mx-auto w-full px-4 max-w-7xl", className) }, props.children);
});

export const Row = forwardRef(function ShadcnRow({ as, className, style, ...props }, ref) {
  return element(as, "div", { ...props, ref, style, className: cn("row flex flex-wrap", className) }, props.children);
});

const gridWidths = (props) => {
  const style = {};
  for (const bp of ["xs", "sm", "md", "lg", "xl", "xxl"]) {
    const value = props[bp];
    if (value == null) continue;
    const spec = typeof value === "object" ? value : { span: value };
    if (spec.span === "auto") style[`--ui-col-${bp}`] = "auto";
    else if (spec.span === "12" || spec.span === 12) style[`--ui-col-${bp}`] = "100%";
    else if (Number.isFinite(Number(spec.span))) style[`--ui-col-${bp}`] = `${(Number(spec.span) / 12) * 100}%`;
    if (spec.offset != null) style[`--ui-offset-${bp}`] = `${(Number(spec.offset) / 12) * 100}%`;
  }
  return style;
};
export const Col = forwardRef(function ShadcnCol({ as, xs, sm, md, lg, xl, xxl, className, style, ...props }, ref) {
  const gridStyle = { ...gridWidths({ xs, sm, md, lg, xl, xxl }), ...style };
  return element(as, "div", { ...props, ref, style: gridStyle, className: cn("col ui-grid-col min-w-0", className) }, props.children);
});

const FormContext = createContext({ controlId: undefined });
const FormRoot = forwardRef(function ShadcnForm({ as, className, ...props }, ref) {
  return element(as, "form", { ...props, ref, className: cn(className) }, props.children);
});
const FormGroupComponent = ({ as, controlId, className, ...props }) => (
  <FormContext.Provider value={{ controlId }}>
    {element(as, "div", { ...props, className: cn("space-y-1.5", className), id: props.id }, props.children)}
  </FormContext.Provider>
);
const FormLabel = forwardRef(function ShadcnFormLabel({ as, htmlFor, className, ...props }, ref) {
  const context = useContext(FormContext);
  return element(as, "label", { ...props, ref, htmlFor: htmlFor || context.controlId, className: cn("text-sm font-medium text-[var(--modern-text,#0f172a)]", className) }, props.children);
});
const FormControl = forwardRef(function ShadcnFormControl({ as, size, className, isInvalid, isValid, plaintext, children, ...props }, ref) {
  const context = useContext(FormContext);
  const Component = as || "input";
  return element(Component, "input", {
    ...props,
    ref,
    id: props.id || context.controlId,
    className: cn("form-control", size && `form-control-${size}`, plaintext ? "border-0 bg-transparent p-0" : modernControl, size === "sm" && "min-h-8 px-2.5 text-sm", size === "lg" && "min-h-11 px-4 text-lg", isInvalid && "border-[var(--modern-danger,#ef4444)]", isValid && "border-[var(--modern-success,#16a34a)]", "w-full px-3 py-2", className),
  }, children ?? props.children);
});
const FormSelect = forwardRef(function ShadcnFormSelect({ as, size, className, ...props }, ref) {
  return element(as, "select", { ...props, ref, className: cn("form-select", modernControl, "w-full px-3 py-2", size === "sm" && "min-h-8 text-sm", className) }, props.children);
});
const CheckContext = createContext({ id: undefined, type: "checkbox" });
const FormCheck = ({ type = "checkbox", id, label, className, children, inline, reverse, ...props }) => {
  const generatedId = useId();
  const controlId = id || `check-${generatedId}`;
  return (
    <CheckContext.Provider value={{ id: controlId, type }}>
      <div className={cn("form-check flex items-center gap-2.5 min-h-6", inline && "inline-flex", reverse && "flex-row-reverse", className)}>
        {children || <>
          <FormCheck.Input {...props} id={controlId} type={type} />
          {label != null && <FormCheck.Label htmlFor={controlId}>{label}</FormCheck.Label>}
        </>}
      </div>
    </CheckContext.Provider>
  );
};
FormCheck.Input = forwardRef(function ShadcnCheckInput({ className, type = "checkbox", ...props }, ref) {
  const context = useContext(CheckContext);
  return <input {...props} ref={ref} id={props.id || context.id} type={type || context.type} className={cn("form-check-input m-0 h-4 w-4 shrink-0 cursor-pointer rounded border border-[var(--modern-border-strong,#cbd5e1)] accent-[var(--modern-primary,#6366f1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]", className)} />;
});
FormCheck.Label = forwardRef(function ShadcnCheckLabel({ className, ...props }, ref) {
  const context = useContext(CheckContext);
  return <label {...props} ref={ref} htmlFor={props.htmlFor || context.id} className={cn("form-check-label m-0 inline-flex items-center gap-2 cursor-pointer select-none text-sm leading-snug text-[var(--modern-text,#0f172a)]", className)} />;
});
const FormText = ({ muted, className, ...props }) => <small {...props} className={cn("form-text block text-xs", muted ? "text-[var(--modern-muted,#64748b)]" : "", className)} />;
const FormFeedback = ({ type = "invalid", className, ...props }) => <small {...props} role={type === "invalid" ? "alert" : undefined} className={cn("block text-xs", type === "invalid" ? "text-[var(--modern-danger,#ef4444)]" : "text-[var(--modern-success,#16a34a)]", className)} />;
FormControl.Feedback = FormFeedback;
export const Form = Object.assign(FormRoot, { Group: FormGroupComponent, Label: FormLabel, Control: FormControl, Select: FormSelect, Check: FormCheck, Text: FormText, Floating: FormGroupComponent });
export const FormGroup = FormGroupComponent;

const ModalContext = createContext({ close: () => {} });
const containsDialogTitle = (children) => React.Children.toArray(children).some((child) => React.isValidElement(child) && (child.type === Modal.Title || containsDialogTitle(child.props.children)));
const Modal = ({ show = false, onHide, children, className, dialogClassName, contentClassName, centered = false, size, fullscreen, backdrop = true, keyboard = true, style, ...props }) => {
  const sizeClass = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl" }[size] || "max-w-2xl";
  const titleId = useId();
  const hasTitle = containsDialogTitle(children);
  return (
    <DialogPrimitive.Root open={Boolean(show)} onOpenChange={(open) => { if (!open) onHide?.(); }}>
      <DialogPrimitive.Portal>
        {backdrop !== false && <DialogPrimitive.Overlay className="fixed inset-0 z-[1040] bg-black/50" />}
        <DialogPrimitive.Content
          {...props}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? props["aria-label"] : props["aria-label"] || "Dialog"}
          onEscapeKeyDown={(event) => { if (!keyboard || backdrop === "static") event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (backdrop === "static" || backdrop === false) event.preventDefault(); }}
          className={cn("fixed left-1/2 z-[1050] w-[calc(100%-2rem)] -translate-x-1/2 outline-none", centered ? "top-1/2 -translate-y-1/2" : "top-8", sizeClass, fullscreen && "left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0", className)}
          style={style}
        >
          <ModalContext.Provider value={{ close: onHide, titleId }}>
            <div className={cn("modal-dialog w-full", fullscreen && "h-full", dialogClassName)}>
              <div className={cn("modal-content", modernSurface, "max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-xl", fullscreen && "h-full max-h-none rounded-none", contentClassName)}>{children}</div>
            </div>
          </ModalContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
Modal.Dialog = ({ className, ...props }) => <div {...props} className={cn("modal-dialog", className)} />;
Modal.Header = ({ closeButton, children, className, ...props }) => {
  const { close } = useContext(ModalContext);
  return <div {...props} className={cn("modal-header flex items-center justify-between gap-3 border-b border-[var(--modern-border,#e2e8f0)] px-5 py-4", className)}>{children}{closeButton && <button type="button" onClick={close} aria-label="Close" className="btn-close inline-flex shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-[var(--modern-muted,#64748b)] cursor-pointer transition-colors hover:bg-transparent hover:text-[var(--modern-text,#0f172a)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"><X className="h-4 w-4" /></button>}</div>;
};
Modal.Title = ({ as = "h2", className, ...props }) => { const context = useContext(ModalContext); const Component = as === "h2" ? DialogPrimitive.Title : as; return element(Component, "h2", { ...props, id: props.id || context.titleId, className: cn("modal-title m-0 inline-flex items-center gap-2.5 text-lg font-semibold leading-snug text-[var(--modern-text,#0f172a)]", className) }, props.children); };
Modal.Body = ({ className, ...props }) => <div {...props} className={cn("modal-body p-5", className)} />;
Modal.Footer = ({ className, ...props }) => <div {...props} className={cn("modal-footer flex flex-wrap items-center justify-end gap-2 border-t border-[var(--modern-border,#e2e8f0)] px-5 py-4", className)} />;
Modal.CloseButton = ({ onClick, className, ...props }) => <button type="button" aria-label="Close" onClick={onClick} className={cn("btn-close inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-1.5 text-[var(--modern-muted,#64748b)] cursor-pointer hover:bg-transparent hover:text-[var(--modern-text,#0f172a)]", className)} {...props}><X className="h-4 w-4" /></button>;
export { Modal };

const Offcanvas = ({ show = false, onHide, placement = "end", children, className, style, backdrop = true, keyboard = true, scroll = false, ...props }) => {
  const titleId = useId();
  const hasTitle = React.Children.toArray(children).some((child) => React.isValidElement(child) && (child.type === Offcanvas.Title || React.Children.toArray(child.props.children).some((nested) => React.isValidElement(nested) && nested.type === Offcanvas.Title)));
  const rtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const side = placement === "start" ? (rtl ? "right" : "left") : placement === "top" || placement === "bottom" ? placement : (rtl ? "left" : "right");
  const positionClass = side === "left" ? "left-0 top-0 h-full w-[min(88vw,28rem)] border-r" : side === "right" ? "right-0 top-0 h-full w-[min(88vw,28rem)] border-l" : side === "top" ? "left-0 top-0 w-full border-b" : "bottom-0 left-0 w-full border-t";
  const panelStyle = { ...style, width: side === "left" || side === "right" ? "var(--ui-offcanvas-width, min(88vw, 28rem))" : "100%" };
  return (
    <DialogPrimitive.Root open={Boolean(show)} onOpenChange={(open) => { if (!open) onHide?.(); }}>
      <DialogPrimitive.Portal>
        {backdrop !== false && <DialogPrimitive.Overlay className="fixed inset-0 z-[1040] bg-black/50" />}
        <DialogPrimitive.Content
          {...props}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? props["aria-label"] : props["aria-label"] || "Panel"}
          onEscapeKeyDown={(event) => { if (!keyboard) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (backdrop === "static" || backdrop === false) event.preventDefault(); }}
          className={cn("offcanvas fixed z-[1050] flex flex-col overflow-y-auto outline-none", modernSurface, positionClass, scroll && "overflow-visible", className)}
          style={panelStyle}
        ><ModalContext.Provider value={{ close: onHide, titleId }}>{children}</ModalContext.Provider></DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
Offcanvas.Header = ({ closeButton, children, className, ...props }) => {
  const { close } = useContext(ModalContext);
  return <div {...props} className={cn("offcanvas-header flex items-center justify-between gap-3 border-b border-[var(--modern-border,#e2e8f0)] px-5 py-4", className)}>{children}{closeButton && <DialogPrimitive.Close aria-label="Close" className="btn-close inline-flex shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-[var(--modern-muted,#64748b)] cursor-pointer transition-colors hover:bg-transparent hover:text-[var(--modern-text,#0f172a)]"><X className="h-4 w-4" /></DialogPrimitive.Close>}</div>;
};
Offcanvas.Title = ({ as = "h2", className, ...props }) => { const context = useContext(ModalContext); const Component = as === "h2" ? DialogPrimitive.Title : as; return element(Component, "h2", { ...props, id: props.id || context.titleId, className: cn("offcanvas-title m-0 inline-flex items-center gap-2.5 text-lg font-semibold leading-snug text-[var(--modern-text,#0f172a)]", className) }, props.children); };
Offcanvas.Body = ({ className, ...props }) => <div {...props} className={cn("offcanvas-body flex-1 overflow-y-auto p-5", className)} />;
Offcanvas.Header.displayName = "OffcanvasHeader";
export { Offcanvas };

const DropdownContext = createContext(null);
const DropdownRoot = ({ children, show, defaultShow = false, onToggle, onSelect, drop = "down", className, autoClose = true, ...props }) => {
  const [localShow, setLocalShow] = useState(defaultShow);
  const toggleRef = React.useRef(null);
  const controlled = show !== undefined;
  const open = controlled ? show : localShow;
  const setOpen = (next, event) => { if (!controlled) setLocalShow(next); onToggle?.(next, event); };
  const context = useMemo(() => ({ open, setOpen, onSelect, autoClose, drop, toggleRef }), [open, onSelect, autoClose, drop]);
  return <DropdownContext.Provider value={context}><div {...props} className={cn("dropdown relative inline-flex", className)}>{children}</div></DropdownContext.Provider>;
};
const DropdownToggle = forwardRef(function ShadcnDropdownToggle({ as, children, className, onClick, variant, id, ...props }, ref) {
  const context = useContext(DropdownContext);
  const Component = as || "button";
  const resolvedVariant = variant !== undefined ? variant : (as ? "none" : "secondary");
  const isUnstyledVariant = resolvedVariant === "none" || resolvedVariant === "";
  const toggleProps = { ...props, ref: (node) => { if (context?.toggleRef) context.toggleRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }, id, type: Component === "button" ? (props.type || "button") : undefined, "aria-haspopup": "menu", "aria-expanded": Boolean(context?.open), onClick: (event) => { onClick?.(event); if (!event.defaultPrevented) context?.setOpen(!context.open, event); }, className: cn("dropdown-toggle inline-flex items-center justify-between gap-2 rounded-md text-sm cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#6366f1)]", !as && "px-3 py-2", isUnstyledVariant ? "border-0 bg-transparent text-[var(--modern-text,#0f172a)]" : "border border-solid border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-3 py-2 text-[var(--modern-text,#0f172a)]", className) };
  return element(Component, "button", toggleProps, children ?? (Component === "button" ? <ChevronDown className="h-4 w-4 shrink-0" /> : null));
});
const DropdownMenu = ({ children, className, align, style, ...props }) => {
  const context = useContext(DropdownContext);
  const menuRef = React.useRef(null);
  useEffect(() => {
    if (!context?.open) return;
    const close = (event) => { if (!menuRef.current?.parentElement?.contains(event.target)) context.setOpen(false, event); };
    document.addEventListener("mousedown", close);
    return () => { document.removeEventListener("mousedown", close); };
  }, [context]);
  if (!context?.open) return null;
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const toggleWantsEnd = context?.toggleRef?.current?.dataset?.dropdownAlign === "end";
  const classWantsEnd = typeof className === "string" && className.includes("dropdown-menu-end");
  const classWantsStart = typeof className === "string" && className.includes("dropdown-menu-start");
  const resolvedAlign = align || (classWantsEnd ? "end" : classWantsStart ? "start" : toggleWantsEnd ? "end" : "start");
  const horizontalClass = resolvedAlign === "end" ? (isRtl ? "left-0" : "right-0") : (isRtl ? "right-0" : "left-0");
  const position = context.drop === "end" ? "left-full top-0 ml-1" : context.drop === "start" ? "right-full top-0 mr-1" : context.drop === "up" ? `bottom-full mb-1 ${horizontalClass}` : `top-full mt-1 ${horizontalClass}`;
  const handleKeyDown = (event) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') || [])];
    if (event.key === "Escape") { event.preventDefault(); context.setOpen(false, event); context.toggleRef.current?.focus(); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const index = items.indexOf(document.activeElement); const delta = event.key === "ArrowDown" ? 1 : -1; items[(index + delta + items.length) % items.length]?.focus(); }
  };
  return <div {...props} ref={menuRef} role="menu" onKeyDown={handleKeyDown} style={style} className={cn("dropdown-menu absolute z-[1060] min-w-48 rounded-lg border border-solid border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-1 text-[var(--modern-text,#0f172a)]", position, className)}>{children}</div>;
};
const DropdownItem = forwardRef(function ShadcnDropdownItem({ as, eventKey, active, disabled, href, onClick, className, children, ...props }, ref) {
  const context = useContext(DropdownContext);
  const Component = as || (href ? "a" : "button");
  const handleClick = (event) => { if (disabled) { event.preventDefault(); return; } onClick?.(event); if (event.defaultPrevented) return; context?.onSelect?.(eventKey ?? href, event); if (context?.autoClose !== false) context?.setOpen(false, event); };
  return element(Component, Component === "a" ? "a" : "button", { ...props, ref, href, type: Component === "button" ? (props.type || "button") : undefined, role: "menuitem", tabIndex: disabled ? -1 : 0, disabled: Component === "button" ? disabled : undefined, "aria-disabled": disabled || undefined, "aria-current": active ? "true" : undefined, onClick: handleClick, className: cn("dropdown-item flex w-full items-center gap-2.5 rounded-md border-0 bg-transparent px-3 py-2 text-left text-sm text-[var(--modern-text,#0f172a)] no-underline cursor-pointer transition-colors hover:bg-[var(--modern-raised,#f1f5f9)] focus-visible:bg-[var(--modern-raised,#f1f5f9)] focus-visible:outline-none", active && "bg-[var(--modern-raised,#f1f5f9)]", disabled && "pointer-events-none opacity-50", className) }, children ?? props.children);
});
const DropdownHeader = ({ className, ...props }) => <div {...props} className={cn("dropdown-header px-3 py-2 text-xs font-semibold text-[var(--modern-muted,#64748b)]", className)} />;
const DropdownDivider = ({ className, ...props }) => <div {...props} role="separator" className={cn("dropdown-divider my-1 h-px bg-[var(--modern-border,#e2e8f0)]", className)} />;
DropdownRoot.Toggle = DropdownToggle; DropdownRoot.Menu = DropdownMenu; DropdownRoot.Item = DropdownItem; DropdownRoot.Header = DropdownHeader; DropdownRoot.Divider = DropdownDivider;
export const Dropdown = DropdownRoot;
export const DropdownButton = ({ title, children, id, variant, className, menuRole, ...props }) => <Dropdown {...props}><Dropdown.Toggle id={id} variant={variant} className={className}>{title}</Dropdown.Toggle><Dropdown.Menu role={menuRole}>{children}</Dropdown.Menu></Dropdown>;
export const NavDropdown = ({ title, children, id, className, menuVariant, ...props }) => <Dropdown {...props} className={cn("inline-flex", className)}><Dropdown.Toggle id={id} variant="none" className="px-2 py-1">{title}</Dropdown.Toggle><Dropdown.Menu className={menuVariant === "dark" ? "bg-[var(--modern-text,#0f172a)] text-[var(--modern-card,#fff)]" : undefined}>{children}</Dropdown.Menu></Dropdown>;
NavDropdown.Item = DropdownItem;
NavDropdown.Divider = DropdownDivider;
NavDropdown.Header = DropdownHeader;

const AccordionContext = createContext(null);
const Accordion = ({ children, defaultActiveKey, activeKey, onSelect, alwaysOpen = false, className, ...props }) => {
  const [local, setLocal] = useState(defaultActiveKey);
  const value = activeKey === undefined ? local : activeKey;
  const toggle = (key) => { const next = alwaysOpen ? (Array.isArray(value) && value.includes(key) ? value.filter((x) => x !== key) : [...(Array.isArray(value) ? value : value == null ? [] : [value]), key]) : value === key ? null : key; if (activeKey === undefined) setLocal(next); onSelect?.(next); };
  return <AccordionContext.Provider value={{ value, toggle }}><div {...props} className={cn("accordion divide-y divide-[var(--modern-border,#e2e8f0)] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)]", className)}>{children}</div></AccordionContext.Provider>;
};
Accordion.Item = ({ eventKey, children, className, ...props }) => {
  const parent = useContext(AccordionContext);
  const id = useId();
  return <AccordionContext.Provider value={{ ...parent, eventKey, panelId: `accordion-panel-${id}`, triggerId: `accordion-trigger-${id}` }}><div {...props} className={cn("accordion-item border-b border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)] shadow-none", className)}>{children}</div></AccordionContext.Provider>;
};
Accordion.Header = ({ as = "h3", children, className, ...props }) => {
  const context = useContext(AccordionContext); const open = Array.isArray(context?.value) ? context.value.includes(context.eventKey) : context?.value === context?.eventKey;
  return <div className={cn("accordion-header", className)} {...props}><button type="button" id={context?.triggerId} aria-controls={context?.panelId} aria-expanded={Boolean(open)} onClick={() => context?.toggle(context?.eventKey)} className={cn("accordion-button flex w-full items-center justify-between gap-3 rounded-md border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] px-4 py-3 text-left font-medium text-[var(--modern-text,#0f172a)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-violet,#6366f1)]", open && "bg-[var(--modern-violet-soft,#eef2ff)] text-[var(--modern-violet,#6366f1)]")}>{children}<ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} /></button></div>;
};
Accordion.Body = ({ className, ...props }) => { const context = useContext(AccordionContext); const open = Array.isArray(context?.value) ? context.value.includes(context.eventKey) : context?.value === context?.eventKey; return <div {...props} id={context?.panelId} role="region" aria-labelledby={context?.triggerId} hidden={!open} aria-hidden={!open} className={cn("accordion-body pb-4", className)} />; };
export { Accordion };

export const Spinner = ({ animation = "border", size = "md", className, role = "status", ...props }) => <span {...props} role={role} className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]", size === "sm" ? "h-4 w-4" : "h-6 w-6", animation === "grow" && "animate-pulse border-0 bg-current", className)}><span className="sr-only">Loading</span></span>;

const NavContext = createContext({ onSelect: undefined, activeKey: undefined });
const Nav = ({ as, children, className, onSelect, activeKey, variant, ...props }) => element(as, "nav", { ...props, className: cn("nav flex flex-wrap items-center gap-2", className), "data-variant": variant }, <NavContext.Provider value={{ onSelect, activeKey }}>{children}</NavContext.Provider>);
export { Nav };
Nav.Item = ({ as, className, ...props }) => element(as, "div", { ...props, className: cn("nav-item", className) }, props.children);
Nav.Link = forwardRef(function ShadcnNavLink({ as, eventKey, active, className, onClick, href, children, ...props }, ref) {
  const context = useContext(NavContext); const Component = as || (href ? "a" : "button"); const selected = active ?? (eventKey != null && context.activeKey === eventKey);
  return element(Component, Component === "a" ? "a" : "button", { ...props, ref, href, type: Component === "button" ? (props.type || "button") : undefined, role: props.role, "aria-current": selected ? "page" : undefined, onClick: (event) => { onClick?.(event); if (!event.defaultPrevented) context.onSelect?.(eventKey, event); }, className: cn("nav-link inline-flex items-center rounded-md border-0 bg-transparent px-3 py-2 text-sm text-[var(--modern-text,#0f172a)] no-underline cursor-pointer hover:bg-[var(--modern-raised,#f1f5f9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#6366f1)]", selected && "bg-[var(--modern-raised,#f1f5f9)]", className) }, children ?? props.children);
});

const NavbarContext = createContext({ expanded: false, toggle: () => {}, close: () => {} });
const Navbar = ({ children, expand = true, className, as, sticky, ...props }) => {
  const [expanded, setExpanded] = useState(false);
  const context = useMemo(() => ({ expanded, toggle: () => setExpanded((v) => !v), close: () => setExpanded(false) }), [expanded]);
  return <NavbarContext.Provider value={context}>{element(as, "nav", { ...props, className: cn("navbar", sticky === "top" && "sticky top-0", "w-full", className) }, children)}</NavbarContext.Provider>;
};
Navbar.Toggle = ({ children, className, onClick, ...props }) => { const context = useContext(NavbarContext); return <button type="button" {...props} aria-expanded={context.expanded} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) context.toggle(); }} className={cn("inline-flex items-center justify-center rounded-md border border-[var(--modern-border,#e2e8f0)] bg-transparent p-2 text-[var(--modern-text,#0f172a)] cursor-pointer", className)}>{children}</button>; };
Navbar.Collapse = ({ children, className, ...props }) => { const context = useContext(NavbarContext); return context.expanded ? <div {...props} className={cn(className)}>{children}</div> : null; };
Navbar.Offcanvas = ({ show, onHide, ...props }) => { const context = useContext(NavbarContext); return <Offcanvas {...props} show={show ?? context.expanded} onHide={() => { onHide?.(); context.close(); }} />; };
export { Navbar };

const ListGroup = ({ as, children, className, ...props }) => element(as, "ul", { ...props, className: cn("list-group divide-y divide-[var(--modern-border,#e2e8f0)] rounded-md border border-[var(--modern-border,#e2e8f0)]", className) }, children);
ListGroup.Item = ({ as, action, active, className, ...props }) => element(as || (action ? "button" : "li"), "li", { ...props, type: (as || (action ? "button" : "li")) === "button" ? (props.type || "button") : undefined, className: cn("list-group-item px-4 py-3 text-sm", action && "w-full text-left hover:bg-[var(--modern-raised,#f1f5f9)]", active && "bg-[var(--modern-raised,#f1f5f9)]", className) }, props.children);
export { ListGroup };

const InputGroup = ({ as, children, className, ...props }) => element(as, "div", { ...props, className: cn("input-group flex w-full items-stretch", className) }, children);
InputGroup.Text = ({ className, ...props }) => <span {...props} className={cn("inline-flex items-center rounded-md border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-3 text-sm", className)} />;
InputGroup.Button = Button;
export { InputGroup };

const Tab = () => null;
const Tabs = ({ children, activeKey, defaultActiveKey, onSelect, id, className, mountOnEnter, unmountOnExit, ...props }) => {
  const tabs = React.Children.toArray(children).filter(Boolean); const [selected, setSelected] = useState(activeKey ?? defaultActiveKey ?? tabs[0]?.props?.eventKey);
  const current = activeKey ?? selected; const currentTab = tabs.find((tab) => tab.props.eventKey === current) || tabs[0];
  return <div {...props} className={cn(className)}><div role="tablist" aria-label={props["aria-label"] || id} className="flex flex-wrap gap-1 border-b border-[var(--modern-border,#e2e8f0)]">{tabs.map((tab) => <button type="button" role="tab" key={tab.props.eventKey} id={`${id || "tabs"}-${tab.props.eventKey}`} aria-selected={current === tab.props.eventKey} aria-controls={`${id || "tabs"}-panel`} onClick={() => { setSelected(tab.props.eventKey); onSelect?.(tab.props.eventKey); }} className={cn("px-3 py-2 text-sm text-[var(--modern-muted,#64748b)]", current === tab.props.eventKey && "border-b-2 border-[var(--modern-primary,#6366f1)] font-medium text-[var(--modern-text,#0f172a)]")}>{tab.props.title}</button>)}</div><div role="tabpanel" id={`${id || "tabs"}-panel`} aria-labelledby={`${id || "tabs"}-${currentTab?.props?.eventKey}`} className="pt-4">{currentTab?.props?.children}</div></div>;
};
export { Tab, Tabs };

export const OverlayTrigger = ({ children, overlay, trigger = ["hover", "focus"], placement = "top", rootClose, delay, ...props }) => {
  const [open, setOpen] = useState(false); const ref = React.useRef(null);
  useEffect(() => { if (!open || !rootClose) return; const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, [open, rootClose]);
  const triggers = Array.isArray(trigger) ? trigger : [trigger]; const events = {};
  if (triggers.includes("hover")) { events.onMouseEnter = () => setOpen(true); events.onMouseLeave = () => setOpen(false); }
  if (triggers.includes("focus")) { events.onFocus = () => setOpen(true); events.onBlur = () => setOpen(false); }
  if (triggers.includes("click")) events.onClick = () => setOpen((v) => !v);
  const childProps = {};
  for (const [name, triggerHandler] of Object.entries(events)) {
    const childHandler = children?.props?.[name];
    childProps[name] = (event) => { triggerHandler(event); childHandler?.(event); };
  }
  if (open && overlay?.props?.id) childProps["aria-describedby"] = [children?.props?.["aria-describedby"], overlay.props.id].filter(Boolean).join(" ");
  const triggeredChild = React.isValidElement(children) ? React.cloneElement(children, childProps) : children;
  return <span ref={ref} className="relative inline-flex" {...props}>{triggeredChild}{open && React.isValidElement(overlay) && React.cloneElement(overlay, { className: cn("absolute z-50", placement === "left" ? "right-full top-1/2 -translate-y-1/2" : placement === "bottom" ? "left-1/2 top-full -translate-x-1/2" : placement === "right" ? "left-full top-1/2 -translate-y-1/2" : "bottom-full left-1/2 -translate-x-1/2", overlay.props.className) })}</span>;
};
export const Tooltip = ({ id, className, ...props }) => <span id={id} role="tooltip" {...props} className={cn("rounded-md bg-[var(--modern-text,#0f172a)] px-2 py-1 text-xs text-[var(--modern-card,#fff)]", className)} />;
export const Popover = ({ id, title, className, children, ...props }) => <div id={id} {...props} className={cn("min-w-48 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-3 text-[var(--modern-text,#0f172a)]", className)}>{title && <div className="mb-2 border-b border-[var(--modern-border,#e2e8f0)] pb-2 font-medium">{title}</div>}{children}</div>;

const CarouselItem = ({ children, className, ...props }) => <div {...props} className={cn("carousel-item", className)}>{children}</div>;
const Carousel = ({ children, controls = true, indicators = true, interval = false, className, wrap = true, ...props }) => {
  const items = React.Children.toArray(children).filter(Boolean); const [index, setIndex] = useState(0);
  useEffect(() => { if (!interval || items.length < 2) return; const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), Number(interval)); return () => clearInterval(timer); }, [interval, items.length]);
  const move = (delta) => setIndex((i) => { const next = i + delta; return wrap ? (next + items.length) % items.length : Math.max(0, Math.min(items.length - 1, next)); });
  return <div {...props} className={cn("relative", className)}><div className="carousel-inner overflow-visible">{items[index] && React.cloneElement(items[index], { className: cn(items[index].props.className, "block") })}</div>{controls && items.length > 1 && <><button type="button" aria-label="Previous slide" onClick={() => move(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--modern-card,#fff)] p-2 text-[var(--modern-text,#0f172a)]"><ChevronLeft /></button><button type="button" aria-label="Next slide" onClick={() => move(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--modern-card,#fff)] p-2 text-[var(--modern-text,#0f172a)]"><ChevronRight /></button></>}{indicators && items.length > 1 && <div className="carousel-indicators relative inset-auto ms-5 flex items-center justify-start gap-2 p-0">{items.map((_, i) => <button key={i} type="button" data-bs-target="" aria-label={`Go to slide ${i + 1}`} aria-current={index === i} onClick={() => setIndex(i)} className={cn("h-1 flex-none rounded-full border-0 transition-all duration-200 cursor-pointer", index === i ? "active w-[38px] opacity-100 bg-[linear-gradient(100deg,var(--modern-violet),var(--modern-blue),var(--modern-cyan))]" : "w-[21px] opacity-70 bg-[var(--modern-border-strong,#cbd5e1)]")} />)}</div>}</div>;
};
Carousel.Item = CarouselItem;
export { Carousel };

