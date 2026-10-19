import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import Loader from "@/Components/CommonModals/Loader/Loader";
import dashboardService from "@/services/dashboardService";

const SignOrder = ({ masterDocID }) => {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState();

  const colorOptions = [
    {
      key: "originator",
      color: "#d3d3d3",
      name: t("signOrderDaigram.originator"),
    },
    {
      key: "Signed",
      color: "#19d157",
      name: t("signOrderDaigram.signed"),
    },
    {
      key: "Pending",
      color: "#f9ba05",
      name: t("signOrderDaigram.pending"),
    },
    {
      key: "Not Started",
      color: "#b2b6c0",
      name: t("signOrderDaigram.notStarted"),
    },
    {
      key: "Declined",
      color: "#dc3545",
      name: t("signOrderDaigram.declined"),
    },
    {
      key: "Viewed",
      color: "#999446",
      name: t("signOrderDaigram.viewed"),
    },
    {
      key: "Recalled",
      color: "#47b7c5",
      name: t("signOrderDaigram.recalled"),
    },
  ];

  const handleSignOrder = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getSignatureOrder(masterDocID);
      if (response.data.statusCode === "1") {
        setIsLoading(false);
        setApiResponse(response);
        setShowModal(true);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getColorForSignatory = (signStatus) => {
    const colorOption = colorOptions.find((option) => option.key === signStatus);
    return colorOption ? colorOption.color : "";
  };

  const uniqueSignatories = [];

  apiResponse &&
    apiResponse.data.response.forEach((signatory, index) => {
      if (index === 0 || (index > 0 && signatory.email !== apiResponse.data.response[index - 1].email)) {
        uniqueSignatories.push(signatory);
      }
    });

  return (
    <>
      {isLoading &&
        ReactDOM.createPortal(
          <div className='loader-overlay'>
            <Loader />
          </div>,
          document.body
        )}

      <div className='d-flex gap-2 align-items-center' onClick={() => handleSignOrder()}>
        <Icons.SignOrder />
        <span>{t("signOrderDaigram.Signorder")}</span>
      </div>

      <Modal show={showModal} backdrop='static' keyboard={false} onHide={closeModal} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title className='w-100 text-center text-md-start'>{t("signOrderDaigram.Signorder")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='signature-modal-body' style={{ maxHeight: "50vh", overflowY: "auto" }}>
          {/* Legend */}
          <div className='d-flex flex-wrap justify-content-center justify-content-md-start p-2 mb-3' style={{ gap: "8px" }}>
            {colorOptions.map((item) => (
              <div className='d-flex align-items-center' key={item.name} style={{ margin: "4px" }}>
                <div
                  style={{
                    backgroundColor: item.color,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    marginRight: "6px",
                    flexShrink: 0,
                  }}
                ></div>
                <span style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{item.name}</span>
              </div>
            ))}
          </div>
          <hr />

          {/* Desktop Headers */}
          <div className='row mb-3 d-none d-md-flex'>
            <div className='col-md-3 fw-bold text-center'>{t("signOrderDaigram.originator")}</div>
            <div className='col-md-6 fw-bold text-center'>{t("signOrderDaigram.signatories")}</div>
            <div className='col-md-3 fw-bold text-center'>{t("signOrderDaigram.status")}</div>
          </div>

          {/* Sign Order Flow */}
          {apiResponse && apiResponse.data && uniqueSignatories.length > 0 && (
            <div className='sign-order-container'>
              {/* Desktop Layout */}
              <div className='row align-items-start d-none d-md-flex'>
                {/* Originator Column */}
                <div className='col-md-3 d-flex justify-content-center'>
                  <div className='d-flex flex-column align-items-center'>
                    <div
                      style={{
                        color: "#6c757d",
                        border: `1px solid #6c757d`,
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        textAlign: "center",
                        minWidth: "120px",
                        wordBreak: "break-word",
                      }}
                      title={uniqueSignatories[0]?.createdBy}
                    >
                      {uniqueSignatories[0]?.createdByName}
                    </div>
                  </div>
                </div>

                {/* Arrow and Signatories Column */}
                <div className='col-md-6 d-flex flex-column align-items-center position-relative'>
                  {/* Horizontal Arrow - Desktop Only */}
                  <div className='d-none d-md-flex justify-content-center align-items-center mb-2' style={{ position: "absolute", top: "10px", left: "-15px" }}>
                    <Icons.ArrowRightLong size={25} style={{ transform: document.documentElement.dir === "rtl" ? "rotate(180deg)" : "none", color: "#9ea2a5ff" }} />
                  </div>

                  {/* Signatories Stack */}
                  <div className='signatories-stack w-100'>
                    {uniqueSignatories.map((signatory, index) => (
                      <div key={signatory.createdBy} className='d-flex flex-column align-items-center mb-2'>
                        <div
                          style={{
                            color: getColorForSignatory(signatory.signStatus),
                            border: `1px solid ${getColorForSignatory(signatory.signStatus)}`,
                            padding: "8px 12px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "14px",
                            textAlign: "center",
                            minWidth: "120px",
                            wordBreak: "break-word",
                          }}
                          title={signatory.email}
                        >
                          {signatory.name}
                        </div>
                        {index < uniqueSignatories.length - 1 && (
                          <div className='my-2 d-none d-md-block'>
                            <Icons.ArrowDownLong size={25} style={{ color: "#9ea2a5ff" }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Column */}
                <div className='col-md-3'>
                  <div className='status-stack d-flex flex-column align-items-center'>
                    {uniqueSignatories.map((signatory, index) => (
                      <div
                        key={`status-${signatory.createdBy}`}
                        className='d-flex justify-content-center'
                        style={{ minHeight: index < uniqueSignatories.length - 1 ? "85px" : "50px", alignItems: "flex-start" }}
                      >
                        <div
                          style={{
                            color: getColorForSignatory(signatory.signStatus),
                            border: `1px solid ${getColorForSignatory(signatory.signStatus)}`,
                            padding: "8px 12px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "14px",
                            textAlign: "center",
                            minWidth: "100px",
                            wordBreak: "break-word",
                          }}
                          title={signatory.signStatus}
                        >
                          {signatory.signStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className='d-block d-md-none'>
                {/* Originator */}
                <div className='mb-4'>
                  <h6 className='fw-bold text-center mb-3'>{t("signOrderDaigram.originator")}</h6>
                  <div className='d-flex justify-content-center'>
                    <div
                      style={{
                        color: "#6c757d",
                        border: `1px solid #6c757d`,
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        textAlign: "center",
                        maxWidth: "200px",
                        wordBreak: "break-word",
                      }}
                      title={uniqueSignatories[0]?.createdBy}
                    >
                      {uniqueSignatories[0]?.createdByName}
                    </div>
                  </div>
                </div>

                {/* Signatories and Status */}
                <div>
                  <h6 className='fw-bold text-center mb-3'>
                    {t("signOrderDaigram.signatories")} & {t("signOrderDaigram.status")}
                  </h6>
                  {uniqueSignatories.map((signatory, index) => (
                    <div key={`mobile-${signatory.createdBy}`} className='mb-3'>
                      <div className='row g-2'>
                        <div className='col-7'>
                          <div
                            style={{
                              color: getColorForSignatory(signatory.signStatus),
                              border: `1px solid ${getColorForSignatory(signatory.signStatus)}`,
                              padding: "8px 12px",
                              borderRadius: "12px",
                              fontWeight: "bold",
                              fontSize: "14px",
                              textAlign: "center",
                              wordBreak: "break-word",
                            }}
                            title={signatory.email}
                          >
                            {signatory.name}
                          </div>
                        </div>
                        <div className='col-5'>
                          <div
                            style={{
                              color: getColorForSignatory(signatory.signStatus),
                              border: `1px solid ${getColorForSignatory(signatory.signStatus)}`,
                              padding: "8px 12px",
                              borderRadius: "12px",
                              fontWeight: "bold",
                              fontSize: "14px",
                              textAlign: "center",
                              wordBreak: "break-word",
                            }}
                            title={signatory.signStatus}
                          >
                            {signatory.signStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className='modalFooter'>
          <Button variant='none' className='applyBtn text-white w-25' onClick={closeModal}>
            {t("signOrderDaigram.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignOrder;
