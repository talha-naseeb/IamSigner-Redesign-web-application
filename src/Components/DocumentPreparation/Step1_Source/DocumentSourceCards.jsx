import React from "react";
import { Form } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import {
  DropboxPicker as Dropbox,
  GoogleDrivePicker as UploadFromGoogleDrive,
} from "@/Components/Common/CloudPickers";
import OneDriveIntegration from "@/Components/OneDrive/oneDriveIntegration";
import DmsUploadIntegration from "@/Components/DMS/DmsUploadIntegration";
import { uploadSourceCardClassName } from "@/Components/Common/CloudPickers/UploadSourceCard";

/**
 * DocumentSourceCards - Unified document upload & cloud source selection (ENG-01)
 *
 * Consolidates local file dropzone and cloud integrations (Google Drive, OneDrive, Dropbox, DMS)
 * across Upload Flow, BulkSend, SelfSignature, and Templates.
 */
const DocumentSourceCards = ({
  getRootProps,
  getInputProps,
  user,
  userAccess,
  isDmsEnabled = false,
  canStartDms = false,
  onOpenDmsPicker,
  isDmsUploading = false,
  dropboxProps = null,
  googleDriveProps = null,
  oneDriveProps = null,
  t,
  uploadErrorMessage = "",
  compactStudio = false,
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

  if (compactStudio) {
    return (
      <div>
        <div
          {...(getRootProps
            ? getRootProps({
                className:
                  "group relative flex flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] px-4 py-5 text-center transition-colors hover:border-[var(--modern-primary,#4d8dff)]",
              })
            : {
                className:
                  "group relative flex flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] px-4 py-5 text-center transition-colors hover:border-[var(--modern-primary,#4d8dff)]",
              })}
        >
          <div className='mb-2.5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[var(--modern-primary,#4d8dff)] text-white'>
            <Icons.UploadCloud size={26} color='#ffffff' />
          </div>
          <h3 className='m-0 text-base font-semibold text-[var(--modern-text,#0f172a)]'>
            {translate("uploadDocFlow.easilyUpload", "Drop your documents here")}
          </h3>
          <p className='mt-1 text-xs text-[var(--modern-muted,#64748b)]'>
            <span>{translate("uploadDocFlow.dragOrSelect", "Drag and drop, or select files")}</span>{" "}
            <span className='font-mono text-[11px] opacity-80'>· PDF, DOCX</span>
          </p>

          <div
            className='studio-source-grid mt-3.5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 [&_.group]:!min-h-[44px] [&_.group]:!rounded-xl [&_.group]:!px-2.5 [&_.group]:!py-1.5 [&_.group]:!gap-2 [&_label]:!text-xs [&_label]:!font-semibold [&_label]:!truncate [&_label]:!max-w-[130px] [&_svg]:!h-5 [&_svg]:!w-5 [&_img]:!h-5 [&_img]:!w-5 [&_svg]:!shrink-0 [&_img]:!shrink-0'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Local Document Source — spans full width at top of source grid */}
            <div className='sm:col-span-2 min-w-0'>
              <Form.Group controlId='file-input-add' className='space-y-0'>
                <div
                  {...(getRootProps
                    ? getRootProps({
                        className: uploadSourceCardClassName,
                        onClick: (e) => e.stopPropagation(),
                      })
                    : { className: uploadSourceCardClassName })}
                >
                  <Icons.Local />
                  <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-xs font-semibold'>
                    {translate("uploadDocFlow.local", "Local Documents")}
                  </Form.Label>
                  {getInputProps && (
                    <Form.Control
                      {...getInputProps()}
                      className='!sr-only'
                      type='file'
                      name='file'
                      accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
                      multiple
                    />
                  )}
                </div>
              </Form.Group>
            </div>

            {/* DMS Source */}
            {isDmsEnabled && canStartDms ? (
              <div className='min-w-0'>
                <DmsUploadIntegration
                  onOpenPicker={onOpenDmsPicker}
                  isDmsUploading={isDmsUploading}
                />
              </div>
            ) : null}

            {/* Dropbox Source */}
            {user?.isDropbox && userAccess?.dropbox && dropboxProps ? (
              <div className='min-w-0'>
                <Dropbox {...dropboxProps} />
              </div>
            ) : null}

            {/* Google Drive Source */}
            {user?.isGoogleDrive && userAccess?.googDrive && googleDriveProps ? (
              <div className='min-w-0'>
                <UploadFromGoogleDrive {...googleDriveProps} />
              </div>
            ) : null}

            {/* OneDrive Source */}
            {user?.isOneDrive && userAccess?.oneDrive && oneDriveProps ? (
              <div className='min-w-0'>
                <OneDriveIntegration {...oneDriveProps} />
              </div>
            ) : null}
          </div>
        </div>

        {uploadErrorMessage && (
          <p className='mt-2 flex items-start gap-2 text-xs font-medium text-[var(--modern-danger,#ef4444)]'>
            <Icons.AlertCircle size={16} className='mt-0.5 shrink-0' />
            <span>{uploadErrorMessage}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        {...(getRootProps
          ? getRootProps({
              className:
                "m-0 flex flex-col justify-center gap-[5px] rounded-lg border-[3px] border-dashed border-[var(--modern-border-strong)] bg-card p-10 transition-colors hover:border-primary",
            })
          : {
              className:
                "m-0 flex flex-col justify-center gap-[5px] rounded-lg border-[3px] border-dashed border-[var(--modern-border-strong)] bg-card p-10 transition-colors hover:border-primary",
            })}
      >
        <div className='my-4 flex flex-col items-center justify-center gap-4'>
          <Icons.UploadCloud size={38} color='var(--modern-primary)' />
          <label className='text-lg font-normal text-foreground'>
            {translate("uploadDocFlow.easilyUpload", "Easily upload and sign your documents")}
          </label>
        </div>

        <div className='grid grid-cols-1 gap-2 md:grid-cols-4'>
          {/* Local Document Source */}
          <div className='min-w-0'>
            <Form.Group controlId='file-input-add' className='space-y-0'>
              <div
                {...(getRootProps
                  ? getRootProps({
                      className: uploadSourceCardClassName,
                      onClick: (e) => e.stopPropagation(),
                    })
                  : { className: uploadSourceCardClassName })}
              >
                <Icons.Local />
                <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-sm font-medium'>
                  {translate("uploadDocFlow.local", "Local")}
                </Form.Label>
                {getInputProps && (
                  <Form.Control
                    {...getInputProps()}
                    className='!sr-only'
                    type='file'
                    name='file'
                    accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
                    multiple
                  />
                )}
              </div>
            </Form.Group>
          </div>

          {/* DMS Source (if enabled for user) */}
          {isDmsEnabled && canStartDms ? (
            <div className='min-w-0'>
              <DmsUploadIntegration
                onOpenPicker={onOpenDmsPicker}
                isDmsUploading={isDmsUploading}
              />
            </div>
          ) : null}

          {/* Dropbox Source */}
          {user?.isDropbox && userAccess?.dropbox && dropboxProps ? (
            <div className='min-w-0'>
              <Dropbox {...dropboxProps} />
            </div>
          ) : null}

          {/* Google Drive Source */}
          {user?.isGoogleDrive && userAccess?.googDrive && googleDriveProps ? (
            <div className='min-w-0'>
              <UploadFromGoogleDrive {...googleDriveProps} />
            </div>
          ) : null}

          {/* OneDrive Source */}
          {user?.isOneDrive && userAccess?.oneDrive && oneDriveProps ? (
            <div className='min-w-0'>
              <OneDriveIntegration {...oneDriveProps} />
            </div>
          ) : null}
        </div>
      </div>

      {uploadErrorMessage && (
        <p className='mt-2 flex items-start gap-2 text-sm italic text-[var(--modern-danger)]'>
          <Icons.AlertCircle className='mb-1 mx-2' />
          {uploadErrorMessage}
        </p>
      )}
    </div>
  );
};

export default DocumentSourceCards;
