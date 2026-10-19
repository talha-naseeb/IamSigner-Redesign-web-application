import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Offcanvas, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";

const FOLDER_COLOR_OPTIONS = [
  { value: "", labelKey: "DMS.defaultBrandColor", swatch: "var(--theme-color)" },
  { value: "#0979A9", labelKey: "DMS.colorSky", swatch: "#0979A9" },
  { value: "#0F766E", labelKey: "DMS.colorTeal", swatch: "#0F766E" },
  { value: "#2563EB", labelKey: "DMS.colorBlue", swatch: "#2563EB" },
  { value: "#7C3AED", labelKey: "DMS.colorPurple", swatch: "#7C3AED" },
  { value: "#EA580C", labelKey: "DMS.colorOrange", swatch: "#EA580C" },
  { value: "#DC2626", labelKey: "DMS.colorRed", swatch: "#DC2626" },
];

const NewFolderOffcanvas = ({
  show,
  onHide,
  onCreate,
  parentFolders = [],
  defaultParentId = "",
  creating = false,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      folderName: "",
      description: "",
      parentId: defaultParentId,
      color: "",
    },
  });
  useEffect(() => {
    if (show) {
      reset({
        folderName: "",
        description: "",
        parentId: defaultParentId,
        color: "",
      });
    }
  }, [defaultParentId, show, reset]);

  const onSubmit = async (data) => {
    if (creating) return;
    await onCreate({
      folderName: data.folderName.trim(),
      description: data.description.trim(),
      parentId: data.parentId,
      color: data.color,
    });
    onHide();
  };

  const handleClose = () => {
    if (creating) return;
    reset({
      folderName: "",
      description: "",
      parentId: defaultParentId,
      color: "",
    });
    onHide();
  };
  const selectedColor = watch("color");

  return (
    
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      scroll={true}
      className="dms-form-offcanvas"
      backdrop={creating ? "static" : true}
      keyboard={!creating}
    >
      {creating ? (
        <div className="loader-overlay">
          <Loader />
        </div>
      ) : null}
      <Offcanvas.Header closeButton={!creating}>
        <Offcanvas.Title>{t("DMS.createNewFolder")}</Offcanvas.Title>
      </Offcanvas.Header>
      <hr style={{ margin: "0", borderColor: "var(--border-color)" }} />
      <Offcanvas.Body className="d-flex flex-column p-0">
        <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column h-100">
          <div className="flex-grow-1 p-3">
            <Form.Group className="mb-3">
              <Form.Label>
                {t("DMS.folderName")} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t("DMS.folderNamePlaceholder")}
                autoFocus
                isInvalid={Boolean(errors.folderName)}
                disabled={creating}
                {...register("folderName", {
                  required: t("DMS.fieldRequired"),
                  validate: (value) => value.trim().length > 0 || t("DMS.fieldRequired"),
                })}
              />
              {errors.folderName ? (
                <Form.Control.Feedback type="invalid">{errors.folderName.message}</Form.Control.Feedback>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t("DMS.description")} <span className="text-muted">({t("DMS.optional")})</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t("DMS.folderDescriptionPlaceholder")}
                disabled={creating}
                {...register("description")}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("DMS.folderColor")}</Form.Label>
              <input type="hidden" {...register("color")} />
              <div className="dms-folder-color-picker">
                {FOLDER_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value || "default"}
                    type="button"
                    className={`dms-folder-color-swatch${selectedColor === option.value ? " active" : ""}`}
                    style={{ "--dms-folder-swatch-color": option.swatch }}
                    onClick={() => setValue("color", option.value, { shouldDirty: true })}
                    disabled={creating}
                    aria-label={t(option.labelKey)}
                    title={t(option.labelKey)}
                  >
                    <span />
                  </button>
                ))}
              </div>
              <Form.Text muted>{t("DMS.folderColorHint")}</Form.Text>
            </Form.Group>
            {!defaultParentId ? (
              <Form.Group className="mb-3">
                <Form.Label>{t("DMS.createInside")}</Form.Label>
                <Form.Select disabled={creating} {...register("parentId")}>
                  <option value="">{t("DMS.myFoldersRoot")}</option>
                  {parentFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            ) : null}
          </div>

          <div className="d-flex align-items-center justify-content-between w-100 border-top p-3 mt-auto">
            <Button type="button" variant="none" className="resetBtn" onClick={handleClose} disabled={creating}>
              {t("DMS.cancel")}
            </Button>
            <Button type="submit" variant="none" className="applyBtn" disabled={creating}>
              {t("DMS.createFolder")}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default NewFolderOffcanvas;
