import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Form, Button, Spinner } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";
import { Icons } from "@/assets/Icons";

const PasswordField = ({ id, label, value, onChange, show, onToggle, error, placeholder }) => (
  <Form.Group className='m-0' controlId={id}>
    <Form.Label className='block mb-1.5 text-[14px] font-medium text-[var(--modern-text)]'>{label}</Form.Label>
    <div className='relative'>
      <Form.Control
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={id === "oldPassword" ? "current-password" : "new-password"}
        className='min-h-[44px] w-full rounded-lg border border-solid border-[var(--modern-border)] bg-[var(--modern-bg)] px-3 py-2 pe-11 text-[14px] text-start text-[var(--modern-text)] shadow-none focus:border-[var(--modern-violet)] focus:outline focus:outline-[3px] focus:outline-[var(--modern-focus)] focus:outline-offset-2'
      />
      <button
        type='button'
        className='absolute top-1/2 -translate-y-1/2 end-3 flex items-center justify-center p-0 border-0 bg-transparent text-[var(--modern-muted)] cursor-pointer hover:text-[var(--modern-text)]'
        onClick={onToggle}
        aria-label='Toggle password visibility'
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <Form.Text className='block mt-1.5 text-[13px] text-[var(--color-danger)]'>{error}</Form.Text>}
  </Form.Group>
);

const RequirementItem = ({ met, label }) => (
  <li className={`flex items-center gap-2 text-[13px] ${met ? "text-[var(--modern-text)]" : "text-[var(--modern-muted)]"}`}>
    <span className={`flex-none inline-flex ${met ? "opacity-100 text-[var(--color-success,#10b981)]" : "opacity-35"}`}>
      <Icons.Check size={14} />
    </span>
    <span>{label}</span>
  </li>
);

