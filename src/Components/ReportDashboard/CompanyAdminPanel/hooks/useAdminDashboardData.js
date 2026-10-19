import { useEffect, useMemo, useState } from "react";
import documentService from "@/services/documentService";
import userService from "@/services/userService";

const DOC_CONFIG = [
  { key: "completedCount", labelKey: "UserDocs.completeDocs", color: "#0f8f95" },
  { key: "pendingCount", labelKey: "UserDocs.pendingDocs", color: "#5ec8a8" },
  { key: "draftCount", labelKey: "UserDocs.DraftDocs", color: "#e8a838" },
  { key: "sharedCount", labelKey: "UserDocs.ShareDocs", color: "#4b8fe8" },
  { key: "declineCount", labelKey: "UserDocs.declineDocs", color: "#e25555" },
  { key: "recalledCount", labelKey: "UserDocs.recallDocs", color: "#8b6fd4" },
  { key: "inActiveCount", labelKey: "UserDocs.inactiveDocs", color: "#94a3b8" },
];

const ROLE_LABELS = {
  1: "UserDocs.activeAdmins",
  2: "UserDocs.activeAppUsers",
  3: "UserDocs.activeViewers",
};
const ROLE_NAMES = {
  1: "Admin",
  2: "App User",
  3: "Viewer",
};

const normalizeFolderSize = (payload) => {
  if (payload == null) {
    return { readableSize: "0 KB", totalSize: null, quotaBytes: null };
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
      totalSize:
        payload.totalSize ??
        payload.TotalSize ??
        payload.totalBytes ??
        payload.TotalBytes ??
        null,
      quotaBytes: Number.isFinite(quotaBytes) && quotaBytes > 0 ? quotaBytes : null,
    };
  }
  return { readableSize: String(payload), totalSize: null, quotaBytes: null };
};

export const getDefaultLifecycleDateRange = () => ({
  fromDate: "",
  toDate: "",
});

const mapDocCountsToMetrics = (counts, t) =>
  DOC_CONFIG.map((item) => ({
    ...item,
    label: t(item.labelKey),
    value: Number(counts?.[item.key] || 0),
  }));

