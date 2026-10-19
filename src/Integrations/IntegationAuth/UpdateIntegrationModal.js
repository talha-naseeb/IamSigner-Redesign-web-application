import React, { useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function UpdateIntegrationModal({ show, onHide, isLoading, appName, expiryInSecond, handleAppNameChange, handleExpiryChange, handleUpdate, handleCancel, AuthData, setAppName, setExpiryInSecond }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (show && AuthData) {
      setAppName(AuthData.appName || ""); 
      setExpiryInSecond(AuthData.expiryinSecond || ""); 
    }
  }, [show, AuthData, setAppName, setExpiryInSecond]);

  return (
    <>
      <Offcanvas show={show} onHide={onHide} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("AuthIntegration.UpdateIntegration")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr style={{ margin: " auto 0", borderColor: "black" }} />  
        <Offcanvas.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className='mb-2' controlId='appName'>
              <Form.Label>{t("AuthIntegration.AppName")}<span className="text-danger mx-1">*</span></Form.Label>
              <Form.Control type='text' placeholder={t("AuthIntegration.EnterAppName")} value={appName} onChange={handleAppNameChange} />
            </Form.Group>

            <Form.Group controlId='expiryInSecond'>
              <Form.Label>{t("AuthIntegration.ExpiryTime")}<span className="text-danger mx-1">*</span></Form.Label>
              <Form.Control type='number' placeholder={t("AuthIntegration.EnterExpiryTime")} value={expiryInSecond} onChange={handleExpiryChange} />
            </Form.Group>

            <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
              <Button className='resetBtn' onClick={handleCancel}>
                {t("AuthIntegration.Cancel")}
              </Button>
              <Button className='applyBtn' type='submit' disabled={!appName.trim()}>
                {isLoading ? "Updating..." : t("AuthIntegration.UpdateKey")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default UpdateIntegrationModal;
