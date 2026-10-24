import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import { Container, Row, Col, Form, Button, Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import "./style.css";
import "@/Pages/Auth/AuthPages.css";
import ForgotCarousel from "@/Pages/Auth/Carousels/Forgot/ForgotCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import thankyou from "@/assets/images/thankyouIcon.svg";
import Loader from "@/Components/CommonModals/Loader/Loader";
import authService from "@/services/authService";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";
import { Helmet } from "react-helmet-async";
import { getRecaptchaToken } from "@/utils/recaptcha";

const ForgotPassword = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await getRecaptchaToken("FORGOT_PASSWORD");
    } catch {
      toast.error(t("logScreens.reCaptcha"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(data.email);

      if (response.data.statusCode === "1") {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/");
        }, 10000);
      } else if (response.data.statusCode === "7") {
        toast.info(response.data.message);
      } else {
        toast.error(t("logScreens.forgetPassErrorToast"));
      }
    } catch (error) {
      toast.error(t("logScreens.forgetPassErrorToast"));
      console.error("API Error:", error);
    } finally {
      reset();
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <Helmet>
        <meta name="description" content="Reset your IAMSigner password. Enter your email to receive a password reset link." />
        <link rel="canonical" href="https://app.iamsigner.com/forgot-password" />
        <meta property="og:title" content="Forgot Password - IAMSigner" />
        <meta property="og:url" content="https://app.iamsigner.com/forgot-password" />
      </Helmet>
      <Container fluid className='login-container'>
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <Row>
          <Col sm={12} md={6} className='login-col d-flex flex-column  '>
            <div className='login-form'>
              <div className='headingIMSigner'>
                <div className='d-flex gap-2 align-items-center'>
                  <Link to='/'>
                    <IoArrowBack size={22} className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} style={{ color: "var(--text-primary)", cursor: "pointer" }} />
                  </Link>
                  {theme === "dark" ? <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} /> : <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />}
                </div>
                <div className='d-flex align-items-center gap-2'>
                  <AuthThemeToggle />
                  <LangSelector style={{ padding: "0px" }} />
                </div>
              </div>

              <div className='mb-3'>
                <label style={{ fontSize: "20px", fontWeight: "700" }}>{t("logScreens.forgetPass")}</label>
              </div>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className='mb-3'>
                  <Form.Label className='mb-4'>{t("logScreens.forgetPassDecs")}</Form.Label>
                  <Form.Control
                    type='email'
                    {...register("email", {
                      required: t("logScreens.emailRequired"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                        message: t("logScreens.invalidEmail"),
                      },
                    })}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    disabled={isLoading}
                    placeholder={t("logScreens.enterEmailLog")}
                  />
                  {errors.email && <div className='invalid-feedback'>{errors.email.message}</div>}
                </Form.Group>

                <Button type='submit' disabled={isLoading} style={{ backgroundColor: isLoading ? "#889CAA" : "" }} className='forgot-button'>
                  {t("logScreens.submit")}
                </Button>
              </Form>
            </div>
          </Col>
          <Col md={6} className='slider-col d-none d-md-flex flex-column align-items-center'>
            <ForgotCarousel />
          </Col>
        </Row>
      </Container>

      <Modal show={showSuccessModal} onHide={handleCloseModal} centered dialogClassName='custom-modal-width auth-success-modal'>
        <Modal.Body className='p-3'>
          <div className='thankyou-message-modal'>
            <div className='message-box d-flex flex-column justify-content-center align-items-center'>
              <img src={thankyou} alt='iconLoading' />
              <h4 style={{ marginTop: "1rem", color: "#24B032" }}>{t("logScreens.sent")}</h4>
              <p className='m-0'>{t("logScreens.passwordResetLink")}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ForgotPassword;
