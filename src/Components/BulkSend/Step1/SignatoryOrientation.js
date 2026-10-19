import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { AiOutlineInfoCircle } from "react-icons/ai"; 

const SignatoryOrientation = ({ onOrientationChange, isSerial }) => {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(true);

    useEffect(() => {
      setIsChecked(isSerial ? "serial" : "parallel");
    }, [isSerial]);

    const handleCheckboxChange = (event) => {
      const value = event.target.checked;
      setIsChecked(value);
      onOrientationChange(value === "serial");
    };

  return (
    <div className='mb-3 mx-3'>
      <div className='d-flex align-items-center'>
        <div className='form-check'>
          <input type='checkbox' className='form-check-input' id='setSigningOrderCheckbox' checked={isChecked} onChange={handleCheckboxChange} />
          <label className='form-check-label ms-2' htmlFor='setSigningOrderCheckbox'>
            {t("uploadDocFlow.Setsigningorder")}
          </label>
        </div>
        <OverlayTrigger placement='top' overlay={<Tooltip id='tooltip'>{t("uploadDocFlow.OrderToltip")}</Tooltip>}>
          <span className='ms-2'>
            <AiOutlineInfoCircle />
          </span>
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default SignatoryOrientation;
