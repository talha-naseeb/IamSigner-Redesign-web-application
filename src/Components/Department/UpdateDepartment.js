import React, { useEffect } from "react";
import { Offcanvas, Button, Form } from "@/Components/UI/shadcnCompat";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";

const UpdateDepartment = ({ show, handleClose, selectedDepartment, fetchDepartments }) => {
  const { t } = useTranslation();
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
    }
  };

  return (
    <Offcanvas show={show} className='department-form-panel' onHide={handleClose} placement='end'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{t("departmentList.updateDepartment")}</Offcanvas.Title>
      </Offcanvas.Header>
      <hr className='department-form-divider' />
      <Offcanvas.Body>
        <Form onSubmit={handleSubmit(handleUpdateDepartment)}>
          <Form.Group controlId='departmentTitle'>
            <Form.Label>
              {t("departmentList.title")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control type='text' placeholder={t("createDepartment.enterTitle")} {...register("Title", { required: t("departmentList.titleRequired") })} />
            {errors.Title && <div className='text-danger'>{errors.Title.message}</div>}
          </Form.Group>

          <Form.Group controlId='departmentDescription' className='mt-3'>
            <Form.Label>
              {t("departmentList.description")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control
              as='textarea'
              rows={5}
              placeholder={t("createDepartment.enterDescription")}
              {...register("Description", {
                required: t("departmentList.descriptionRequired"),
                maxLength: {
                  value: 500,
                  message: t("createDepartment.descriptionTooLong") || "Description must be 500 characters or less",
                },
              })}
            />
            {errors.Description && <div className='text-danger'>{errors.Description.message}</div>}
            {description.length > 0 && <small className={`d-block mt-1 ${description.length >= 500 ? "text-danger" : "text-muted"}`}>{t("createDepartment.descriptionTooLong")}</small>}
          </Form.Group>

          <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
            <Button variant='secondary' className='modalCancelButton' onClick={handleClose}>
              {t("createTeam.cancel")}
            </Button>
            <Button variant='primary' className='applyBtn' type='submit'>
              {t("tablesLabel.update")}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default UpdateDepartment;
