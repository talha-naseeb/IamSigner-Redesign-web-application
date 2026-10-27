import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { startOfToday } from "date-fns";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { CloudUploadIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import DateRangePicker, { formatPickerDate } from "@/Components/Common/DateRangePicker/DateRangePicker";
import TagsInput from "../components/TagsInput";
import {
  DMS_MAX_UPLOAD_BYTES,
  formatFileSize,
  validateDmsFiles,
  getDmsFileTypeIcon,
} from "../constants/dmsConfig";

const UploadModal = ({ show, onHide, defaultFolderId = "", onUpload }) => {
  const { t } = useTranslation();
  const minDate = useMemo(() => startOfToday(), []);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [showNotificationFields, setShowNotificationFields] = useState(false);

  const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      documentTitle: "",
      description: "",
      tags: "",
      notificationDate: null,
      notificationBeforeDays: "",
    },
  });

  useEffect(() => {
    if (show) {
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      setFileError("");
      setShowNotificationFields(false);
      reset({
        documentTitle: "",
        description: "",
        tags: "",
        notificationDate: null,
        notificationBeforeDays: "",
      });
    }
  }, [show, reset]);

  const handleNotificationToggle = (event) => {
    const isChecked = event.target.checked;
    setShowNotificationFields(isChecked);

    if (!isChecked) {
      setValue("notificationDate", null);
      setValue("notificationBeforeDays", "");
    }
  };

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const { isValid, oversizedFiles } = validateDmsFiles(incoming, DMS_MAX_UPLOAD_BYTES);
    if (!isValid && oversizedFiles.length > 0) {
      setFileError(t("DMS.fileTooLarge"));
      return;
    }

    setFileError("");
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const newFiles = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      return [...prev, ...newFiles];
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    if (isUploading) return;
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data) => {
    if (isUploading || !selectedFiles.length || !defaultFolderId || !onUpload) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await Promise.resolve(
        onUpload({
          files: selectedFiles,
          folderId: defaultFolderId,
          tags: (data.tags || "").trim(),
          title: (data.documentTitle || "").trim(),
          description: (data.description || "").trim(),
          notificationDate: showNotificationFields ? formatPickerDate(data.notificationDate) : null,
          notificationBeforeDays: showNotificationFields ? data.notificationBeforeDays : "",
          onProgress: setUploadProgress,
        }),
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const totalBytesSelected = useMemo(
    () => selectedFiles.reduce((acc, f) => acc + (f?.size || 0), 0),
    [selectedFiles]
  );

  return (
    <Modal
      show={show}
      onHide={isUploading ? undefined : onHide}
      centered
      backdrop="static"
      keyboard={!isUploading}
      dialogClassName="custom-modal-width dms-upload-modal"
    >
      <Modal.Header closeButton={!isUploading} className="pb-2">
        <Modal.Title>{t("DMS.uploadDocuments")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body className="px-4 py-3">
          <div
            className={`dms-dropzone${dragOver ? " active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isUploading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (!isUploading) handleFiles(e.dataTransfer.files);
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 44, color: dragOver ? "var(--modern-primary)" : "var(--modern-border-strong)" }} />
            <p className="dms-dropzone-text">
              {t("DMS.dropFilesHere")}{" "}
              <label className={`dms-dropzone-browse${isUploading ? " pe-none opacity-50" : ""}`}>
                {t("DMS.browse")}
                <input
                  type="file"
                  multiple
                  hidden
                  disabled={isUploading}
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </p>
            <span className="dms-dropzone-hint">{t("DMS.uploadHint")}</span>
            {fileError ? <p className="text-danger small mt-2 mb-0">{fileError}</p> : null}

            {selectedFiles.length > 0 && (
              <div className="dms-selected-files-list">
                {selectedFiles.map((file, i) => {
                  const ext = (file.name.split(".").pop() || "").toUpperCase();
                  const FileIcon = getDmsFileTypeIcon(ext);
                  return (
                    <div key={`${file.name}-${i}`} className="dms-selected-file-chip">
                      <div className="dms-selected-file-info">
                        <FileIcon size={18} color="var(--modern-primary)" />
                        <span className="dms-selected-file-name-text" title={file.name}>
                          {file.name}
                        </span>
                        <span className="dms-selected-file-size">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        className="dms-selected-file-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(i);
                        }}
                        disabled={isUploading}
                        title={t("DMS.removeFile") || "Remove file"}
                        aria-label={`${t("DMS.removeFile") || "Remove"} ${file.name}`}
                      >
                        <Icons.CloseSmall size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isUploading && (
            <div className="dms-upload-progress-container mt-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small font-medium text-muted">
                  {t("DMS.uploading") || "Uploading..."} ({selectedFiles.length} {t("DMS.document") || "files"} — {formatFileSize(totalBytesSelected)})
                </span>
                <span className="small font-semibold text-primary">{uploadProgress}%</span>
              </div>
              <div className="dms-progress-track">
                <div
                  className="dms-progress-bar"
                  style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                />
              </div>
            </div>
          )}

          <Form.Group className="mt-3">
            <Form.Label>
              {t("DMS.title")} <span className="text-muted">({t("DMS.optional")})</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t("DMS.documentTitlePlaceholder")}
              disabled={isUploading}
              {...register("documentTitle")}
            />
            {selectedFiles.length > 1 ? (
              <Form.Text className="text-muted">{t("DMS.documentTitleMultiHint")}</Form.Text>
            ) : null}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>
              {t("DMS.tags")} <span className="text-muted">({t("DMS.optional")})</span>
            </Form.Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("DMS.tagsPlaceholder")}
                  disabled={isUploading}
                />
              )}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>
              {t("DMS.description")} <span className="text-muted">({t("DMS.optional")})</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={t("DMS.descriptionPlaceholder")}
              disabled={isUploading}
              {...register("description")}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Check
              type="checkbox"
              id="dms-upload-notification-toggle"
              label={t("DMS.enableNotificationReminder")}
              checked={showNotificationFields}
              onChange={handleNotificationToggle}
              disabled={isUploading}
            />
          </Form.Group>

          {showNotificationFields ? (
            <>
              <Form.Group className="mt-3">
                <Form.Label>
                  {t("DMS.notificationDate")} <span className="text-muted">({t("DMS.optional")})</span>
                </Form.Label>
                <Controller
                  name="notificationDate"
                  control={control}
                  render={({ field }) => (
                    <DateRangePicker
                      value={field.value}
                      onChange={field.onChange}
                      minDate={minDate}
                      range={false}
                      placeholder={t("mm-dd-yyyy")}
                      disabled={isUploading}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>
                  {t("DMS.notificationBeforeDays")} <span className="text-muted">({t("DMS.optional")})</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("DMS.notificationBeforeDaysPlaceholder")}
                  disabled={isUploading}
                  {...register("notificationBeforeDays")}
                />
              </Form.Group>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]">
          <Button
            type="button"
            variant="none"
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors"
            onClick={onHide}
            disabled={isUploading}
          >
            {t("DMS.cancel")}
          </Button>
          <Button
            type="submit"
            variant="none"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            disabled={!selectedFiles.length || isUploading}
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>
                  {t("DMS.uploading") || "Uploading..."} {uploadProgress > 0 ? `(${uploadProgress}%)` : ""}
                </span>
              </span>
            ) : (
              t("DMS.upload")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UploadModal;
