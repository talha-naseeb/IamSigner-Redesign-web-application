import React from "react";
import "./Badge.css";

const Badge = ({
  children,
  variant = "primary", // pending | completed | draft | shared | declined | inactive | recalled | primary
  size = "md", // sm | md
  dot = true,
  className = "",
  ...rest
}) => {
  const classNames = [
    "ui-badge",
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} {...rest}>
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      <span className="ui-badge__label">{children}</span>
    </span>
  );
};

export default Badge;
