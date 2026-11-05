import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { DraggableButton } from "@/Components/DocumentPreparation";
import ImageWithDropZone from "./DisplayCenterImage";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AIAssistant from "@/Components/CommonModals/AIAssitant/AIAssistant";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import PageIcon from "@/assets/images/file-02.svg";
import { getInitials } from "@/Components/UI/dataPrimitives";
import { clearWorkflowStorage } from "@/utils/workflowStorage";

const Secondstep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();

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
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [controls, setControls] = useState([]);
  const [signatureType, setSignatureType] = useState({});
  const [buttonClicked, setButtonClicked] = useState();
  const [buttonLabel, setButtonLabel] = useState();
  const [controlID, setControlID] = useState();
  const [hoveredSignatory, setHoveredSignatory] = useState(null);
  const [mobileTab, setMobileTab] = useState("stage");

  // Page deletion confirmation state
  const [deletingMasterPageID, setDeletingMasterPageID] = useState(null);
  const [deletingPageIndex, setDeletingPageIndex] = useState(null);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);

  const storedTemplateID =
    sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
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
      if (storedTemplateID) {
        try {
          setIsLoading(true);
          const response = await templateService.getTemplateData(storedTemplateID);
          if (response.data.successStatus) {
            setFormData(response.data.response);

            const ids = response.data.response.primaryDocs.map(
              (doc) => doc.masterDocID
            );
            setMasterDocIDs(ids);
            setDefaultMasterDocID(ids[0]);
            const firstDocument = response.data.response.primaryDocs[0];
            if (firstDocument) {
              const firstDocName = firstDocument.docName;
              const truncatedName =
                firstDocName.length > 10
                  ? firstDocName.slice(0, 7) + ".."
                  : firstDocName;
              setSelectedFolder(truncatedName);
              setSelectedDocFullName(firstDocName);

              const firstMasterDocID = firstDocument.masterDocID;
              setSelectedMasterDocID(firstMasterDocID);
              fetchImagesForDocument(firstMasterDocID);
            }

            const firstSignatory = response.data.response.templateSignatory?.[0];
            if (firstSignatory) {
              const firstSignatoryID = firstSignatory.templateSignatoryID;
              setSelectedSignatoryID(firstSignatoryID);

              const firstName = firstSignatory.name;
              const truncatedSignatoryName =
                firstName.length > 4 ? firstName.slice(0, 4) + ".." : firstName;
              setSelectedName(truncatedSignatoryName);
            }

            const initialSignatoryColors = {};
            response.data.response.templateSignatory?.forEach((signatory) => {
              initialSignatoryColors[signatory.templateSignatoryID] =
                signatory.signatureColor;
            });
            setSignatoryColors(initialSignatoryColors);

            const initialSignatureTypes = {};
            response.data.response.templateSignatory?.forEach((signatory) => {
              initialSignatureTypes[signatory.templateSignatoryID] =
                signatory.signatureType;
            });
            setSignatureType(initialSignatureTypes);
            setIsLoading(false);
          }
        } catch (error) {
          toast.info(t("uploadDocFlow.sessionExpire"));
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [storedTemplateID]);

  const fetchStandardFields = async () => {
    try {
      const response = await uploadFlowService.getControls();

      if (response.data.successStatus) {
        const standardFieldsData = response.data.response;
        const updatedStandardFields = standardFieldsData.map((field) => ({
          icon: field.icon,
          label: field.controlName,
          controlID: field.controlID,
          controlUniqueIdentifier: field.controlUniqueIdentifier,
        }));
        setStandardFields(updatedStandardFields);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchStandardFields();
  }, []);

  const filteredFields = standardFields.filter((field) =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchImagesForDocument = async (masterDocID) => {
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
    } catch (error) {}
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

  const handleNameSelect = (templateSignatoryID, name) => {
    const truncatedName = name.length > 10 ? name.slice(0, 7) + ".." : name;
    setSelectedName(truncatedName);
    setSelectedSignatoryID(templateSignatoryID);
  };

  const handleFinish = async () => {
    // 1. Older validation: Must place at least one signature or stamp if any signatory needs to sign
    const hasSignatureOrStamp =
      Array.isArray(controls) &&
      controls.some(
        (control) =>
          control.controlCode === "Signature" ||
          control.controlCode === "Stamp" ||
          control.isSignature ||
          control.isStamp ||
          control.controlName === "Signature" ||
          control.controlName === "Stamp" ||
          control.buttonLabel === "Signature" ||
          control.buttonLabel === "Stamp"
      );

    const hasNeedsToSign =
      !formData?.templateSignatory ||
      formData.templateSignatory.length === 0 ||
      formData.templateSignatory.some(
        (s) =>
          (s.signatureType ||
            signatureType?.[s.templateSignatoryID] ||
            "Needs To Sign") !== "View Only"
      );

    if (hasNeedsToSign && !hasSignatureOrStamp) {
      toast.error(t("uploadDocFlow.placeSignatoryatleast"));
      return;
    }

    // 2. Signatory validation: Every signatory must have at least one control if SignatureType is "Needs To Sign"
    // If "View Only", there is no restriction on it.
    if (formData?.templateSignatory && formData.templateSignatory.length > 0) {
      for (const signatory of formData.templateSignatory) {
        const sigType =
          signatory.signatureType ||
          signatureType?.[signatory.templateSignatoryID] ||
          "Needs To Sign";

        if (sigType === "View Only") {
          continue;
        }

        const sigId = String(signatory.templateSignatoryID || "");
        const signatoryControls = Array.isArray(controls)
          ? controls.filter((c) => {
              const cSigId = String(
                c.templateSignatoryID ||
                  c.signatoriesID ||
                  c.selectedSignatoryID ||
                  c.SignatoriesID ||
                  ""
              );
              return cSigId === sigId;
            })
          : [];

        if (signatoryControls.length === 0) {
          const signerName =
            signatory.name || t("uploadDocFlow.signatory", "Signatory");
          toast.error(
            `${signerName}: ${t(
              "uploadDocFlow.placeSignatoryControl",
              "Please place at least one control for this signatory"
            )}`
          );
          if (signatory.templateSignatoryID) {
            handleNameSelect(signatory.templateSignatoryID, signatory.name);
          }
          return;
        }
      }
    }

    clearWorkflowStorage();
    navigate("/templates-page");
  };

  const handleBack = async () => {
    setActiveStep(2);
    setCompletedSteps([1]);
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

  const totalPlacedFields = Array.isArray(controls) ? controls.length : 0;

  return (
    <div className='relative w-full min-h-[calc(100vh-70px)] bg-[var(--modern-bg,#f7f5ff)]'>
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

      <main className='mx-auto grid max-w-[1560px] grid-cols-1 items-start gap-4 p-2.5 sm:p-4 lg:p-5 lg:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]'>
        {/* Left Sticky Control Panel (.panel) */}
        <section
          className={`flex flex-col rounded-[24px] border border-[var(--modern-border)] bg-[var(--modern-card)] lg:sticky lg:top-[60px] lg:h-[calc(100vh-var(--editor-header-height,67px)-80px)] overflow-hidden ${
            mobileTab === "controls" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Panel Header (.phead) */}
          <div className='px-5 pt-5 pb-1.5'>
            <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
              {t("uploadDocFlow.step", "STEP")} 3 {t("uploadDocFlow.of", "OF")} 3
            </small>
            <h1 className='mt-0.5 text-[22px] font-bold tracking-tight text-[var(--modern-text)]'>
              {t("Stepper.placeSignatories", "Place Signatories")}
            </h1>
            <p className='mt-1 text-[13px] text-[var(--modern-muted,#64748b)]'>
              {t(
                "uploadDocFlow.dragOrTapFieldsHint",
                "Drag fields onto the document, or tap one to drop it on the page"
              )}
            </p>
          </div>

          {/* Scrollable Panel Body (.pbody) */}
          <div className='min-h-0 flex-1 overflow-y-auto px-5 pt-3.5 pb-5 space-y-4'>
            {/* Document Switcher (if multiple primaryDocs exist) */}
            {formData?.primaryDocs?.length > 1 && (
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]'>
                  {t("uploadDocFlow.selectDocument", "Active Document")}
                </label>
                <Form.Select
                  value={`${selectedMasterDocID},${selectedDocFullName}`}
                  onChange={(e) => {
                    const [docId, ...nameParts] = e.target.value.split(",");
                    handleDocSelect(docId, nameParts.join(","));
                  }}
                >
                  {formData.primaryDocs.map((doc) => (
                    <option
                      key={doc.masterDocID}
                      value={`${doc.masterDocID},${doc.docName}`}
                    >
                      {doc.docName}
                    </option>
                  ))}
                </Form.Select>
              </div>
            )}

            {/* Signer Selector Chips (.chips / .sgchip) */}
            <div>
              <h3 className='mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]'>
                {t("Stepper.AddSigners", "Signers")}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {formData?.templateSignatory?.map((signatory) => {
                  const originalColor = signatory.signatureColor || "#4d8dff";
                  const isSelected =
                    selectedSignatoryID === signatory.templateSignatoryID;
                  const sigType =
                    signatory.signatureType ||
                    signatureType?.[signatory.templateSignatoryID] ||
                    "Needs To Sign";
                  const isViewOnly = sigType === "View Only";
                  const signerFieldCount = Array.isArray(controls)
                    ? controls.filter(
                        (c) =>
                          String(c.templateSignatoryID) ===
                          String(signatory.templateSignatoryID)
                      ).length
                    : 0;

                  return (
                    <button
                      key={signatory.templateSignatoryID}
                      type='button'
                      onClick={() =>
                        handleNameSelect(
                          signatory.templateSignatoryID,
                          signatory.name
                        )
                      }
                      onMouseEnter={() =>
                        setHoveredSignatory(signatory.templateSignatoryID)
                      }
                      onMouseLeave={() => setHoveredSignatory(null)}
                      title={`${signatory.name} (${isViewOnly ? t("uploadDocFlow.viewOnly", "View Only") : t("uploadDocFlow.needsToSign", "Needs To Sign")})`}
                      style={{
                        borderColor: isSelected ? originalColor : undefined,
                        outlineColor: isSelected
                          ? `color-mix(in srgb, ${originalColor} 24%, transparent)`
                          : undefined,
                      }}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] py-1 pl-1.5 pr-3 text-[13px] transition-all cursor-pointer appearance-none ${
                        isSelected
                          ? "bg-[var(--modern-raised)] font-semibold text-[var(--modern-text)] outline outline-4"
                          : "border-[var(--modern-border-strong)] bg-[var(--modern-card)] font-medium text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:bg-[color-mix(in_srgb,var(--modern-primary)_8%,var(--modern-raised))] hover:text-[var(--modern-text)]"
                      }`}
                    >
                      <span
                        className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold text-white'
                        style={{ backgroundColor: originalColor }}
                      >
                        {getInitials(signatory.name)}
                      </span>
                      <span className='max-w-[130px] truncate'>
                        {signatory.name || "—"}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center rounded-md p-1 ${
                          isViewOnly
                            ? "bg-[color-mix(in_srgb,var(--modern-text)_10%,transparent)] text-[var(--modern-muted)]"
                            : "bg-[color-mix(in_srgb,var(--modern-primary)_12%,transparent)] text-[var(--modern-primary)]"
                        }`}
                        title={isViewOnly ? t("uploadDocFlow.viewOnly", "View Only") : t("uploadDocFlow.needsToSign", "Needs To Sign")}
                      >
                        {isViewOnly ? (
                          <Icons.View size={12} className='shrink-0' />
                        ) : (
                          <Icons.SignatureType size={12} className='shrink-0' />
                        )}
                      </span>
                      <small className='ml-0.5 rounded-full bg-[var(--modern-raised,#f1f5f9)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--modern-muted,#64748b)]'>
                        {signerFieldCount}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Searchable 3-Column Field Palette Grid (.sec / .tiles) */}
            <div>
              <h3 className='mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]'>
                {t("uploadDocFlow.standardFields", "Fields")}
              </h3>

              {/* Search Input */}
              <div className='relative mb-2.5'>
                <span className='pointer-events-none absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center text-[var(--modern-muted,#64748b)]'>
                  <Icons.Search size={16} />
                </span>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("uploadDocFlow.searchFields", "Search fields")}
                  aria-label={t("uploadDocFlow.searchFields", "Search fields")}
                  className='h-[40px] w-full rounded-xl border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none'
                />
              </div>

              {/* 3-Column Field Tiles Grid */}
              {filteredFields.length > 0 ? (
                <div className='grid grid-cols-3 gap-2'>
                  {filteredFields.map((field, index) => (
                    <DraggableButton
                      key={field.controlID || index}
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

              {/* Placement Helper Tip */}
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

          {/* Sticky Panel Footer (.pfoot) */}
          <div className='mt-auto shrink-0 sticky bottom-0 z-20 flex items-center justify-between gap-2.5 border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5'>
            <Button
              variant='outline'
              id='hide_part_one'
              className='!h-[42px] !rounded-full !px-4 font-semibold shrink-0 hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] hover:bg-[color-mix(in_srgb,var(--modern-primary)_8%,var(--modern-card))] transition-all'
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
                {totalPlacedFields}{" "}
                {t("uploadDocFlow.fieldsPlaced", "fields placed")}
              </span>
            </div>

            <Button
              variant='primary'
              id='hide_part_one'
              className='!h-[42px] !rounded-full !px-5 font-semibold inline-flex items-center gap-2 shrink-0'
              onClick={handleFinish}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  {t("uploadDocFlow.finish")}
                </span>
              ) : (
                <>
                  <span>{t("uploadDocFlow.finish")}</span>
                  <Icons.Check size={15} />
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Right Document Stage (.stage) */}
        <section
          aria-label='Document Stage'
          className={`min-w-0 flex-col ${mobileTab === "stage" ? "flex" : "hidden lg:flex"}`}
        >
          {/* Stage Top Bar (.stbar) */}
          <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] px-4 py-2.5'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span className='truncate text-sm font-semibold text-[var(--modern-text)]'>
                  {selectedDocFullName ||
                    formData?.primaryDocs?.[0]?.docName ||
                    "—"}
                </span>
                {formData?.templateName && (
                  <span className='hidden sm:inline-flex items-center rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--modern-primary)]'>
                    {formData.templateName}
                  </span>
                )}
              </div>
              <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--modern-muted)]'>
                <span className='inline-flex items-center gap-1.5 font-medium text-[var(--modern-primary)]'>
                  <span className='h-1.5 w-1.5 rounded-full bg-current' />
                  {t("uploadDocFlow.editingFieldsMode", "Editing fields")}
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

          {/* Horizontal Page Thumbnails Strip (.thumbs) */}
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

                    {/* Placed Field Count Badge (.cnt) */}
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
                        className='absolute top-1 right-1 rtl:right-auto rtl:left-1 z-10 hidden h-5 w-5 items-center justify-center rounded bg-[var(--modern-card,#ffffff)]/90 text-[var(--modern-danger,#ef4444)] border border-[var(--modern-border,#e2e8f0)] group-hover:inline-flex'
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

          {/* Ruled Canvas Desk (.desk) */}
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
                TemplateID={storedTemplateID}
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
      <div className='lg:hidden fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none'>
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
