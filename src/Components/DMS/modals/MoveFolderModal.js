import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Form, Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";

const MoveFolderModal = ({
  show,
  target,
  destinationFolders = [],
  onHide,
  onMove,
}) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const isDocument = target?.itemType === "document";
  const currentParentId = String(
    isDocument
      ? target?.folderId || target?.parentFolderID || ""
      : target?.parentFolderID || ""
  );
  const titleKey = isDocument ? "DMS.moveDocument" : "DMS.moveFolder";
  const hintKey = isDocument ? "DMS.moveDocumentHint" : "DMS.moveFolderHint";
  const itemLabel = isDocument ? t("DMS.document") : t("DMS.folder");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newParentFolderId: currentParentId,
    },
  });

  useEffect(() => {
    if (show) {
      reset({ newParentFolderId: currentParentId });
      setSaving(false);
    }
  }, [currentParentId, reset, show]);

  const handleClose = () => {
    if (saving) return;
    onHide();
  };

  const onSubmit = async (data) => {
    if (!target) return;
    setSaving(true);
    try {
      await onMove({
        folderId: target.folderID ?? target.id,
        documentId: target.id,
        newParentFolderId: data.newParentFolderId || "",
      });
      onHide();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      dialogClassName="custom-modal-width"
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton={!saving} className="pb-2">
          <div className="header-content">
            <div className="header-icon">
              <Icons.TransferOwner size={22} />
            </div>
            <div className="header-text">
              <Modal.Title>{t(titleKey)}</Modal.Title>
              {target?.name ? (
                <p className="header-subtitle">
                  {t(hintKey, { name: target.name })}
                </p>
              ) : null}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          <div className="border rounded-3 p-3 mb-3 d-flex align-items-center gap-2">
            {isDocument ? (
              <Icons.DocumentReport size={24} color="var(--theme-color)" />
            ) : (
              <Icons.FoldersFill size={24} color="var(--theme-color)" />
            )}
            <div className="min-w-0">
              <div className="text-muted small">{itemLabel}</div>
              <strong
                className="d-block text-truncate text-wrap"
                title={target?.name}
              >
                {target?.name ||
                  (isDocument
                    ? t("DMS.untitledDocument")
                    : t("DMS.untitledFolder"))}
              </strong>
            </div>
          </div>

          <Form.Group>
            <Form.Label>
              {t("DMS.moveTo")} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              isInvalid={Boolean(errors.newParentFolderId)}
              disabled={saving}
              {...register("newParentFolderId", {
                validate: (value) =>
                  String(value || "") !== currentParentId ||
                  t("DMS.moveSameLocation"),
              })}
            >
              {destinationFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {"".repeat(folder.depth || 0)}
                  {folder.name}
                </option>
              ))}
            </Form.Select>
            {errors.newParentFolderId ? (
              <Form.Control.Feedback type="invalid">
                {errors.newParentFolderId.message}
              </Form.Control.Feedback>
            ) : null}
            <Form.Text muted>{t("DMS.moveSameLocation")}</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button
            type="button"
            variant="none"
            className="modalCancelButton"
            onClick={handleClose}
            disabled={saving}
          >
            {t("DMS.cancel")}
          </Button>
          <Button
            type="submit"
            variant="none"
            className="applyBtn"
            disabled={saving}
          >
            {t(titleKey)}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MoveFolderModal;
