import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import { Building2, Loader2 } from "lucide-react";

const UpdateDepartment = ({ show, handleClose, selectedDepartment, fetchDepartments }) => {
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

  // Reset form when selectedDepartment changes
  useEffect(() => {
    if (selectedDepartment) {
      reset({
        Title: selectedDepartment.title,
        Description: selectedDepartment.description,
        IsActive: selectedDepartment.isActive,
      });
    }
  }, [selectedDepartment, reset]);

  // Handle department update
  const handleUpdateDepartment = async (data) => {
    const updatedData = {
      DepartmentID: selectedDepartment.departmentID,
      Title: data.Title,
      Description: data.Description,
      IsActive: true,
    };

    try {
      setIsLoading(true);
      const response = await userService.updateAccountDepartment(updatedData);

      if (response.data.statusCode === "1") {
        toast.success(t("departmentList.updateSuccess"));
        fetchDepartments();
        handleClose();
      } else {
        toast.error(t("departmentList.updateFailed"));
      }
    } catch (error) {
      toast.error(t("departmentList.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
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
              {t("departmentList.updateDepartment")}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {selectedDepartment?.title || "Update department details"}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
        <Form onSubmit={handleSubmit(handleUpdateDepartment)} className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
              {t("departmentList.title")} <span className='text-rose-500'>*</span>
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
                {t("departmentList.description")} <span className='text-rose-500'>*</span>
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
          onClick={handleClose}
          disabled={isLoading}
          className='px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
        >
          {t("createTeam.cancel")}
        </Button>
        <Button
          variant='none'
          type='button'
          onClick={handleSubmit(handleUpdateDepartment)}
          disabled={isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
        >
          {isLoading && <Loader2 size={16} className='animate-spin' />}
          <span>{t("tablesLabel.update")}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateDepartment;
