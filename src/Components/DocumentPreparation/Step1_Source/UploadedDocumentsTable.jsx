import React from "react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";

/**
 * UploadedDocumentsTable - Unified uploaded file list and action menu (ENG-01)
 *
 * Renders the uploaded document rows with file icon, template badges, and 3-dots action menu
 * (View, Delete, Apply Template, Remove Template).
 */
const UploadedDocumentsTable = ({
  uploadedFiles = [],
  isTemplateApplied = [],
  masterDocIDs = [],
  onViewFile,
  onDeleteFile,
  onApplyTemplate,
  onRemoveTemplate,
  renderTemplateBadge,
  t,
  compactStudio = false,
  selectedMasterDocID = null,
  onSelectFile,
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return null;
  }

  if (compactStudio) {
    return (
      <div className='mt-3 space-y-2' id='upload_file_bx' data-testid='uploaded-documents-list'>
        {uploadedFiles.map((fileName, index) => {
          const masterDocId = masterDocIDs[index];
          const hasTemplate = isTemplateApplied && isTemplateApplied[index];
          const isSelected = selectedMasterDocID && masterDocId && String(selectedMasterDocID) === String(masterDocId);

          return (
            <div
              key={masterDocId || index}
              onClick={() => {
                if (typeof onSelectFile === "function" && masterDocId) {
                  onSelectFile(masterDocId, fileName);
                }
              }}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
                onSelectFile ? "cursor-pointer" : ""
              } ${
                isSelected
                  ? "border-[var(--modern-primary,#4d8dff)] bg-[var(--modern-raised,#f8fafc)]"
                  : "border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] hover:border-[var(--modern-border-strong,#cbd5e1)]"
              }`}
            >
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_15%,transparent)] text-[var(--modern-primary,#4d8dff)]'>
                <Icons.PDFs size={20} />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <span className='truncate text-[13.5px] font-semibold text-[var(--modern-text,#0f172a)]'>
                    {fileName}
                  </span>
                  {hasTemplate &&
                    (renderTemplateBadge ? (
                      renderTemplateBadge(index)
                    ) : (
                      <Icons.Templates size={16} title='Template applied' />
                    ))}
                </div>
                <span className='block text-xs text-[var(--modern-muted,#64748b)]'>
                  {translate("uploadDocFlow.readyForPreview", "Ready for preview")}
                </span>
              </div>

              <div className='flex shrink-0 items-center gap-1.5' onClick={(e) => e.stopPropagation()}>
                {onApplyTemplate && !hasTemplate && (
                  <button
                    type='button'
                    onClick={() => onApplyTemplate(masterDocId, index)}
                    title={translate("uploadDocFlow.Applytemplate", "Apply Template")}
                    aria-label={translate("uploadDocFlow.Applytemplate", "Apply Template")}
                    className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_10%,transparent)] cursor-pointer'
                  >
                    <Icons.ApplyTemplate size={16} />
                  </button>
                )}
                {onRemoveTemplate && hasTemplate && (
                  <button
                    type='button'
                    onClick={() => onRemoveTemplate(masterDocId, index)}
                    title={translate("uploadDocFlow.removeTemplate", "Remove Template")}
                    aria-label={translate("uploadDocFlow.removeTemplate", "Remove Template")}
                    className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-warning,#f59e0b)] transition-colors hover:border-[var(--modern-warning,#f59e0b)] hover:bg-[color-mix(in_srgb,var(--modern-warning,#f59e0b)_10%,transparent)] cursor-pointer'
                  >
                    <Icons.RemoveTemplate size={16} />
                  </button>
                )}
                {onDeleteFile && (
                  <button
                    type='button'
                    onClick={() => onDeleteFile(masterDocId, index)}
                    title={translate("uploadDocFlow.delete", "Delete")}
                    aria-label={translate("uploadDocFlow.delete", "Delete")}
                    className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-muted,#64748b)] transition-colors hover:border-[var(--modern-danger,#ef4444)] hover:text-[var(--modern-danger,#ef4444)] cursor-pointer'
                  >
                    <Icons.DeleteAction size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className='mt-3 space-y-2' id='upload_file_bx' data-testid='uploaded-documents-list'>
      {uploadedFiles.map((fileName, index) => {
        const masterDocId = masterDocIDs[index];
        const hasTemplate = isTemplateApplied && isTemplateApplied[index];

        return (
          <div
            key={masterDocId || index}
            className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-3 text-foreground'
          >
            <p className='m-0 flex min-w-0 items-center gap-2 break-all text-sm'>
              <Icons.PDFs size={22} />
              <span>{fileName}</span>
              {hasTemplate && (
                renderTemplateBadge ? (
                  renderTemplateBadge(index)
                ) : (
                  <Icons.Templates size={18} title='Template applied' />
                )
              )}
            </p>

            <div className='flex shrink-0 items-center'>
              <Dropdown>
                <Dropdown.Toggle as={CustomToggle} />
                <Dropdown.Menu>
                  {/* Apply Template option (if handler provided and no template applied yet) */}
                  {onApplyTemplate && !hasTemplate && (
                    <Dropdown.Item
                      className='flex items-center gap-2'
                      onClick={() => onApplyTemplate(masterDocId, index)}
                    >
                      <Icons.ApplyTemplate size={18} />
                      {translate("uploadDocFlow.Applytemplate", "Apply Template")}
                    </Dropdown.Item>
                  )}

                  {/* Remove Template option (if handler provided and template is currently applied) */}
                  {onRemoveTemplate && hasTemplate && (
                    <Dropdown.Item
                      className='flex items-center gap-2'
                      onClick={() => onRemoveTemplate(masterDocId, index)}
                    >
                      <Icons.RemoveTemplate size={18} />
                      {translate("uploadDocFlow.removeTemplate", "Remove Template")}
                    </Dropdown.Item>
                  )}

                  {/* Delete File Option */}
                  {onDeleteFile && (
                    <Dropdown.Item
                      className='flex items-center gap-2'
                      onClick={() => onDeleteFile(masterDocId, index)}
                    >
                      <Icons.DeleteAction size={18} />
                      {translate("uploadDocFlow.delete", "Delete")}
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadedDocumentsTable;
