import React, { useEffect, useRef, useState } from "react";
import verificationService from "@/services/verificationService";
import { Loader2 } from "lucide-react";

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
  }, [idIndex, parts]);

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
    <div className='min-h-screen bg-white text-black p-0 m-0'>
      <div className='flex justify-center items-center w-full py-2'>
        <div
          className='relative w-full max-w-full flex justify-center items-center'
          ref={mainDocumentRef}
        >
          <div className='relative inline-block select-none'>
            {isLoading && (
              <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80'>
                <Loader2 className='h-8 w-8 animate-spin text-[var(--modern-primary,#6366f1)]' />
                <span className='mt-2 text-sm font-medium text-slate-600'>Loading document...</span>
              </div>
            )}

            {masterDocPages && (
              <img
                src={masterDocPages.pagesPath}
                alt=''
                className='block max-w-full h-auto print:shadow-none'
                style={{ display: "block" }}
              />
            )}

            {controlData.map((control, index) => {
              if (control.controlStatus === "Signed") {
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
                      {control.controlName === "Date" && (control.signDate || control.textEditor)}
                      {control.controlName === "Stamp" && (
                        <img
                          src={control.signature}
                          alt='Stamp'
                          style={{
                            width: control.width,
                            height: control.height,
                            border: "none",
                            objectFit: "contain",
                          }}
                        />
                      )}
                      {control.controlName === "QR Code" && control.qrCodePath && (
                        <img
                          src={`${control.qrCodePath}`}
                          alt='QR Code'
                          style={{
                            height: control.height,
                            width: control.width,
                            objectFit: "contain",
                          }}
                        />
                      )}
                      {control.controlName === "Signature" && (
                        <img
                          src={control.signature}
                          alt='Signature'
                          style={{
                            width: control.width,
                            height: control.height,
                            border: "none",
                            objectFit: "contain",
                          }}
                        />
                      )}
                      {control.controlName === "Initial" && (
                        <img
                          src={control.signature}
                          alt='Initial'
                          style={{
                            width: control.width,
                            height: control.height,
                            border: "none",
                            objectFit: "contain",
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
                            objectFit: "contain",
                          }}
                        />
                      )}
                      {control.controlName === "Radio" && (
                        <div
                          style={{
                            width: control.width + "px",
                            height: control.height + "px",
                            padding: "10px",
                          }}
                        >
                          <div className='flex justify-start items-center gap-2'>
                            <input
                              type='radio'
                              id={`radio${control.controlLocationID}`}
                              name='radioGroup'
                              style={{ width: "15px", height: "15px" }}
                              readOnly
                              checked
                            />
                            <label htmlFor={`radio${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                          </div>
                        </div>
                      )}
                      {control.controlName === "Checkbox" && (
                        <div
                          style={{
                            width: control.width + "px",
                            height: control.height + "px",
                            padding: "10px",
                          }}
                        >
                          <div className='flex justify-start items-center gap-2'>
                            <input
                              type='checkbox'
                              id={`checkbox${control.controlLocationID}`}
                              name={`checkbox${control.controlLocationID}`}
                              value=''
                              checked={control.isCheckBox && control.textEditor === "YES"}
                              readOnly
                              style={{ width: "15px", height: "15px" }}
                            />
                            <label htmlFor={`checkbox${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPdfPage;
