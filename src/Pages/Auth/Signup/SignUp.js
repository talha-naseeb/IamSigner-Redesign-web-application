import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./style.css";
import "@/Pages/Auth/AuthPages.css";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Container, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { Form, FormGroup, Button } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import SignUpCarousel from "@/Pages/Auth/Carousels/SignUp/SignUpCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import successAnimation from "@/assets/images/success-animation.webp";
import Loader from "@/Components/CommonModals/Loader/Loader";
import PhoneInput from "react-phone-input-2";
import authService from "@/services/authService";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";
import { Helmet } from "react-helmet-async";
import { getRecaptchaToken } from "@/utils/recaptcha";

const Signup = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
    setError,
    setValue,
    clearErrors,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("I");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = (setter) => {
    setter((prev) => !prev);
  };

  const handlePhoneChange = (phone) => {
    setPhoneNumber(phone);
    setValue("MobileNumber", phone);

    // Clear mobile number error when user starts typing
    if (phone.length >= 10) {
      clearErrors("MobileNumber");
    }
  };

  const onSubmit = async (data) => {
    const { Password, ConfirmPassword } = data;

    if (Password !== ConfirmPassword) {
      setError("ConfirmPassword", {
        type: "manual",
        message: t("logScreens.passMatch"),
      });
      return;
    }

    // Extract country code and mobile number from the combined phone input
    let mobileData = {};
    if (phoneNumber) {
      const countryCode = phoneNumber.substring(0, phoneNumber.length - 10); // Assuming 10 digits for mobile
      const mobileNumber = phoneNumber.substring(phoneNumber.length - 10);
      mobileData = {
        MobileNumber: mobileNumber,
        CountryCode: countryCode,
      };
    }

    const payload = { ...data, ...mobileData, accountType };

    try {
      setIsLoading(true);
      await getRecaptchaToken("SIGNUP");
      const response = await authService.signup(payload);
      if (response.data.statusCode === "1") {
        toast.success(t("logScreens.userRegistered"));
        reset();
        setPhoneNumber("");
        setShowSuccessModal(true);
        setTimeout(() => {
          //handle Navigate
          setShowSuccessModal(false);
          navigate("/");
        }, 3000);
      } else if (response.data.statusCode === "10") {
        toast.error(t("logScreens.userExists"));
      } else {
        toast.error(t("logScreens.registrationFailed"));
      }
    } catch (error) {
      if (error?.code === "RECAPTCHA_UNAVAILABLE") {
        toast.error(t("logScreens.reCaptcha"));
      } else if (error.response && error.response.status === 400) {
        const serverErrors = error.response.data.errors;
        Object.keys(serverErrors).forEach((field) => {
          setError(field, { type: "manual", message: serverErrors[field].message });
        });
      } else {
        toast.error(t("logScreens.networkErr"));
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <Helmet>
        <meta name="description" content="Create your IAMSigner account. Start sending and signing documents electronically in minutes." />
        <link rel="canonical" href="https://app.iamsigner.com/sign-up" />
        <meta property="og:title" content="Sign Up - IAMSigner" />
        <meta property="og:description" content="Create your IAMSigner account. Start sending and signing documents electronically in minutes." />
        <meta property="og:url" content="https://app.iamsigner.com/sign-up" />
      </Helmet>
      <Container fluid className='login-container'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Row>
        <Col sm={12} md={6} className='login-col d-flex flex-column'>
          <div className='SignUp-form'>
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

            <h4 className='form-heading fw-bold'>{t("logScreens.accountCreate")}</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Account Type */}

              <div className='accctypeBtn'>
                <Button
                  type='button'
                  className={`SignAccountTypeBtn ${accountType === "I" ? "" : "outline"}`}
                  aria-pressed={accountType === "I"}
                  onClick={() => setAccountType("I")}
                >
                  {t("logScreens.individual")}
                </Button>
                <Button
                  type='button'
                  className={`SignAccountTypeBtn ${accountType === "B" ? "" : "outline"}`}
                  aria-pressed={accountType === "B"}
                  onClick={() => setAccountType("B")}
                >
                  {t("logScreens.company")}
                </Button>
              </div>

              <div className='signup-name-fields' style={{ display: "flex", justifyContent: "space-between" }}>
                {accountType === "B" && (
                  <FormGroup className={`mb-2 ${errors.CompanyName ? "has-error" : ""}`} style={{ width: "calc(45%)" }}>
                    <Form.Label className='form-label'>
                      {t("logScreens.companyName")}
                      <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type='text'
                      placeholder={t("logScreens.companyName")}
                      {...register("CompanyName", { required: t("logScreens.companyNameRequired") })}
                      className={`form-control ${errors.CompanyName ? "error-border" : ""}`}
                    />
                    {errors.CompanyName && <div className='error'>{errors.CompanyName.message}</div>}
                  </FormGroup>
                )}

                {/* Name */}
                <FormGroup className={`mb-2 ${errors.Name ? "has-error" : ""}`} style={{ width: `${accountType === "I" ? "100%" : "calc(45%)"}` }}>
                  <Form.Label className='form-label'>
                    {t("logScreens.name")}
                    <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder={t("logScreens.name")}
                    {...register("Name", { required: t("logScreens.requiredName") })}
                    className={`form-control ${errors.Name ? "error-border" : ""}`}
                  />
                  {errors.Name && <div className='error'>{errors.Name.message}</div>}
                </FormGroup>
              </div>

              {/* Email */}
              <FormGroup className={`mb-2 ${errors.EmailID ? "has-error" : ""}`}>
                <Form.Label className='form-label'>
                  <span> {t("logScreens.emailAdd")}</span>
                  <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type='text'
                  placeholder={t("logScreens.email")}
                  {...register("EmailID", {
                    required: t("logScreens.emailRequired"),
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: t("logScreens.emailAddress"),
                    },
                  })}
                  className={`form-control ${errors.EmailID ? "error-border" : ""}`}
                />
                {errors.EmailID && <div className='error'>{errors.EmailID.message}</div>}
              </FormGroup>

              <FormGroup className={`mb-2 ${errors.MobileNumber ? "has-error" : ""}`}>
                <Form.Label className='form-label'>
                  {t("logScreens.mobileNumber")}
                  <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <PhoneInput
                  excludeCountries={["il"]}
                  country={"sa"}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  containerClass={`phone-input-container signup-phone-input ${errors.MobileNumber || (phoneNumber && phoneNumber.length > 0 && phoneNumber.length < 10) ? "is-invalid" : ""}`}
                />
                {phoneNumber && phoneNumber.length < 10 && <div className='error'>{t("logScreens.ValidmobileNumber")}</div>}
                {errors.MobileNumber && <div className='error'>{errors.MobileNumber.message}</div>}
              </FormGroup>

              <div className='signup-password-fields'>
                {/*password  */}
                <FormGroup className={`form-group ${errors.Password ? "has-error" : ""}`}>
                  <Form.Label className='form-label'>
                    {t("logScreens.password")}
                    <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <div className='position-relative'>
                    <Form.Control
                      className={`form-control ${showPassword ? "password-show" : ""} ${errors.Password ? "error-border" : ""}`}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("logScreens.password")}
                      {...register("Password", {
                        required: t("logScreens.passwordRequired"),
                        minLength: {
                          value: 8,
                          message: t("logScreens.passLengthRequired"),
                        },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/,
                          message: t("logScreens.validPassword"),
                        },
                      })}
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary custom-border position-absolute end-0 top-50 translate-middle-y'
                      onClick={() => togglePasswordVisibility(setShowPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.Password && <div className='error'>{errors.Password.message}</div>}
                </FormGroup>

                {/* Confirm Password */}
                <FormGroup className={`form-group ${errors.ConfirmPassword ? "has-error" : ""}`}>
                  <Form.Label className='form-label'>
                    {t("logScreens.confirmPassword")}
                    <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <div className='position-relative'>
                    <Form.Control
                      className={`form-control ${showConfirmPassword ? "password-show" : ""} ${errors.ConfirmPassword ? "error-border" : ""}`}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("logScreens.confirmPassword")}
                      {...register("ConfirmPassword", { required: t("logScreens.confrimPassword") })}
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary custom-border position-absolute end-0 top-50 translate-middle-y'
                      onClick={() => togglePasswordVisibility(setShowConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.ConfirmPassword && <div className='error'>{errors.ConfirmPassword.message}</div>}
                </FormGroup>
              </div>

              {/* Submit Button */}

              <Button className='btn-singUp mt-2' type='submit' disabled={isLoading} style={{ backgroundColor: isLoading ? "#889CAA" : "" }}>
                {t("logScreens.signUp")}
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={6} className='slider-col d-none d-md-flex flex-column align-items-center'>
          <div className='slider'>
            <SignUpCarousel />
          </div>
        </Col>
      </Row>

      <Modal show={showSuccessModal} onHide={handleCloseModal} centered dialogClassName='custom-modal-width auth-success-modal'>
        <Modal.Body className='p-3'>
          <div className='thankyou-message-modal'>
            <div className='message-box d-flex flex-column justify-content-center align-items-center'>
              <img src={successAnimation} alt='iconLoading' />
              <h4 style={{ marginTop: "1rem", color: "#24B032" }}>Congratulations</h4>
              <p className='m-0'>Your account has created successfully!</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
    </>
  );
};

export default Signup;
