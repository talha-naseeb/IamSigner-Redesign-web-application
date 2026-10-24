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
  const thumbSize = Math.min(handleDiameter ?? height - 4, height);
  const padding = (height - thumbSize) / 2;
  const checkedOffset = width - thumbSize - padding * 2;
  const handleChange = (event) => onChange?.(!checked, event);

  return (
    <span className={cn("app-switch inline-flex align-middle", className)} style={{ width, height }}>
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
        className="ui-switch-track relative inline-flex w-full items-center rounded-full p-0 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ width, height, backgroundColor: checked ? onColor : offColor }}
      >
        {uncheckedIcon && !checked && <span className="absolute left-1 top-1/2 -translate-y-1/2">{uncheckedIcon}</span>}
        {checkedIcon && checked && <span className="absolute right-1 top-1/2 -translate-y-1/2">{checkedIcon}</span>}
        <span
          aria-hidden="true"
          className="ui-switch-thumb absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-transform"
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
