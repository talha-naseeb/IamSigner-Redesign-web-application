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
  return <div className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] px-2 py-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--modern-primary,#6366f1)]", className)}>
    {chips.map((tag, index) => <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--modern-primary-soft,#ede9fe)] px-2.5 py-1 text-xs text-[var(--modern-text,#0f172a)]"><span>{tag}</span><button type="button" disabled={disabled} aria-label={`Remove ${tag}`} onClick={() => remove(tag)} className="rounded-full text-[var(--modern-muted,#64748b)] hover:text-[var(--modern-danger,#ef4444)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"><X className="h-3 w-3" /></button></span>)}
    <input {...props} id={id} disabled={disabled} value={draft} placeholder={placeholder} onChange={onChangeInput} onKeyDown={onKeyDown} onBlur={(event) => { props.onBlur?.(event); if (!event.defaultPrevented) add(draft, event); }} className="min-w-24 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-[var(--modern-text,#0f172a)] outline-none placeholder:text-[var(--modern-muted,#64748b)] disabled:opacity-60" aria-label={props["aria-label"] || placeholder || "Add tag"} />
  </div>;
};

export default Chips;
