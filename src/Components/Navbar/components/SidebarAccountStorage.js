import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineDatabase } from "react-icons/hi";
import documentService from "@/services/documentService";

const normalizeFolderSize = (payload) => {
  if (payload == null) {
    return { readableSize: "0 KB", totalSize: 0, quotaBytes: null };
  }
  if (typeof payload === "object") {
    const quotaRaw =
      payload.quotaBytes ??
      payload.QuotaBytes ??
      payload.quota ??
      payload.Quota ??
      payload.maxSize ??
      payload.MaxSize ??
      payload.storageLimit ??
      payload.StorageLimit ??
      null;
    const quotaBytes =
      quotaRaw == null || quotaRaw === "" ? null : Number(quotaRaw);

    return {
      readableSize: payload.readableSize || payload.ReadableSize || "0 KB",
      totalSize: Number(
        payload.totalSize ??
          payload.TotalSize ??
          payload.totalBytes ??
          payload.TotalBytes ??
          0
      ),
      quotaBytes: Number.isFinite(quotaBytes) && quotaBytes > 0 ? quotaBytes : null,
    };
  }
  return { readableSize: String(payload), totalSize: 0, quotaBytes: null };
};

const SidebarAccountStorage = ({ accountId, isOpen }) => {
  const { t } = useTranslation();
  const [folderSize, setFolderSize] = useState({
    readableSize: "—",
    totalSize: 0,
    quotaBytes: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    let mounted = true;
    const fetchSize = async () => {
      setLoading(true);
      try {
      const response = await documentService.getAccountFolderSize(accountId, {
        suppressGlobalErrorToast: true,
      });
        if (!mounted) return;
        if (response?.data?.statusCode === "1") {
          setFolderSize(normalizeFolderSize(response.data.response));
        } else {
          setFolderSize({ readableSize: "0 KB", totalSize: 0, quotaBytes: null });
        }
      } catch {
        if (mounted) {
          setFolderSize({ readableSize: "0 KB", totalSize: 0, quotaBytes: null });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSize();
    return () => {
      mounted = false;
    };
  }, [accountId]);

  const displaySize = loading ? "…" : folderSize.readableSize || "0 KB";
  const usedBytes = Number(folderSize.totalSize) || 0;
  const quotaBytes = folderSize.quotaBytes;
  const hasQuota = Number.isFinite(quotaBytes) && quotaBytes > 0;
  const usagePercent = hasQuota
    ? Math.min(100, Math.max(0, (usedBytes / quotaBytes) * 100))
    : null;

  return (
    <div
      className={`sidebar-storage${isOpen ? "" : " sidebar-storage--collapsed"}`}
      title={displaySize}
    >
      <div className="sidebar-storage-content" aria-hidden={!isOpen}>
        <div className="sidebar-storage-row">
          <span>{t("Sidebar.accountStorage")}</span>
          <strong>{displaySize}</strong>
        </div>
        {hasQuota ? (
          <div className="sidebar-storage-bar">
            <span style={{ width: `${loading ? 0 : usagePercent}%` }} />
          </div>
        ) : null}
      </div>
      <div
        className="sidebar-storage-collapsed-icon"
        aria-hidden={isOpen}
      >
        <HiOutlineDatabase size={20} />
      </div>
    </div>
  );
};

export default SidebarAccountStorage;
