import { useState } from "react";
import { CloseIcon as CloseIcon } from "@/Components/UI/iconCompat";

// value: comma-separated string (what gets sent to API)
// onChange: called with comma-separated string on every change
const TagsInput = ({ value = "", onChange, placeholder = "Add tag..." }) => {
  const chips = value
    ? value.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const [input, setInput] = useState("");

  const addChip = (raw) => {
    const tag = raw.trim();
    if (!tag || chips.includes(tag)) return;
    onChange([...chips, tag].join(","));
  };

  const removeChip = (tag) => {
    onChange(chips.filter((c) => c !== tag).join(","));
  };

  const handleKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addChip(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && chips.length) {
      onChange(chips.slice(0, -1).join(","));
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addChip(input);
      setInput("");
    }
  };

  return (
    <div className="dms-tags-input-wrap">
      {chips.map((tag) => (
        <span key={tag} className="dms-tag-chip">
          {tag}
          <button
            type="button"
            className="dms-tag-chip-remove"
            onClick={() => removeChip(tag)}
          >
            <CloseIcon sx={{ fontSize: 10 }} />
          </button>
        </span>
      ))}
      <input
        className="dms-tags-input"
        value={input}
        placeholder={chips.length === 0 ? placeholder : ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val.endsWith(",")) {
            addChip(val.slice(0, -1));
            setInput("");
          } else {
            setInput(val);
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default TagsInput;
