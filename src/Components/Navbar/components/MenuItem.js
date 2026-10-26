import React from "react";
import { NavLink } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const MenuItem = ({
  item,
  isOpen,
  onClick,
  onNavigate,
  className = "menuLinks",
}) => {
  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) onNavigate?.();
  };

  const label = (
    <span className="link_text" aria-hidden={!isOpen}>
      {item.label}
    </span>
  );

  if (item.type === "upload") {
    return (
      <NavLink
        className="UploadMenuLink"
        to={item.path || "/upload-doc"}
        onClick={handleClick}
        title={!isOpen ? item.label : undefined}
        aria-label={item.label}
      >
        <span className="UploadDocMenu">
          <span className="Menuicons" aria-hidden="true">
            <item.icon size={20} />
          </span>
          {label}
        </span>
      </NavLink>
    );
  }

  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={`${className} ${item.className || ""}`}
      onClick={handleClick}
      title={!isOpen ? item.label : undefined}
      aria-label={item.label}
    >
      <span className="Menuicons" aria-hidden="true">
        {typeof item.icon === "string" ? (
          <img
            src={item.hoverIcon || item.icon}
            alt=""
            style={{ height: item.iconHeight ? `${item.iconHeight}px` : undefined }}
          />
        ) : (
          <Icon size={item.iconSize || 19} />
        )}
      </span>
      {label}
      {item.className === "dms-section" && isOpen && (
        <span className="dms-sidebar-tab-arrow" aria-hidden="true">
          <FiChevronRight size={14} />
        </span>
      )}
    </NavLink>
  );
};

export default MenuItem;
