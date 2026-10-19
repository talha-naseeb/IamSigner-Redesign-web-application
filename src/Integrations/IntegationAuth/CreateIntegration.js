import React from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Offcanvas from "react-bootstrap/Offcanvas";

const CreateIntegration = ({ show, onHide, appName, expiryInSecond, handleAppNameChange, handleExpiryChange, handleSubmit, handleCancel }) => {
  const { t } = useTranslation();

  return (
    <>
      <Offcanvas show={show} onHide={onHide} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("AuthIntegration.Api&key")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr style={{ margin: " auto 0", borderColor: "black" }} />
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <>
              <Form.Group controlId='appName'>
                <Form.Label>{t("AuthIntegration.AppName")}<span className="text-danger mx-1">*</span></Form.Label>
                <Form.Control type='text' placeholder={t("AuthIntegration.EnterAppName")} value={appName} onChange={handleAppNameChange} />
              </Form.Group>

              <Form.Group className='mt-2' controlId='expiryInSecond'>
                <Form.Label>{t("AuthIntegration.ExpiryTime")}<span className="text-danger mx-1">*</span></Form.Label>
                <Form.Control type='number' placeholder={t("AuthIntegration.EnterExpiryTime")} value={expiryInSecond} onChange={handleExpiryChange} />
              </Form.Group>
            </>

            <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
              <Button className='resetBtn' onClick={handleCancel}>
                {t("AuthIntegration.Cancel")}
              </Button>
              <Button className='applyBtn' type='submit' disabled={!appName.trim()}>
                {t("AuthIntegration.Create")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CreateIntegration;
