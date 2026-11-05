import React from "react";
import { Icons } from "@/assets/Icons";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getInitials } from "@/Components/UI/dataPrimitives";

const StudioDocumentStage = ({
  selectedDocName = "",
  uploadedFiles = [],
  masterDocIDs = [],
  selectedMasterDocID = null,
  onSelectDoc,
  imagesData = [],
  selectedImage = null,
  onSelectPage,
  isLoadingPages = false,
  recipients = [],
  activeStep = 1,
  t = (k, f) => f || k,
  emptyStateTitle,
  emptyStateDescription,
}) => {
  const totalPages = imagesData?.length || 0;
  const currentPageIndex = imagesData.findIndex((img) => img.pagesPath === selectedImage);
  const currentPageNumber = currentPageIndex >= 0 ? currentPageIndex + 1 : 1;

  const goToPage = (index) => {
    if (!imagesData || totalPages === 0) return;
    const clamped = Math.max(0, Math.min(totalPages - 1, index));
    const target = imagesData[clamped];
    if (target && typeof onSelectPage === "function") {
      onSelectPage(target.pagesPath, target.masterDocPagesID, clamped);
    }
  };

  return (
    <section aria-label="Document Stage" className="min-w-0 flex flex-col flex-1">
      {/* Stage Top Bar */}
      <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] p-3 sm:px-4 sm:py-2.5">
        <div className="min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="truncate text-xs sm:text-sm font-semibold text-[var(--modern-text,#0f172a)] block">
              {selectedDocName || uploadedFiles?.[0] || t("uploadDocFlow.documentPreview", "Document Preview")}
            </span>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-[var(--modern-muted,#64748b)]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--modern-success,#10b981)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {t("uploadDocFlow.livePreview", "Live preview")}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-document selector (if >1 uploaded file) */}
        {uploadedFiles?.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {uploadedFiles.map((fileName, idx) => {
              const docId = masterDocIDs[idx];
              const isSel = String(docId) === String(selectedMasterDocID);
              return (
                <button
                  key={docId || idx}
                  type="button"
                  onClick={() => onSelectDoc?.(docId, fileName)}
                  className={`max-w-[120px] sm:max-w-[140px] truncate shrink-0 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${
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
        <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 rounded-full border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] p-1 self-center sm:self-auto shrink-0">
          <button
            type="button"
            disabled={totalPages === 0 || currentPageNumber <= 1}
            onClick={() => goToPage(0)}
            aria-label="First page"
            className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            <ChevronsLeft size={14} className="rtl:rotate-180" />
          </button>
          <button
            type="button"
            disabled={totalPages === 0 || currentPageNumber <= 1}
            onClick={() => goToPage(currentPageIndex - 1)}
            aria-label="Previous page"
            className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </button>
          <span className="min-w-[56px] sm:min-w-[64px] text-center font-mono text-[11px] sm:text-xs font-medium text-[var(--modern-muted,#64748b)] select-none">
            {totalPages > 0
              ? `${currentPageNumber} ${t("uploadDocFlow.of", "of")} ${totalPages}`
              : `0 ${t("uploadDocFlow.of", "of")} 0`}
          </span>
          <button
            type="button"
            disabled={totalPages === 0 || currentPageNumber >= totalPages}
            onClick={() => goToPage(currentPageIndex + 1)}
            aria-label="Next page"
            className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
          <button
            type="button"
            disabled={totalPages === 0 || currentPageNumber >= totalPages}
            onClick={() => goToPage(totalPages - 1)}
            aria-label="Last page"
            className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full !border-0 !bg-transparent p-0 text-[var(--modern-text,#0f172a)] transition-colors hover:bg-[var(--modern-card,#ffffff)] hover:text-[var(--modern-primary,#4d8dff)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            <ChevronsRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Recipient Strip on Stage (when recipients exist) */}
      {recipients?.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3.5 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
            {t("Stepper.AddSigners", "Signers")}:
          </span>
          {recipients.map((rec, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] py-1 pl-1.5 pr-3 text-xs font-medium text-[var(--modern-text,#0f172a)]"
            >
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
                style={{ backgroundColor: rec.signColor || rec.signatureColor || "#4d8dff" }}
              >
                {getInitials(rec.name || `${idx + 1}`)}
              </span>
              <span className="max-w-[140px] truncate">
                {rec.name || `${t("uploadDocFlow.signatory", "Signatory")} ${idx + 1}`}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Horizontal Page Thumbnails Strip */}
      {totalPages > 0 && (
        <div className="mb-3 flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
          {imagesData.map((img, idx) => {
            const isCurrent = img.pagesPath === selectedImage;
            return (
              <button
                key={img.masterDocPagesID || idx}
                type="button"
                onClick={() => goToPage(idx)}
                aria-label={`Page ${idx + 1}`}
                className={`relative w-[78px] shrink-0 aspect-[8.5/11] overflow-hidden rounded-[10px] border-2 bg-white p-0 transition-all cursor-pointer ${
                  isCurrent
                    ? "border-[var(--modern-primary,#4d8dff)] outline outline-3 outline-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_22%,transparent)]"
                    : "border-[var(--modern-border,#e2e8f0)] hover:border-[var(--modern-border-strong,#cbd5e1)]"
                }`}
              >
                <img
                  src={img.pagesPath}
                  alt={`Page ${idx + 1}`}
                  className="h-full w-full object-cover pointer-events-none"
                />
                <span className="absolute bottom-1 right-1 rounded bg-[var(--modern-card,#ffffff)]/90 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[var(--modern-text,#0f172a)] border border-[var(--modern-border,#e2e8f0)]">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Ruled Canvas Desk */}
      <div
        className="flex min-h-[300px] sm:min-h-[460px] lg:min-h-[560px] w-full flex-col items-center justify-center rounded-[20px] sm:rounded-[24px] border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] p-2 sm:p-6 overflow-x-auto"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, var(--modern-border) 23px 24px)",
          backgroundSize: "100% 24px",
        }}
      >
        {isLoadingPages ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 sm:py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--modern-primary,#4d8dff)] border-t-transparent" />
            <p className="text-xs sm:text-sm font-medium text-[var(--modern-muted,#64748b)]">
              {t("uploadDocFlow.loadingPreview", "Loading document preview…")}
            </p>
          </div>
        ) : selectedImage ? (
          <div className="w-full max-w-[760px] overflow-hidden rounded-lg sm:rounded-xl border-2 border-[var(--modern-border-strong)] bg-white">
            <img
              src={selectedImage}
              alt={`Page ${currentPageNumber}`}
              className="block h-auto w-full max-w-full select-none"
            />
          </div>
        ) : (
          <div className="flex max-w-md flex-col items-center justify-center gap-3 py-10 sm:py-16 text-center px-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card,#ffffff)] text-[var(--modern-primary,#4d8dff)]">
              <Icons.DocumentReport size={26} />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--modern-text,#0f172a)]">
              {emptyStateTitle || t("templateUploadFlow.noDocUploadedYet", "No document selected yet")}
            </h3>
            <p className="text-[11px] sm:text-xs leading-relaxed text-[var(--modern-muted,#64748b)]">
              {emptyStateDescription ||
                t(
                  "templateUploadFlow.uploadToPreviewHint",
                  "Upload a PDF or Word document in the left panel to preview its pages live here across every step."
                )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudioDocumentStage;
