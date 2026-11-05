import React, { useEffect, useState } from "react";
import FirstStep from "../Step1/FirstStep";
import Secondstep from "../Step2/Secondstep";
import Thirdstep from "../Step3/Thirdstep";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UserProvider } from "@/Context/UserContext";
import Stepper from "../Stepper/Stepper";
import { useUser } from "@/Context/UserContext";
import UserLisence from "../../UserLisence/UserLisence";
import Signatories from "../Signatories/Signatories";
import { StudioDocumentStage, useStudioPreview } from "@/Components/DocumentPreparation";

const UploadDoc = () => {
  const { t } = useTranslation();

  const { user, userAccess } = useUser("");

  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [mobileTab, setMobileTab] = useState("setup");
  const navigate = useNavigate();

  const { previewState, setPreviewState, fetchPreviewPages, handlePreviewSync } = useStudioPreview();

  useEffect(() => {
    retrieveSavedStep();
  }, [userAccess]);

  // Hydrate initial preview if registerSignID exists
  useEffect(() => {
    const storedRegisterSignID = localStorage.getItem("registerSignID");
    if (!storedRegisterSignID) return;

    let mounted = true;
    uploadFlowService
      .getRegisterSignData(storedRegisterSignID)
      .then((response) => {
        if (!mounted || !response?.data?.successStatus) return;
        const data = response.data.response || {};
        const docs = Array.isArray(data.primaryDocs) ? data.primaryDocs : [];
        const docNames = docs.map((d) => d.docName);
        const docIds = docs.map((d) => d.masterDocID);

        setPreviewState((prev) => ({
          ...prev,
          uploadedFiles: docNames,
          masterDocIDs: docIds,
        }));

        if (docIds[0]) {
          fetchPreviewPages(docIds[0], docNames[0]);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [fetchPreviewPages, activeStep]);

  async function retrieveSavedStep() {
    const storedRegisterSignID = localStorage.getItem("registerSignID");
    try {
      const response = await uploadFlowService.getSignWorkFlowActivity(storedRegisterSignID);

      const currentStep = response.data.response.signWorkFlowActivityRef;

      let newActiveStep;

      switch (currentStep) {
        case "1":
          newActiveStep = 1;
          break;
        case "2":
          newActiveStep = 2;
          break;
        case "3":
          newActiveStep = 3;
          break;
        case "4":
          newActiveStep = 4;
          break;
        default:
          newActiveStep = 1;
          break;
      }
      setActiveStep(newActiveStep);

      if (newActiveStep === 2) {
        setCompletedSteps([1]);
      } else if (newActiveStep === 3) {
        setCompletedSteps([1, 2]);
      } else if (newActiveStep === 4) {
        setCompletedSteps([1, 2, 3]);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <UserProvider>
      <div className='relative min-h-[calc(100vh-70px)] bg-[var(--modern-bg,#f7f5ff)]'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <>
            <UserLisence />
          </>
        ) : (
          <>
            {!isLoading && (
              <div className='flex flex-col w-full'>
                <Stepper activeStep={activeStep} t={t} completedSteps={completedSteps} variant='studio' />

                <div className='w-full'>
                  {activeStep === 1 || activeStep === 2 ? (
                    <div className='mx-auto max-w-[1560px] px-4 py-4 sm:py-5'>
                      {/* Mobile View Toggle (Setup vs Preview) */}
                      <div className='mb-4 flex lg:hidden items-center gap-2 p-1.5 rounded-2xl bg-[var(--modern-card)] border border-[var(--modern-border-strong)]'>
                        <button
                          type='button'
                          onClick={() => setMobileTab("setup")}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
                            mobileTab === "setup"
                              ? "bg-[var(--modern-primary,#4d8dff)] text-white border-[var(--modern-primary,#4d8dff)]"
                              : "bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] border-[var(--modern-border)]"
                          }`}
                        >
                          {activeStep === 1
                            ? t("uploadDocFlow.uploadDoc", "1. Setup")
                            : t("Stepper.AddSigners", "2. Signers")}
                        </button>
                        <button
                          type='button'
                          onClick={() => setMobileTab("preview")}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 border ${
                            mobileTab === "preview"
                              ? "bg-[var(--modern-primary,#4d8dff)] text-white border-[var(--modern-primary,#4d8dff)]"
                              : "bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] border-[var(--modern-border)]"
                          }`}
                        >
                          <span>{t("uploadDocFlow.documentPreview", "Document Preview")}</span>
                          {previewState.imagesData?.length > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                mobileTab === "preview"
                                  ? "bg-white/25 text-white"
                                  : "bg-[var(--modern-raised)] text-[var(--modern-muted)]"
                              }`}
                            >
                              {previewState.imagesData.length}
                            </span>
                          )}
                        </button>
                      </div>

                      <main className='grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]'>
                        {/* Left Sticky Control Panel */}
                        <section
                          className={`flex flex-col rounded-[24px] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] lg:sticky lg:top-[60px] lg:h-[calc(100vh-var(--editor-header-height,67px)-80px)] overflow-hidden ${
                            mobileTab === "setup" ? "flex" : "hidden lg:flex"
                          }`}
                        >
                          {activeStep === 1 && (
                            <FirstStep
                              setActiveStep={setActiveStep}
                              setCompletedSteps={setCompletedSteps}
                              onPreviewSync={handlePreviewSync}
                              selectedMasterDocID={previewState.selectedMasterDocID}
                              onSelectPreviewDoc={fetchPreviewPages}
                              compactStudio={true}
                            />
                          )}
                          {activeStep === 2 && (
                            <Signatories
                              setActiveStep={setActiveStep}
                              setCompletedSteps={setCompletedSteps}
                              onPreviewSync={handlePreviewSync}
                            />
                          )}
                        </section>

                        {/* Right Always-Live Document Stage */}
                        <div className={mobileTab === "preview" ? "block" : "hidden lg:block"}>
                          <StudioDocumentStage
                            selectedDocName={previewState.selectedDocName}
                            uploadedFiles={previewState.uploadedFiles}
                            masterDocIDs={previewState.masterDocIDs}
                            selectedMasterDocID={previewState.selectedMasterDocID}
                            onSelectDoc={fetchPreviewPages}
                            imagesData={previewState.imagesData}
                            selectedImage={previewState.selectedImage}
                            onSelectPage={(img, id) =>
                              setPreviewState((prev) => ({
                                ...prev,
                                selectedImage: img,
                                masterDocPagesId: id,
                              }))
                            }
                            isLoadingPages={previewState.isLoadingPages}
                            recipients={previewState.recipients}
                            activeStep={activeStep}
                            t={t}
                          />
                        </div>
                      </main>
                    </div>
                  ) : activeStep === 3 ? (
                    <Secondstep setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />
                  ) : (
                    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-6'>
                      <Thirdstep setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserProvider>
  );
};

export default UploadDoc;