export const useAdminDashboardData = ({ accountId, t, fromDate, toDate }) => {
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [docCounts, setDocCounts] = useState({});
  const [lifecycleDocCounts, setLifecycleDocCounts] = useState({});
  const [folderSize, setFolderSize] = useState({
    readableSize: "0 KB",
    totalSize: null,
    quotaBytes: null,
  });
  const [team, setTeam] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Team / storage / departments / account-wide KPIs (no date filters)
  useEffect(() => {
    if (!accountId) return;

    let mounted = true;
    const fetchBase = async () => {
      setLoading(true);
      setErrorKey("");
      const quietRequest = { suppressGlobalErrorToast: true };

      try {
        const [folderSizeResult, teamResult, deptResult, docsResult] = await Promise.allSettled([
          documentService.getAccountFolderSize(accountId, quietRequest),
          userService.getAppUserTeam(accountId, undefined, quietRequest),
          userService.getAccountDepartments(accountId, undefined, quietRequest),
          documentService.getAdminAllDocsCount(accountId, {}, quietRequest),
        ]);

        if (!mounted) return;

        const folderSizeRes = folderSizeResult.status === "fulfilled" ? folderSizeResult.value : null;
        const teamRes = teamResult.status === "fulfilled" ? teamResult.value : null;
        const deptRes = deptResult.status === "fulfilled" ? deptResult.value : null;
        const docsRes = docsResult.status === "fulfilled" ? docsResult.value : null;

        const folderSizeOk = folderSizeRes?.data?.statusCode === "1";
        const teamOk = teamRes?.data?.statusCode === "1";
        const deptOk = deptRes?.data?.statusCode === "1";
        const docsOk = docsRes?.data?.statusCode === "1";

        if (!folderSizeOk && !teamOk && !deptOk && !docsOk) {
          setErrorKey("adminDashboard.failedToLoad");
          return;
        }

        setFolderSize(
          folderSizeOk
            ? normalizeFolderSize(folderSizeRes.data.response)
            : { readableSize: "0 KB", totalSize: null, quotaBytes: null }
        );
        setTeam(teamOk ? teamRes.data.response || [] : []);
        setDepartments(deptOk ? deptRes.data.response || [] : []);
        setDocCounts(docsOk ? docsRes.data.response || {} : {});
      } catch (fetchError) {
        setErrorKey(fetchError?.message || "adminDashboard.failedToLoad");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBase();
    return () => {
      mounted = false;
    };
  }, [accountId]);

  // Document Lifecycle chart only — dates optional
  useEffect(() => {
    if (!accountId) return;

    let mounted = true;
    const fetchLifecycleDocs = async () => {
      setDocsLoading(true);
      try {
        const dateParams = fromDate && toDate ? { fromDate, toDate } : {};
        const docsRes = await documentService.getAdminAllDocsCount(
          accountId,
          dateParams,
          { suppressGlobalErrorToast: true }
        );

        if (!mounted) return;

        const docsOk = docsRes?.data?.statusCode === "1";
        setLifecycleDocCounts(docsOk ? docsRes.data.response || {} : {});
      } catch {
        if (mounted) setLifecycleDocCounts({});
      } finally {
        if (mounted) setDocsLoading(false);
      }
    };

    fetchLifecycleDocs();
    return () => {
      mounted = false;
    };
  }, [accountId, fromDate, toDate]);

  const error = errorKey
    ? errorKey.startsWith("adminDashboard.")
      ? t(errorKey)
      : errorKey
    : "";

  const documentMetrics = useMemo(
    () => mapDocCountsToMetrics(docCounts, t),
    [docCounts, t]
  );

  const lifecycleDocumentMetrics = useMemo(
    () => mapDocCountsToMetrics(lifecycleDocCounts, t),
    [lifecycleDocCounts, t]
  );

  const totalDocuments = useMemo(
    () => documentMetrics.reduce((sum, item) => sum + item.value, 0),
    [documentMetrics]
  );

  const roleSummary = useMemo(() => {
    const counts = {
      activeAdmins: 0,
      activeAppUsers: 0,
      activeViewers: 0,
      inactiveUsers: 0,
    };

    team.forEach((member) => {
      const roleLabelKey = ROLE_LABELS[member.roleID];
      if (member.isActive && roleLabelKey) {
        const key = roleLabelKey.split(".")[1];
        counts[key] += 1;
      }
      if (!member.isActive) counts.inactiveUsers += 1;
    });

    return counts;
  }, [team]);

  const userMetrics = useMemo(
    () => [
      { label: t("UserDocs.totalUsers"), value: team.length, color: "#007bff" },
      { label: t("UserDocs.activeAdmins"), value: roleSummary.activeAdmins, color: "#19d157" },
      { label: t("UserDocs.activeAppUsers"), value: roleSummary.activeAppUsers, color: "#43a6e4" },
      { label: t("UserDocs.activeViewers"), value: roleSummary.activeViewers, color: "#62c2ce" },
      { label: t("adminDashboard.inactiveUsers"), value: roleSummary.inactiveUsers, color: "#dc3545" },
    ],
    [roleSummary, t, team.length]
  );

  const departmentMetrics = useMemo(() => {
    const counters = {};

    team.forEach((member) => {
      const rawName = member.department?.trim();
      const depName = rawName || "__unassigned__";
      counters[depName] = (counters[depName] || 0) + 1;
    });

    departments.forEach((dep) => {
      const depName = dep?.title?.trim();
      if (depName && !counters[depName]) counters[depName] = 0;
    });

    return Object.entries(counters)
      .map(([name, count]) => ({
        name: name === "__unassigned__" ? t("adminDashboard.unassignedDepartment") : name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [departments, t, team]);

  const roleBreakdown = useMemo(() => {
    const counter = {
      Admin: { labelKey: "UserDocs.activeAdmins", active: 0, inactive: 0 },
      AppUser: { labelKey: "UserDocs.activeAppUsers", active: 0, inactive: 0 },
      Viewer: { labelKey: "UserDocs.activeViewers", active: 0, inactive: 0 },
    };

    const roleKeyById = {
      1: "Admin",
      2: "AppUser",
      3: "Viewer",
    };

    team.forEach((member) => {
      const key = roleKeyById[member.roleID];
      if (!key) return;
      if (member.isActive) counter[key].active += 1;
      else counter[key].inactive += 1;
    });

    const rows = Object.values(counter);
    return {
      categories: rows.map((item) => t(item.labelKey)),
      active: rows.map((item) => item.active),
      inactive: rows.map((item) => item.inactive),
    };
  }, [t, team]);

  const mostActiveUsers = useMemo(() => {
    return [...team]
      .filter((member) => Boolean(member?.isActive))
      .sort((a, b) => {
        const aTime = Date.parse(a?.createdOn || a?.createdOnFormatted || "") || 0;
        const bTime = Date.parse(b?.createdOn || b?.createdOnFormatted || "") || 0;
        return bTime - aTime;
      })
      .slice(0, 6)
      .map((member) => ({
        name: member?.fullName || member?.emailID || t("adminDashboard.unknownUser"),
        role:
          member?.roleNameEn ||
          ROLE_NAMES[member?.roleID] ||
          t("adminDashboard.unknownRole"),
        isActive: true,
        lastActivity:
          member?.createdOnFormatted || t("adminDashboard.recentlyActive"),
      }));
  }, [t, team]);

  return {
    loading,
    docsLoading,
    error,
    hasAnyData:
      totalDocuments > 0 ||
      team.length > 0 ||
      departmentMetrics.length > 0 ||
      Boolean(folderSize?.readableSize && folderSize.readableSize !== "0 KB"),
    documentMetrics,
    lifecycleDocumentMetrics,
    totalDocuments,
    folderSize,
    userMetrics,
    departmentMetrics,
    roleBreakdown,
    mostActiveUsers,
  };
};
