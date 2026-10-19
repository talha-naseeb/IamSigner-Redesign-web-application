import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import "./style.css";
import "@/Pages/Auth/AuthPages.css";
import ForgotCarousel from "@/Pages/Auth/Carousels/Forgot/ForgotCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import lockIcon from "@/assets/images/resetpassSuccess.svg";
import Loader from "@/Components/CommonModals/Loader/Loader";
import authService from "@/services/authService";
import { validate } from "@/utils/validators";
import { getPathAfterId } from "@/utils/url";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";
import { Helmet } from "react-helmet-async";

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
    if (sessionStorage.getItem("token")) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  const isFormValid = newPassword !== "" && confirmPassword !== "" && !newPasswordError && !confirmPasswordError;

  if (authStatus === "Link is valid") {
    return (
      <>
        <Helmet>
          <meta name="description" content="Set a new password for your IAMSigner account." />
          <link rel="canonical" href="https://app.iamsigner.com/forgot-password" />
        </Helmet>
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <Container fluid className='login-container'>
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
                  <label style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{t("logScreens.resetPass")}</label>
                </div>
                <p style={{ color: "var(--text-primary)" }}>{t("logScreens.Createpass")}</p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className='mt-2' controlId='newPassword'>
                    <Form.Label style={{ color: "var(--text-primary)" }}>{t("changePassword.newPassword")}</Form.Label>
                    <div className='password-input'>
                      <Form.Control type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => handleChangeNewPassword(e.target.value)} />
                      <span className='toggle-password' onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                      </span>
                    </div>
                    {newPasswordError && <Form.Text className='text-danger'>{newPasswordError}</Form.Text>}
                  </Form.Group>

                  <Form.Group className='mt-2' controlId='confirmPassword'>
                    <Form.Label style={{ color: "var(--text-primary)" }}>{t("changePassword.confirmPassword")}</Form.Label>
                    <div className='password-input'>
                      <Form.Control type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => handleChangeConfirmPassword(e.target.value)} />
                      <span className='toggle-password' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                      </span>
                    </div>
                    {confirmPasswordError && <Form.Text className='text-danger'>{confirmPasswordError}</Form.Text>}
                  </Form.Group>

                  <Button className='forgot-button mt-3' type='submit' disabled={!isFormValid} style={{ backgroundColor: isLoading || !isFormValid ? "#889CAA" : "" }}>
                    {t("changePassword.submit")}
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
                <img src={lockIcon} alt='iconLoading' />
                <h4 style={{ marginTop: "1rem", color: "#24B032" }}>{t("logScreens.resetPass")}</h4>
                <p className='m-0'>{t("logScreens.successFullyChanged")}</p>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  } else if (authStatus === "The link has expired. Please request a new password reset link.") {
    return (
      <Container fluid className='login-container'>
        <Row>
          <Col sm={12} md={6} className='login-col d-flex flex-column'>
            <div className='login-form'>
              <div className='headingIMSigner'>
                <div className='d-flex gap-2 align-items-center'>
                  <Link to='/'>
                    <IoArrowBack size={22} className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} style={{ color: "var(--text-primary)", cursor: "pointer" }} />
                  </Link>
                  {theme === "dark" ? <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} /> : <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />}
                </div>
                <div className='d-flex align-items-center gap-3'>
                  <AuthThemeToggle />
                  <LangSelector style={{ padding: "0px" }} />
                </div>
              </div>

              <div className='expired-link-content text-center mt-4'>
                <div className='expired-icon mb-4'>
                  <div className='expired-icon-container'>
                    <svg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                        stroke='var(--decline-status)'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>

                <div className='mb-3'>
                  <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--decline-status)", marginBottom: "12px" }}>{t("logScreens.Expired") || "Link Expired"}</h2>
                </div>

                <p className='expired-link-desc'>{t("logScreens.passwordReset") || "The link has expired. Please request a new password reset link."}</p>

                <div className='d-flex flex-column gap-3'>
                  <Button
                    as={Link}
                    to='/forgot-password'
                    className='w-100 auth-primary-action'
                  >
                    Request New Reset Link
                  </Button>

                  <Button
                    as={Link}
                    to='/'
                    variant='outline-secondary'
                    className='w-100'
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Back to Login
                  </Button>
                </div>

                <div className='expired-link-footer'>
                  <p>
                    Need help?{" "}
                    <Link to='/contact' style={{ color: "var(--theme-color)", textDecoration: "none" }}>
                      Contact Support
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} className='slider-col d-none d-md-flex flex-column align-items-center'>
            <ForgotCarousel />
          </Col>
        </Row>
      </Container>
    );
  } else if (authStatus === "Sorry, You have already changed the password thank you!") {
    return (
      <Container fluid className='login-container'>
        <div className='declined-Link-container'>
          <div className='auth-declined-shell'>
            <div className='headingIMSigner'>
              <Link to='/'>
                {theme === "dark" ? <Icons.IamSignerLightMode style={{ height: "45px", width: "140px" }} /> : <Icons.StepperLogo style={{ height: "45px", width: "140px" }} />}
              </Link>
              <div className='d-flex align-items-center gap-2'>
                <AuthThemeToggle />
                <LangSelector style={{ padding: "0px" }} />
              </div>
            </div>
            <div className='message-box d-flex flex-column justify-content-center align-items-center'>
              <h1>{t("logScreens.sorry")}</h1>
              <p>{t("logScreens.alreadyChanged")}!</p>
            </div>
          </div>
        </div>
      </Container>
    );
  }
};

export default ResetPassword;
