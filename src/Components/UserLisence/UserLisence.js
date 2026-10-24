import React from "react";
import expireImage from "@/assets/images/ExpireImage.png";
import "./style.css";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";

function UserLisence() {
  const { t } = useTranslation();
  const { userAccess } = useUser("");

  return (
    <div className='lisenceExpire'>
      <div className='LisenceImage'>
        <img className='license-expire-image' src={expireImage} alt='imageExpire' />
        {userAccess.packageName === "Trial" ? (
          <h3 className='license-expire-heading'>
            {userAccess.packageName} {""}
            {t("home.hasExpired")}
          </h3>
        ) : (
          <h3 className='license-expire-heading'>{t("home.Expire")}</h3>
        )}
      </div>
    </div>
  );
}

export default UserLisence;
