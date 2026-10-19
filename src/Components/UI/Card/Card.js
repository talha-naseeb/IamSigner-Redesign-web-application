import React from "react";
import "./Card.css";

const Card = React.forwardRef(
  (
    {
      children,
      variant = "default", // default | glass | flat | outlined
      hoverable = false,
      className = "",
      onClick,
      ...rest
    },
    ref
  ) => {
    const classNames = [
      "ui-card",
      variant !== "default" ? `ui-card--${variant}` : "",
      hoverable ? "ui-card--hoverable" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classNames} onClick={onClick} {...rest}>
        {children}
      </div>
    );
  }
);

const CardHeader = ({ children, className = "", ...rest }) => (
  <div className={`ui-card__header ${className}`} {...rest}>
    {children}
  </div>
);

const CardBody = ({ children, compact = false, className = "", ...rest }) => (
  <div
    className={`ui-card__body ${compact ? "ui-card__body--compact" : ""} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className = "", ...rest }) => (
  <div className={`ui-card__footer ${className}`} {...rest}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.displayName = "UICard";

export default Card;
