import React from "react";
import "./Input.css";

const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconRight,
      disabled = false,
      required = false,
      className = "",
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const groupClasses = [
      "ui-input-group",
      error ? "ui-input-group--error" : "",
      disabled ? "ui-input-group--disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={groupClasses}>
        {label && (
          <label htmlFor={inputId} className="ui-input__label">
            {label}
            {required && <span className="ui-input__required">*</span>}
          </label>
        )}
        <div className="ui-input__wrapper">
          {icon && <span className="ui-input__icon ui-input__icon--start">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className="ui-input__field"
            {...rest}
          />
          {iconRight && (
            <span className="ui-input__icon ui-input__icon--end">{iconRight}</span>
          )}
        </div>
        {error ? (
          <div className="ui-input__error" role="alert">
            {error}
          </div>
        ) : helperText ? (
          <div className="ui-input__helper">{helperText}</div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "UIInput";

export default Input;
