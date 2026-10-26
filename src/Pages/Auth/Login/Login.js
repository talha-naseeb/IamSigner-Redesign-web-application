import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Nav, InputGroup, Spinner } from "@/Components/UI/shadcnCompat";
import LoginCarousel from "@/Pages/Auth/Carousels/Login/LoginCarousel";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import Otpinput from "@/Pages/Auth/VerifyOtp/VerifyOtpPage";
import LangSelector from "@/Components/Language/LangSelector";
import authService from "@/services/authService";
import { validate } from "@/utils/validators";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";
import { Helmet } from "react-helmet-async";
import { getRecaptchaToken } from "@/utils/recaptcha";

const Login = ({ onLogin }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validate.email(newEmail)) {
      setEmailError(t("logScreens.invalidEmail"));
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoginButtonDisabled(true);
    setIsLoading(true);

    setEmailError("");
    setPasswordError("");

    if (!email || !password) {
      if (!email) setEmailError(t("logScreens.emailRequired"));
      if (!password) setPasswordError(t("logScreens.passwordRequired"));

      setIsLoginButtonDisabled(false);
      setIsLoading(false);
      return;
    }

    if (!validate.email(email)) {
      setEmailError(t("logScreens.invalidEmail"));
      setIsLoginButtonDisabled(false);
      setIsLoading(false);
      return;
    }

    try {
      await getRecaptchaToken("LOGIN");
      const response = await authService.login(email, password);

      if (response.data.statusCode === "1") {
        setShowOtpModal(true, { state: { email, password } });
        toast.success(t("logScreens.otpsend"));
      }
    } catch (error) {
      if (error?.code === "RECAPTCHA_UNAVAILABLE") toast.error(t("logScreens.reCaptcha"));
    } finally {
      setIsLoginButtonDisabled(false);
      setIsLoading(false);
    }
  };

  const handleOtpModalClose = () => {
    setShowOtpModal(false);
  };

  const baseInputClass =
    "min-h-[48px] w-full rounded-[var(--radius-md,12px)] border border-solid px-3.5 py-[11px] text-[14px] bg-[var(--modern-raised)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] shadow-none focus:border-[var(--modern-violet)] focus:shadow-[0_0_0_3px_var(--modern-focus)] focus:outline-none";

  return (
    <>
      <Helmet>
        <meta name='description' content='Sign in to IAMSigner to manage, send, and electronically sign your documents securely.' />
        <link rel='canonical' href='https://app.iamsigner.com/' />
        <meta property='og:title' content='Login - IAMSigner' />
        <meta property='og:description' content='Sign in to IAMSigner to manage, send, and electronically sign your documents securely.' />
        <meta property='og:url' content='https://app.iamsigner.com/' />
      </Helmet>
      <Container
        fluid
        id='iam-login-page'
        className='login-container min-h-screen w-full overflow-x-hidden overflow-y-auto p-0 bg-[var(--modern-bg)] text-[var(--modern-text)] font-[var(--modern-font-ui)]'
      >
        <Row className='min-h-screen m-0'>
          <Col
            sm={12}
            md={6}
            className='relative flex min-h-screen flex-col items-center justify-center py-8 px-4 sm:px-8 lg:px-16 bg-[radial-gradient(ellipse_at_15%_8%,var(--modern-glow-violet),transparent_42%),var(--modern-bg)]'
          >
            <div className='w-full max-w-[460px] mx-auto rounded-2xl sm:rounded-3xl border border-solid border-[var(--modern-border)] bg-[var(--modern-card)] p-6 sm:p-9 text-[var(--modern-text)] shadow-[var(--modern-card-shadow)]'>
              <div className='flex items-center justify-between gap-4 mb-8'>
                <Link to='https://iamsigner.com' className='inline-flex min-h-[44px] items-center'>
                  {theme === "dark" ? (
                    <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} />
                  ) : (
                    <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />
                  )}
                </Link>
                <div className='flex items-center gap-2'>
                  <AuthThemeToggle />
                  <LangSelector style={{ padding: "0px" }} />
                </div>
              </div>
              <h1 className='m-0 mb-2 text-[clamp(24px,3vw,30px)] font-bold leading-tight tracking-[-0.025em] text-[var(--modern-text)]'>
                {t("logScreens.WelcomeImSigner")}
              </h1>
              <p className='m-0 mb-6 text-[15px] leading-relaxed text-[var(--modern-muted)]'>{t("logScreens.imSignerDesc")}</p>
              <Form className='mt-2' onSubmit={handleLogin} noValidate>
                <Form.Group controlId='formBasicEmail' className='mb-4'>
                  <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>{t("logScreens.email")}</Form.Label>
                  <InputGroup className='flex justify-between'>
                    <Form.Control
                      type='email'
                      autoComplete='username'
                      placeholder={t("logScreens.enterEmailLog")}
                      value={email}
                      required
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? "login-email-error" : undefined}
                      onChange={handleEmailChange}
                      className={`${baseInputClass} ${
                        emailError
                          ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                          : "border-[var(--modern-border-strong)]"
                      }`}
                    />
                  </InputGroup>
                  {emailError && (
                    <Form.Text id='login-email-error' className='mt-1 block text-xs text-[var(--color-danger)]'>
                      {emailError}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className='mt-2 mb-3' controlId='formBasicPassword'>
                  <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>{t("logScreens.password")}</Form.Label>
                  <div className='relative flex items-center'>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete='current-password'
                      placeholder={t("logScreens.enterPassword")}
                      onChange={handlePasswordChange}
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      className={`${baseInputClass} pe-12 ${
                        passwordError
                          ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                          : "border-[var(--modern-border-strong)]"
                      }`}
                    />
                    <button
                      type='button'
                      className='absolute z-[2] end-2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--modern-muted)] cursor-pointer transition-colors hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2'
                      onClick={handleTogglePasswordVisibility}
                      aria-label={showPassword ? t("logScreens.hidePassword") : t("logScreens.showPassword")}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <FaEyeSlash /> : <MdRemoveRedEye />}
                    </button>
                  </div>
                  {passwordError && (
                    <Form.Text id='login-password-error' className='mt-1 block text-xs text-[var(--color-danger)]'>
                      {passwordError}
                    </Form.Text>
                  )}
                </Form.Group>

                <div className='flex justify-between mt-2 mb-3'>
                  <Nav.Link
                    as={Link}
                    to='/forgot-password'
                    className='p-0 text-[14px] font-semibold text-[var(--modern-violet)] no-underline hover:text-[var(--modern-violet-hover)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2'
                  >
                    {t("logScreens.forgetPassword")}
                  </Nav.Link>
                </div>
                <Button
                  type='submit'
                  className='mt-4 inline-flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-md,12px)] border border-solid border-transparent px-4 py-[11px] text-[15px] font-semibold text-white transition-all hover:opacity-95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2'
                  style={{
                    background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                  }}
                  disabled={isLoginButtonDisabled}
                  aria-busy={isLoading}
                >
                  {isLoading && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("logScreens.logIn")}
                </Button>

                <div className='mt-5 flex items-center justify-start text-[14px] text-[var(--modern-muted)]'>
                  {t("logScreens.dontHaveAcc")}
                  <Nav.Link
                    as={Link}
                    to='/sign-up'
                    className='px-2 font-bold text-[var(--modern-violet)] no-underline hover:text-[var(--modern-violet-hover)] hover:underline'
                  >
                    {t("logScreens.signUp")}
                  </Nav.Link>
                </div>
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
              <LoginCarousel />
            </div>
          </Col>
        </Row>
      </Container>
      <Otpinput show={showOtpModal} handleClose={handleOtpModalClose} email={email} password={password} onLogin={onLogin} />
    </>
  );
};

export default Login;
