import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Offcanvas, Button, Form, Spinner } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import userService from "@/services/userService";
import { DMS_PERMISSION_NAMES, DMS_PERMISSION_OPTIONS } from "../constants/dmsConfig";
import {
  buildDocumentShareUpdatePayload,
  buildFolderShareUpdatePayload,
  buildShareRowDraft,
  getPermissionLabelKey,
  getShareResponsePayload,
  normalizeDocumentShare,
  normalizeFolderShare,
  parsePermissionName,
  shareDraftEquals,
} from "../utils/dmsShareUtils";

const avatarInitial = (email) => {
  const s = String(email || "").trim();
  if (!s) return "?";
  return s[0].toUpperCase();
};

const FolderAccessModal = ({ show, target, folder, onHide, onInvitePeople, onSharesChanged }) => {
  const { t } = useTranslation();
  const resolvedTarget = target ?? folder;
  const isDocumentTarget = resolvedTarget?.itemType === "document";
  const resourceId = isDocumentTarget
    ? String(resolvedTarget?.documentId || resolvedTarget?.id || "")
    : resolvedTarget?.folderID
      ? String(resolvedTarget.folderID)
      : resolvedTarget?.id
        ? String(resolvedTarget.id)
        : null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingShareId, setSavingShareId] = useState(null);
  const [deletingShareId, setDeletingShareId] = useState(null);

  const { control, register, reset, getValues, setValue, watch } = useForm({
    defaultValues: { drafts: {} },
  });

  const drafts = watch("drafts");

  const loadShares = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    try {
      const res = isDocumentTarget
        ? await userService.getDocumentShares(resourceId)
        : await userService.getFolderShares(resourceId);
      const payload = getShareResponsePayload(res);
      const normalize = isDocumentTarget ? normalizeDocumentShare : normalizeFolderShare;
      const nextRows = payload.map(normalize).filter((r) => r.id);
      setRows(nextRows);
      const nextDrafts = {};
      nextRows.forEach((r) => {
        nextDrafts[r.id] = buildShareRowDraft(r);
      });
      reset({ drafts: nextDrafts });
    } catch {
      setRows([]);
      reset({ drafts: {} });
    } finally {
      setLoading(false);
    }
  }, [resourceId, isDocumentTarget, reset]);

  useEffect(() => {
    if (show && resourceId) {
      void loadShares();
    } else if (!show) {
      setRows([]);
      reset({ drafts: {} });
      setSavingShareId(null);
      setDeletingShareId(null);
    }
  }, [show, resourceId, loadShares, reset]);

  const handleSave = async (shareId) => {
    const draft = getValues(`drafts.${shareId}`);
    const row = rows.find((r) => r.id === shareId);
    if (!draft || !row) return;
    const safeDraft = {
      ...draft,
      canReshare:
        parsePermissionName(draft.permission) === DMS_PERMISSION_NAMES.FullControl &&
        Boolean(draft.canReshare),
    };
    setSavingShareId(shareId);
    try {
      if (isDocumentTarget) {
        const payload = buildDocumentShareUpdatePayload(
          { ...row, documentId: row.documentId || resourceId },
          safeDraft
        );
        await userService.updateDocumentShare(shareId, payload);
      } else {
        const payload = buildFolderShareUpdatePayload(
          { ...row, folderId: row.folderId || resourceId },
          safeDraft
        );
        await userService.updateFolderShare(shareId, payload);
      }
      toast.success(t("DMS.shareUpdateSuccess"));
      await loadShares();
      onSharesChanged?.();
    } catch {
      // interceptor
    } finally {
      setSavingShareId(null);
    }
  };

  const handleRevoke = async (shareId) => {
    setDeletingShareId(shareId);
    try {
      if (isDocumentTarget) {
        await userService.deleteDocumentShare(shareId);
      } else {
        await userService.deleteFolderShare(shareId);
      }
      toast.success(t("DMS.shareRevokedSuccess"));
      await loadShares();
      onSharesChanged?.();
    } catch {
      // interceptor
    } finally {
      setDeletingShareId(null);
    }
  };

  const handleInvite = () => {
    onHide();
    onInvitePeople?.(resolvedTarget);
  };

  const titleKey = isDocumentTarget ? "DMS.manageDocumentAccess" : "DMS.manageFolderAccess";
  const hintKey = isDocumentTarget ? "DMS.manageDocumentAccessHint" : "DMS.manageFolderAccessHint";

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      scroll
      backdrop
      className="dms-folder-access-panel"
    >
      <Offcanvas.Header closeButton className="dms-folder-access-header">
        <div className="header-content">
          <div className="header-icon">
            <Icons.Users size={22} />
          </div>
          <div className="header-text">
            <Offcanvas.Title className="mb-0">{t(titleKey)}</Offcanvas.Title>
            {resolvedTarget?.name ? (
              <p className="header-subtitle mb-0">{resolvedTarget.name}</p>
            ) : null}
            <p className="dms-folder-access-hint mb-0">{t(hintKey)}</p>
          </div>
        </div>
      </Offcanvas.Header>

      <hr className="my-0 opacity-25" />

      <Offcanvas.Body className="dms-folder-access-body">
        {loading ? (
          <div className="dms-folder-access-loading">
            <Spinner animation="border" size="sm" />
            <span>{t("DMS.loadingShares")}</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="dms-folder-access-empty">
            <Icons.Users size={48} style={{ opacity: 0.35 }} />
            <p className="dms-folder-access-empty-title">{t("DMS.accessEmptyTitle")}</p>
            <p className="dms-folder-access-empty-hint">{t("DMS.accessEmptyHint")}</p>
            <Button size="sm" className="dms-upload-btn mt-2 d-inline-flex align-items-center gap-1" onClick={handleInvite}>
              <Icons.Users size={15} />
              {t("DMS.invitePeople")}
            </Button>
          </div>
        ) : (
          <ul className="dms-access-list list-unstyled mb-0">
            {rows.map((row) => {
              const draft = drafts?.[row.id] || buildShareRowDraft(row);
              const isDirty = !shareDraftEquals(draft, row);
              const isSaving = savingShareId === row.id;
              const isRevoking = deletingShareId === row.id;
              const isFullControl =
                parsePermissionName(draft.permission) === DMS_PERMISSION_NAMES.FullControl;
              const permissionField = register(`drafts.${row.id}.permission`);

              return (
                <li key={row.id} className="dms-access-card">
                  <div className="dms-access-card-top">
                    <div className="dms-access-avatar" aria-hidden>
                      {avatarInitial(row.sharedWithUser)}
                    </div>
                    <div className="dms-access-identity">
                      <span className="dms-access-email" title={row.sharedWithUser}>
                        {row.sharedWithUser}
                      </span>
                    </div>
                  </div>

                  <div className="dms-access-fields">
                    <Form.Group className="mb-2">
                      <Form.Label className="dms-access-field-label">
                        {t("DMS.permission")}
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        disabled={isSaving || isRevoking}
                        {...permissionField}
                        onChange={(event) => {
                          permissionField.onChange(event);
                          if (
                            parsePermissionName(event.target.value) !==
                            DMS_PERMISSION_NAMES.FullControl
                          ) {
                            setValue(`drafts.${row.id}.canReshare`, false, {
                              shouldDirty: true,
                            });
                          }
                        }}
                      >
                        {DMS_PERMISSION_OPTIONS.map((name) => (
                          <option key={name} value={name}>
                            {t(getPermissionLabelKey(name))}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {isFullControl ? <Form.Group className="mb-2">
                      <Controller
                        name={`drafts.${row.id}.canReshare`}
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="checkbox"
                            id={`dms-access-reshare-${row.id}`}
                            className="dms-access-reshare-check"
                            label={t("DMS.canReshare")}
                            checked={Boolean(field.value)}
                            disabled={isSaving || isRevoking}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </Form.Group> : null}
                  </div>

                  <div className="dms-access-card-actions justify-content-end">
                    <Button
                      size="sm"
                      variant="none"
                      className="applyBtn w-auto px-3"
                      disabled={!isDirty || isSaving || isRevoking}
                      onClick={() => void handleSave(row.id)}
                    >
                      {isSaving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        t("DMS.save")
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="none"
                      className="modalCancelButton w-auto px-3"
                      disabled={isSaving || isRevoking}
                      onClick={() => void handleRevoke(row.id)}
                    >
                      {isRevoking ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        t("DMS.revokeShare")
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Offcanvas.Body>

      {!loading && rows.length > 0 ? (
        <div className="dms-folder-access-footer">
          <Button variant="none" size="sm" className="modalCancelButton w-auto px-3 d-inline-flex align-items-center gap-1" onClick={handleInvite}>
            <Icons.Users size={15} />
            {t("DMS.invitePeople")}
          </Button>
          <Button size="sm" variant="none" className="applyBtn w-auto px-3" onClick={onHide}>
            {t("DMS.done")}
          </Button>
        </div>
      ) : null}
    </Offcanvas>
  );
};

export default FolderAccessModal;
