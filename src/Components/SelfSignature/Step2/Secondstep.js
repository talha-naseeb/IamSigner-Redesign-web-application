import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { DraggableButton } from "@/Components/DocumentPreparation";
import ImageWithDropZone from "./DisplayCenterImage";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AIAssistant from "@/Components/CommonModals/AIAssitant/AIAssistant";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import PageIcon from "@/assets/images/file-02.svg";
import { getInitials } from "@/Components/UI/dataPrimitives";

const Secondstep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();

  const storedRegisterSignID = localStorage.getItem("registerSignID");

  const [isLoading, setIsLoading] = useState(false);
  const [imageButtonsMap, setImageButtonsMap] = useState({});
  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState();
  const [selectedDocFullName, setSelectedDocFullName] = useState("");
  const [selectedName, setSelectedName] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState();
  const [imagesData, setImagesData] = useState([]);
  const [standardFields, setStandardFields] = useState([]);
  const [signatoryColors, setSignatoryColors] = useState({});
  const [selectedSignatoryID, setSelectedSignatoryID] = useState();
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [controls, setControls] = useState([]);
  const [signatureType, setSignatureType] = useState({});
  const [buttonClicked, setButtonClicked] = useState();
  const [buttonLabel, setButtonLabel] = useState();
  const [controlID, setControlID] = useState();
  const [mobileTab, setMobileTab] = useState("stage");

  // Page deletion confirmation state
  const [deletingMasterPageID, setDeletingMasterPageID] = useState(null);
  const [deletingPageIndex, setDeletingPageIndex] = useState(null);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);

  const navigate = useNavigate();
  const mainDocumentRef = useRef(null);

  const handleDraggbleButtonClick = (label, icon, ctrlID, index, value) => {
    setButtonClicked(value);
    setButtonLabel(label);
    setControlID(ctrlID);
    setMobileTab("stage");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (storedRegisterSignID) {
        try {
          setIsLoading(true);
          const response = await uploadFlowService.getRegisterSignData(storedRegisterSignID);

          if (response.data.successStatus) {
            setFormData(response.data.response);

            const ids = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
            setMasterDocIDs(ids);

            const firstDocument = response.data.response.primaryDocs[0];
            if (firstDocument) {
              const firstDocName = firstDocument.docName;
              const truncatedName =
                firstDocName.length > 10 ? firstDocName.slice(0, 7) + ".." : firstDocName;
              setSelectedFolder(truncatedName);
              setSelectedDocFullName(firstDocName);

              const firstMasterDocID = firstDocument.masterDocID;
              setSelectedMasterDocID(firstMasterDocID);
              fetchImagesForDocument(firstMasterDocID);
            }

            const firstSignatory = response.data.response.signatories?.[0];
            if (firstSignatory) {
              const firstSignatoryID = firstSignatory.signatoriesID;
              setSelectedSignatoryID(firstSignatoryID);

              const firstName = firstSignatory.name;
              const truncatedSignatoryName =
                firstName.length > 4 ? firstName.slice(0, 4) + ".." : firstName;
              setSelectedName(truncatedSignatoryName);
            }

            const initialSignatoryColors = {};
            response.data.response.signatories.forEach((signatory) => {
              initialSignatoryColors[signatory.signatoriesID] = signatory.signatureColor;
            });
            setSignatoryColors(initialSignatoryColors);

            const initialSignatureTypes = {};
            response.data.response.signatories.forEach((signatory) => {
              initialSignatureTypes[signatory.signatoriesID] = signatory.signatureType;
            });
            setSignatureType(initialSignatureTypes);
          }
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [storedRegisterSignID]);

  const fetchStandardFields = async () => {
    try {
      const response = await uploadFlowService.getControls();

      if (response.data.successStatus) {
        const allControls = response.data.response;
        const updatedStandardFields = allControls.map((field) => ({
          icon: field.icon,
          label: field.controlName,
          controlID: field.controlID,
          controlUniqueIdentifier: field.controlUniqueIdentifier,
        }));
        setStandardFields(updatedStandardFields);
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errorfetchingfields"));
    }
  };

  useEffect(() => {
    fetchStandardFields();
  }, []);

  const filteredFields = standardFields?.filter((field) =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchImagesForDocument = async (masterDocID) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);
      const pages = response?.data?.response || [];
      setImagesData(pages);
      if (pages.length > 0) {
        setSelectedImage(pages[0].pagesPath);
        setMasterDocPagesId(pages[0].masterDocPagesID);
      } else {
        setSelectedImage(null);
        setMasterDocPagesId(null);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocSelect = async (masterDocID, selectedFolderName) => {
    const truncatedName =
      selectedFolderName.length > 10
        ? selectedFolderName.slice(0, 7) + ".."
        : selectedFolderName;
    setSelectedFolder(truncatedName);
    setSelectedDocFullName(selectedFolderName);
    setSelectedMasterDocID(masterDocID);

    fetchImagesForDocument(masterDocID);
  };

  const handleImageSelect = (image, id) => {
    setMasterDocPagesId(id);
    setSelectedImage(image);
  };

  const handleConfirmPageDelete = (masterDocPagesID, pageIndex) => {
    setDeletingMasterPageID(masterDocPagesID);
    setDeletingPageIndex(pageIndex);
    setShowDeletePageModal(true);
  };

  const handlePageDelete = async () => {
    if (!deletingMasterPageID) return;
    try {
      const response = await uploadFlowService.deleteMasterDocPages({
        MasterDocPagesID: deletingMasterPageID,
      });

      if (response.status === 200) {
        const updatedImagesData = [...imagesData];
        updatedImagesData.splice(deletingPageIndex, 1);
        setImagesData(updatedImagesData);

        if (updatedImagesData.length === 0) {
          setSelectedImage(null);
          setMasterDocPagesId(null);
        } else {
          const nextPage =
            updatedImagesData[
              Math.min(deletingPageIndex, updatedImagesData.length - 1)
            ];
          setSelectedImage(nextPage.pagesPath);
          setMasterDocPagesId(nextPage.masterDocPagesID);
        }
        toast.success(t("uploadDocFlow.pageDeleted"));
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errDelete"));
    } finally {
      setShowDeletePageModal(false);
      setDeletingMasterPageID(null);
      setDeletingPageIndex(null);
    }
  };

  const currentPageIndex = Array.isArray(imagesData)
    ? imagesData.findIndex((img) => img.pagesPath === selectedImage)
    : -1;
  const currentPageNumber = currentPageIndex >= 0 ? currentPageIndex + 1 : 1;
  const totalPages = Array.isArray(imagesData) ? imagesData.length : 0;

  const goToPage = (index) => {
    if (!totalPages) return;
    const clamped = Math.max(0, Math.min(totalPages - 1, index));
    const pageObj = imagesData[clamped];
    if (pageObj) {
      handleImageSelect(pageObj.pagesPath, pageObj.masterDocPagesID);
    }
  };

  const handleContinue = async () => {
    const hasSignatureOrStamp =
      controls &&
      controls.some(
        (control) =>
          control.controlCode === "Signature" || control.controlCode === "Stamp"
      );

    if (!hasSignatureOrStamp) {
      toast.error(t("uploadDocFlow.placeSignatoryatleast"));
      return;
    }

    const StepData = {
      SignWorkFlowActivityName: "Send and Sign",
      SignWorkFlowActivityRef: "3",
      SignWorkFlowActivityClass: "RED",
      RegisterSignID: storedRegisterSignID,
      IsMobile: false,
    };

    try {
      setIsLoading(true);
      const response = await uploadFlowService.createWorkflowActivity(StepData);

      setIsLoading(false);

      if (response.data.successStatus) {
        setActiveStep(3);
        setCompletedSteps([1, 2]);
      } else {
        toast.error(t("uploadDocFlow.errInProcessing"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.info(t("uploadDocFlow.errInProcessing"));
    }
  };

  const handleBack = async () => {
    const StepData = {
      SignWorkFlowActivityName: "Upload Doc",
      SignWorkFlowActivityRef: "1",
      SignWorkFlowActivityClass: "RED",
      RegisterSignID: storedRegisterSignID,
      IsMobile: false,
    };

    try {
      setIsLoading(true);
      const response = await uploadFlowService.createWorkflowActivity(StepData);

      setIsLoading(false);

      if (response.data.successStatus) {
        setActiveStep(1);
        setCompletedSteps([]);
      } else {
        toast.error(t("uploadDocFlow.errorPreviousStep"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.info(t("uploadDocFlow.sessionExpire"));
    }
  };

  const totalPlacedFields = Array.isArray(controls) ? controls.length : 0;

  return (
    <div className='relative w-full min-h-[calc(100vh-70px)] bg-[var(--modern-bg,#f7f5ff)] pb-24 lg:pb-6'>
      {/* Mobile Segmented View Switcher */}
      <div className='flex lg:hidden items-center gap-2 p-1.5 mx-3 sm:mx-4 mt-3 mb-4 rounded-2xl bg-[var(--modern-card)] border border-[var(--modern-border-strong)]'>
        <button
          type='button'
          onClick={() => setMobileTab("stage")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            mobileTab === "stage"
              ? "bg-[var(--modern-primary,#4d8dff)] text-white border-[var(--modern-primary,#4d8dff)]"
              : "bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] border-[var(--modern-border)]"
          }`}
        >
          <Icons.PDFs size={15} />
          <span>{t("uploadDocFlow.documentCanvas", "Document Canvas")}</span>
        </button>
        <button
          type='button'
          onClick={() => setMobileTab("controls")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            mobileTab === "controls"
              ? "bg-[var(--modern-primary,#4d8dff)] text-white border-[var(--modern-primary,#4d8dff)]"
              : "bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] border-[var(--modern-border)]"
          }`}
        >
          <Icons.TeamMembers size={15} />
          <span>{t("uploadDocFlow.fieldsControls", "Fields & Controls")}</span>
        </button>
      </div>

      <main className='grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 p-2.5 sm:p-4 lg:p-6 items-start'>
        {/* Left Studio Panel */}
        <section
          aria-label='Studio Field Controls'
          className={`w-full rounded-2xl border border-[var(--modern-border-strong)] bg-[var(--modern-card)] flex-col overflow-hidden lg:sticky lg:top-[86px] ${
            mobileTab === "controls" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Signatory Banner */}
          <div className='border-b border-[var(--modern-border)] bg-[var(--modern-raised)]/60 px-5 py-4'>
            <div className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-2'>
              {t("selfSign.signer", "Signer (Myself)")}
            </div>
            <div className='flex items-center gap-3 p-2.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
              <div className='w-9 h-9 rounded-full bg-[var(--modern-primary,#4d8dff)] text-white flex items-center justify-center shrink-0 font-bold text-xs uppercase'>
                {getInitials(formData?.signatories?.[0]?.name || "Self")}
              </div>
              <div className='min-w-0'>
                <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                  {formData?.signatories?.[0]?.name || t("selfSign.myself", "Myself")}
                </div>
                <div className='text-xs text-[var(--modern-muted)] truncate'>
                  {formData?.signatories?.[0]?.email || ""}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Search & Grid */}
          <div className='p-5 space-y-4'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>
                  {t("uploadDocFlow.fields", "Fields & Controls")}
                </span>
                <span className='text-xs font-mono text-[var(--modern-muted)]'>
                  {filteredFields.length} {t("common.available", "available")}
                </span>
              </div>

              {/* Search Bar */}
              <div className='relative mb-3'>
                <Icons.Search
                  size={15}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--modern-muted)] rtl:left-auto rtl:right-3 pointer-events-none'
                />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("uploadDocFlow.searchFields", "Search fields...")}
                  className='w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] py-2 pl-9 pr-8 text-xs text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors rtl:pl-8 rtl:pr-9'
                />
                {searchTerm && (
                  <button
                    type='button'
                    onClick={() => setSearchTerm("")}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--modern-muted)] hover:text-[var(--modern-text)] cursor-pointer rtl:right-auto rtl:left-2.5'
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 3-Column Draggable Buttons Grid */}
              {filteredFields.length > 0 ? (
                <div className='grid grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1'>
                  {filteredFields.map((field, index) => (
                    <DraggableButton
                      key={index}
                      index={index}
                      icon={field.icon}
                      label={field.label}
                      controlID={field.controlID}
                      data={field.label}
                      signatoryColors={signatoryColors}
                      selectedSignatoryID={selectedSignatoryID}
                      MasterDocPagesId={masterDocPagesId}
                      signatureType={signatureType}
                      onButtonClick={handleDraggbleButtonClick}
                      controlUniqueIdentifier={field.controlUniqueIdentifier}
                      variant='tile'
                    />
                  ))}
                </div>
              ) : (
                <p className='my-4 text-center text-xs text-[var(--modern-muted)]'>
                  {t("uploadDocFlow.notItemsFound")}
                </p>
              )}

              {/* Helper Tip */}
              <div className='mt-3 flex items-start gap-2 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-2.5 text-xs text-[var(--modern-muted)]'>
                <Icons.AlertCircle
                  size={15}
                  className='mt-0.5 shrink-0 text-[var(--modern-primary)]'
                />
                <span>
                  {t(
                    "uploadDocFlow.tipPlaceFields",
                    "Drag with the mouse, or tap a field to add it to the current page. Drag placed fields to move them."
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Panel Footer */}
          <div className='mt-auto flex items-center justify-between gap-2.5 border-t border-[var(--modern-border-strong)] bg-[var(--modern-raised)] px-5 py-3.5'>
            <Button
              variant='outline'
              id='hide_part_one'
              className='!h-[42px] !rounded-full !px-4 font-semibold shrink-0'
              onClick={handleBack}
              disabled={isLoading}
            >
              {t("uploadDocFlow.back")}
            </Button>

            <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted)]'>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  totalPlacedFields > 0
                    ? "bg-[var(--modern-success)]"
                    : "bg-[var(--modern-warning)]"
                }`}
              />
              <span className='truncate'>
                {totalPlacedFields} {t("uploadDocFlow.fieldsPlaced", "fields placed")}
              </span>
            </div>

            <Button
              variant='primary'
              id='hide_part_one'
              className='!h-[42px] !rounded-full !px-5 font-semibold inline-flex items-center gap-2 shrink-0'
              onClick={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  <span>{t("uploadDocFlow.Continue")}</span>
                </span>
              ) : (
                <>
                  <span>{t("uploadDocFlow.Continue")}</span>
                  <Icons.Check size={15} />
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Right Document Stage */}
        <section
          aria-label='Document Stage'
          className={`min-w-0 flex-col ${mobileTab === "stage" ? "flex" : "hidden lg:flex"}`}
        >
          {/* Stage Top Bar */}
          <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] px-4 py-2.5'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span className='truncate text-sm font-semibold text-[var(--modern-text)]'>
                  {selectedDocFullName || formData?.primaryDocs?.[0]?.docName || "—"}
                </span>
                {formData?.primaryDocs && formData.primaryDocs.length > 1 && (
                  <select
                    value={`${selectedMasterDocID},${selectedDocFullName}`}
                    onChange={(e) => {
                      const [docId, docName] = e.target.value.split(",");
                      handleDocSelect(docId, docName);
                    }}
                    className='text-xs rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2 py-1 text-[var(--modern-text)] cursor-pointer'
                  >
                    {formData.primaryDocs.map((doc) => (
                      <option key={doc.masterDocID} value={`${doc.masterDocID},${doc.docName}`}>
                        {doc.docName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--modern-muted)]'>
                <span className='inline-flex items-center gap-1.5 font-medium text-[var(--modern-primary)]'>
                  <span className='h-1.5 w-1.5 rounded-full bg-current' />
                  {t("selfSign.placingMyFields", "Placing your signature fields")}
                </span>
              </div>
            </div>

            {/* Pill Pager */}
            <div className='inline-flex items-center gap-1 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] p-1'>
              <button
                type='button'
                disabled={totalPages === 0 || currentPageNumber <= 1}
                onClick={() => goToPage(0)}
                aria-label='First page'
                className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text)] transition-colors hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                style={{ background: "transparent", border: "none" }}
              >
                <ChevronsLeft size={15} className='rtl:rotate-180' />
              </button>
              <button
                type='button'
                disabled={totalPages === 0 || currentPageNumber <= 1}
                onClick={() => goToPage(currentPageIndex - 1)}
                aria-label='Previous page'
                className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text)] transition-colors hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                style={{ background: "transparent", border: "none" }}
              >
                <ChevronLeft size={15} className='rtl:rotate-180' />
              </button>
              <span className='min-w-[64px] text-center font-mono text-xs font-medium text-[var(--modern-muted)] select-none'>
                {totalPages > 0
                  ? `${currentPageNumber} ${t("uploadDocFlow.of", "of")} ${totalPages}`
                  : `0 ${t("uploadDocFlow.of", "of")} 0`}
              </span>
              <button
                type='button'
                disabled={totalPages === 0 || currentPageNumber >= totalPages}
                onClick={() => goToPage(currentPageIndex + 1)}
                aria-label='Next page'
                className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text)] transition-colors hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                style={{ background: "transparent", border: "none" }}
              >
                <ChevronRight size={15} className='rtl:rotate-180' />
              </button>
              <button
                type='button'
                disabled={totalPages === 0 || currentPageNumber >= totalPages}
                onClick={() => goToPage(totalPages - 1)}
                aria-label='Last page'
                className='inline-flex h-7 w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text)] transition-colors hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                style={{ background: "transparent", border: "none" }}
              >
                <ChevronsRight size={15} className='rtl:rotate-180' />
              </button>
            </div>
          </div>

          {/* Horizontal Page Thumbnails Strip */}
          {totalPages > 0 && (
            <div className='mb-3 flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5'>
              {imagesData.map((img, idx) => {
                const isCurrent = img.pagesPath === selectedImage;
                const pageFieldCount = Array.isArray(controls)
                  ? controls.filter(
                      (c) =>
                        String(c.masterDocPagesID) ===
                        String(img.masterDocPagesID)
                    ).length
                  : 0;

                return (
                  <div
                    key={img.masterDocPagesID || idx}
                    onClick={() =>
                      handleImageSelect(img.pagesPath, img.masterDocPagesID)
                    }
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleImageSelect(img.pagesPath, img.masterDocPagesID);
                      }
                    }}
                    aria-label={`${t("uploadDocFlow.page", "Page")} ${idx + 1}`}
                    className={`group relative w-[82px] shrink-0 aspect-[8.5/11] cursor-pointer overflow-hidden rounded-[10px] border-2 bg-white transition-all ${
                      isCurrent
                        ? "border-[var(--modern-primary,#4d8dff)] outline outline-3 outline-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_22%,transparent)]"
                        : "border-[var(--modern-border,#e2e8f0)] hover:border-[var(--modern-border-strong,#cbd5e1)]"
                    }`}
                  >
                    <img
                      src={img.pagesPath}
                      alt={`Page ${idx + 1}`}
                      className='h-full w-full object-cover pointer-events-none'
                      onError={() => {
                        navigate("/home");
                        toast.info(t("uploadDocFlow.pleaseUploadDoc"), {
                          toastId: "broken-thumb",
                        });
                      }}
                    />

                    {/* Placed Field Count Badge */}
                    {pageFieldCount > 0 && (
                      <span className='absolute top-1 left-1 rtl:left-auto rtl:right-1 z-10 rounded-md bg-[var(--modern-primary,#4d8dff)] px-1.5 py-0.2 font-mono text-[10px] font-semibold text-white'>
                        {pageFieldCount}
                      </span>
                    )}

                    {/* Delete Page Action on Hover */}
                    {totalPages > 1 && (
                      <button
                        type='button'
                        title={t("uploadDocFlow.deletePage", "Delete page")}
                        aria-label={t("uploadDocFlow.deletePage", "Delete page")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPageDelete(img.masterDocPagesID, idx);
                        }}
                        className='absolute top-1 right-1 rtl:right-auto rtl:left-1 z-10 hidden h-5 w-5 items-center justify-center rounded bg-[var(--modern-card,#ffffff)]/90 text-[var(--modern-danger,#ef4444)] border border-[var(--modern-border,#e2e8f0)] group-hover:inline-flex cursor-pointer'
                      >
                        <Icons.DeleteAction size={12} />
                      </button>
                    )}

                    {/* Page Number Badge */}
                    <span className='absolute bottom-1 right-1 rtl:right-auto rtl:left-1 z-10 rounded bg-[var(--modern-card)]/90 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[var(--modern-text)] border border-[var(--modern-border)]'>
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ruled Canvas Desk */}
          <div
            ref={mainDocumentRef}
            className='flex min-h-[360px] sm:min-h-[600px] w-full flex-col items-center justify-center overflow-auto rounded-[24px] border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] p-2 sm:p-4 lg:p-6'
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, var(--modern-border) 23px 24px)",
              backgroundSize: "100% 24px",
            }}
          >
            {!imagesData || imagesData.length === 0 ? (
              <div className='flex items-center justify-center p-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-[var(--modern-primary,#4d8dff)] border-t-transparent' />
              </div>
            ) : (
              <ImageWithDropZone
                selectedImage={selectedImage}
                imageButtonsMap={imageButtonsMap}
                setImageButtonsMap={setImageButtonsMap}
                signatoryColors={signatoryColors}
                selectedSignatoryID={selectedSignatoryID}
                selectedMasterDocID={selectedMasterDocID}
                masterDocPagesId={masterDocPagesId}
                RegisterSignID={storedRegisterSignID}
                setControls={setControls}
                buttonClicked={buttonClicked}
                setButtonClicked={setButtonClicked}
                buttonLabel={buttonLabel}
                controlID={controlID}
              />
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Stack for Mobile (MacAI Assistant on top, Add Fields below) */}
      <div className='lg:hidden fixed bottom-20 right-5 rtl:right-auto rtl:left-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none'>
        <div className='pointer-events-auto'>
          <AIAssistant className='!static' />
        </div>
        {mobileTab === "stage" && (
          <button
            type='button'
            onClick={() => setMobileTab("controls")}
            className='pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--modern-primary,#4d8dff)] text-white text-xs font-semibold shadow-lg shadow-[var(--modern-primary,#4d8dff)]/25 border border-white/20 cursor-pointer active:scale-95 transition-all'
          >
            <Icons.Plus size={15} />
            <span>{t("uploadDocFlow.addFields", "Add Fields")}</span>
          </button>
        )}
      </div>

      {/* Fixed Bottom Action Bar for Mobile (< 1024px) */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-4 py-3 shadow-lg'>
        <Button
          variant='outline'
          className='!h-10 !rounded-full !px-4 text-xs font-semibold shrink-0 border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)]'
          onClick={handleBack}
          disabled={isLoading}
        >
          {t("uploadDocFlow.back")}
        </Button>

        <div className='flex items-center gap-1.5 text-xs text-[var(--modern-muted)] font-medium truncate'>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              totalPlacedFields > 0 ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className='truncate font-mono'>
            {totalPlacedFields} {t("uploadDocFlow.fieldsPlaced", "fields placed")}
          </span>
        </div>

        <Button
          variant='primary'
          className='!h-10 !rounded-full !px-5 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 !bg-[var(--modern-primary,#4d8dff)] !text-white hover:opacity-90 active:scale-95 shadow-none'
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className='inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
          ) : (
            <>
              <span>{t("uploadDocFlow.Continue")}</span>
              <Icons.Check size={14} />
            </>
          )}
        </Button>
      </div>

      {/* Desktop MacAI Assistant */}
      <div className='hidden lg:block'>
        <AIAssistant className='bottom-6 right-6 rtl:right-auto rtl:left-6' />
      </div>

      {/* Delete Page Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeletePageModal}
        onHide={() => setShowDeletePageModal(false)}
        title={t("uploadDocFlow.confirmDelete")}
        subtitle={t("uploadDocFlow.deletePage")}
        warningText={t("uploadDocFlow.deletePage")}
        itemTitle={t("uploadDocFlow.deleteTemplates")}
        itemName={imagesData[deletingPageIndex]?.pagesName || "Page"}
        onConfirm={handlePageDelete}
        confirmText={t("createTeam.confirm")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={22} />}
        itemIconSrc={PageIcon}
      />
    </div>
  );
};

export default Secondstep;