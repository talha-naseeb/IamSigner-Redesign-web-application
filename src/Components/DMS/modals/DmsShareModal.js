import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Form, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";
import { DMS_PERMISSION_NAMES, DMS_PERMISSION_OPTIONS } from "../constants/dmsConfig";
import { getDmsPermissionRank, getPermissionLabelKey, parsePermissionName } from "../utils/dmsShareUtils";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ShareModal = ({ show, target, onHide, onSubmit, onManageAccess, canManageAccess = false, canSuggestRecipients = false, maxPermissionRank = 5, canDelegateReshare = false }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const inputRef = useRef(null);

  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [teamEmails, setTeamEmails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      permission: DMS_PERMISSION_NAMES.View,
      canReshare: false,
    },
  });

  const isFolderTarget = target?.itemType === "folder" && target?.folderID;
  const isDocumentTarget =
    target?.itemType === "document" && (target?.documentId || target?.id);
  const isShareTarget = isFolderTarget || isDocumentTarget;
  const ownEmail = String(user?.emailID || user?.EmailID || "").trim().toLowerCase();
  const availablePermissionOptions = DMS_PERMISSION_OPTIONS.filter(
    (permission) => getDmsPermissionRank(permission) <= maxPermissionRank
  );
  const selectedPermission = watch("permission");
  const isFullControlSelected =
    parsePermissionName(selectedPermission) === DMS_PERMISSION_NAMES.FullControl;

  useEffect(() => {
    if (!isFullControlSelected) {
      setValue("canReshare", false);
    }
  }, [isFullControlSelected, setValue]);

  useEffect(() => {
    if (show) {
      setEmails([]);
      setEmailInput("");
      setEmailError("");
      setSuggestions([]);
      reset({
        permission: DMS_PERMISSION_NAMES.View,
        canReshare: false,
      });
      if (canSuggestRecipients) {
        fetchTeam();
      } else {
        setTeamEmails([]);
      }
    }
  }, [show, user?.AccountID, canSuggestRecipients, reset]);

  useEffect(() => {
    if (emailInput.trim()) {
      const q = emailInput.trim().toLowerCase();
      const filtered = teamEmails.filter(
        (e) =>
          e.toLowerCase().includes(q) &&
          e.toLowerCase() !== ownEmail &&
          !emails.some((added) => added.toLowerCase() === e.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [emailInput, teamEmails, ownEmail, emails]);

  const fetchTeam = async () => {
    if (!user?.AccountID) return;
    try {
      const res = await userService.getAppUserTeam(user.AccountID);
      setTeamEmails(res.data.response.map((m) => m.emailID));
    } catch {
      setTeamEmails([]);
    }
  };

  const addEmail = (raw) => {
    const trimmed = String(raw || "").trim().toLowerCase();
    if (!trimmed) return false;
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(t("DMS.invalidEmail"));
      return false;
    }
    if (trimmed === ownEmail) {
      setEmailError(t("DMS.cannotShareWithYourself"));
      return false;
    }
    if (emails.some((e) => e.toLowerCase() === trimmed)) {
      setEmailError(t("Folder.emailAlreadyAdded", "This email is already added"));
      return false;
    }
    setEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
    setEmailError("");
    setShowSuggestions(false);
    return true;
  };

  const removeEmail = (emailToRemove) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(emailInput);
    } else if (e.key === "Backspace" && !emailInput && emails.length > 0) {
      e.preventDefault();
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addEmail(val.slice(0, -1));
    } else {
      setEmailInput(val);
      setEmailError("");
    }
  };

  const handleSuggestionSelect = (selectedEmail) => {
    addEmail(selectedEmail);
    inputRef.current?.focus();
  };

  const onFormSubmit = async (data) => {
    let finalEmails = [...emails];
    if (emailInput.trim()) {
      const trimmed = emailInput.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmed)) {
        setEmailError(t("DMS.invalidEmail"));
        return;
      }
      if (trimmed === ownEmail) {
        setEmailError(t("DMS.cannotShareWithYourself"));
        return;
      }
      if (!finalEmails.some((e) => e.toLowerCase() === trimmed)) {
        finalEmails.push(trimmed);
      }
    }

    if (finalEmails.length === 0) {
      setEmailError(t("DMS.addAtLeastOneEmail"));
      return;
    }

    setSubmitLoading(true);
    try {
      await onSubmit(finalEmails, {
        permission: parsePermissionName(data.permission),
        canReshare: data.canReshare,
      });
      setEmails([]);
      setEmailInput("");
    } catch {
      // interceptor may toast
    } finally {
      setSubmitLoading(false);
      onHide();
    }
  };

  const handleOpenManageAccess = () => {
    onHide();
    onManageAccess?.(target);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      backdrop="static"
      keyboard={false}
      dialogClassName="dms-dialog-compact dms-share-invite-modal"
    >
      <Modal.Header closeButton className="pb-2">
        <div className="header-content">
          <div className="header-icon">
            <Icons.Share size={22} />
          </div>
          <div className="header-text">
            <Modal.Title>
              {isFolderTarget ? t("DMS.inviteToFolder") : t("DMS.shareDocument")}
            </Modal.Title>
            <p className="header-subtitle">
              {isFolderTarget
                ? t("DMS.inviteSubtitle", "Collaborate and grant access to this folder")
                : t("DMS.shareSubtitle", "Share document with colleagues or team members")}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body className="px-4 py-3">
          <div className="dms-target-preview-card">
            <div className="dms-target-preview-icon">
              {isFolderTarget ? (
                <Icons.FoldersFill size={22} className="text-[var(--modern-violet)]" />
              ) : (
                <Icons.DocumentReport size={22} className="text-[var(--modern-violet)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="dms-target-preview-type">
                {isFolderTarget ? t("DMS.folder") : t("DMS.document")}
              </div>
              <strong className="dms-target-preview-name" title={target?.name}>
                {target?.name ||
                  (isFolderTarget
                    ? t("DMS.untitledFolder")
                    : t("DMS.untitledDocument"))}
              </strong>
            </div>
          </div>

          {isShareTarget && canManageAccess && onManageAccess ? (
            <div className="dms-share-manage-access-wrap mb-3">
              <button
                type="button"
                className="dms-share-manage-access-link"
                onClick={handleOpenManageAccess}
              >
                <Icons.Lock size={14} className="me-1 inline" />
                <span>{t("DMS.viewPeopleWithAccess")}</span>
              </button>
            </div>
          ) : null}

          <Form.Group className="mt-1 position-relative">
            <Form.Label>{t("DMS.inviteByEmail")}</Form.Label>

            <div
              className="email-chips-input"
              onClick={() => inputRef.current?.focus()}
            >
              {emails.map((email, idx) => (
                <span key={`${email}-${idx}`} className="email-chip">
                  <UserInitialsBadge name={email} avatarOnly className="dms-chip-avatar" />
                  <span>{email}</span>
                  <button
                    type="button"
                    className="email-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmail(email);
                    }}
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                ref={inputRef}
                className="email-chip-input"
                type="email"
                placeholder={
                  emails.length === 0
                    ? t("Folder.selectEmailPlaceholder", "Add email address...")
                    : ""
                }
                value={emailInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>

            {emailError ? (
              <span className="text-danger mt-1 d-block" style={{ fontSize: 12 }}>
                {emailError}
              </span>
            ) : null}

            {showSuggestions ? (
              <div className="email-suggestions">
                {suggestions.map((e) => (
                  <div
                    key={e}
                    className="email-suggestion-item"
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      handleSuggestionSelect(e);
                    }}
                  >
                    <UserInitialsBadge name={e} />
                  </div>
                ))}
              </div>
            ) : null}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>{t("DMS.permission")}</Form.Label>
            <Form.Select className="dms-select-field" {...register("permission")}>
              {availablePermissionOptions.map((name) => (
                <option key={name} value={name}>
                  {t(getPermissionLabelKey(name))}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {(isFolderTarget || isDocumentTarget) &&
          canDelegateReshare &&
          isFullControlSelected ? (
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                id="dms-share-canReshare"
                className="dms-checkbox"
                label={t("DMS.canReshare")}
                {...register("canReshare")}
              />
            </Form.Group>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between gap-2">
          <Button
            type="button"
            variant="none"
            className="modalCancelButton"
            onClick={onHide}
            disabled={submitLoading}
          >
            {t("DMS.cancel")}
          </Button>
          <Button
            type="submit"
            variant="none"
            className="applyBtn"
            disabled={(!emails.length && !emailInput.trim()) || submitLoading}
          >
            {submitLoading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>{t("DMS.sharing", "Sharing...")}</span>
              </span>
            ) : (
              t("DMS.share")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ShareModal;
