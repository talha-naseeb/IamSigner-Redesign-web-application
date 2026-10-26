import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import { Container, Row, Col, Form, Button, Modal, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import ForgotCarousel from "@/Pages/Auth/Carousels/Forgot/ForgotCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import thankyou from "@/assets/images/thankyouIcon.svg";
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

  const baseInputClass =
    "min-h-[48px] w-full rounded-[var(--radius-md,12px)] border border-solid px-3.5 py-[11px] text-[14px] bg-[var(--modern-raised)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] shadow-none focus:border-[var(--modern-violet)] focus:shadow-[0_0_0_3px_var(--modern-focus)] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <>
      <Helmet>
        <meta name='description' content='Reset your IAMSigner password. Enter your email to receive a password reset link.' />
        <link rel='canonical' href='https://app.iamsigner.com/forgot-password' />
        <meta property='og:title' content='Forgot Password - IAMSigner' />
        <meta property='og:url' content='https://app.iamsigner.com/forgot-password' />
      </Helmet>
      <Container
        fluid
        className='login-container min-h-screen w-full overflow-x-hidden overflow-y-auto p-0 bg-[var(--modern-bg)] text-[var(--modern-text)] font-[var(--modern-font-ui)]'
      >
        <Row className='min-h-screen m-0'>
          <Col
            sm={12}
            md={6}
            className='relative flex min-h-screen flex-col items-center justify-center py-8 px-4 sm:px-8 lg:px-16 bg-[radial-gradient(ellipse_at_15%_8%,var(--modern-glow-violet),transparent_42%),var(--modern-bg)]'
          >
            <div className='w-full max-w-[520px] mx-auto rounded-2xl sm:rounded-3xl border border-solid border-[var(--modern-border)] bg-[var(--modern-card)] p-6 sm:p-9 text-[var(--modern-text)] shadow-[var(--modern-card-shadow)]'>
              <div className='flex items-center justify-between gap-4 mb-8'>
                <div className='flex gap-2 items-center'>
                  <Link to='/' className='inline-flex items-center text-[var(--modern-text)]'>
                    <IoArrowBack
                      size={22}
                      className={document.documentElement.dir === "rtl" ? "rotate-180 cursor-pointer" : "cursor-pointer"}
                    />
                  </Link>
                  {theme === "dark" ? (
                    <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} />
                  ) : (
                    <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <AuthThemeToggle />
                  <LangSelector style={{ padding: "0px" }} />
                </div>
              </div>

              <div className='mb-3'>
                <h1 className='m-0 text-[22px] font-bold text-[var(--modern-text)]'>{t("logScreens.forgetPass")}</h1>
              </div>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className='mb-4'>
                  <Form.Label className='block mb-4 text-[14px] font-semibold text-[var(--modern-text)]'>
                    {t("logScreens.forgetPassDecs")}
                  </Form.Label>
                  <Form.Control
                    type='email'
                    {...register("email", {
                      required: t("logScreens.emailRequired"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                        message: t("logScreens.invalidEmail"),
                      },
                    })}
                    className={`${baseInputClass} ${
                      errors.email
                        ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                        : "border-[var(--modern-border-strong)]"
                    }`}
                    disabled={isLoading}
                    placeholder={t("logScreens.enterEmailLog")}
                  />
                  {errors.email && <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.email.message}</div>}
                </Form.Group>

                <Button
                  type='submit'
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className='mt-4 inline-flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-md,12px)] border border-solid border-transparent px-4 py-[11px] text-[15px] font-semibold text-white transition-all hover:opacity-95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2'
                  style={{
                    background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                  }}
                >
                  {isLoading && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("logScreens.submit")}
                </Button>
              </Form>
            </div>
          </Col>
          <Col
            md={6}
            className='relative hidden md:flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 lg:p-12 bg-[radial-gradient(ellipse_at_77%_20%,var(--modern-glow-violet),transparent_42%),radial-gradient(ellipse_at_15%_86%,var(--modern-glow-blue),transparent_38%),var(--modern-surface)]'
          >
            <span
              aria-hidden='true'
              className='pointer-events-none absolute -top-[190px] -end-[130px] h-[320px] w-[320px] rounded-full border border-solid border-[var(--modern-border)]'
            />
            <span
              aria-hidden='true'
              className='pointer-events-none absolute -bottom-[210px] -start-[160px] h-[400px] w-[400px] rounded-full border border-solid border-[var(--modern-border)]'
            />
            <div className='relative z-[1] w-full max-w-[680px] mx-auto'>
              <ForgotCarousel />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showSuccessModal}
        onHide={handleCloseModal}
        centered
        className='!max-w-[400px] rounded-2xl border border-solid border-[var(--modern-border-strong)] bg-[var(--modern-card)] text-[var(--modern-text)] shadow-[var(--modern-float-shadow)] overflow-hidden'
      >
        <Modal.Body className='p-0'>
          <div className='flex w-full flex-col items-center justify-center px-6 py-8 text-center'>
            <span
              className='mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-full border border-solid'
              style={{
                background: "var(--color-success-bg, rgba(16, 185, 129, 0.12))",
                borderColor: "color-mix(in srgb, var(--color-success, #10b981) 28%, transparent)",
              }}
            >
              <img src={thankyou} alt='iconLoading' className='h-9 w-9 object-contain' />
            </span>
            <h4 className='m-0 mb-2 text-[20px] font-bold leading-snug text-[var(--color-success,#10b981)]'>{t("logScreens.sent")}</h4>
            <p className='m-0 max-w-[320px] text-[14px] leading-relaxed text-[var(--modern-muted)]'>
              {t("logScreens.passwordResetLink")}
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ForgotPassword;
