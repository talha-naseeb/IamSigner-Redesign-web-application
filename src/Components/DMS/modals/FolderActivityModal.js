import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";

const ACTIVITY_PAGE_SIZE = 5;

const getActivityText = (item, fallback) => {
  if (typeof item === "string") return item;
  const message =
    item?.message ||
    item?.description ||
    item?.activity ||
    item?.action ||
    item?.event ||
    item?.type ||
    "";
  return message || fallback;
};

const getActivityDetails = (item) => {
  if (typeof item === "string") return "";
  return item?.details || item?.detail || item?.description || item?.message || "";
};

const getActivityActor = (item) => {
  if (typeof item === "string") return "";
  return (
    item?.performedBy ||
    item?.performedByName ||
    item?.performedByUser ||
    item?.createdBy ||
    item?.createdByName ||
    item?.userName ||
    item?.userEmail ||
    item?.actor ||
    ""
  );
};

const getActionClassName = (action) => {
  const normalized = String(action || "").toLowerCase();
  if (normalized.includes("create")) return "created";
  if (normalized.includes("update") || normalized.includes("edit")) return "updated";
  if (normalized.includes("delete") || normalized.includes("remove")) return "deleted";
  return "default";
};

const getActivityTime = (item, locale) => {
  if (typeof item === "string") return "";
  const raw = getActivityTimestamp(item);
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

const getActivityTimestamp = (item) => {
  if (typeof item === "string") return "";
  const raw =
    item?.performedOn ||
    item?.performedAt ||
    item?.createdAt ||
    item?.createdOn ||
    item?.createdOnFormatted ||
    item?.activityDate ||
    item?.date ||
    item?.timestamp ||
    item?.updatedAt ||
    "";
  return raw;
};

const getActivityTimestampMs = (item) => {
  const raw = getActivityTimestamp(item);
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const FolderActivityModal = ({ show, folder, activities = [], loading = false, onHide }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  const [page, setPage] = useState(1);
  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => getActivityTimestampMs(b) - getActivityTimestampMs(a)),
    [activities]
  );
  const totalPages = Math.max(1, Math.ceil(sortedActivities.length / ACTIVITY_PAGE_SIZE));
  const visibleActivities = sortedActivities.slice(
    (page - 1) * ACTIVITY_PAGE_SIZE,
    page * ACTIVITY_PAGE_SIZE
  );
  const startItem = sortedActivities.length ? (page - 1) * ACTIVITY_PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * ACTIVITY_PAGE_SIZE, sortedActivities.length);

  useEffect(() => {
    setPage(1);
  }, [show, activities]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={!loading}
      dialogClassName="custom-modal-width"
    >
      <Modal.Header closeButton={!loading} className="pb-2">
        <div className="header-content">
          <div className="header-icon">
            <Icons.InfoOutline size={22} />
          </div>
          <div className="header-text">
            <Modal.Title>{t("DMS.folderActivity")}</Modal.Title>
            {folder?.name ? <p className="header-subtitle">{folder.name}</p> : null}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center gap-2 py-4 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t("DMS.loadingActivity")}</span>
          </div>
        ) : sortedActivities.length ? (
          <>
            <div className="dms-folder-activity-list">
              {visibleActivities.map((item, index) => {
              const action = getActivityText(item, t("DMS.folderActivity"));
              const details = getActivityDetails(item);
              const actor = getActivityActor(item);
              const time = getActivityTime(item, locale);
              return (
                <div key={item?.id ?? item?.activityId ?? index} className="dms-folder-activity-card">
                  <div className="dms-folder-activity-marker">
                    <span className={`dms-folder-activity-badge ${getActionClassName(action)}`}>
                      {action}
                    </span>
                  </div>
                  <div className="dms-folder-activity-content">
                    {details ? <p className="dms-folder-activity-details">{details}</p> : null}
                    <div className="dms-folder-activity-meta">
                      {actor ? (
                        <span title={actor}>
                          <strong>{t("DMS.performedBy")}:</strong> {actor}
                        </span>
                      ) : null}
                      {actor && time ? <span className="dms-folder-activity-separator">•</span> : null}
                      {time ? <span>{time}</span> : null}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
            {totalPages > 1 ? (
              <div className="dms-folder-activity-pagination">
                <span>
                  {t("DMS.showingActivityRange", {
                    start: startItem,
                    end: endItem,
                    total: sortedActivities.length,
                  })}
                </span>
                <div className="dms-folder-activity-page-actions">
                  <Button
                    type="button"
                    variant="none"
                    className="dms-folder-activity-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {t("DMS.previous")}
                  </Button>
                  <span className="dms-folder-activity-page-count">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="none"
                    className="dms-folder-activity-page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    {t("DMS.next")}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center text-muted py-4">
            <Icons.InfoOutline size={34} className="mb-2" />
            <p className="mb-0">{t("DMS.noFolderActivity")}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-end">
        <Button type="button" variant="none" className="applyBtn w-auto px-4" onClick={onHide}>
          {t("DMS.done")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FolderActivityModal;
