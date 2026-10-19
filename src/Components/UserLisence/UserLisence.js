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
        {userAccess.packageName === "Trial" ? (
          <h3>
            {userAccess.packageName} {""}
            {t("home.hasExpired")}
          </h3>
        ) : (
          <h3>{t("home.Expire")}</h3>
        )}

        <img src={expireImage} alt='imageExpire' style={{ mixBlendMode: "multiply", height: "120px", width: "120px" }} />
      </div>
    </div>
  );
}

export default UserLisence;
