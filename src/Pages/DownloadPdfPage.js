import React, { useEffect, useRef, useState } from "react";
import verificationService from "@/services/verificationService";
import { Button, Col, Row } from "react-bootstrap";

const DownloadPdfPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [masterDocPages, setMasterDocPages] = useState();
  const [controlData, setControlData] = useState([]);

  const [auth, setAuth] = useState();
  const mainDocumentRef = useRef(null);

  const masterDocPagesID = "990997c2-e1a9-4d08-9093-dc73b156d96d";

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
    const GetMasterDocPagesControls = async () => {
      setIsLoading(true);
      try {
        const response = await verificationService.getMasterDocPagesControls(masterDocPagesID, auth);

        if (response.data.successStatus) {
          setControlData(response.data.response.controlsLocation);
          setMasterDocPages(response.data.response.masterDocPages);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    if (auth) {
      GetMasterDocPagesControls();
    }
  }, [auth]);

  return (
    <div style={{ background: "#fff" }}>
      <Row className=' my-2  mx-0 '>
        <Col className='p-0 d-flex justify-content-lg-center align-items-center'>
          <div
            className='main-document  border-0 '
            ref={mainDocumentRef}
            style={{
              position: "relative",
            }}
          >
            <div className='image'>
              <div className='large-image'>
                <div
                  className=''
                  style={{
                    // width: "100%",
                    position: "relative",
                    height: "auto",
                  }}
                >
                  {isLoading && (
                    <div className='loader-overlay'>
                      <div className='loader'></div>
                    </div>
                  )}

                  {masterDocPages && <img src={masterDocPages.pagesPath} alt='' className='download-img' />}

                  {controlData.map((control, index) => {
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
                          <Button
                            className='field-button'
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              width: control.width,
                              height: control.height,
                              fontFamily: control.fontStyle || "",
                              color: control.fontColor || "black",
                              fontSize: control.fontSize || "",
                            }}
                          >
                            {control.controlName === "Name" && control.name}
                            {control.controlName === "Email" && control.email}
                            {control.controlName === "Company" && control.company}
                            {control.controlName === "Date Signed" && control.signDate}
                            {control.controlName === "Text" && control.textEditor}
                            {control.controlName === "Number" && control.textEditor}
                            {control.controlName === "Date" && control.textEditor}
                            {control.controlName === "Stamp" && (
                              <img
                                src={control.signature}
                                alt='stamp Image'
                                style={{
                                  width: control.width,
                                  height: control.height,
                                  border: "none",
                                }}
                              />
                            )}
                            {control.controlName === "QR Code" && control.qrCodePath && <img src={`${control.qrCodePath}`} alt='QR Code' style={{ height: control.height, width: control.width }} />}
                            {control.controlName === "Signature" && (
                              <img
                                src={control.signature}
                                alt='Signature Image'
                                style={{
                                  width: control.width,
                                  height: control.height,
                                  border: "none",
                                }}
                              />
                            )}
                            {control.controlName === "Initial" && (
                              <img
                                src={control.signature}
                                alt='Initial Image'
                                style={{
                                  width: control.width,
                                  height: control.height,
                                  border: "none",
                                }}
                              />
                            )}
                            {control.controlName === "Image" && (
                              <img
                                src={control.signature}
                                alt='Image'
                                style={{
                                  width: control.width,
                                  height: control.height,
                                  border: "none",
                                }}
                              />
                            )}

                            {control.controlName === "Radio" && (
                              <div
                                style={{
                                  width: control.width + "px",
                                  height: control.height + "px",
                                  padding: "10px ",
                                  cursor: "grab",
                                }}
                              >
                                <div className='d-flex justify-content-start align-items-center gap-2'>
                                  <input type='radio' id={`radio${control.controlLocationID}`} name='radioGroup' style={{ width: "15px", height: "15px" }} />
                                  <label htmlFor={`radio${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                </div>
                              </div>
                            )}

                            {control.controlName === "Checkbox" && (
                              <div
                                style={{
                                  width: control.width + "px",
                                  height: control.height + "px",
                                  padding: "10px ",
                                  cursor: "grab",
                                }}
                              >
                                <div className='d-flex justify-content-start align-items-center gap-2'>
                                  <input
                                    type='checkbox'
                                    id={`checkbox${control.controlLocationID}`}
                                    name={`checkbox${control.controlLocationID}`}
                                    value=''
                                    checked={control.isCheckBox && control.textEditor === "YES" ? true : false}
                                    style={{ width: "15px", height: "15px" }}
                                  />

                                  <label htmlFor={`checkbox${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                </div>
                              </div>
                            )}
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DownloadPdfPage;
