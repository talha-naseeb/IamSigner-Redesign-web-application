import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import "./style.css";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { Form, Button } from "react-bootstrap";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import userService from "@/services/userService";
import { Icons } from "@/assets/Icons";

const PasswordField = ({ id, label, value, onChange, show, onToggle, error, placeholder }) => (
  <Form.Group className='password-change-field' controlId={id}>
    <Form.Label>{label}</Form.Label>
    <div className='password-change-input-wrap'>
      <Form.Control
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={id === "oldPassword" ? "current-password" : "new-password"}
      />
      <button type='button' className='password-change-toggle' onClick={onToggle} aria-label='Toggle password visibility'>
        {show ? <RiEyeOffFill /> : <RiEyeFill />}
      </button>
    </div>
    {error && <Form.Text className='password-change-error'>{error}</Form.Text>}
  </Form.Group>
);

const RequirementItem = ({ met, label }) => (
  <li className={`password-change-requirement${met ? " met" : ""}`}>
    <Icons.Check size={14} />
    <span>{label}</span>
  </li>
);

const PasswordChange = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [oldVerified, setOldVerified] = useState(false);

  const { emailId } = useUser();

  const passwordChecks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
    }),
    [newPassword]
  );

  useEffect(() => {
    const noErrors = !newPasswordError && !confirmPasswordError;
    const newFieldsFilled = newPassword !== "" && confirmPassword !== "";
    setIsFormValid(oldVerified && noErrors && newFieldsFilled);
  }, [oldVerified, newPassword, confirmPassword, newPasswordError, confirmPasswordError]);

  const handleChangeNewPassword = (value) => {
    setNewPassword(value);
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(value)) {
      setNewPasswordError(t("changePassword.validPassword"));
    } else {
      setNewPasswordError("");
    }
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError(t("changePassword.passMatch"));
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleChangeConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (value !== newPassword) {
      setConfirmPasswordError(t("changePassword.passMatch"));
    } else {
      setConfirmPasswordError("");
    }
  };

  const hanleCLearFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setOldVerified(false);
  };

  const handleField = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOldVerified(false);
  };

  const handleVerifyOldPassword = async () => {
    if (!oldPassword) {
      toast.error(t("changePassword.oldPassCheck"));
      return;
    }
    setIsLoading(true);
    try {
      const oldPasswordCheck = await userService.checkOldPassword({
        UserName: emailId,
        OldPassword: oldPassword,
      });
      if (!oldPasswordCheck.data.successStatus) {
        if (oldPasswordCheck.data.statusCode === "7") {
          toast.error(t("changePassword.oldpassError"));
        } else {
          toast.error(t("changePassword.oldPassCheck"));
        }
        setOldVerified(false);
      } else {
        setOldVerified(true);
        toast.success(t("changePassword.oldpassVerified") || "Old password verified");
      }
    } catch (error) {
      toast.error(t("changePassword.oldPassCheck"));
      setOldVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("changePassword.passMatch"));
      return;
    }
    setIsLoading(true);
    try {
      const response = await userService.changePassword({
        UserName: emailId,
        OldPassword: oldPassword,
        NewPassword: newPassword,
        AppUserID: process.env.REACT_APP_USER_ID,
      });

      if (response.data.statusCode === "1") {
        toast.success(t("changePassword.changePasswordSuccessfull"));
        handleField();
      }
    } catch (error) {
      toast.error(t("changePassword.changePasswordError"), error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='password-change-card'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='password-change-header'>
        <div className='password-change-icon-badge' aria-hidden='true'>
          <Icons.Lock size={26} />
        </div>
        <div>
          <p className='password-change-eyebrow'>{t("changePassword.passwordmustcontain")}</p>
          <p className='password-change-description'>{t("changePassword.validPassword")}</p>
        </div>
      </div>

      <div className='password-change-steps' aria-label='Password change progress'>
        <div className={`password-change-step${!oldVerified ? " active" : " completed"}`}>
          <span className='password-change-step-number'>1</span>
          <span className='password-change-step-label'>{t("changePassword.oldPassword")}</span>
        </div>
        <div className='password-change-step-divider' />
        <div className={`password-change-step${oldVerified ? " active" : ""}`}>
          <span className='password-change-step-number'>2</span>
          <span className='password-change-step-label'>{t("changePassword.newPassword")}</span>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className='password-change-form'>
        {!oldVerified ? (
          <>
            <PasswordField
              id='oldPassword'
              label={
                <>
                  {t("changePassword.oldPassword")}
                  <span className='text-danger ms-1'>*</span>
                </>
              }
              value={oldPassword}
              onChange={setOldPassword}
              show={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
            />
            {oldPassword.trim().length > 0 && (
              <div className='password-change-actions'>
                <Button type='button' className='password-change-btn password-change-btn-primary' onClick={handleVerifyOldPassword}>
                  {t("changePassword.verify") || "Verify"}
                </Button>
                <Button type='button' className='password-change-btn password-change-btn-secondary' onClick={hanleCLearFields}>
                  {t("changePassword.cancel")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className='password-change-verified-banner'>
              <Icons.CheckCircle size={18} />
              <span>{t("changePassword.oldpassVerified") || "Old password verified"}</span>
            </div>

            <PasswordField
              id='newPassword'
              label={
                <>
                  {t("changePassword.newPassword")}
                  <span className='text-danger ms-1'>*</span>
                </>
              }
              value={newPassword}
              onChange={handleChangeNewPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              error={newPasswordError}
            />

            <ul className='password-change-requirements'>
              <RequirementItem met={passwordChecks.length} label={t("changePassword.lengthRequirement")} />
              <RequirementItem met={passwordChecks.uppercase} label={t("changePassword.uppercaseRequirement")} />
              <RequirementItem met={passwordChecks.special} label={t("changePassword.specialCharacterRequirement")} />
            </ul>

            <PasswordField
              id='confirmPassword'
              label={
                <>
                  {t("changePassword.confirmPassword")}
                  <span className='text-danger ms-1'>*</span>
                </>
              }
              value={confirmPassword}
              onChange={handleChangeConfirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={confirmPasswordError}
            />

            <div className='password-change-actions'>
              <Button type='submit' className='password-change-btn password-change-btn-primary' disabled={!isFormValid}>
                {t("changePassword.submit")}
              </Button>
              <Button type='button' className='password-change-btn password-change-btn-secondary' onClick={hanleCLearFields}>
                {t("changePassword.cancel")}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

export default PasswordChange;
