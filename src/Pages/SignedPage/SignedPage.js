import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import { Download, CheckCircle2, FileText, Loader2 } from "lucide-react";

const SignedPage = () => {
  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState();
  const [fileName, setFileName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [imagesData, setImagesData] = useState([]);
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [controlData, setControlData] = useState([]);
  const [registerSignID, setRegisterSignID] = useState();
  const [auth, setAuth] = useState();
  const mainDocumentRef = useRef(null);

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
    setIsLoading(false);

    const getRegisterSignDataCompleted = async () => {
      try {
        const response = await verificationService.getRegisterSignDataCompleted(auth);

        if (response.data.successStatus) {
          setFormData(response.data.response);

          setRegisterSignID(response.data.response.registerSignID);
          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);
          setDefaultMasterDocID(masterDocIDs[0]);
          const firstDocument = response.data.response.primaryDocs[0];
          const firstDocName = firstDocument.docName;
          setFileName(firstDocName);
          const truncatedName = firstDocName.length > 4 ? firstDocName.slice(0, 4) + "..." : firstDocName;
          setSelectedFolder(truncatedName);

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

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  const handleFileDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await verificationService.downloadDocVerification(auth);

      const response1 = await fetch(response.data.response.document);
      const blob = await response1.blob();
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${fileName || "signed_document.pdf"}`;
      downloadLink.click();
      setIsDownloading(false);
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("File not downloaded. Try again");
      setIsDownloading(false);
    }
  };

  const handleImageClick = (pagesPath, masterDocPagesID) => {
    setSelectedImage(pagesPath);
    setMasterDocPagesId(masterDocPagesID);
  };

  const currentPageIndex = imagesData.findIndex((img) => img.pagesPath === selectedImage);

  return (
    <div className='min-h-screen bg-[var(--modern-bg,#f8fafc)] text-[var(--modern-text,#0f172a)] flex flex-col'>
      {/* Top Header / Action Bar */}
      <header className='sticky top-0 z-20 border-b border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] px-4 py-3'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--modern-raised,#f1f5f9)] border border-[var(--modern-border,#e2e8f0)] text-[var(--modern-primary,#6366f1)]'>
              <FileText className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h1 className='truncate text-base font-semibold text-[var(--modern-text,#0f172a)]' title={fileName}>
                  {fileName || "Signed Document"}
                </h1>
                <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='h-3 w-3' />
                  Signed
                </span>
              </div>
              {imagesData.length > 0 && (
                <p className='text-xs text-[var(--modern-muted,#64748b)]'>
                  Page {currentPageIndex >= 0 ? currentPageIndex + 1 : 1} of {imagesData.length}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='primary'
              onClick={handleFileDownload}
              disabled={isDownloading || !auth}
              className='gap-2 text-sm font-medium'
            >
              {isDownloading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className='h-4 w-4' />
                  <span>Download</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Page Switcher */}
      {imagesData.length > 1 && (
        <div className='md:hidden flex items-center gap-2 overflow-x-auto p-2 bg-[var(--modern-card,#fff)] border-b border-[var(--modern-border,#e2e8f0)]'>
          {imagesData.map((imageData, index) => {
            const isSelected = selectedImage === imageData.pagesPath;
            return (
              <button
                key={index}
                type='button'
                onClick={() => handleImageClick(imageData.pagesPath, imageData.masterDocPagesID)}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-[var(--modern-primary,#6366f1)] text-white"
                    : "bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-border,#e2e8f0)]"
                }`}
              >
                Page {index + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className='mx-auto flex w-full max-w-7xl flex-1 gap-6 p-4 md:p-6'>
        {/* Document Viewer */}
        <div className='flex-1 overflow-auto flex justify-center items-start'>
          <div
            ref={mainDocumentRef}
            className='relative rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-white p-2 transition-colors dark:border-[var(--modern-border-strong,#334155)] print:border-none'
          >
            {isLoading && (
              <div className='absolute inset-0 z-30 flex flex-col items-center justify-center rounded-lg bg-white/70 backdrop-blur-xs dark:bg-black/60'>
                <Loader2 className='h-8 w-8 animate-spin text-[var(--modern-primary,#6366f1)]' />
                <span className='mt-2 text-sm font-medium text-[var(--modern-muted,#64748b)]'>Loading document...</span>
              </div>
            )}

            {selectedImage ? (
              <div className='relative inline-block select-none'>
                <img
                  src={selectedImage}
                  alt={fileName || "Document page"}
                  className='block max-w-full h-auto rounded'
                  style={{ display: "block" }}
                />

                {/* Overlaid Signed Controls */}
                {controlData.map((control, index) => {
                  if (
                    control.masterDocPagesID === masterDocPagesId &&
                    control.controlStatus === "Signed"
                  ) {
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
                          className='field-button flex items-center'
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
                                border: "none",
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
                                border: "none",
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
                          {control.controlName === "Text" && (
                            <span className='text-black text-sm whitespace-pre-wrap'>{control.textEditor}</span>
                          )}
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
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : !isLoading ? (
              <div className='flex h-96 w-72 md:w-96 flex-col items-center justify-center p-6 text-center'>
                <FileText className='h-10 w-10 text-[var(--modern-muted,#64748b)] mb-2' />
                <p className='text-sm font-medium text-[var(--modern-text,#0f172a)]'>No preview available</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop Thumbnails Rail */}
        <aside className='w-56 shrink-0 hidden md:flex flex-col gap-3 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-3 max-h-[calc(100vh-120px)] sticky top-20'>
          <div className='border-b border-[var(--modern-border,#e2e8f0)] pb-2'>
            <h2 className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]'>
              Pages ({imagesData.length})
            </h2>
          </div>

          <div className='flex-1 overflow-y-auto space-y-3 pr-1'>
            {imagesData.length === 0 ? (
              <div className='py-8 text-center text-xs text-[var(--modern-muted,#64748b)]'>
                No pages found
              </div>
            ) : (
              imagesData.map((imageData, index) => {
                const isSelected = selectedImage === imageData.pagesPath;
                return (
                  <button
                    type='button'
                    key={index}
                    onClick={() => handleImageClick(imageData.pagesPath, imageData.masterDocPagesID)}
                    className={`group relative w-full overflow-hidden rounded-md border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--modern-primary,#6366f1)] ${
                      isSelected
                        ? "border-[var(--modern-primary,#6366f1)] ring-2 ring-[var(--modern-primary,#6366f1)]/30 bg-[var(--modern-raised,#f8fafc)]"
                        : "border-[var(--modern-border,#e2e8f0)] hover:border-[var(--modern-border-strong,#cbd5e1)] bg-white"
                    }`}
                  >
                    <img
                      src={imageData.pagesPath}
                      alt={`Page ${index + 1}`}
                      className='w-full h-auto block'
                    />
                    <div className='flex items-center justify-between border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] px-2 py-1 text-[11px] font-medium text-[var(--modern-text,#0f172a)]'>
                      <span>Page {index + 1}</span>
                      {isSelected && (
                        <span className='h-1.5 w-1.5 rounded-full bg-[var(--modern-primary,#6366f1)]' />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SignedPage;
