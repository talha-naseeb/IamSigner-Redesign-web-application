import React from "react";
import { cn } from "@/lib/utils";

/** Accessible Tailwind switch preserving the app's boolean-first onChange API. */
const AppSwitch = ({
  checked = false,
  onChange,
  checkedIcon = null,
  uncheckedIcon = null,
  onColor = "var(--modern-primary, #6366f1)",
  offColor = "var(--modern-border-strong, #94a3b8)",
  onHandleColor = "#fff",
  offHandleColor = "#fff",
  handleDiameter,
  height = 20,
  width = 50,
  className,
  disabled = false,
  id,
  name,
  value,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...inputProps
}) => {
  const thumbSize = Math.min(handleDiameter ?? height - 4, height - 2);
  const padding = Math.max(2, (height - thumbSize) / 2);
  const checkedOffset = Math.max(0, width - thumbSize - padding * 2);
  const iconSlotWidth = Math.max(0, width - thumbSize - padding * 2);
  const handleChange = (event) => onChange?.(!checked, event);

  return (
    <span className={cn("app-switch inline-flex shrink-0 align-middle", className)} style={{ width, height }}>
      <button
        {...inputProps}
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={handleChange}
        className="ui-switch-track relative inline-flex w-full h-full items-center rounded-full border-0 p-0 overflow-hidden cursor-pointer outline-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ width, height, backgroundColor: checked ? onColor : offColor }}
      >
        {checkedIcon && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-150",
              checked ? "opacity-100" : "opacity-0"
            )}
            style={{ left: padding, width: iconSlotWidth, height: thumbSize }}
          >
            {checkedIcon}
          </span>
        )}
        {uncheckedIcon && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-150",
              !checked ? "opacity-100" : "opacity-0"
            )}
            style={{ right: padding, width: iconSlotWidth, height: thumbSize }}
          >
            {uncheckedIcon}
          </span>
        )}
        <span
          aria-hidden="true"
          className="ui-switch-thumb pointer-events-none absolute top-1/2 z-[1] flex -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 ease-out"
          style={{
            width: thumbSize,
            height: thumbSize,
            left: padding,
            transform: `translate(${checked ? checkedOffset : 0}px, -50%)`,
            backgroundColor: checked ? onHandleColor : offHandleColor,
          }}
        />
      </button>
      {name && <input type="checkbox" name={name} value={value} checked={Boolean(checked)} readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />}
    </span>
  );
};

export default AppSwitch;
