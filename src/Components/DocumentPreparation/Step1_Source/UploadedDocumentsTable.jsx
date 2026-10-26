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
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return null;
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

                  {/* View File Option */}
                  {onViewFile && (
                    <Dropdown.Item
                      className='flex items-center gap-2'
                      onClick={() => onViewFile(masterDocId, fileName)}
                    >
                      <Icons.View size={18} />
                      {translate("uploadDocFlow.view", "View")}
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
