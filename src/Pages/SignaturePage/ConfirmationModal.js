import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";

const ConfirmationModal = ({ show, onHide, onClick, className }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={onHide} dialogClassName={`custom-modal-width ${className}`}>
      <Modal.Header closeButton className='pb-2'>
        {/* <div className='header-content d-flex align-items-start gap-2'>
          <div
            className='header-icon d-flex align-items-center justify-content-center'
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
              background: '#E6F7FB',
              border: '1px solid #BFE9F6',
            }}
          >
            <span style={{ color: '#0C9AD7', fontWeight: 700 }}>✓</span>
          </div>
          <div className='header-text'>
          <small className='text-muted'>{t('signaturePage.proceed')}</small>
          </div>
          </div> */}
        <Modal.Title className='d-flex align-items-center gap-2'>
          {/* <Icons.SignatureDefault /> */}
          {t("signaturePage.confirmCompleted")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='px-4 py-3'>
        {/* <div
          className='document-info p-3'
          style={{ borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className='d-flex align-items-start gap-3'>
            <div className='document-icon d-flex align-items-center justify-content-center'
              style={{ height: 40, width: 40, borderRadius: 10, background: '#F3F6F8', border: '1px solid #E6EAED' }}
            >
              <Icons.SignatureDefault />
            </div>
            <div className='document-details'>
              <small className='text-uppercase text-muted fw-semibold'>
                {t('signaturePage.sendAndSign')}
              </small>
              <div className='fw-semibold mt-1'>
                {t('signaturePage.sendDescription')}
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className='transfer-warning mt-3'>
          <div className='warning-text'> */}
        <p className='mb-0'>{t("signaturePage.proceed")}</p>
        {/* </div>
        </div> */}
      </Modal.Body>

      <Modal.Footer className='d-flex justify-content-between'>
        <Button onClick={onHide} variant='none' className='modalCancelButton'>
          {t("signaturePage.no")}
        </Button>
        <Button onClick={onClick} variant='none' className='applyBtn'>
          {t("signaturePage.yes")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
