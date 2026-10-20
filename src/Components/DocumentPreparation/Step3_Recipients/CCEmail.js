import React, { useState } from "react";
import { Chips } from "primereact/chips";
import { Button } from "react-bootstrap";
import uploadFlowService from "@/services/uploadFlowService";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "./style.css";
import Loader from "@/Components/CommonModals/Loader/Loader";

/**
 * Unified CCEmail Component
 * Manages CC recipients and dispatching copyTo requests
 */
export const CCEmail = () => {
  const { t } = useTranslation();
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
      {isLoading && <Loader />}
      <div className='d-flex align-items-center mb-3 mt-3'>
        <label className='email_label me-3'>{t("uploadDocFlow.addCCemail")}</label>
        <span className='refer_note mb-0'>{t("uploadDocFlow.optionalCCemail")}</span>
      </div>
      <div className='card p-fluid'>
        <Chips
          value={items}
          onChange={(e) => setItems(e.value)}
          placeholder={t("uploadDocFlow.emailPlaceHolder")}
          className='custom-chips'
          separator=','
          onAdd={(e) => {
            const email = e.value;
            if (!isValid(email)) {
              e.preventDefault();
            }
          }}
        />
      </div>
      <div className='d-flex justify-content-end'>
        <Button
          className='btn-global-primary mt-3'
          style={{ width: "120px" }}
          onClick={handleButtonClick}
          disabled={items.length === 0}
        >
          {t("uploadDocFlow.save")}
        </Button>
      </div>
    </div>
  );
};

export default CCEmail;
