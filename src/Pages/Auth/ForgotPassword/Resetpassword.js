import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Container, Row, Col, Form, Button, Modal, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import ForgotCarousel from "@/Pages/Auth/Carousels/Forgot/ForgotCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import lockIcon from "@/assets/images/resetpassSuccess.svg";
import authService from "@/services/authService";
import { validate } from "@/utils/validators";
import { getPathAfterId } from "@/utils/url";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";
import { Helmet } from "react-helmet-async";
import { tokenManager } from "@/services/tokenManager";

const ResetPassword = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState("");
  const [authStatus, setAuthStatus] = useState();
  const [auth, setAuth] = useState();
  const navigate = useNavigate();

  const handleChangeConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (value !== newPassword) {
      setConfirmPasswordError(t("logScreens.passMatch"));
    } else {
      setConfirmPasswordError("");
    }
  };

  const resetFields = () => {
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordError("");
    setConfirmPasswordError("");
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const pathAfterId = getPathAfterId();

      if (pathAfterId) {
        setAuth(pathAfterId);

        try {
          const response = await authService.checkResetLinkExpiry(pathAfterId);
          const message = response.data.message;
          setAuthStatus(message);

          if (message !== "Link is valid") {
            navigate("/link-expired");
          }
        } catch (error) {
          console.error("API Error checking link expiry:", error);
          navigate("/link-expired");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleChangeNewPassword = (value) => {
    setNewPassword(value);
    if (!validate.password(value)) {
      setNewPasswordError(t("logScreens.passwordValidate"));
    } else {
      setNewPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t("logScreens.passwordMismatch"));
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.changePassword({ NewPassword: newPassword }, auth);
      if (response.data.statusCode === "1") {
        resetFields();
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/");
        }, 15000);
      } else {
        toast.error(t("logScreens.unAbleChanged"));
      }
    } catch (error) {
      console.error("API Error changing password:", error);
      toast.error(t("logScreens.ChangeErr"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    if (tokenManager.hasToken()) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  const isFormValid = newPassword !== "" && confirmPassword !== "" && !newPasswordError && !confirmPasswordError;

  const baseInputClass =
    "min-h-[48px] w-full rounded-[var(--radius-md,12px)] border border-solid border-[var(--modern-border-strong)] px-3.5 py-[11px] pe-12 text-[14px] bg-[var(--modern-raised)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] shadow-none focus:border-[var(--modern-violet)] focus:shadow-[0_0_0_3px_var(--modern-focus)] focus:outline-none";

  const primaryButtonClass =
    "inline-flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-md,12px)] border border-solid border-transparent px-4 py-[11px] text-[15px] font-semibold text-white no-underline transition-all hover:opacity-95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2";

  const secondaryButtonClass =
    "inline-flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-md,12px)] border border-solid border-[var(--modern-border-strong)] bg-transparent px-4 py-[11px] text-[15px] font-semibold text-[var(--modern-text)] no-underline transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)] hover:text-[var(--modern-violet)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2";

  const renderHeader = () => (
    <div className='flex items-center justify-between gap-4 mb-8'>
      <div className='flex gap-2 items-center'>
        <Link to='/' className='inline-flex items-center text-[var(--modern-text)]'>
          <ArrowLeft
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
  );

  const renderSliderCol = () => (
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
  );

  if (authStatus === "Link is valid") {
    return (
      <>
        <Helmet>
          <meta name='description' content='Set a new password for your IAMSigner account.' />
          <link rel='canonical' href='https://app.iamsigner.com/forgot-password' />
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
                {renderHeader()}

                <div className='mb-2'>
                  <h1 className='m-0 text-[22px] font-bold text-[var(--modern-text)]'>{t("logScreens.resetPass")}</h1>
                </div>
                <p className='m-0 mb-5 text-[15px] text-[var(--modern-muted)]'>{t("logScreens.Createpass")}</p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className='mt-2 mb-4' controlId='newPassword'>
                    <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                      {t("changePassword.newPassword")}
                    </Form.Label>
                    <div className='relative flex items-center'>
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => handleChangeNewPassword(e.target.value)}
                        className={baseInputClass}
                      />
                      <button
                        type='button'
                        className='absolute z-[2] end-2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--modern-muted)] cursor-pointer hover:text-[var(--modern-text)]'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newPasswordError && <Form.Text className='mt-1 block text-xs text-[var(--color-danger)]'>{newPasswordError}</Form.Text>}
                  </Form.Group>

                  <Form.Group className='mt-2 mb-4' controlId='confirmPassword'>
                    <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                      {t("changePassword.confirmPassword")}
                    </Form.Label>
                    <div className='relative flex items-center'>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => handleChangeConfirmPassword(e.target.value)}
                        className={baseInputClass}
                      />
                      <button
                        type='button'
                        className='absolute z-[2] end-2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--modern-muted)] cursor-pointer hover:text-[var(--modern-text)]'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <Form.Text className='mt-1 block text-xs text-[var(--color-danger)]'>{confirmPasswordError}</Form.Text>
                    )}
                  </Form.Group>

                  <Button
                    className={`mt-4 ${primaryButtonClass}`}
                    style={{
                      background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                    }}
                    type='submit'
                    disabled={isLoading || !isFormValid}
                    aria-busy={isLoading}
                  >
                    {isLoading && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                    {t("changePassword.submit")}
                  </Button>
                </Form>
              </div>
            </Col>
            {renderSliderCol()}
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
                <img src={lockIcon} alt='iconLoading' className='h-9 w-9 object-contain' />
              </span>
              <h4 className='m-0 mb-2 text-[20px] font-bold leading-snug text-[var(--color-success,#10b981)]'>
                {t("logScreens.resetPass")}
              </h4>
              <p className='m-0 max-w-[320px] text-[14px] leading-relaxed text-[var(--modern-muted)]'>
                {t("logScreens.successFullyChanged")}
              </p>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  } else if (authStatus === "The link has expired. Please request a new password reset link.") {
    return (
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
              {renderHeader()}

              <div className='text-center mt-4'>
                <div className='mb-4'>
                  <div
                    className='inline-flex h-[76px] w-[76px] items-center justify-center rounded-full border border-solid'
                    style={{
                      background: "var(--color-danger-bg, rgba(239, 68, 68, 0.12))",
                      borderColor: "color-mix(in srgb, var(--color-danger, #ef4444) 28%, transparent)",
                    }}
                  >
                    <svg width='36' height='36' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                        stroke='var(--color-danger)'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>

                <div className='mb-3'>
                  <h2 className='text-2xl font-bold text-[var(--color-danger)] mb-3'>
                    {t("logScreens.Expired") || "Link Expired"}
                  </h2>
                </div>

                <p className='mb-8 text-base leading-normal text-[var(--modern-muted)] text-center'>
                  {t("logScreens.passwordReset") || "The link has expired. Please request a new password reset link."}
                </p>

                <div className='flex flex-col gap-3'>
                  <Button
                    as={Link}
                    to='/forgot-password'
                    className={primaryButtonClass}
                    style={{
                      background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                    }}
                  >
                    Request New Reset Link
                  </Button>

                  <Button as={Link} to='/' variant='outline-secondary' className={secondaryButtonClass}>
                    Back to Login
                  </Button>
                </div>

                <div className='mt-6 pt-4 border-t border-solid border-[var(--modern-border)] text-center'>
                  <p className='m-0 text-sm text-[var(--modern-muted)]'>
                    Need help?{" "}
                    <Link to='/contact' className='text-[var(--modern-violet)] no-underline hover:underline'>
                      Contact Support
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
          {renderSliderCol()}
        </Row>
      </Container>
    );
  } else if (authStatus === "Sorry, You have already changed the password thank you!") {
    return (
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
              {renderHeader()}

              <div className='text-center mt-4'>
                <div className='mb-4'>
                  <div
                    className='inline-flex h-[76px] w-[76px] items-center justify-center rounded-full border border-solid'
                    style={{
                      background: "var(--color-danger-bg, rgba(239, 68, 68, 0.12))",
                      borderColor: "color-mix(in srgb, var(--color-danger, #ef4444) 28%, transparent)",
                    }}
                  >
                    <svg width='36' height='36' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                        stroke='var(--color-danger)'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>

                <div className='mb-3'>
                  <h2 className='text-2xl font-bold text-[var(--color-danger)] mb-3'>{t("logScreens.sorry")}</h2>
                </div>

                <p className='mb-8 text-base leading-normal text-[var(--modern-muted)] text-center'>
                  {t("logScreens.alreadyChanged")}
                </p>

                <div className='flex flex-col gap-3'>
                  <Button
                    as={Link}
                    to='/'
                    className={primaryButtonClass}
                    style={{
                      background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </Col>
          {renderSliderCol()}
        </Row>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className='login-container min-h-screen w-full overflow-x-hidden overflow-y-auto p-0 bg-[var(--modern-bg)] text-[var(--modern-text)] font-[var(--modern-font-ui)]'
    />
  );
};

export default ResetPassword;
