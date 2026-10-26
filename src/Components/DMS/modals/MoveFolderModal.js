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
      size="md"
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      dialogClassName="dms-dialog-compact dms-move-modal"
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
          <div className="dms-target-preview-card">
            <div className="dms-target-preview-icon">
              {isDocument ? (
                <Icons.DocumentReport size={22} className="text-[var(--modern-violet)]" />
              ) : (
                <Icons.FoldersFill size={22} className="text-[var(--modern-violet)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="dms-target-preview-type">{itemLabel}</div>
              <strong
                className="dms-target-preview-name"
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
              className="dms-select-field"
              isInvalid={Boolean(errors.newParentFolderId)}
              disabled={saving}
              {...register("newParentFolderId", {
                validate: (value) =>
                  String(value || "") !== currentParentId ||
                  t("DMS.moveSameLocation"),
              })}
            >
              {destinationFolders.map((folder) => {
                const indent = folder.depth > 0 ? `${"\u00A0\u00A0".repeat(folder.depth)}└─ ` : "";
                return (
                  <option key={folder.id} value={folder.id}>
                    {indent}{folder.name}
                  </option>
                );
              })}
            </Form.Select>
            {errors.newParentFolderId ? (
              <Form.Control.Feedback type="invalid">
                {errors.newParentFolderId.message}
              </Form.Control.Feedback>
            ) : null}
            <Form.Text muted>{t("DMS.moveSameLocation")}</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between gap-2">
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
            {saving ? <Icons.Loading className="animate-spin" size={16} /> : null}
            {t(titleKey)}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MoveFolderModal;
