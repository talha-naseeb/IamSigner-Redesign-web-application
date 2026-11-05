import React, { useCallback, useEffect, useState } from "react";
import FirstStep from "../Step1/FirstStep";
import Secondstep from "../Step2/Secondstep";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import Stepper from "@/Components/Upload Flow/Stepper/Stepper";
import UserLisence from "@/Components/UserLisence/UserLisence";
import AddRecipient from "../Step1/AddRecipient/AddRecipient";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { Icons } from "@/assets/Icons";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getInitials } from "@/Components/UI/dataPrimitives";

const UploadDoc = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, userAccess } = useUser("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  // Live Studio Stage preview state shared across Steps 1 & 2
  const [previewState, setPreviewState] = useState({
    templateName: "",
    templateScope: "Individual",
    uploadedFiles: [],
    masterDocIDs: [],
    selectedMasterDocID: null,
    selectedDocName: "",
    imagesData: [],
    selectedImage: null,
    masterDocPagesId: null,
    isLoadingPages: false,
    recipients: [],
  });

  const fetchPreviewPages = useCallback(async (masterDocID, docName = "") => {
    if (!masterDocID) {
      setPreviewState((prev) => ({
        ...prev,
        selectedMasterDocID: null,
        selectedDocName: "",
        imagesData: [],
        selectedImage: null,
        masterDocPagesId: null,
        isLoadingPages: false,
      }));
      return;
    }

    setPreviewState((prev) => ({
      ...prev,
      selectedMasterDocID: masterDocID,
      selectedDocName: docName || prev.selectedDocName,
      isLoadingPages: true,
    }));

    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);
      if (response?.data?.successStatus && Array.isArray(response.data.response)) {
        const pages = response.data.response;
        setPreviewState((prev) => ({
          ...prev,
          selectedMasterDocID: masterDocID,
          selectedDocName: docName || prev.selectedDocName,
          imagesData: pages,
          selectedImage: pages[0]?.pagesPath || null,
          masterDocPagesId: pages[0]?.masterDocPagesID || null,
          isLoadingPages: false,
        }));
      } else {
        setPreviewState((prev) => ({ ...prev, isLoadingPages: false }));
      }
    } catch (error) {
      setPreviewState((prev) => ({ ...prev, isLoadingPages: false }));
    }
  }, []);

  const handlePreviewSync = useCallback(
    (updates) => {
      setPreviewState((prev) => {
        const next = { ...prev, ...updates };
        const nextMasterDocIDs = updates.masterDocIDs ?? prev.masterDocIDs;
        const nextFiles = updates.uploadedFiles ?? prev.uploadedFiles;

        if (Array.isArray(nextMasterDocIDs)) {
          if (nextMasterDocIDs.length === 0) {
            next.selectedMasterDocID = null;
            next.selectedDocName = "";
            next.imagesData = [];
            next.selectedImage = null;
            next.masterDocPagesId = null;
          } else if (
            !prev.selectedMasterDocID ||
            !nextMasterDocIDs.some((id) => String(id) === String(prev.selectedMasterDocID))
          ) {
            const firstId = nextMasterDocIDs[0];
            const firstName = nextFiles?.[0] || "";
            setTimeout(() => fetchPreviewPages(firstId, firstName), 0);
          }
        }
        return next;
      });
    },
    [fetchPreviewPages]
  );

  // Hydrate initial preview if templateID exists in sessionStorage/localStorage
  useEffect(() => {
    const storedTemplateID =
      sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
    if (!storedTemplateID) return;

    let mounted = true;
    templateService
      .getTemplateData(storedTemplateID)
      .then((response) => {
        if (!mounted || !response?.data?.successStatus) return;
        const data = response.data.response || {};
        const docs = Array.isArray(data.primaryDocs) ? data.primaryDocs : [];
        const docNames = docs.map((d) => d.docName);
        const docIds = docs.map((d) => d.masterDocID);
        const scopeLabel = data.scope === "B" ? "Business" : "Individual";
        const signatories = Array.isArray(data.templateSignatory)
          ? data.templateSignatory.map((s) => ({
              name: s.name || "",
              email: s.email || "",
              signColor: s.signatureColor || "#4d8dff",
              signatureType: s.signatureType || "Needs To Sign",
            }))
          : [];

        setPreviewState((prev) => ({
          ...prev,
          templateName: data.templateName || prev.templateName,
          templateScope: scopeLabel,
          uploadedFiles: docNames,
          masterDocIDs: docIds,
          recipients: signatories.length > 0 ? signatories : prev.recipients,
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

  const handleSetActiveStep = (step) => {
    setActiveStep(step);
    sessionStorage.setItem("activeStep", step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetCompletedSteps = (steps) => {
    setCompletedSteps(steps);
    sessionStorage.setItem("completedSteps", JSON.stringify(steps));
  };

  useEffect(() => {
    const isEdit = location?.pathname?.includes("/edit-templates");
    const storedTemplateID =
      sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
    const storedRegisterSignID =
      sessionStorage.getItem("registerSignID") || localStorage.getItem("registerSignID");

    // When starting a new template flow without an in-progress template/register id,
    // ensure clean Step 1 state to prevent jumping to a stale step
    if (!isEdit && !storedTemplateID && !storedRegisterSignID) {
      setActiveStep(1);
      setCompletedSteps([]);
      sessionStorage.removeItem("activeStep");
      sessionStorage.removeItem("completedSteps");
      localStorage.removeItem("activeStep");
      localStorage.removeItem("completedSteps");
      return;
    }

    const storedActiveStep =
      sessionStorage.getItem("activeStep") || localStorage.getItem("activeStep");
    const storedCompletedSteps =
      sessionStorage.getItem("completedSteps") || localStorage.getItem("completedSteps");

    if (storedActiveStep) {
      setActiveStep(parseInt(storedActiveStep, 10));
    }

    if (storedCompletedSteps) {
      try {
        setCompletedSteps(JSON.parse(storedCompletedSteps));
      } catch (_) {}
    }
  }, [location?.pathname]);

  const currentPageIndex = previewState.imagesData.findIndex(
    (img) => img.pagesPath === previewState.selectedImage
  );
  const currentPageNumber = currentPageIndex >= 0 ? currentPageIndex + 1 : 1;
  const totalPages = previewState.imagesData.length;

  const goToPreviewPage = (index) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, index));
    const pageObj = previewState.imagesData[clamped];
    if (pageObj) {
      setPreviewState((prev) => ({
        ...prev,
        selectedImage: pageObj.pagesPath,
        masterDocPagesId: pageObj.masterDocPagesID,
      }));
    }
  };

  return (
    <div className='uploadDoc-container min-h-[calc(100vh-var(--editor-header-height,67px))] bg-[var(--modern-bg,#f8fafc)] text-[var(--modern-text,#0f172a)]'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <UserLisence />
        ) : (
          <div className='flex flex-col'>
            <Stepper
              activeStep={activeStep}
              t={t}
              completedSteps={completedSteps}
              variant='studio'
            />

            <div className='formSteps w-full'>
              {activeStep === 3 ? (
                <Secondstep
                  setActiveStep={handleSetActiveStep}
                  setCompletedSteps={handleSetCompletedSteps}
                />
              ) : (
                <main className='mx-auto grid max-w-[1560px] grid-cols-1 items-start gap-5 px-4 py-5 lg:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]'>
                  {/* Left Sticky Control Panel */}
                  <section className='flex flex-col rounded-[24px] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] lg:sticky lg:top-[60px] lg:h-[calc(100vh-var(--editor-header-height,67px)-80px)] overflow-hidden'>
                    {activeStep === 1 && (
                      <FirstStep
                        setActiveStep={handleSetActiveStep}
                        setCompletedSteps={handleSetCompletedSteps}
                        onPreviewSync={handlePreviewSync}
                        selectedMasterDocID={previewState.selectedMasterDocID}
                        onSelectPreviewDoc={fetchPreviewPages}
                      />
                    )}
                    {activeStep === 2 && (
                      <AddRecipient
                        setActiveStep={handleSetActiveStep}
                        setCompletedSteps={handleSetCompletedSteps}
                        onPreviewSync={handlePreviewSync}
                      />
                    )}
                  </section>

                  {/* Right Always-Live Document Stage */}
                  <section aria-label='Document Stage' className='min-w-0 flex flex-col'>
                    {/* Stage Top Bar */}
                    <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-4 py-2.5'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='truncate text-sm font-semibold text-[var(--modern-text,#0f172a)]'>
                            {previewState.selectedDocName ||
                              previewState.uploadedFiles?.[0] ||
                              t("templateUploadFlow.templatePreview", "Template Document Preview")}
                          </span>
                          {previewState.templateName && (
                            <span className='hidden sm:inline-flex items-center rounded-full border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--modern-primary,#4d8dff)]'>
                              {previewState.templateName}
                            </span>
                          )}
                        </div>
                        <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
                          <span>
                            {previewState.templateScope === "Business"
                              ? t("templateUploadFlow.Company", "Company")
                              : t("templateUploadFlow.Individual", "Individual")}
                          </span>
                          <span>·</span>
                          <span className='inline-flex items-center gap-1.5 font-medium text-[var(--modern-success,#10b981)]'>
                            <span className='h-1.5 w-1.5 rounded-full bg-current' />
                            {t("uploadDocFlow.livePreview", "Live preview")}
                          </span>
                        </div>
                      </div>

                      {/* Multi-document selector (if >1 uploaded file) */}
                      {previewState.uploadedFiles?.length > 1 && (
                        <div className='flex items-center gap-1.5'>
                          {previewState.uploadedFiles.map((fileName, idx) => {
                            const docId = previewState.masterDocIDs[idx];
                            const isSel =
                              String(docId) === String(previewState.selectedMasterDocID);
                            return (
                              <button
                                key={docId || idx}
                                type='button'
                                onClick={() => fetchPreviewPages(docId, fileName)}
                                className={`max-w-[140px] truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                  isSel
                                    ? "border-[var(--modern-primary,#4d8dff)] bg-[var(--modern-raised,#f8fafc)] text-[var(--modern-primary,#4d8dff)] font-semibold"
                                    : "border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-muted,#64748b)] hover:text-[var(--modern-text,#0f172a)]"
                                }`}
                              >
                                {fileName}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Pill Pager */}
                      <div className='inline-flex items-center gap-1 rounded-full border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] p-1'>
                        <button
                          type='button'
                          disabled={totalPages === 0 || currentPageNumber <= 1}
                          onClick={() => goToPreviewPage(0)}
                          aria-label='First page'
                          className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                          style={{ background: "transparent", border: "none" }}
                        >
                          <ChevronsLeft size={15} className='rtl:rotate-180' />
                        </button>
                        <button
                          type='button'
                          disabled={totalPages === 0 || currentPageNumber <= 1}
                          onClick={() => goToPreviewPage(currentPageIndex - 1)}
                          aria-label='Previous page'
                          className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                          style={{ background: "transparent", border: "none" }}
                        >
                          <ChevronLeft size={15} className='rtl:rotate-180' />
                        </button>
                        <span className='min-w-[64px] text-center font-mono text-xs font-medium text-[var(--modern-muted,#64748b)] select-none'>
                          {totalPages > 0
                            ? `${currentPageNumber} ${t("uploadDocFlow.of", "of")} ${totalPages}`
                            : `0 ${t("uploadDocFlow.of", "of")} 0`}
                        </span>
                        <button
                          type='button'
                          disabled={totalPages === 0 || currentPageNumber >= totalPages}
                          onClick={() => goToPreviewPage(currentPageIndex + 1)}
                          aria-label='Next page'
                          className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                          style={{ background: "transparent", border: "none" }}
                        >
                          <ChevronRight size={15} className='rtl:rotate-180' />
                        </button>
                        <button
                          type='button'
                          disabled={totalPages === 0 || currentPageNumber >= totalPages}
                          onClick={() => goToPreviewPage(totalPages - 1)}
                          aria-label='Last page'
                          className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                          style={{ background: "transparent", border: "none" }}
                        >
                          <ChevronsRight size={15} className='rtl:rotate-180' />
                        </button>
                      </div>
                    </div>

                    {/* Step 2 Live Recipient Strip on Stage */}
                    {activeStep === 2 && previewState.recipients?.length > 0 && (
                      <div className='mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3.5 py-2'>
                        <span className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]'>
                          {t("Stepper.AddSigners", "Signers")}:
                        </span>
                        {previewState.recipients.map((rec, idx) => (
                          <span
                            key={idx}
                            className='inline-flex items-center gap-2 rounded-full border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] py-1 pl-1.5 pr-3 text-xs font-medium text-[var(--modern-text,#0f172a)]'
                          >
                            <span
                              className='inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white'
                              style={{ backgroundColor: rec.signColor || "#4d8dff" }}
                            >
                              {getInitials(rec.name || `${idx + 1}`)}
                            </span>
                            <span className='max-w-[140px] truncate'>
                              {rec.name || `${t("uploadDocFlow.signatory", "Signatory")} ${idx + 1}`}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Horizontal Page Thumbnails Strip */}
                    {totalPages > 0 && (
                      <div className='mb-3 flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5'>
                        {previewState.imagesData.map((img, idx) => {
                          const isCurrent = img.pagesPath === previewState.selectedImage;
                          return (
                            <button
                              key={img.masterDocPagesID || idx}
                              type='button'
                              onClick={() => goToPreviewPage(idx)}
                              aria-label={`Page ${idx + 1}`}
                              className={`relative w-[78px] shrink-0 aspect-[8.5/11] overflow-hidden rounded-[10px] border-2 bg-white p-0 transition-all ${
                                isCurrent
                                  ? "border-[var(--modern-primary,#4d8dff)] outline outline-3 outline-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_22%,transparent)]"
                                  : "border-[var(--modern-border,#e2e8f0)] hover:border-[var(--modern-border-strong,#cbd5e1)]"
                              }`}
                            >
                              <img
                                src={img.pagesPath}
                                alt={`Page ${idx + 1}`}
                                className='h-full w-full object-cover pointer-events-none'
                              />
                              <span className='absolute bottom-1 right-1 rounded bg-[var(--modern-card,#ffffff)]/90 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[var(--modern-text,#0f172a)] border border-[var(--modern-border,#e2e8f0)]'>
                                {idx + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Ruled Canvas Desk */}
                    <div
                      className='flex min-h-[560px] w-full flex-col items-center justify-center rounded-[24px] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] p-4 sm:p-6'
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in srgb, var(--modern-border, #e2e8f0) 55%, transparent) 23px 24px)",
                      }}
                    >
                      {previewState.isLoadingPages ? (
                        <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
                          <div className='h-8 w-8 animate-spin rounded-full border-2 border-[var(--modern-primary,#4d8dff)] border-t-transparent' />
                          <p className='text-sm font-medium text-[var(--modern-muted,#64748b)]'>
                            {t("uploadDocFlow.loadingPreview", "Loading document preview…")}
                          </p>
                        </div>
                      ) : previewState.selectedImage ? (
                        <div className='w-full max-w-[760px] overflow-hidden rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-white'>
                          <img
                            src={previewState.selectedImage}
                            alt={`Page ${currentPageNumber}`}
                            className='block h-auto w-full select-none'
                          />
                        </div>
                      ) : (
                        <div className='flex max-w-md flex-col items-center justify-center gap-3 py-16 text-center'>
                          <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card,#ffffff)] text-[var(--modern-primary,#4d8dff)]'>
                            <Icons.DocumentReport size={30} />
                          </div>
                          <h3 className='text-base font-semibold text-[var(--modern-text,#0f172a)]'>
                            {t("templateUploadFlow.noDocUploadedYet", "No template document selected yet")}
                          </h3>
                          <p className='text-xs leading-relaxed text-[var(--modern-muted,#64748b)]'>
                            {t(
                              "templateUploadFlow.uploadToPreviewHint",
                              "Upload a PDF or Word document in the left panel to preview its pages live here across every step."
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </main>
              )}
            </div>
          </div>
        )}
      </div>
  );
};

export default UploadDoc;
