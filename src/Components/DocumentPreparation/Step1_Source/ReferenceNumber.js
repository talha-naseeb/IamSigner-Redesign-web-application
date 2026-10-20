import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Unified ReferenceNumber Component
 * Used across Upload Flow, Bulk Send, Self-Sign, and Templates.
 */
export const ReferenceNumber = ({ fetchedData, setFetchedData, setReferenceNumber }) => {
  const { t } = useTranslation();

  return (
    <div className='ref_number_box mb-3'>
      <label>{t("uploadDocFlow.referenceNumberOptional")}</label>
      <br />
      <input
        type='text'
        placeholder=''
        value={fetchedData?.referenceNumber || ""}
        onChange={(e) => {
          if (setFetchedData && fetchedData) {
            setFetchedData({
              ...fetchedData,
              referenceNumber: e.target.value,
            });
          }
          if (setReferenceNumber) {
            setReferenceNumber(e.target.value);
          }
        }}
      />
      <div className='refer_note'>
        <p>{t("uploadDocFlow.uploadDescription")}</p>
      </div>
    </div>
  );
};

export default ReferenceNumber;
