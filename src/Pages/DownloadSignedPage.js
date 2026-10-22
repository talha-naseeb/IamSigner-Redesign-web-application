import verificationService from "@/services/verificationService";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

const DownloadSignedPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [imagesData, setImagesData] = useState([]);
  const [controlData, setControlData] = useState([]);
  const [auth, setAuth] = useState();
  const mainDocumentRef = useRef(null);
  const canvasRef = useRef(null);

  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");

  const idIndex = parts.indexOf("id");

  useEffect(() => {
    if (idIndex !== -1 && idIndex < parts.length - 1) {
      const pathAfterId = parts.slice(idIndex + 1).join("/");
      setAuth(pathAfterId);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
  }, [imagesData]);

  useEffect(() => {
    const getControlsLocation = async () => {
      setIsLoading(true);
      try {
        const response = await verificationService.getControlLocationCompleted(selectedMasterDocID, auth);

        if (response.data.successStatus) {
          setControlData(response.data.response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (selectedMasterDocID) {
      getControlsLocation();
    }
  }, [selectedMasterDocID]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    try {
      const response = await verificationService.getMasterDocPagesCompleted(selectedMasterDocID, auth);

      setImagesData(response.data.response);

      response.data.response.map((doc) => doc.masterDocPagesID);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getRegisterSignDataComlpeted = async () => {
      setIsLoading(true);
      try {
        const response = await verificationService.getRegisterSignDataCompleted(auth);

        if (response.data.successStatus) {
          const firstDocument = response.data.response.primaryDocs[0];
          const firstMasterDocID = firstDocument.masterDocID;
          setSelectedMasterDocID(firstMasterDocID);
          getMasterDocPages(firstMasterDocID);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    if (auth) {
      getRegisterSignDataComlpeted();
    }
  }, [auth]);

  return (
    <div>
      <Row className='d-none justify-content-lg-center align-items-center m-3'>
        <div className='button' style={{ background: "white" }}>
          <div class='button-wrapper'>
            <div class='text'>Download</div>
            <span class='icon'>
              <svg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' width='2em' height='2em' preserveAspectRatio='xMidYMid meet' viewBox='0 0 24 24'>
                <path
                  fill='none'
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17'
                ></path>
              </svg>
            </span>
          </div>
        </div>
      </Row>
      <Row className='my-2  mx-0 '>
        <Col className='p-0 d-flex justify-content-lg-center align-items-center'>
          <div
            className='main-document  border-0 '
            ref={mainDocumentRef}
            style={{
              position: "relative",
            }}
          >
            <canvas ref={canvasRef} />
            {imagesData &&
              imagesData.map((imageData, index) => (
                <div className='image'>
                  <div className='large-image'>
                    <>
                      {isLoading && (
                        <div className='loader-overlay'>
                          <div className='loader'></div>
                        </div>
                      )}
                      <img src={imageData.pagesPath} alt='' className='doc-image download-img' />

                      {controlData
                        .filter((control) => control.masterDocPagesID === imageData.masterDocPagesID && control.pagesName === imageData.pagesName)
                        .map((control, index) => {
                          if (control.controlStatus === "Signed") {
                            return (
                              <div
                                key={index}
                                className='draggable-button-container'
                                style={{
                                  position: "absolute",
                                  left: control.controlLocationX,
                                  top: control.controlLocationY,
                                }}
                              >
                                {control.controlName === "Company" && control.company === "" ? null : (
                                  <Button
                                    className='field-button'
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "black",
                                      width: control.width,
                                      height: control.height,
                                    }}
                                  >
                                    {control.controlName === "Signature" && (
                                      <img
                                        src={control.signature}
                                        alt='Signature Image'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "0px",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Name" && control.name}
                                    {control.controlName === "Initial" && (
                                      <img
                                        src={control.signature}
                                        alt='Initial Image'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "0px",
                                        }}
                                      />
                                    )}

                                    {control.controlName === "Email" && control.email}
                                    {control.controlName === "Company" && control.company}
                                    {control.controlName === "Date Signed" && control.signDate}
                                    {control.controlName === "Text" && (
                                      <img
                                        src={control.signature}
                                        alt='stamp Image'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "0px",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Stamp" && (
                                      <img
                                        src={control.signature}
                                        alt='stamp Image'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "0px",
                                        }}
                                      />
                                    )}
                                  </Button>
                                )}
                              </div>
                            );
                          }

                          return null;
                        })}
                    </>
                  </div>
                </div>
              ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DownloadSignedPage;
