import React from "react";
import "./Button.css";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconRight,
      fullWidth = false,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const classNames = [
      "ui-btn",
      `ui-btn--${variant}`,
      `ui-btn--${size}`,
      fullWidth ? "ui-btn--full" : "",
      disabled || loading ? "ui-btn--disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={classNames}
        {...rest}
      >
        {loading ? (
          <span className="ui-btn__spinner" aria-hidden="true" />
        ) : (
          icon && <span className="ui-btn__icon ui-btn__icon--start">{icon}</span>
        )}
        <span className="ui-btn__content">{children}</span>
        {!loading && iconRight && (
          <span className="ui-btn__icon ui-btn__icon--end">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "UIButton";

export default Button;
