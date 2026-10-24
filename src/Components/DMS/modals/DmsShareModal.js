import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Form, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";
import { DMS_PERMISSION_NAMES, DMS_PERMISSION_OPTIONS } from "../constants/dmsConfig";
import { getDmsPermissionRank, getPermissionLabelKey, parsePermissionName } from "../utils/dmsShareUtils";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ShareModal = ({ show, target, onHide, onSubmit, onManageAccess, canManageAccess = false, canSuggestRecipients = false, maxPermissionRank = 5, canDelegateReshare = false }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const inputRef = useRef(null);

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
      const filtered = teamEmails.filter(
        (e) =>
          e.toLowerCase().includes(emailInput.toLowerCase()) &&
          e.toLowerCase() !== ownEmail
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [emailInput, teamEmails, ownEmail]);

  const fetchTeam = async () => {
    if (!user?.AccountID) return;
    try {
      const res = await userService.getAppUserTeam(user.AccountID);
      setTeamEmails(res.data.response.map((m) => m.emailID));
    } catch {
      setTeamEmails([]);
    }
  };

  const validateEmail = (raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) {
      setEmailError(t("DMS.addAtLeastOneEmail"));
      return null;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(t("DMS.invalidEmail"));
      return null;
    }
    if (trimmed.toLowerCase() === ownEmail) {
      setEmailError(t("DMS.cannotShareWithYourself"));
      return null;
    }
    setEmailError("");
    return trimmed;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.form?.requestSubmit();
    }
  };

  const handleInputChange = (e) => {
    setEmailInput(e.target.value);
    setEmailError("");
  };

  const onFormSubmit = async (data) => {
    const email = validateEmail(emailInput);
    if (!email) return;

    setSubmitLoading(true);
    try {
      await onSubmit([email], {
        permission: parsePermissionName(data.permission),
        canReshare: data.canReshare,
      });
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
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal-width dms-share-invite-modal"
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
            {target?.name && <p className="header-subtitle">{target.name}</p>}
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body className="px-4 py-3">
          {isShareTarget && canManageAccess && onManageAccess ? (
            <button
              type="button"
              className="dms-share-manage-access-link"
              onClick={handleOpenManageAccess}
            >
              {t("DMS.viewPeopleWithAccess")}
            </button>
          ) : null}

          <Form.Group className="mt-1 position-relative">
            <Form.Label>{t("DMS.inviteByEmail")}</Form.Label>

            <input
              ref={inputRef}
              className="form-control"
              type="email"
              placeholder={t("DMS.emailPlaceholder")}
              value={emailInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />

            {emailError ? (
              <span className="text-danger" style={{ fontSize: 12 }}>
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
                      setEmailInput(e);
                      setEmailError("");
                      setShowSuggestions(false);
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>
            ) : null}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>{t("DMS.permission")}</Form.Label>
            <Form.Select {...register("permission")}>
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
                label={t("DMS.canReshare")}
                {...register("canReshare")}
              />
            </Form.Group>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="mt-2 d-flex justify-content-between">
          <Button type="button" variant="none" className="modalCancelButton" onClick={onHide}>
            {t("DMS.cancel")}
          </Button>
          <Button
            type="submit"
            variant="none"
            className="applyBtn"
            disabled={!emailInput.trim() || submitLoading}
          >
            {submitLoading ? <Spinner animation="border" size="sm" /> : t("DMS.share")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ShareModal;
