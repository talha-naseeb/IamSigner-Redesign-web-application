import React, { useEffect, useId, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import MenuItem from "./MenuItem";

const pathIsActive = (pathname, path) =>
  Boolean(path) &&
  (pathname === path || pathname.startsWith(`${path.replace(/\/$/, "")}/`));

const DropdownMenu = ({
  items,
  triggerIcon: Icon,
  triggerLabel,
  isOpen,
  className = "menuLinks",
  onItemClick,
  onNavigate,
  onExpandSidebar,
}) => {
  const { pathname } = useLocation();
  const panelId = useId();
  const hasActiveItem = items.some((item) => pathIsActive(pathname, item.path));
  const [isExpanded, setIsExpanded] = useState(hasActiveItem);

  useEffect(() => {
    if (hasActiveItem) setIsExpanded(true);
  }, [hasActiveItem]);

  const handleToggle = () => {
    if (!isOpen) {
      onExpandSidebar?.();
      setIsExpanded(true);
      return;
    }
    setIsExpanded((expanded) => !expanded);
  };

  return (
    <div className={`sidebar-nav-group${isExpanded ? " sidebar-nav-group--expanded" : ""}`}>
      <button
        type="button"
        className={`${className} sidebar-group-trigger${hasActiveItem ? " sidebar-group-trigger--active" : ""}`}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={isOpen && isExpanded ? panelId : undefined}
        aria-label={triggerLabel}
        title={!isOpen ? triggerLabel : undefined}
      >
        <span className="Menuicons" aria-hidden="true">
          {Icon ? <Icon size={19} /> : null}
        </span>
        <span className="link_text" aria-hidden={!isOpen}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`sidebar-group-chevron${isExpanded ? " sidebar-group-chevron--open" : ""}`}
          size={15}
          aria-hidden="true"
        />
      </button>

      <div
        className={`sidebar-submenu-wrapper${isExpanded && isOpen ? " sidebar-submenu-wrapper--open" : ""}`}
        aria-hidden={!(isExpanded && isOpen)}
      >
        <div className="sidebar-submenu-inner">
          <div className="sidebar-submenu" id={panelId}>
            {items.map((item) => (
              <MenuItem
                key={item.path}
                item={item}
                isOpen={isOpen}
                className="menuLinks sidebar-sub-link"
                onClick={item.isSubscriptionOnly ? (event) => onItemClick?.(event, item) : undefined}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
