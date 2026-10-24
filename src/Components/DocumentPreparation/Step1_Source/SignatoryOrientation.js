import React, { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";

/**
 * Unified SignatoryOrientation Component
 * Used across Upload Flow, Bulk Send, Self-Sign, and Templates.
 */
export const SignatoryOrientation = ({ onOrientationChange, isSerial }) => {
  const { t } = useTranslation();
  const checkboxId = useId();
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    setIsChecked(isSerial ? "serial" : "parallel");
  }, [isSerial]);

  const handleCheckboxChange = (event) => {
    const value = event.target.checked;
    setIsChecked(value);
    if (onOrientationChange) {
      onOrientationChange(value === "serial" || value === true);
    }
  };

  return (
    <div className="mb-3 mx-3">
      <div className="flex items-center">
        <div className="inline-flex items-center">
          <input
            type='checkbox'
            className="h-4 w-4 rounded border border-[var(--modern-border-strong,#cbd5e1)] accent-[var(--modern-primary,#6366f1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"
            id={checkboxId}
            checked={isChecked === "serial" || isChecked === true}
            onChange={handleCheckboxChange}
          />
          <label className="ms-2 text-sm text-[var(--modern-text,#0f172a)]" htmlFor={checkboxId}>
            {t("uploadDocFlow.Setsigningorder")}
          </label>
        </div>
        <OverlayTrigger placement='top' overlay={<Tooltip id='tooltip'>{t("uploadDocFlow.OrderToltip")}</Tooltip>}>
          <span className="ms-2 inline-flex text-[var(--modern-muted,#64748b)]">
            <Icons.InfoOutline />
          </span>
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default SignatoryOrientation;
