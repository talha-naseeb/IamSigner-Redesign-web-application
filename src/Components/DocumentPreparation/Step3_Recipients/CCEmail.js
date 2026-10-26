import React, { useId, useState } from "react";
import { Chips } from "@/Components/UI/EmailChips";
import { Button } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

/**
 * Unified CCEmail Component
 * Manages CC recipients and dispatching copyTo requests
 */
export const CCEmail = () => {
  const { t } = useTranslation();
  const emailInputId = useId();
  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [toValue, setToValue] = useState([]);

  const isValid = (email) => {
    if (isInList(email)) {
      toast.info(t("uploadDocFlow.hasAdded"));
      return false;
    }

    if (!isEmail(email)) {
      toast.error(`${email} ${t("uploadDocFlow.isnotValid")}`);
      return false;
    }

    return true;
  };

  const isInList = (email) => {
    return items.includes(email);
  };

  const isEmail = (email) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
  };

  const handleButtonClick = async () => {
    const storedRegisterSignID =
      sessionStorage.getItem("registerSignID") || localStorage.getItem("registerSignID");

    try {
      setIsLoading(true);
      const emailsString = items.join(",");
      const toString = toValue.join(",");
      const response = await uploadFlowService.copyTo({
        RegisterSignID: storedRegisterSignID,
        emailTo: toString,
        CopyTo: emailsString,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("uploadDocFlow.SuccessUpdated"));
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <label htmlFor={emailInputId} className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
          {t("uploadDocFlow.addCCemail")}
        </label>
        <span className="text-sm text-[var(--modern-muted,#64748b)]">{t("uploadDocFlow.optionalCCemail")}</span>
      </div>
      <div className="w-full">
        <Chips
          id={emailInputId}
          value={items}
          onChange={(e) => setItems(e.value)}
          placeholder={t("uploadDocFlow.emailPlaceHolder")}
          separator=','
          onAdd={(e) => {
            const email = e.value;
            if (!isValid(email)) {
              e.preventDefault();
            }
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="mt-3 w-[120px]"
          onClick={handleButtonClick}
          disabled={items.length === 0}
        >
          {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
          {t("uploadDocFlow.save")}
        </Button>
      </div>
    </div>
  );
};

export default CCEmail;
