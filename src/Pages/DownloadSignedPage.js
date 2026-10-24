import React, { useEffect, useRef, useState } from "react";
import verificationService from "@/services/verificationService";
import { Loader2 } from "lucide-react";

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
  }, [idIndex, parts]);

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

    if (selectedMasterDocID && auth) {
      getControlsLocation();
    }
  }, [selectedMasterDocID, auth]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    try {
      const response = await verificationService.getMasterDocPagesCompleted(selectedMasterDocID, auth);

      setImagesData(response.data.response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getRegisterSignDataCompleted = async () => {
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
      getRegisterSignDataCompleted();
    }
  }, [auth]);

  return (
    <div className='min-h-screen bg-white text-black p-0 m-0'>
      <div className='flex justify-center items-center w-full'>
        <div
          className='relative w-full max-w-full flex flex-col items-center gap-4 py-4'
          ref={mainDocumentRef}
        >
          <canvas ref={canvasRef} className='hidden' />

          {isLoading && (
            <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80'>
              <Loader2 className='h-8 w-8 animate-spin text-[var(--modern-primary,#6366f1)]' />
              <span className='mt-2 text-sm font-medium text-slate-600'>Loading document...</span>
            </div>
          )}

          {imagesData &&
            imagesData.map((imageData, pageIdx) => (
              <div key={pageIdx} className='relative max-w-full print:m-0 print:p-0'>
                <div className='relative inline-block select-none'>
                  <img
                    src={imageData.pagesPath}
                    alt=''
                    className='block max-w-full h-auto print:shadow-none'
                    style={{ display: "block" }}
                  />

                  {controlData
                    .filter(
                      (control) =>
                        control.masterDocPagesID === imageData.masterDocPagesID &&
                        control.pagesName === imageData.pagesName
                    )
                    .map((control, index) => {
                      if (control.controlStatus === "Signed") {
                        if (control.controlName === "Company" && control.company === "") return null;

                        return (
                          <div
                            key={index}
                            className='draggable-button-container absolute pointer-events-none select-none print:absolute'
                            style={{
                              position: "absolute",
                              left: control.controlLocationX,
                              top: control.controlLocationY,
                            }}
                          >
                            <div
                              className='flex items-center'
                              style={{
                                width: control.width,
                                height: control.height,
                              }}
                            >
                              {control.controlName === "Signature" && (
                                <img
                                  src={control.signature}
                                  alt='Signature'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "0px",
                                    objectFit: "contain",
                                  }}
                                />
                              )}
                              {control.controlName === "Name" && (
                                <span className='text-black text-sm font-medium'>{control.name}</span>
                              )}
                              {control.controlName === "Initial" && (
                                <img
                                  src={control.signature}
                                  alt='Initial'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "0px",
                                    objectFit: "contain",
                                  }}
                                />
                              )}

                              {control.controlName === "Email" && (
                                <span className='text-black text-sm'>{control.email}</span>
                              )}
                              {control.controlName === "Company" && (
                                <span className='text-black text-sm'>{control.company}</span>
                              )}
                              {control.controlName === "Date Signed" && (
                                <span className='text-black text-sm'>{control.signDate}</span>
                              )}
                              {control.controlName === "Text" &&
                                (control.signature ? (
                                  <img
                                    src={control.signature}
                                    alt=''
                                    style={{
                                      width: control.width,
                                      height: control.height,
                                      border: "0px",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <span className='text-black text-sm whitespace-pre-wrap'>{control.textEditor}</span>
                                ))}
                              {control.controlName === "Stamp" && (
                                <img
                                  src={control.signature}
                                  alt='Stamp'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "0px",
                                    objectFit: "contain",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadSignedPage;
