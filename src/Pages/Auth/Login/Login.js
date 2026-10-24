import React, { useState } from "react";
import "./Login.css";
import "@/Pages/Auth/AuthPages.css";
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

  return (
    <>
      <Helmet>
        <meta name="description" content="Sign in to IAMSigner to manage, send, and electronically sign your documents securely." />
        <link rel="canonical" href="https://app.iamsigner.com/" />
        <meta property="og:title" content="Login - IAMSigner" />
        <meta property="og:description" content="Sign in to IAMSigner to manage, send, and electronically sign your documents securely." />
        <meta property="og:url" content="https://app.iamsigner.com/" />
      </Helmet>
      <Container fluid className='login-container' id='iam-login-page'>
        <Row>
          <Col sm={12} md={6} className='login-col d-flex flex-column  '>
            <div className='login-form '>
              <div className='headingIMSigner'>
                <Link to='https://iamsigner.com'>
                  {theme === "dark" ? <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} /> : <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />}
                </Link>
                <div className='d-flex align-items-center gap-2'>
                  <AuthThemeToggle />
                  <LangSelector style={{ padding: "0px" }} />
                </div>
              </div>
              <h1 className='form-heading fw-bold'>{t("logScreens.WelcomeImSigner")}</h1>
              <p className='form-heading-desc'>{t("logScreens.imSignerDesc")}</p>
              <Form className='mt-2' onSubmit={handleLogin} noValidate>
                <Form.Group controlId='formBasicEmail'>
                  <Form.Label className='form-label'>{t("logScreens.email")}</Form.Label>
                  <InputGroup className='input-group d-flex justify-content-between'>
                    <Form.Control
                      type='email'
                      autoComplete='username'
                      placeholder={t("logScreens.enterEmailLog")}
                      value={email}
                      required
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? "login-email-error" : undefined}
                      onChange={handleEmailChange}
                      className={`form-control text-secondary ${emailError ? "is-invalid" : ""}`}
                    />
                  </InputGroup>
                  {emailError && <Form.Text id='login-email-error' className='text-danger d-block'>{emailError}</Form.Text>}
                </Form.Group>

                <Form.Group className='mt-2' controlId='formBasicPassword'>
                  <Form.Label>{t("logScreens.password")}</Form.Label>
                  <div className='password-input'>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete='current-password'
                      placeholder={t("logScreens.enterPassword")}
                      onChange={handlePasswordChange}
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      className={`custom-password-input form-control text-secondary ${passwordError ? "is-invalid" : ""} ${showPassword ? "" : "passwordSize"}`}
                    />
                    <button
                      type='button'
                      className='toggle-password'
                      onClick={handleTogglePasswordVisibility}
                      aria-label={showPassword ? t("logScreens.hidePassword") : t("logScreens.showPassword")}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <FaEyeSlash /> : <MdRemoveRedEye />}
                    </button>
                  </div>
                  {passwordError && <Form.Text id='login-password-error' className='text-danger d-block'>{passwordError}</Form.Text>}
                </Form.Group>

                <div className='links d-flex justify-content-between mt-2 mb-3'>
                  <Nav.Link as={Link} to='/forgot-password' className='link-item fw-bold p-0' style={{ fontSize: "14px" }}>
                    {t("logScreens.forgetPassword")}
                  </Nav.Link>
                </div>
                <Button type='submit' className='login-button' disabled={isLoginButtonDisabled} aria-busy={isLoading}>
                  {isLoading && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("logScreens.logIn")}
                </Button>
                {/* Available soon */}
                {/* <GoogleLogin /> */}

                <div className='login-signup-prompt d-flex align-items-center justify-content-start'>
                  {t("logScreens.dontHaveAcc")}
                  <Nav.Link as={Link} to='/sign-up' className='link-item fw-bold px-2'>
                    {t("logScreens.signUp")}
                  </Nav.Link>
                </div>
              </Form>
            </div>
          </Col>
          <Col md={6} className='slider-col d-none d-md-flex flex-column align-items-center'>
            <div className='slider'>
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
