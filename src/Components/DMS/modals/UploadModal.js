import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { startOfToday } from "date-fns";
import { Modal, Button, Form } from "react-bootstrap";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslation } from "react-i18next";
import DateRangePicker, { formatPickerDate } from "@/Components/Common/DateRangePicker/DateRangePicker";
import TagsInput from "../components/TagsInput";
import { DMS_MAX_UPLOAD_BYTES } from "../constants/dmsConfig";
import Loader from "@/Components/CommonModals/Loader/Loader";

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
    const files = Array.from(fileList || []);
    const tooLarge = files.find((f) => f.size > DMS_MAX_UPLOAD_BYTES);
    if (tooLarge) {
      setFileError(t("DMS.fileTooLarge"));
      setSelectedFiles([]);
      return;
    }
    setFileError("");
    setSelectedFiles(files);
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
          tags: data.tags.trim(),
          title: data.documentTitle.trim(),
          description: data.description.trim(),
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

  return (
    <>
      {isUploading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} onHide={onHide} centered backdrop='static' keyboard={false} dialogClassName='custom-modal-width dms-upload-modal'>
        <Modal.Header closeButton className='pb-2'>
          <Modal.Title>{t("DMS.uploadDocuments")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className='px-4 py-3'>
            <div
              className={`dms-dropzone${dragOver ? " active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 44, color: dragOver ? "var(--theme-color)" : "var(--border-color)" }} />
              <p className='dms-dropzone-text'>
                {t("DMS.dropFilesHere")}{" "}
                <label className='dms-dropzone-browse'>
                  {t("DMS.browse")}
                  <input
                    type='file'
                    multiple
                    hidden
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </p>
              <span className='dms-dropzone-hint'>{t("DMS.uploadHint")}</span>
              {fileError ? <p className='text-danger small mt-2 mb-0'>{fileError}</p> : null}

              {selectedFiles.length > 0 && (
                <div className='dms-selected-files mt-2'>
                  {selectedFiles.map((file, i) => (
                    <div key={i} className='dms-selected-file-name'>
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Form.Group className='mt-3'>
              <Form.Label>
                {t("DMS.title")} <span className='text-muted'>({t("DMS.optional")})</span>
              </Form.Label>
              <Form.Control type='text' placeholder={t("DMS.documentTitlePlaceholder")} {...register("documentTitle")} />
              {selectedFiles.length > 1 ? <Form.Text className='text-muted'>{t("DMS.documentTitleMultiHint")}</Form.Text> : null}
            </Form.Group>

            <Form.Group className='mt-3'>
              <Form.Label>
                {t("DMS.tags")} <span className='text-muted'>({t("DMS.optional")})</span>
              </Form.Label>
              <Controller name='tags' control={control} render={({ field }) => <TagsInput value={field.value} onChange={field.onChange} placeholder={t("DMS.tagsPlaceholder")} />} />
            </Form.Group>

            <Form.Group className='mt-3'>
              <Form.Label>
                {t("DMS.description")} <span className='text-muted'>({t("DMS.optional")})</span>
              </Form.Label>
              <Form.Control as='textarea' rows={3} placeholder={t("DMS.descriptionPlaceholder")} {...register("description")} />
            </Form.Group>

            <Form.Group className='mt-3'>
              <Form.Check type='checkbox' id='dms-upload-notification-toggle' label={t("DMS.enableNotificationReminder")} checked={showNotificationFields} onChange={handleNotificationToggle} />
            </Form.Group>

            {showNotificationFields ? (
              <>
                <Form.Group className='mt-3'>
                  <Form.Label>
                    {t("DMS.notificationDate")} <span className='text-muted'>({t("DMS.optional")})</span>
                  </Form.Label>
                  <Controller
                    name='notificationDate'
                    control={control}
                    render={({ field }) => <DateRangePicker value={field.value} onChange={field.onChange} minDate={minDate} range={false} placeholder={t("mm-dd-yyyy")} />}
                  />
                </Form.Group>

                <Form.Group className='mt-3'>
                  <Form.Label>
                    {t("DMS.notificationBeforeDays")} <span className='text-muted'>({t("DMS.optional")})</span>
                  </Form.Label>
                  <Form.Control type='number' min='0' step='1' placeholder={t("DMS.notificationBeforeDaysPlaceholder")} {...register("notificationBeforeDays")} />
                </Form.Group>
              </>
            ) : null}
          </Modal.Body>
          <Modal.Footer className='d-flex justify-content-between'>
            <Button type='button' variant='none' className='modalCancelButton' onClick={onHide}>
              {t("DMS.cancel")}
            </Button>
            <Button type='submit' variant='none' className='applyBtn' disabled={!selectedFiles.length || isUploading}>
              {t("DMS.upload")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UploadModal;
