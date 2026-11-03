import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import { Plus, Building2, Loader2 } from "lucide-react";

function CreateDepartment({ accountID, showOffcanvas, setShowOffcanvas, fetchDepartments }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const description = watch("Description") || "";

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await userService.createAccountDepartment({
        AccountID: accountID,
        Title: data.Title,
        Description: data.Description,
      });

      if (response.data.statusCode === "1") {
        toast.success(t("createDepartment.success"));
        setShowOffcanvas(false);
        fetchDepartments();
        reset();
      } else {
        toast.error(t("createDepartment.failedToCreate"));
      }
    } catch (error) {
      toast.error(t("createDepartment.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowOffcanvas(false);
    reset();
  };

  return (
    <div>
      <Button className='templateButton inline-flex items-center gap-2' onClick={() => setShowOffcanvas(true)}>
        <Plus size={16} />
        <span>{t("createDepartment.createDepartment")}</span>
      </Button>

      <Modal
        show={showOffcanvas}
        onHide={handleCancel}
        centered
        dialogClassName='max-w-lg'
        backdrop='static'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
              <Building2 size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {t("createDepartment.createDepartment")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("createDepartment.enterTitle") || "Create a new department for your team"}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <Form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                {t("createDepartment.title")} <span className='text-rose-500'>*</span>
              </label>
              <Form.Control
                type='text'
                placeholder={t("createDepartment.enterTitle")}
                {...register("Title", { required: t("departmentList.titleRequired") })}
                className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
              />
              {errors.Title && <div className='text-xs text-rose-500 mt-1'>{errors.Title.message}</div>}
            </div>

            <div>
              <div className='flex items-center justify-between mb-1.5'>
                <label className='block text-xs font-semibold text-[var(--modern-text)] m-0'>
                  {t("createDepartment.description")} <span className='text-rose-500'>*</span>
                </label>
                <span className={`text-[11px] ${description.length > 500 ? "text-rose-500 font-semibold" : "text-[var(--modern-muted)]"}`}>
                  {description.length} / 500
                </span>
              </div>
              <Form.Control
                as='textarea'
                rows={4}
                placeholder={t("createDepartment.enterDescription")}
                {...register("Description", {
                  required: t("departmentList.descriptionRequired"),
                  maxLength: {
                    value: 500,
                    message: t("createDepartment.descriptionTooLong") || "Description must be 500 characters or less",
                  },
                })}
                className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors resize-none'
              />
              {errors.Description && <div className='text-xs text-rose-500 mt-1'>{errors.Description.message}</div>}
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-4 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <Button
            variant='none'
            type='button'
            onClick={handleCancel}
            disabled={isLoading}
            className='px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
          >
            {t("createTeam.cancel")}
          </Button>
          <Button
            variant='none'
            type='button'
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
          >
            {isLoading && <Loader2 size={16} className='animate-spin' />}
            <span>{t("createDepartment.submit")}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CreateDepartment;
