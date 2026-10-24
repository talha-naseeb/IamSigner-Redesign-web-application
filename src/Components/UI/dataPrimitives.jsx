import React, { createContext, forwardRef, useContext } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const pxKeys = new Set(["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "top", "right", "bottom", "left", "gap", "rowGap", "columnGap", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"]);
const sxToStyle = (sx) => {
  if (!sx || Array.isArray(sx) || typeof sx === "function") return {};
  return Object.fromEntries(Object.entries(sx).filter(([key, value]) => !key.startsWith("&") && !key.startsWith("@") && value != null).map(([key, value]) => {
    let next = value;
    if (typeof value === "number" && pxKeys.has(key) && key !== "width" && key !== "minWidth" && key !== "maxWidth" && key !== "height" && key !== "minHeight" && key !== "maxHeight" && key !== "top" && key !== "right" && key !== "bottom" && key !== "left") next = `${value * 8}px`;
    if (key === "fontSize" && typeof value === "number") next = `${value}px`;
    if (key === "fontWeight") next = value;
    return [key, next];
  }));
};
const useStyles = (style, sx) => ({ ...sxToStyle(sx), ...style });

export const Paper = forwardRef(function ShadcnPaper({ component: Component = "div", variant = "elevation", elevation, square, className, style, sx, ...props }, ref) {
  return <Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-paper", variant === "outlined" ? "border border-[var(--modern-border,#e2e8f0)]" : "", "bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)]", !square && "rounded-lg", className)} />;
});

const GridContext = createContext({ container: false, spacing: 0 });
export const Grid = forwardRef(function ShadcnGrid({ container, item, xs, sm, md, lg, xl, spacing = 0, direction = "row", alignItems, justifyContent, wrap = "wrap", className, style, sx, ...props }, ref) {
  const parent = useContext(GridContext);
  const containerClass = container && "flex";
  const align = { center: "items-center", flexStart: "items-start", flexEnd: "items-end", stretch: "items-stretch", baseline: "items-baseline" }[alignItems];
  const justify = { center: "justify-center", flexStart: "justify-start", flexEnd: "justify-end", spaceBetween: "justify-between", spaceAround: "justify-around", spaceEvenly: "justify-evenly" }[justifyContent];
  const gridStyle = { ...useStyles(style, sx) };
  if (container && spacing) gridStyle.gap = `${Number(spacing) * 8}px`;
  if (item) {
    for (const [bp, value] of Object.entries({ xs, sm, md, lg, xl })) {
      if (value == null) continue;
      gridStyle[`--ui-grid-${bp}`] = typeof value === "number" ? `${(value / 12) * 100}%` : value === "auto" ? "auto" : undefined;
    }
    if (xs == null && !parent.container) gridStyle["--ui-grid-xs"] = "100%";
  }
  const contextValue = { container: Boolean(container), spacing };
  return <GridContext.Provider value={container ? contextValue : parent}><div {...props} ref={ref} style={gridStyle} className={cn("ui-grid", containerClass, item && "ui-grid-item min-w-0", container && (direction === "column" ? "flex-col" : "flex-row"), container && (wrap === "nowrap" ? "flex-nowrap" : "flex-wrap"), align, justify, className)} /></GridContext.Provider>;
});

export const Stack = forwardRef(function ShadcnStack({ direction = "column", spacing = 0, alignItems, justifyContent, divider, className, style, sx, ...props }, ref) {
  const align = { center: "items-center", flexStart: "items-start", flexEnd: "items-end", stretch: "items-stretch", baseline: "items-baseline" }[alignItems];
  const justify = { center: "justify-center", flexStart: "justify-start", flexEnd: "justify-end", spaceBetween: "justify-between", spaceAround: "justify-around", spaceEvenly: "justify-evenly" }[justifyContent];
  return <div {...props} ref={ref} style={{ ...useStyles(style, sx), gap: typeof spacing === "number" ? `${spacing * 8}px` : spacing }} className={cn("ui-stack flex", direction === "row" ? "flex-row" : "flex-col", align, justify, className)} />;
});

const TableHeadContext = createContext(false);
export const TableContainer = forwardRef(function ShadcnTableContainer({ component: Component = "div", className, sx, style, ...props }, ref) {
  return <Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-table-container w-full overflow-x-auto", className)} />;
});
export const Table = forwardRef(function ShadcnTable({ component: Component = "table", stickyHeader, size = "medium", className, sx, style, ...props }, ref) {
  return <Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-table table w-full border-collapse bg-[var(--modern-card,#fff)] text-left text-sm text-[var(--modern-text,#0f172a)] [font-family:var(--modern-font-ui)] [&_tbody_tr:hover_td]:bg-[var(--modern-raised,#f1f5f9)]", size === "small" && "text-xs", stickyHeader && "[&_thead]:sticky [&_thead]:top-0", className)} />;
});
export const TableHead = forwardRef(function ShadcnTableHead({ component: Component = "thead", className, sx, style, ...props }, ref) {
  return <TableHeadContext.Provider value><Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-table-head border-b border-[var(--modern-border,#e2e8f0)]", className)} /></TableHeadContext.Provider>;
});
export const TableBody = forwardRef(function ShadcnTableBody({ component: Component = "tbody", className, sx, style, ...props }, ref) {
  return <TableHeadContext.Provider value={false}><Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-table-body", className)} /></TableHeadContext.Provider>;
});
export const TableRow = forwardRef(function ShadcnTableRow({ component: Component = "tr", hover, selected, className, sx, style, ...props }, ref) {
  return <Component {...props} ref={ref} style={useStyles(style, sx)} className={cn("ui-table-row border-b border-[var(--modern-border,#e2e8f0)]", hover && "hover:bg-[var(--modern-raised,#f1f5f9)]", selected && "bg-[var(--modern-raised,#f1f5f9)]", className)} />;
});
export const TableCell = forwardRef(function ShadcnTableCell({ component, align = "left", padding = "normal", size = "medium", scope, className, sx, style, ...props }, ref) {
  const inHead = useContext(TableHeadContext); const Tag = component || (inHead ? "th" : "td");
  const themedCell = inHead
    ? "border-b border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] text-[0.72rem] font-semibold tracking-[0.04em] uppercase whitespace-nowrap text-[var(--modern-muted,#64748b)]"
    : "border-b border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] leading-[1.45] text-[var(--modern-text,#0f172a)]";
  return <Tag {...props} ref={ref} scope={scope || (inHead ? "col" : undefined)} style={useStyles(style, sx)} className={cn("ui-table-cell", inHead ? "ui-table-cell-head" : "ui-table-cell-body", "px-4 py-3 text-sm [font-family:var(--modern-font-ui)]", themedCell, align === "center" && "text-center", align === "right" && "text-right", padding === "checkbox" && "w-12 px-2", padding === "none" && "p-0", size === "small" && "px-2 py-2 text-xs", className)} />;
});

export const Pagination = ({ count = 0, page = 1, onChange, className, color = "primary", variant = "text", shape, size = "medium", siblingCount = 1, boundaryCount = 1, ...props }) => {
  const total = Math.max(0, Number(count) || 0);
  if (total < 1) return null;
  const current = Math.min(total, Math.max(1, Number(page) || 1));
  const candidates = new Set();
  for (let p = 1; p <= Math.min(boundaryCount, total); p++) candidates.add(p);
  for (let p = Math.max(1, current - siblingCount); p <= Math.min(total, current + siblingCount); p++) candidates.add(p);
  for (let p = Math.max(1, total - boundaryCount + 1); p <= total; p++) candidates.add(p);
  const pages = [...candidates].sort((a, b) => a - b);
  const items = [];
  pages.forEach((number, index) => { if (index && number - pages[index - 1] > 1) items.push({ ellipsis: true, key: `ellipsis-${number}` }); items.push({ number, key: number }); });
  const select = (event, nextPage) => { if (nextPage >= 1 && nextPage <= total && nextPage !== current) onChange?.(event, nextPage); };
  const selectedClass = color === "primary" ? "bg-[var(--modern-primary,#6366f1)] text-white" : "bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-text,#0f172a)]";
  return <nav {...props} aria-label={props["aria-label"] || "Pagination"} className={cn("ui-pagination flex items-center gap-1", className)}><button type="button" aria-label="Go to previous page" disabled={current === 1} onClick={(event) => select(event, current - 1)} className="ui-pagination-item ui-pagination-item-previous rounded-md border border-[var(--modern-border,#e2e8f0)] p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>{items.map((item) => item.ellipsis ? <span key={item.key} className="px-1 text-[var(--modern-muted,#64748b)]"><MoreHorizontal className="h-4 w-4" /></span> : <button key={item.key} type="button" aria-current={item.number === current ? "page" : undefined} aria-label={`Go to page ${item.number}`} onClick={(event) => select(event, item.number)} className={cn("ui-pagination-item min-w-9 rounded-md border border-[var(--modern-border,#e2e8f0)] px-2 py-1.5 text-sm", item.number === current && "is-selected", item.number === current && selectedClass, shape === "rounded" && "rounded-full", size === "small" && "min-w-7 px-1.5 py-1 text-xs")}>{item.number}</button>)}<button type="button" aria-label="Go to next page" disabled={current === total} onClick={(event) => select(event, current + 1)} className="ui-pagination-item ui-pagination-item-next rounded-md border border-[var(--modern-border,#e2e8f0)] p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></nav>;
};

export const IconButton = forwardRef(function ShadcnIconButton({ size = "medium", edge, className, ...props }, ref) {
  return <button {...props} ref={ref} type={props.type || "button"} className={cn("ui-icon-button inline-flex items-center justify-center rounded-md text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#6366f1)] disabled:opacity-50", size === "small" ? "h-8 w-8" : size === "large" ? "h-11 w-11" : "h-10 w-10", edge === "start" && "-ml-2", edge === "end" && "-mr-2", className)} />;
});
export const Tooltip = ({ title, children, ...props }) => React.isValidElement(children) ? React.cloneElement(children, { title: typeof title === "string" ? title : undefined, ...props, ...children.props }) : <span title={typeof title === "string" ? title : undefined}>{children}</span>;

