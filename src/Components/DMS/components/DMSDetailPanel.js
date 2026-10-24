import { Dropdown, Offcanvas, Spinner } from "@/Components/UI/shadcnCompat";
import { InsertDriveFileOutlinedIcon as InsertDriveFileOutlinedIcon } from "@/Components/UI/iconCompat";
import { PeopleOutlineIcon as PeopleOutlineIcon } from "@/Components/UI/iconCompat";
import { PersonAddAltIcon as PersonAddAltIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import FileTypeIcon from "./FileTypeIcon";
import { isDmsSignableDocument } from "../utils/dmsSignBridge";
import { getPermissionLabelKey, toSharedWithList } from "../utils/dmsShareUtils";

const getActivityText = (item, fallback) => {
  if (typeof item === "string") return item;
  const message =
    item?.message ||
    item?.description ||
    item?.activity ||
    item?.activityType ||
    item?.activityName ||
    item?.action ||
    item?.actionType ||
    item?.operation ||
    item?.event ||
    item?.type ||
    "";
  const actor =
    item?.performedBy ||
    item?.performedByName ||
    item?.performedByUser ||
    item?.createdBy ||
    item?.createdByName ||
    item?.userName ||
    item?.userEmail ||
    item?.email ||
    item?.actor ||
    "";
  return [actor, message].filter(Boolean).join(" - ") || fallback;
};

const getActivityTime = (item, locale) => {
  if (typeof item === "string") return "";
  const raw =
    item?.createdAt ||
    item?.createdOn ||
    item?.createdDate ||
    item?.createdOnFormatted ||
    item?.activityDate ||
    item?.activityOn ||
    item?.performedAt ||
    item?.performedOn ||
    item?.date ||
    item?.timestamp ||
    item?.updatedAt ||
    "";
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DMSDetailPanel = ({
  show,
  doc,
  onHide,
  onOpenDocumentView,
  onDownload,
  onSign,
  onShare,
  onMove,
  onDelete,
  showDocumentShare = true,
  canUseSignFlow = false,
  signFlowOptions = [],
  signDocumentLoading = false,
  canMoveDocument = false,
  canDeleteDocument = true,
  activities = [],
  activityLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  const showSign = Boolean(doc && canUseSignFlow && onSign && isDmsSignableDocument(doc));
  const sharedWithList = toSharedWithList(doc?.sharedWith);
  const sharedWithUser = String(doc?.sharedWithUser || sharedWithList[0] || "").trim();
  const shareDetailRows = doc?.sharedDirectly
    ? [
        ...(sharedWithUser
          ? [[t("DMS.sharedWith"), sharedWithUser]]
          : doc.sharedBy
            ? [[t("DMS.sharedBy"), doc.sharedBy]]
            : []),
        ...(doc.sharedOn ? [[t("DMS.sharedOn"), doc.sharedOn]] : []),
        ...(doc.permission
          ? [[t("DMS.permission"), t(getPermissionLabelKey(doc.permission))]]
          : []),
        ...(doc.sharedDirectly
          ? [[t("DMS.canReshare"), doc.canReshare ? t("DMS.yes") : t("DMS.no")]]
          : []),
      ]
    : [];

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      scroll={true}
      className="dms-detail-panel"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="dms-detail-title-row">
            {doc && <FileTypeIcon ext={doc.ext} size={30} />}
            <div className="dms-detail-title-text">
              <span className="dms-detail-filename">{doc?.name}</span>
            </div>
          </div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr style={{ margin: "0", borderColor: "var(--border-color)" }} />
      <Offcanvas.Body className="dms-detail-body">
        {/* Quick actions */}
        <div className="dms-detail-actions">
          <button type="button" className="dms-detail-action-btn" onClick={() => onOpenDocumentView(doc)}>
            <Icons.View size={14} /> {t("DMS.view")}
          </button>
          <button type="button" className="dms-detail-action-btn" onClick={() => onDownload(doc)}>
            <Icons.Download size={14} /> {t("DMS.download")}
          </button>
          {showDocumentShare && onShare && (
            <button
              type="button"
              className="dms-detail-action-btn"
              onClick={() => {
                onHide();
                onShare(doc);
              }}
            >
              <Icons.Share size={14} /> {t("DMS.share")}
            </button>
          )}
          {doc && canMoveDocument && onMove ? (
            <button
              type="button"
              className="dms-detail-action-btn"
              onClick={() => {
                onHide();
                onMove(doc);
              }}
            >
              <Icons.Folders size={14} /> {t("DMS.moveDocument")}
            </button>
          ) : null}
          {canDeleteDocument ? (
            <button
              type="button"
              className="dms-detail-action-btn dms-action-danger"
              onClick={() => {
                onHide();
                onDelete(doc);
              }}
            >
              <Icons.DeleteAction size={14} /> {t("DMS.delete")}
            </button>
          ) : null}
          {showSign ? (
            <Dropdown className="dms-detail-sign-dropdown">
              <Dropdown.Toggle
                type="button"
                variant="none"
                className="dms-detail-action-btn dms-detail-action-btn-primary"
                disabled={signDocumentLoading}
              >
                <Icons.Upload size={14} /> {t("dashboardCardStatuses.SignDoc")}
              </Dropdown.Toggle>
              <Dropdown.Menu align="start">
                {signFlowOptions.map((option) => (
                  <Dropdown.Item
                    key={option.mode}
                    disabled={signDocumentLoading}
                    onClick={() => onSign(doc, option.mode)}
                  >
                    {option.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : null}
        </div>

        {/* Open viewer — document preview opens in a separate fullscreen modal */}
        <div className="dms-detail-viewer-cta">
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 44, color: "var(--border-color)" }} />
          <span>{t("DMS.clickToPreview")}</span>
          <button type="button" className="dms-preview-open-btn" onClick={() => onOpenDocumentView(doc)}>
            {t("DMS.openDocument")}
          </button>
        </div>

        {/* Details */}
        <div className="dms-detail-section">
          <div className="dms-detail-section-title">{t("DMS.details")}</div>
          {[
            [t("DMS.fileSize"), doc?.size],
            [t("DMS.fileType"), doc?.ext],
            [t("DMS.modified"), doc?.modified],
            [t("DMS.owner"), doc?.owner],
            ...(doc?.folderPath ? [[t("DMS.folderPath"), doc.folderPath]] : []),
            ...shareDetailRows,
            ...(doc?.notificationDate ? [[t("DMS.notificationDate"), doc.notificationDate]] : []),
            ...(doc?.notificationBeforeDays !== "" && doc?.notificationBeforeDays != null
              ? [[t("DMS.notificationBeforeDays"), doc.notificationBeforeDays]]
              : []),
          ].map(([key, val]) => (
            <div key={key} className="dms-detail-row">
              <span className="dms-detail-key">{key}</span>
              <span className="dms-detail-val" title={val}>
                {val}
              </span>
            </div>
          ))}
          {doc?.tags && (
            <div className="dms-detail-row" style={{ alignItems: "flex-start" }}>
              <span className="dms-detail-key">{t("DMS.tags")}</span>
              <div className="dms-detail-tags">
                {doc.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag} className="dms-tag-chip">
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {doc?.description && (
            <div className="dms-detail-description">
              <span className="dms-detail-key">{t("DMS.description")}</span>
              <p className="dms-detail-description-text">{doc.description}</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="dms-detail-section">
          <div className="dms-detail-section-title">
            <Icons.InfoOutline size={13} /> {t("DMS.documentActivity")}
          </div>
          {activityLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner animation="border" size="sm" />
              <span>{t("DMS.loadingActivity")}</span>
            </div>
          ) : activities.length ? (
            <div className="d-flex flex-column gap-3">
              {activities.map((item, index) => {
                const time = getActivityTime(item, locale);
                return (
                  <div key={item?.id ?? item?.activityId ?? index} className="dms-activity-item">
                    <span className="dms-activity-dot completed" />
                    <div>
                      <span className="dms-activity-text">
                        {getActivityText(item, t("DMS.documentActivity"))}
                      </span>
                      {time ? <span className="dms-activity-time">{time}</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="dms-detail-empty">{t("DMS.noDocumentActivity")}</span>
          )}
        </div>

        {/* Shared With */}
        <div className="dms-detail-section">
          <div className="dms-detail-section-title">
            <PeopleOutlineIcon sx={{ fontSize: 13 }} /> {t("DMS.sharedWith")}
          </div>
          {sharedWithList.length > 0 ? (
            sharedWithList.map((email) => (
              <div key={email} className="dms-shared-user">
                <div className="dms-avatar">{email[0].toUpperCase()}</div>
                <span>{email}</span>
              </div>
            ))
          ) : (
            <span className="dms-detail-empty">{t("DMS.notSharedWithAnyone")}</span>
          )}
          {showDocumentShare && onShare && (
            <button
              type="button"
              className="dms-add-share-btn"
              onClick={() => {
                onHide();
                onShare(doc);
              }}
            >
              <PersonAddAltIcon sx={{ fontSize: 13 }} /> {t("DMS.shareWithOthers")}
            </button>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default DMSDetailPanel;
