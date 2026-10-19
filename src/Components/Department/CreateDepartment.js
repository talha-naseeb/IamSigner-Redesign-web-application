import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Offcanvas, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";

function CreateDepartment({ accountID, showOffcanvas, setShowOffcanvas, fetchDepartments }) {
  const { t } = useTranslation();

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
    }
  };

  const handleCancel = () => {
    setShowOffcanvas(false);
    reset();
  };

  return (
    <div>
      <Button className='templateButton' onClick={() => setShowOffcanvas(true)}>
        {t("createDepartment.createDepartment")}
      </Button>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("createDepartment.createDepartment")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr style={{ margin: " auto 0", borderColor: "black" }} />
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId='departmentTitle'>
              <Form.Label>
                {t("createDepartment.title")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Control type='text' placeholder={t("createDepartment.enterTitle")} {...register("Title", { required: t("departmentList.titleRequired") })} />
              {errors.Title && <div className='text-danger'>{errors.Title.message}</div>}
            </Form.Group>

            <Form.Group controlId='departmentDescription' className='mt-3'>
              <Form.Label>
                {t("createDepartment.description")}
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
              <Button variant='secondary' className='modalCancelButton' onClick={handleCancel}>
                {t("createTeam.cancel")}
              </Button>
              <Button variant='primary' className='applyBtn' type='submit'>
                {t("createDepartment.submit")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default CreateDepartment;
