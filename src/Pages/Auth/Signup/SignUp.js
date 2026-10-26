import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Container, Modal, Form, FormGroup, Button, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import SignUpCarousel from "@/Pages/Auth/Carousels/SignUp/SignUpCarousel";
import LangSelector from "@/Components/Language/LangSelector";
import successAnimation from "@/assets/images/success-animation.webp";
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

  const baseInputClass =
    "min-h-[48px] w-full rounded-[var(--radius-md,12px)] border border-solid px-3.5 py-[11px] text-[14px] text-start bg-[var(--modern-raised)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] shadow-none focus:border-[var(--modern-violet)] focus:shadow-[0_0_0_3px_var(--modern-focus)] focus:outline-none";

  const getAccountTabClass = (active) =>
    `inline-flex w-full min-w-0 min-h-[42px] items-center justify-center whitespace-nowrap rounded-[var(--radius-md,12px)] border border-solid border-[var(--modern-violet)] px-3 py-2 text-[13px] sm:text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2 ${
      active
        ? "bg-[var(--modern-violet)] text-white"
        : "bg-transparent text-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)]"
    }`;

  return (
    <>
      <Helmet>
        <meta name='description' content='Create your IAMSigner account. Start sending and signing documents electronically in minutes.' />
        <link rel='canonical' href='https://app.iamsigner.com/sign-up' />
        <meta property='og:title' content='Sign Up - IAMSigner' />
        <meta property='og:description' content='Create your IAMSigner account. Start sending and signing documents electronically in minutes.' />
        <meta property='og:url' content='https://app.iamsigner.com/sign-up' />
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
            <div className='w-full max-w-[620px] mx-auto rounded-2xl sm:rounded-3xl border border-solid border-[var(--modern-border)] bg-[var(--modern-card)] p-6 sm:p-9 text-[var(--modern-text)] shadow-[var(--modern-card-shadow)]'>
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

              <h4 className='m-0 mb-5 text-[clamp(24px,3vw,30px)] font-bold leading-tight tracking-[-0.025em] text-[var(--modern-text)]'>
                {t("logScreens.accountCreate")}
              </h4>
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Account Type */}
                <div className='grid grid-cols-2 gap-2 sm:gap-3 w-full mb-4'>
                  <Button
                    type='button'
                    className={getAccountTabClass(accountType === "I")}
                    aria-pressed={accountType === "I"}
                    onClick={() => setAccountType("I")}
                  >
                    {t("logScreens.individual")}
                  </Button>
                  <Button
                    type='button'
                    className={getAccountTabClass(accountType === "B")}
                    aria-pressed={accountType === "B"}
                    onClick={() => setAccountType("B")}
                  >
                    {t("logScreens.company")}
                  </Button>
                </div>

                <div
                  className={`grid gap-3 mb-2 ${
                    accountType === "B" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {accountType === "B" && (
                    <FormGroup className='mb-2'>
                      <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                        {t("logScreens.companyName")}
                        <span className='text-[var(--color-danger)] ms-1'>*</span>
                      </Form.Label>
                      <Form.Control
                        type='text'
                        placeholder={t("logScreens.companyName")}
                        {...register("CompanyName", { required: t("logScreens.companyNameRequired") })}
                        className={`${baseInputClass} ${
                          errors.CompanyName
                            ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                            : "border-[var(--modern-border-strong)]"
                        }`}
                      />
                      {errors.CompanyName && (
                        <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.CompanyName.message}</div>
                      )}
                    </FormGroup>
                  )}

                  {/* Name */}
                  <FormGroup className='mb-2'>
                    <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                      {t("logScreens.name")}
                      <span className='text-[var(--color-danger)] ms-1'>*</span>
                    </Form.Label>
                    <Form.Control
                      type='text'
                      placeholder={t("logScreens.name")}
                      {...register("Name", { required: t("logScreens.requiredName") })}
                      className={`${baseInputClass} ${
                        errors.Name
                          ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                          : "border-[var(--modern-border-strong)]"
                      }`}
                    />
                    {errors.Name && <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.Name.message}</div>}
                  </FormGroup>
                </div>

                {/* Email */}
                <FormGroup className='mb-3'>
                  <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                    <span>{t("logScreens.emailAdd")}</span>
                    <span className='text-[var(--color-danger)] ms-1'>*</span>
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
                    className={`${baseInputClass} ${
                      errors.EmailID
                        ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                        : "border-[var(--modern-border-strong)]"
                    }`}
                  />
                  {errors.EmailID && <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.EmailID.message}</div>}
                </FormGroup>

                <FormGroup className='mb-3'>
                  <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                    {t("logScreens.mobileNumber")}
                    <span className='text-[var(--color-danger)] ms-1'>*</span>
                  </Form.Label>
                  <PhoneInput
                    excludeCountries={["il"]}
                    country={"sa"}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    containerClass={`phone-input-container signup-phone-input ${
                      errors.MobileNumber || (phoneNumber && phoneNumber.length > 0 && phoneNumber.length < 10)
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  {phoneNumber && phoneNumber.length < 10 && (
                    <div className='mt-1 text-xs text-[var(--color-danger)]'>{t("logScreens.ValidmobileNumber")}</div>
                  )}
                  {errors.MobileNumber && (
                    <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.MobileNumber.message}</div>
                  )}
                </FormGroup>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
                  {/* Password */}
                  <FormGroup>
                    <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                      {t("logScreens.password")}
                      <span className='text-[var(--color-danger)] ms-1'>*</span>
                    </Form.Label>
                    <div className='relative flex items-center'>
                      <Form.Control
                        className={`${baseInputClass} pe-11 ${
                          errors.Password
                            ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                            : "border-[var(--modern-border-strong)]"
                        }`}
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
                        className='absolute z-[2] end-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--modern-muted)] cursor-pointer hover:text-[var(--modern-text)]'
                        onClick={() => togglePasswordVisibility(setShowPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.Password && <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.Password.message}</div>}
                  </FormGroup>

                  {/* Confirm Password */}
                  <FormGroup>
                    <Form.Label className='block mb-2 text-[14px] font-semibold text-[var(--modern-text)]'>
                      {t("logScreens.confirmPassword")}
                      <span className='text-[var(--color-danger)] ms-1'>*</span>
                    </Form.Label>
                    <div className='relative flex items-center'>
                      <Form.Control
                        className={`${baseInputClass} pe-11 ${
                          errors.ConfirmPassword
                            ? "border-[var(--color-danger)] shadow-[0_0_0_3px_var(--color-danger-bg)]"
                            : "border-[var(--modern-border-strong)]"
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("logScreens.confirmPassword")}
                        {...register("ConfirmPassword", { required: t("logScreens.confrimPassword") })}
                      />
                      <button
                        type='button'
                        className='absolute z-[2] end-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--modern-muted)] cursor-pointer hover:text-[var(--modern-text)]'
                        onClick={() => togglePasswordVisibility(setShowConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.ConfirmPassword && (
                      <div className='mt-1 text-xs text-[var(--color-danger)]'>{errors.ConfirmPassword.message}</div>
                    )}
                  </FormGroup>
                </div>

                {/* Submit Button */}
                <Button
                  className='mt-4 inline-flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-md,12px)] border border-solid border-transparent px-4 py-[11px] text-[15px] font-semibold text-white transition-all hover:opacity-95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--modern-focus)] focus-visible:outline-offset-2'
                  style={{
                    background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                  }}
                  type='submit'
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("logScreens.signUp")}
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
              <SignUpCarousel />
            </div>
          </Col>
        </Row>

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
                <img src={successAnimation} alt='iconLoading' className='h-10 w-10 object-contain' />
              </span>
              <h4 className='m-0 mb-2 text-[20px] font-bold leading-snug text-[var(--color-success,#10b981)]'>
                Congratulations
              </h4>
              <p className='m-0 max-w-[320px] text-[14px] leading-relaxed text-[var(--modern-muted)]'>
                Your account has created successfully!
              </p>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default Signup;
