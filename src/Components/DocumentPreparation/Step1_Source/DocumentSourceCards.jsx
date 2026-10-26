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
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

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
