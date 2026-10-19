import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Offcanvas, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TagsInput from "../components/TagsInput";

const FOLDER_COLOR_OPTIONS = [
  { value: "", labelKey: "DMS.defaultBrandColor", swatch: "var(--theme-color)" },
  { value: "#0979A9", labelKey: "DMS.colorSky", swatch: "#0979A9" },
  { value: "#0F766E", labelKey: "DMS.colorTeal", swatch: "#0F766E" },
  { value: "#2563EB", labelKey: "DMS.colorBlue", swatch: "#2563EB" },
  { value: "#7C3AED", labelKey: "DMS.colorPurple", swatch: "#7C3AED" },
  { value: "#EA580C", labelKey: "DMS.colorOrange", swatch: "#EA580C" },
  { value: "#DC2626", labelKey: "DMS.colorRed", swatch: "#DC2626" },
];

const RenameOffcanvas = ({ show, target, onHide, onRename }) => {
  const { t } = useTranslation();
  const isDocument = target?.itemType === "document";

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      color: "",
    },
  });

  useEffect(() => {
    if (target) {
      reset({
        title: target.name || "",
        description: target.description || "",
        tags: target.tags || "",
        color: target.color || "",
      });
    }
  }, [target, reset]);

  const onSubmit = (data) => {
    if (isDocument) {
      onRename({
        title: data.title.trim(),
        description: data.description.trim(),
        tags: data.tags.trim(),
      });
    } else {
      onRename({
        name: data.title.trim(),
        description: data.description.trim(),
        color: data.color,
      });
    }
    onHide();
  };
  const selectedColor = watch("color");

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      scroll={true}
      className="dms-form-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {isDocument ? t("DMS.editDocument") : t("DMS.editFolder")}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr style={{ margin: "0", borderColor: "var(--border-color)" }} />
      <Offcanvas.Body className="d-flex flex-column p-0">
        <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column h-100">
          <div className="flex-grow-1 p-3">
            <Form.Group className="mb-3">
              <Form.Label>
                {isDocument ? t("DMS.title") : t("DMS.folderName")}{" "}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                autoFocus
                isInvalid={Boolean(errors.title)}
                {...register("title", {
                  required: t("DMS.fieldRequired"),
                  validate: (value) => value.trim().length > 0 || t("DMS.fieldRequired"),
                })}
              />
              {errors.title ? (
                <Form.Control.Feedback type="invalid">{errors.title.message}</Form.Control.Feedback>
              ) : null}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("DMS.description")} <span className="text-muted">({t("DMS.optional")})</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t("DMS.descriptionPlaceholder")}
                maxLength={500}
                isInvalid={Boolean(errors.description)}
                {...register("description", {
                  maxLength: {
                    value: 500,
                    message: t("DMS.descriptionMaxLength"),
                  },
                })}
              />
              {errors.description ? (
                <Form.Control.Feedback type="invalid">{errors.description.message}</Form.Control.Feedback>
              ) : null}
            </Form.Group>

            {!isDocument ? (
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
                      aria-label={t(option.labelKey)}
                      title={t(option.labelKey)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
                <Form.Text muted>{t("DMS.folderColorHint")}</Form.Text>
              </Form.Group>
            ) : null}

            {isDocument ? (
              <Form.Group className="mb-3">
                <Form.Label>{t("DMS.tags")}</Form.Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("DMS.tagsPlaceholder")}
                    />
                  )}
                />
              </Form.Group>
            ) : null}
          </div>

          <div className="d-flex align-items-center justify-content-between w-100 border-top p-3 mt-auto">
            <Button type="button" variant="none" className="resetBtn" onClick={onHide}>
              {t("DMS.cancel")}
            </Button>
            <Button type="submit" variant="none" className="applyBtn">
              {t("DMS.save")}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default RenameOffcanvas;
