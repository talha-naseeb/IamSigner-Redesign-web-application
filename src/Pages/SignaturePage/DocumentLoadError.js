import React from "react";
import { useTranslation } from "react-i18next";
import declineIcon from "@/assets/images/documetnDecline.svg";
import SigningMessage from "@/Components/SigningMessage/SigningMessage";

const DocumentLoadError = () => {
  const { t } = useTranslation();

  return (
    <SigningMessage
      icon={declineIcon}
      title={t("docLoadError.title")}
      messages={[t("docLoadError.message"), t("docLoadError.message2")]}
      homeLabel={t("docLoadError.goToHome")}
      loginLabel={t("docLoadError.goToLogin")}
      overlayClassName='doc-load-error-overlay'
    />
  );
};

export default DocumentLoadError;
