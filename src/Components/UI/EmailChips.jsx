import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Token-aware tag input with the PrimeReact Chips value/onChange contract. */
export const Chips = ({ value = [], onChange, onAdd, placeholder, separator = ",", className, id, disabled, ...props }) => {
  const [draft, setDraft] = useState("");
  const chips = Array.isArray(value) ? value : typeof value === "string" ? value.split(separator).map((item) => item.trim()).filter(Boolean) : [];
  const add = (raw, event) => {
    const tag = raw.trim();
    if (!tag) return;
    let prevented = false;
    const addEvent = { value: tag, originalEvent: event, preventDefault: () => { prevented = true; event?.preventDefault?.(); } };
    onAdd?.(addEvent);
    if (prevented || chips.includes(tag)) return;
    onChange?.({ originalEvent: event, value: [...chips, tag] });
    setDraft("");
  };
  const remove = (tag) => onChange?.({ value: chips.filter((item) => item !== tag) });
  const onKeyDown = (event) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === separator) { event.preventDefault(); add(draft, event); }
    else if (event.key === "Backspace" && !draft && chips.length) remove(chips[chips.length - 1]);
  };
  const onChangeInput = (event) => {
    const next = event.target.value;
    if (separator && next.includes(separator)) {
      const parts = next.split(separator);
      let nextChips = [...chips];
      const rejected = [];
      for (const part of parts.slice(0, -1)) {
        const tag = part.trim();
        if (!tag || nextChips.includes(tag)) continue;
        let prevented = false;
        onAdd?.({ value: tag, originalEvent: event, preventDefault: () => { prevented = true; event.preventDefault(); } });
        if (prevented) rejected.push(part);
        else nextChips.push(tag);
      }
      if (nextChips.length !== chips.length) onChange?.({ originalEvent: event, value: nextChips });
      setDraft([...rejected, parts[parts.length - 1]].filter(Boolean).join(`${separator} `));
    } else setDraft(next);
  };
  return (
    <div className={cn("flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 py-1.5 focus-within:border-[var(--modern-primary,#4d8dff)] focus-within:ring-1 focus-within:ring-[var(--modern-primary,#4d8dff)]", className)}>
      {chips.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--modern-primary,#4d8dff)]/25 bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--modern-text)]"
        >
          <span className="truncate max-w-[240px]">{tag}</span>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Remove ${tag}`}
            onClick={() => remove(tag)}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[var(--modern-muted)] hover:bg-[var(--modern-danger,#ef4444)]/15 hover:text-[var(--modern-danger,#ef4444)] cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--modern-primary,#4d8dff)]"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        {...props}
        id={id}
        disabled={disabled}
        value={draft}
        placeholder={placeholder}
        onChange={onChangeInput}
        onKeyDown={onKeyDown}
        onBlur={(event) => { props.onBlur?.(event); if (!event.defaultPrevented) add(draft, event); }}
        className="min-w-24 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-[var(--modern-text)] outline-none placeholder:text-[var(--modern-muted)] disabled:opacity-60"
        aria-label={props["aria-label"] || placeholder || "Add tag"}
      />
    </div>
  );
};

export default Chips;
