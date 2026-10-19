import React, { useState } from "react";
import { Chips } from "primereact/chips";
import { Button } from "react-bootstrap";
import uploadFlowService from "@/services/uploadFlowService";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "./style.css";
import Loader from "@/Components/CommonModals/Loader/Loader";

const CCEmail = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false); // Fix here

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
    const storedRegisterSignID = localStorage.getItem("registerSignID");

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

  const handleChipsChange = (e) => {
    const newEmails = e.value;
    if (newEmails.length > items.length) {
      // Addition: Validate the new email
      const newEmail = newEmails[newEmails.length - 1];
      if (newEmail && isValid(newEmail)) {
        setItems(newEmails);
      }
    } else {
      // Removal: Update state without validation
      setItems(newEmails);
    }
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <>
        <label className='mb-2'>{t("uploadDocFlow.emailAdd")}</label>
        <div className='d-flex justify-content-between align-items-center gap-2'>
          <Chips value={items} onChange={handleChipsChange} className='form-control' placeholder={t("uploadDocFlow.enterEmail")} removable />

          {items.length > 0 && (
            <Button onClick={handleButtonClick} variant='none' className='comment-button'>
              <Icons.Send />
            </Button>
          )}
        </div>
      </>
    </>
  );
};

export default CCEmail;
