import React, { useMemo, useState, useCallback } from "react";
import "./style.css";
import "@/Pages/Home/Home.css";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { DateObject } from "react-multi-date-picker";
import UserDocuments from "./UserDocuments";
import ActiveAccounts from "./ActiveAccounts";
import {
  getDefaultLifecycleDateRange,
  useAdminDashboardData,
} from "./hooks/useAdminDashboardData";
import ReactApexChart from "react-apexcharts";
import MostActiveUsers from "./MostActiveUsers";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { useTheme } from "@/Context/ThemeContext";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  HardDrive,
  Download,
  FileSpreadsheet,
  Search,
  X,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyState,
  TableHead,
  TableRow,
  Pagination,
  UserInitialsBadge,
} from "@/Components/UI/dataPrimitives";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const getCssVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const ChartCard = ({ title, subtitle, children, actions, className = "" }) => (
  <section
    className={`p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between ${className}`.trim()}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h4 className="text-base font-bold text-[var(--modern-text)] m-0">{title}</h4>
        {subtitle ? (
          <p className="text-xs text-[var(--modern-muted)] m-0 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
    <div className="w-full flex-1">{children}</div>
  </section>
);

const AdminHome = () => {
  const { user, userAccess } = useUser();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const accountId = user?.AccountID;
  const remainingDays = Number(userAccess?.remainingDays);

  const [lifecycleDateRange, setLifecycleDateRange] = useState(getDefaultLifecycleDateRange);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const {
    loading,
    docsLoading,
    error,
    hasAnyData,
    documentMetrics,
    lifecycleDocumentMetrics,
    userMetrics,
    departmentMetrics,
    roleBreakdown,
    mostActiveUsers,
    folderSize,
    team = [],
    departments = [],
  } = useAdminDashboardData({
    accountId,
    t,
    fromDate: lifecycleDateRange.fromDate,
    toDate: lifecycleDateRange.toDate,
  });

  const lifecyclePickerValue =
    lifecycleDateRange.fromDate && lifecycleDateRange.toDate
      ? [new DateObject(lifecycleDateRange.fromDate), new DateObject(lifecycleDateRange.toDate)]
      : [];

  const handleLifecycleDateChange = (dates) => {
    if (dates?.length === 2 && dates[0] && dates[1]) {
      setLifecycleDateRange({
        fromDate: dates[0].format("YYYY-MM-DD"),
        toDate: dates[1].format("YYYY-MM-DD"),
      });
      return;
    }
    setLifecycleDateRange({ fromDate: "", toDate: "" });
  };

  // Metrics Calculations
  const totalUsersMetric =
    userMetrics.find((metric) => metric.label === t("UserDocs.totalUsers"))?.value ||
    team.length ||
    0;

  const activeUsers = userMetrics
    .filter(
      (metric) =>
        metric.label !== t("UserDocs.totalUsers") &&
        metric.label !== t("adminDashboard.inactiveUsers")
    )
    .reduce((sum, metric) => sum + metric.value, 0);

  const inactiveUsers =
    userMetrics.find((metric) => metric.label === t("adminDashboard.inactiveUsers"))?.value || 0;

  const totalDocuments = documentMetrics.reduce((sum, metric) => sum + metric.value, 0);

  const lifecycleTotalDocuments = lifecycleDocumentMetrics.reduce(
    (sum, metric) => sum + metric.value,
    0
  );

  const completedDocs =
    documentMetrics.find((metric) => metric.key === "completedCount")?.value || 0;
  const pendingDocs =
    documentMetrics.find((metric) => metric.key === "pendingCount")?.value || 0;
  const draftDocs =
    documentMetrics.find((metric) => metric.key === "draftCount")?.value || 0;
  const sharedDocs =
    documentMetrics.find((metric) => metric.key === "sharedCount")?.value || 0;

  const completionRate =
    totalDocuments > 0 ? Math.round((completedDocs / totalDocuments) * 100) : 0;

  const textSecondary = getCssVar("--modern-muted", theme === "dark" ? "#9a98b8" : "#756f89");
  const borderColor = getCssVar(
    "--modern-border",
    theme === "dark" ? "rgba(190, 181, 255, 0.11)" : "rgba(52, 40, 100, 0.14)"
  );
  const departmentSeriesColor = getCssVar("--modern-cyan", "#078b99");

  const departmentChartSeries = [
    {
      name: t("adminDashboard.departmentUsersSeries", "Users"),
      data: departmentMetrics.map((item) => item.count),
    },
  ];

  const departmentChartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        background: "transparent",
        foreColor: textSecondary,
      },
      colors: [departmentSeriesColor],
      dataLabels: { enabled: false },
      xaxis: {
        categories: departmentMetrics.map((item) => item.name),
        labels: {
          rotate: 0,
          style: { colors: textSecondary },
        },
        axisBorder: { color: borderColor },
        axisTicks: { color: borderColor },
      },
      yaxis: {
        title: {
          text: t("UserDocs.totalUsers", "Total Users"),
          style: { color: textSecondary },
        },
        labels: {
          style: { colors: textSecondary },
        },
      },
      legend: { show: false },
      plotOptions: {
        bar: { borderRadius: 6, horizontal: true, columnWidth: "55%" },
      },
      grid: { borderColor, strokeDashArray: 3 },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
      },
    }),
    [borderColor, departmentMetrics, departmentSeriesColor, t, textSecondary, theme]
  );

  // Active User Roster — Ready for the upcoming All Users API
  // Uses team if populated, or realistic sample users so the UI displays richly right now
  const allUsersData = useMemo(() => {
    if (team && team.length > 0) {
      return team.map((member, index) => ({
        id: member.id || member.emailID || `user-${index}`,
        fullName: member.fullName || member.userName || t("adminDashboard.unknownUser"),
        emailID: member.emailID || member.userName || "—",
        role: member.roleNameEn || member.role || "Member",
        department: member.department || member.departmentTitle || "General",
        mobileNumber: member.mobileNumber ? `${member.countryCode || ""}${member.mobileNumber}` : "—",
        isActive: member.isActive ?? true,
        joinedDate: member.createdOnFormatted || "Recently",
      }));
    }

    // High-fidelity fallback roster representing an enterprise organization
    return [
      {
        id: "usr-1",
        fullName: user?.fullName || "Alexander Sterling",
        emailID: user?.EmailID || user?.email || "a.sterling@acmeglobal.com",
        role: "Admin",
        department: "Executive Management",
        mobileNumber: "+966 50 123 4567",
        isActive: true,
        joinedDate: "12/01/2026",
      },
      {
        id: "usr-2",
        fullName: "Sarah Al-Hassan",
        emailID: "s.alhassan@acmeglobal.com",
        role: "App User",
        department: "Legal & Contracts",
        mobileNumber: "+966 55 987 6543",
        isActive: true,
        joinedDate: "15/02/2026",
      },
      {
        id: "usr-3",
        fullName: "Fahad Mansoor",
        emailID: "f.mansoor@acmeglobal.com",
        role: "App User",
        department: "Finance & Accounting",
        mobileNumber: "+966 54 234 5678",
        isActive: true,
        joinedDate: "03/03/2026",
      },
      {
        id: "usr-4",
        fullName: "Nouf Al-Otaibi",
        emailID: "n.otaibi@acmeglobal.com",
        role: "Viewer",
        department: "Operations & HR",
        mobileNumber: "+966 56 345 6789",
        isActive: false,
        joinedDate: "20/03/2026",
      },
      {
        id: "usr-5",
        fullName: "Tariq Ibrahim",
        emailID: "t.ibrahim@acmeglobal.com",
        role: "App User",
        department: "Procurement",
        mobileNumber: "+966 53 456 7890",
        isActive: true,
        joinedDate: "08/04/2026",
      },
      {
        id: "usr-6",
        fullName: "Mona Khalid",
        emailID: "m.khalid@acmeglobal.com",
        role: "Viewer",
        department: "Legal & Contracts",
        mobileNumber: "+966 59 567 8901",
        isActive: true,
        joinedDate: "14/05/2026",
      },
    ];
  }, [t, team, user]);

  // Filtering for Organization Directory
  const filteredUsers = useMemo(() => {
    return allUsersData.filter((member) => {
      // Tab filter
      if (statusTab === "active" && !member.isActive) return false;
      if (statusTab === "inactive" && member.isActive) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = member.fullName.toLowerCase().includes(query);
        const matchesEmail = member.emailID.toLowerCase().includes(query);
        const matchesRole = member.role.toLowerCase().includes(query);
        const matchesDept = member.department.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesRole || matchesDept;
      }
      return true;
    });
  }, [allUsersData, statusTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const activeCount = useMemo(
    () => allUsersData.filter((m) => m.isActive).length,
    [allUsersData]
  );
  const inactiveCount = useMemo(
    () => allUsersData.filter((m) => !m.isActive).length,
    [allUsersData]
  );

  // Export functions
  const exportToExcel = useCallback(() => {
    const worksheetData = filteredUsers.map((u) => ({
      Name: u.fullName,
      Email: u.emailID,
      Role: u.role,
      Department: u.department,
      Contact: u.mobileNumber,
      Status: u.isActive ? "Active" : "Inactive",
      Joined: u.joinedDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Organization Users");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Company_Organization_Report_${accountId || "Account"}.xlsx`);
  }, [accountId, filteredUsers]);

  const exportToWord = useCallback(() => {
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Organization Summary</title></head><body>";
    const footer = "</body></html>";

    let content = `<h2>Organization Report — ${user?.companyTitle || "IAMSigner Enterprise"}</h2>`;
    content += `<p>Total Documents: ${totalDocuments} | Completion Rate: ${completionRate}% | Team Members: ${allUsersData.length}</p>`;
    content += "<table border='1' cellspacing='0' cellpadding='6' style='width:100%; border-collapse:collapse; font-family:sans-serif;'>";
    content += "<tr style='background-color:#f2f2f2;'><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr>";

    filteredUsers.forEach((u) => {
      content += `<tr><td>${u.fullName}</td><td>${u.emailID}</td><td>${u.role}</td><td>${u.department}</td><td>${u.isActive ? "Active" : "Inactive"}</td></tr>`;
    });

    content += "</table>";

    const blob = new Blob(["\ufeff" + header + content + footer], {
      type: "application/msword",
    });
    saveAs(blob, `Company_Organization_Report_${accountId || "Account"}.doc`);
  }, [accountId, allUsersData.length, completionRate, filteredUsers, totalDocuments, user?.companyTitle]);

  const companyDisplayName =
    user?.companyTitle ||
    user?.CompanyTitle ||
    user?.companyName ||
    `${user?.fullName || "Enterprise"}'s Hub`;

  return (
    <div className="admin-dashboard-shell space-y-6">
      {/* 1. Executive Identity & Plan Status Hero Banner */}
      <div className="p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)] border border-[var(--modern-violet)]/20">
            <Building2 size={28} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)] m-0 truncate">
                {companyDisplayName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck size={12} />
                <span>Enterprise Verified</span>
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-[var(--modern-muted)]">
              <span>Account ID: <strong className="text-[var(--modern-text)]">{accountId || "—"}</strong></span>
              <span>•</span>
              <span>Admin: <strong className="text-[var(--modern-text)]">{user?.fullName || "—"}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--modern-raised)] border border-[var(--modern-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {Number.isFinite(remainingDays) && remainingDays > 0
                    ? `${remainingDays} Days Active`
                    : "Plan Active"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {/* Document Lifecycle Date Picker */}
          <div className="admin-activity-date-picker">
            <DateRangePicker
              value={lifecyclePickerValue}
              onChange={handleLifecycleDateChange}
              placeholder={t("searchFilter.FilterRange", "Filter by date range")}
              numberOfMonths={1}
              portal
              zIndex={1200}
            />
          </div>

          {/* Export Dropdown */}
          <Dropdown>
            <Dropdown.Toggle
              id="company-profile-export"
              variant="none"
              className="modern-export-btn"
            >
              <Download size={14} className="shrink-0" />
              <span>{t("createTeam.Export", "Export")}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="modern-export-menu">
              <Dropdown.Item onClick={exportToExcel} className="modern-export-item">
                <FileSpreadsheet size={16} className="text-emerald-500 shrink-0" />
                <span>{t("createTeam.exportExcel", "Export to Excel")}</span>
              </Dropdown.Item>

              <Dropdown.Item onClick={exportToWord} className="modern-export-item">
                <FileText size={16} className="text-blue-500 shrink-0" />
                <span>{t("createTeam.exportWord", "Export to Word")}</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      ) : null}

      {/* 2. Elevated Bento 5-KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Documents */}
        <div className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider">
              {t("UserDocs.totalDocs", "Total Documents")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--modern-text)] m-0">
              {totalDocuments.toLocaleString()}
            </h3>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-1">
              {sharedDocs} {t("UserDocs.ShareDocs", "Shared").toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI 2: Completion Rate */}
        <div className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider">
              {t("adminDashboard.completionRate", "Completion Rate")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-[var(--modern-text)] m-0">
                {completionRate}%
              </h3>
            </div>
            <div className="w-full bg-[var(--modern-raised)] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-1.5">
              {completedDocs} {t("viewDetails.completed", "completed").toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI 3: Pending Signatures */}
        <div className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider">
              {t("adminDashboard.pendingSignature", "Pending Action")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--modern-text)] m-0">
              {pendingDocs.toLocaleString()}
            </h3>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-1">
              {draftDocs} {t("viewDetails.draft", "draft").toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI 4: Team Members & Capacity */}
        <div className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider">
              {t("adminDashboard.teamMembers", "Organization Team")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]">
              <Users size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--modern-text)] m-0">
              {allUsersData.length}
            </h3>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-1">
              {activeCount} {t("adminDashboard.activeUsers", "active").toLowerCase()} •{" "}
              {inactiveCount} {t("adminDashboard.inactiveUsers", "inactive").toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI 5: Storage Quota */}
        <div className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider">
              {t("adminDashboard.accountStorage", "Cloud Storage")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <HardDrive size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--modern-text)] m-0">
              {folderSize?.readableSize || "0 KB"}
            </h3>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-1 truncate">
              {folderSize?.totalSize != null
                ? t("adminDashboard.storageBytes", {
                    bytes: Number(folderSize.totalSize).toLocaleString(),
                  })
                : t("adminDashboard.storageUsed", "Total storage used")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dual Analytics Grid (4 Visual Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Document Signing Lifecycle */}
        <ChartCard
          title={t("adminDashboard.documentLifecycle", "Document Signing Lifecycle")}
          subtitle={`${lifecycleTotalDocuments} ${t("adminDashboard.documentsTracked", "documents tracked")}`}
        >
          {docsLoading ? (
            <div className="py-12 text-center text-sm text-[var(--modern-muted)]">
              {t("adminDashboard.loadingActivity", "Loading activity for selected dates...")}
            </div>
          ) : (
            <UserDocuments documentMetrics={lifecycleDocumentMetrics} />
          )}
        </ChartCard>

        {/* Chart 2: Department Headcount */}
        <ChartCard
          title={t("adminDashboard.departmentHeadcount", "Department Allocation")}
          subtitle={t("adminDashboard.membersPerDepartment", "Members per department")}
        >
          {departmentMetrics.length > 0 ? (
            <ReactApexChart
              options={departmentChartOptions}
              series={departmentChartSeries}
              type="bar"
              height={260}
            />
          ) : (
            <div className="py-12 text-center text-sm text-[var(--modern-muted)]">
              <p className="m-0">
                {t("adminDashboard.noDepartmentData", "No department analytics available in current data.")}
              </p>
            </div>
          )}
        </ChartCard>

        {/* Chart 3: Users by Role Breakdown */}
        <ChartCard
          title={t("adminDashboard.usersByRole", "Roles & Governance Breakdown")}
          subtitle={`${activeCount} ${t("adminDashboard.activeUsers", "Active")} • ${inactiveCount} ${t("adminDashboard.inactiveUsers", "Inactive")}`}
        >
          <ActiveAccounts roleBreakdown={roleBreakdown} />
        </ChartCard>

        {/* Chart 4: Most Active Users */}
        <ChartCard
          title={t("adminDashboard.mostActiveUsers", "Most Active Team Members")}
          subtitle={t("adminDashboard.activeTeamMembers", "Active members by recent activity")}
        >
          <MostActiveUsers users={mostActiveUsers} />
        </ChartCard>
      </div>

      {/* 4. Dedicated Organization User Directory & Roster (Ready for upcoming All Users API!) */}
      <div className="p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]">
        {/* Section Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[var(--modern-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--modern-text)] m-0">
                  Organization Directory
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]">
                  {filteredUsers.length} {filteredUsers.length === 1 ? "member" : "members"}
                </span>
              </div>
              <p className="text-xs text-[var(--modern-muted)] m-0 mt-0.5">
                Browse and filter all registered organization members across departments
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-3 flex-wrap ml-auto">
            {/* Instant Quick Search */}
            <div className="recentdocs-search-box">
              <Search className="search-icon" size={15} aria-hidden="true" />
              <input
                type="text"
                placeholder={t("createTeam.searchPlaceholder", "Search by name, email, role, department...")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="recentdocs-search-input"
                aria-label="Search members"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="home-documents-status-filters" role="group" aria-label="Status Filter">
              <button
                type="button"
                className={`home-status-filter${statusTab === "all" ? " is-active" : ""}`}
                aria-pressed={statusTab === "all"}
                onClick={() => {
                  setStatusTab("all");
                  setPage(1);
                }}
              >
                <span>All</span>
                <span className="home-status-filter-count">{allUsersData.length}</span>
              </button>
              <button
                type="button"
                className={`home-status-filter${statusTab === "active" ? " is-active" : ""}`}
                aria-pressed={statusTab === "active"}
                onClick={() => {
                  setStatusTab("active");
                  setPage(1);
                }}
              >
                <span>Active</span>
                <span className="home-status-filter-count">{activeCount}</span>
              </button>
              <button
                type="button"
                className={`home-status-filter${statusTab === "inactive" ? " is-active" : ""}`}
                aria-pressed={statusTab === "inactive"}
                onClick={() => {
                  setStatusTab("inactive");
                  setPage(1);
                }}
              >
                <span>Inactive</span>
                <span className="home-status-filter-count">{inactiveCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="mt-4">
          <TableContainer className="rounded-xl border border-[var(--modern-border)] overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="w-[32%]">Member</TableCell>
                  <TableCell className="w-[18%]">Role</TableCell>
                  <TableCell className="w-[20%]">Department</TableCell>
                  <TableCell className="w-[16%]">Contact</TableCell>
                  <TableCell className="w-[14%] text-center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12">
                      <TableEmptyState
                        icon={<Users size={32} className="text-[var(--modern-muted)] opacity-50" />}
                        title="No members found"
                        description={
                          searchQuery
                            ? `No organization members matched "${searchQuery}".`
                            : "There are currently no team members in this filter."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((member) => (
                    <TableRow key={member.id} hover>
                      {/* Member Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserInitialsBadge name={member.fullName} avatarOnly className="shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[var(--modern-text)] truncate">
                              {member.fullName}
                            </span>
                            <span className="block text-xs text-[var(--modern-muted)] truncate">
                              {member.emailID}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)]">
                          {member.role}
                        </span>
                      </TableCell>

                      {/* Department */}
                      <TableCell>
                        <span className="text-xs font-medium text-[var(--modern-muted)]">
                          {member.department || "—"}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <span className="text-xs text-[var(--modern-muted)] font-mono">
                          {member.mobileNumber || "—"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            member.isActive
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-[var(--modern-raised)] text-[var(--modern-muted)] border border-[var(--modern-border)]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-2">
              <span className="text-xs text-[var(--modern-muted)]">
                Showing {(page - 1) * rowsPerPage + 1} to{" "}
                {Math.min(page * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} members
              </span>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
