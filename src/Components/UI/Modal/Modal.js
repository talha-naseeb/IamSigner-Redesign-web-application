import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm | md | lg | xl
  showClose = true,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`ui-modal-container ui-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="ui-modal__header">
            {title ? <h3 className="ui-modal__title">{title}</h3> : <div />}
            {showClose && (
              <button
                type="button"
                className="ui-modal__close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

const ModalBody = ({ children, className = "", ...rest }) => (
  <div className={`ui-modal__body ${className}`} {...rest}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = "", ...rest }) => (
  <div className={`ui-modal__footer ${className}`} {...rest}>
    {children}
  </div>
);

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