const PasswordChange = () => {
  const { t } = useTranslation();
  const [isVerifyingOld, setIsVerifyingOld] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
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
    setIsVerifyingOld(true);
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
      setIsVerifyingOld(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("changePassword.passMatch"));
      return;
    }
    setIsSubmittingPassword(true);
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
      setIsSubmittingPassword(false);
    }
  };

  const primaryBtnClass =
    "w-full sm:w-auto min-w-[120px] min-h-[42px] px-5 py-2 rounded-lg text-[14px] font-semibold text-white border-0 disabled:opacity-65 disabled:cursor-not-allowed";
  const secondaryBtnClass =
    "w-full sm:w-auto min-w-[120px] min-h-[42px] px-5 py-2 rounded-lg text-[14px] font-semibold bg-transparent text-[var(--modern-text)] border border-solid border-[var(--modern-border)] hover:bg-[var(--modern-bg)]";

  return (
    <div className='relative max-w-[520px] p-4 sm:p-7 rounded-[20px] border border-solid border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] font-[var(--modern-font-ui)] transition-colors'>
      <div className='flex items-start gap-4 mb-5'>
        <div
          className='flex-none flex items-center justify-center w-[52px] h-[52px] rounded-[14px] text-[var(--modern-violet)] border border-solid'
          style={{
            background: "color-mix(in srgb, var(--modern-violet) 14%, transparent)",
            borderColor: "color-mix(in srgb, var(--modern-violet) 28%, transparent)",
          }}
          aria-hidden='true'
        >
          <Icons.Lock size={26} />
        </div>
        <div>
          <p className='m-0 mb-1 text-[14px] font-semibold text-[var(--modern-text)]'>{t("changePassword.passwordmustcontain")}</p>
          <p className='m-0 text-[13px] leading-normal text-[var(--modern-muted)]'>{t("changePassword.validPassword")}</p>
        </div>
      </div>

      <div
        className='flex flex-col sm:flex-row sm:items-center gap-3 mb-6 px-4 py-3 rounded-[10px] bg-[var(--modern-bg)] border border-solid border-[var(--modern-border)]'
        aria-label='Password change progress'
      >
        <div className='flex items-center gap-2 flex-1 min-w-0 opacity-100'>
          <span
            className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-full text-xs font-bold flex-none border border-solid ${
              !oldVerified
                ? "bg-[var(--modern-violet)] border-[var(--modern-violet)] text-white"
                : "text-[var(--modern-violet)]"
            }`}
            style={
              oldVerified
                ? {
                    background: "color-mix(in srgb, var(--modern-violet) 12%, transparent)",
                    borderColor: "color-mix(in srgb, var(--modern-violet) 35%, transparent)",
                  }
                : undefined
            }
          >
            1
          </span>
          <span className='text-[13px] font-medium text-[var(--modern-text)] sm:truncate'>{t("changePassword.oldPassword")}</span>
        </div>
        <div className='w-full h-[1px] sm:w-6 sm:h-[2px] bg-[var(--modern-border)] flex-none' />
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${oldVerified ? "opacity-100" : "opacity-55"}`}>
          <span
            className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-full text-xs font-bold flex-none border border-solid ${
              oldVerified
                ? "bg-[var(--modern-violet)] border-[var(--modern-violet)] text-white"
                : "bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-muted)]"
            }`}
          >
            2
          </span>
          <span className='text-[13px] font-medium text-[var(--modern-text)] sm:truncate'>{t("changePassword.newPassword")}</span>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {!oldVerified ? (
          <>
            <PasswordField
              id='oldPassword'
              label={
                <>
                  {t("changePassword.oldPassword")}
                  <span className='text-[var(--color-danger)] ms-1'>*</span>
                </>
              }
              value={oldPassword}
              onChange={setOldPassword}
              show={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
            />
            {oldPassword.trim().length > 0 && (
              <div className='flex flex-col sm:flex-row flex-wrap gap-3 mt-1'>
                <Button
                  type='button'
                  className={primaryBtnClass}
                  style={{
                    background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                  }}
                  onClick={handleVerifyOldPassword}
                  disabled={isVerifyingOld}
                >
                  {isVerifyingOld && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("changePassword.verify") || "Verify"}
                </Button>
                <Button type='button' className={secondaryBtnClass} onClick={hanleCLearFields} disabled={isVerifyingOld}>
                  {t("changePassword.cancel")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className='flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-[var(--modern-text)] border border-solid'
              style={{
                background: "color-mix(in srgb, var(--modern-violet) 12%, var(--modern-card))",
                borderColor: "color-mix(in srgb, var(--modern-violet) 25%, var(--modern-border))",
              }}
            >
              <span className='flex-none text-[var(--modern-violet)] inline-flex'>
                <Icons.Completed size={18} aria-hidden='true' />
              </span>
              <span>{t("changePassword.oldpassVerified") || "Old password verified"}</span>
            </div>

            <PasswordField
              id='newPassword'
              label={
                <>
                  {t("changePassword.newPassword")}
                  <span className='text-[var(--color-danger)] ms-1'>*</span>
                </>
              }
              value={newPassword}
              onChange={handleChangeNewPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              error={newPasswordError}
            />

            <ul className='list-none m-0 px-4 py-3.5 rounded-lg bg-[var(--modern-bg)] border border-solid border-[var(--modern-border)] flex flex-col gap-2'>
              <RequirementItem met={passwordChecks.length} label={t("changePassword.lengthRequirement")} />
              <RequirementItem met={passwordChecks.uppercase} label={t("changePassword.uppercaseRequirement")} />
              <RequirementItem met={passwordChecks.special} label={t("changePassword.specialCharacterRequirement")} />
            </ul>

            <PasswordField
              id='confirmPassword'
              label={
                <>
                  {t("changePassword.confirmPassword")}
                  <span className='text-[var(--color-danger)] ms-1'>*</span>
                </>
              }
              value={confirmPassword}
              onChange={handleChangeConfirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={confirmPasswordError}
            />

            <div className='flex flex-col sm:flex-row flex-wrap gap-3 mt-1'>
              <Button
                type='submit'
                className={primaryBtnClass}
                style={{
                  background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
                }}
                disabled={!isFormValid || isSubmittingPassword}
              >
                {isSubmittingPassword && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                {t("changePassword.submit")}
              </Button>
              <Button type='button' className={secondaryBtnClass} onClick={hanleCLearFields} disabled={isSubmittingPassword}>
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
