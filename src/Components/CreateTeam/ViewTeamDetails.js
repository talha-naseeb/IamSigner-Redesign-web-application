import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import userService from "@/services/userService";
import documentService from "@/services/documentService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Mail, Phone, UserCheck, User, FileText, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getExportDocumentLink } from "@/utils/teamDocumentExport";

const ViewTeamDetails = ({ show, onHide, appUserID }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [documentStats, setDocumentStats] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [documentStatusFilter, setDocumentStatusFilter] = useState("all");
  const [documentNameQuery, setDocumentNameQuery] = useState("");
  const [documentPageSize, setDocumentPageSize] = useState("20");
  const [documentPage, setDocumentPage] = useState(0);
  const [activeDetailsSection, setActiveDetailsSection] = useState("user");

  const getDocumentName = (doc) => doc.docName || doc.documentName || doc.name || "—";
  const getDocumentStatus = (doc) => doc.docStatus || doc.documentStatus || doc.status || "—";
  const normalizeDocumentStatus = (doc) => {
    const status = String(getDocumentStatus(doc)).trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (status === "decline" || status === "declined") return "decline";
    if (status === "signed" || status === "complete" || status === "completed") return "completed";
    if (status === "inactive" || status === "inactivated") return "inactive";
    if (status === "shared") return "shared";
    if (status === "pending") return "pending";
    if (status === "draft") return "draft";
    return status;
  };

  const documentFilters = [
    { id: "all", label: t("viewDetails.all", "All") },
    { id: "draft", label: t("viewDetails.draft", "Draft") },
    { id: "completed", label: t("viewDetails.completed", "Completed") },
    { id: "pending", label: t("viewDetails.pending", "Pending") },
    { id: "shared", label: t("viewDetails.shared", "Shared") },
    { id: "inactive", label: t("viewDetails.inactive", "Inactive") },
    { id: "decline", label: t("viewDetails.declined", "Declined") },
  ];

  const filteredDocuments = useMemo(() => {
    const query = documentNameQuery.trim().toLowerCase();
    return userDocuments.filter((doc) => {
      const matchesStatus = documentStatusFilter === "all" || normalizeDocumentStatus(doc) === documentStatusFilter;
      const matchesName = !query || getDocumentName(doc).toLowerCase().includes(query);
      return matchesStatus && matchesName;
    });
  }, [userDocuments, documentStatusFilter, documentNameQuery]);

  const effectiveDocumentPageSize = documentPageSize === "all"
    ? Math.max(filteredDocuments.length, 1)
    : Number(documentPageSize);
  const documentPageCount = Math.max(1, Math.ceil(filteredDocuments.length / effectiveDocumentPageSize));
  const visibleDocuments = filteredDocuments.slice(
    documentPage * effectiveDocumentPageSize,
    (documentPage + 1) * effectiveDocumentPageSize
  );

  const handleExportDetails = () => {
    const appUser = userData?.appUser || {};
    const userFields = [
      appUser.fullName || "",
      appUser.emailID || "",
      `${appUser.countryCode || ""} ${appUser.mobileNumber || ""}`.trim(),
      userData?.delegation?.delegatedToEmail || "",
      userDocuments.length,
    ];
    const rows = [[
      t("viewDetails.name", "User name"),
      t("viewDetails.emailAccount", "Email"),
      t("viewDetails.mobileNumber", "Mobile number"),
      t("viewDetails.emailDelegateTo", "Delegated to"),
      t("viewDetails.documentCount", "Document count"),
      t("viewDetails.documentName", "Document"),
      t("tablesLabel.status", "Status"),
      t("viewDetails.documentLink", "Document link"),
      t("tablesLabel.documentID", "Document ID"),
      t("tablesLabel.createdOn", "Created on"),
    ]];

    if (userDocuments.length === 0) {
      rows.push([...userFields, "", "", "", "", ""]);
    } else {
      userDocuments.forEach((doc, index) => {
        rows.push([
          ...(index === 0 ? userFields : ["", "", "", "", ""]),
          getDocumentName(doc),
          getDocumentStatus(doc),
          getExportDocumentLink(doc),
          doc.masterDocID || doc.documentID || "",
          doc.createdOn || doc.createdDate || "",
        ]);
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "User and Documents");
    const fileName = (appUser.fullName || "team-member")
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "_");
    const fileData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([fileData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `${fileName}_details.xlsx`
    );
  };

  useEffect(() => {
    setDocumentPage(0);
  }, [documentStatusFilter, documentNameQuery, documentPageSize]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!appUserID) return;
      setActiveDetailsSection("user");
      setIsLoading(true);
      try {
        // Fetch user data
        const userResponse = await userService.getAppUserData(appUserID);
        setUserData(userResponse.data.response);

        // Fetch document statistics for the user's account
        if (userResponse.data.response.appUser?.appUserID) {
          const [statsResponse, docsResponse] = await Promise.all([
            documentService.getAppUserDocsCount(appUserID),
            documentService.getAppUserDocs(appUserID),
          ]);
          if (statsResponse.data.statusCode === "1") setDocumentStats(statsResponse.data.response);
          const docs = docsResponse.data?.response;
          setUserDocuments(Array.isArray(docs) ? docs : []);
        }
      } catch (error) {
        toast.error(t("navbar.errFetchUserData"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [appUserID, t]);

  const statItems = documentStats
    ? [
        { label: t("viewDetails.pending"), value: documentStats.pendingCount || 0, color: "var(--pending-status, #f59e0b)" },
        { label: t("viewDetails.completed"), value: documentStats.completedCount || 0, color: "var(--completed-status, #10b981)" },
        { label: t("viewDetails.draft"), value: documentStats.draftCount || 0, color: "var(--draft-status, #6366f1)" },
        { label: t("viewDetails.declined"), value: documentStats.declineCount || 0, color: "var(--decline-status, #ef4444)" },
        { label: t("viewDetails.shared"), value: documentStats.sharedCount || 0, color: "var(--share-status, #0ea5e9)" },
        { label: t("viewDetails.inactive"), value: documentStats.inActiveCount || 0, color: "var(--inactive-status, #64748b)" },
        { label: t("viewDetails.recalled"), value: documentStats.recalledCount || 0, color: "var(--recall-status, #f97316)" },
        { label: t("viewDetails.bulk"), value: documentStats.bulkCount || 0, color: "var(--theme-color, #6366f1)" },
      ]
    : [];

  return (
    <Modal show={show} className='team-details-dialog' onHide={onHide} backdrop='static' keyboard={false} size='lg' centered>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='w-11 h-11 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] font-bold text-base flex items-center justify-center shrink-0'>
            {userData?.appUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className='min-w-0'>
            <Modal.Title className='text-base font-bold text-[var(--modern-text)] truncate m-0'>
              {userData?.appUser?.fullName || t("viewDetails.userDetails")}
            </Modal.Title>
            {userData?.appUser?.emailID && (
              <div className='text-xs text-[var(--modern-muted)] truncate mt-0.5'>
                {userData?.appUser?.emailID}
              </div>
            )}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-5 custom-table-scrollbar bg-[var(--modern-card)] text-[var(--modern-text)]'>
        {isLoading ? (
          <div className='py-12 flex flex-col items-center justify-center gap-2 text-[var(--modern-muted)]'>
            <Loader2 size={24} className='animate-spin text-[var(--theme-color)]' />
          </div>
        ) : (
          userData && (
            <div className='space-y-6'>
              <div role='tablist' aria-label={t("viewDetails.sections", "Team member details sections")} className='flex items-center gap-1 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-1'>
                {[
                  { id: "user", label: t("viewDetails.userInformation", "User Information") },
                  { id: "documents", label: t("viewDetails.documentInformation", "Document Information") },
                ].map((section) => {
                  const selected = activeDetailsSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type='button'
                      role='tab'
                      onClick={() => setActiveDetailsSection(section.id)}
                      aria-pressed={selected}
                      aria-selected={selected}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${selected ? "border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)]" : "border border-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"}`}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </div>

              {activeDetailsSection === "user" && <div className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <User size={13} />
                    <span>{t("viewDetails.name")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.fullName || "—"}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <Mail size={13} />
                    <span>{t("viewDetails.emailAccount")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.emailID || "—"}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <Phone size={13} />
                    <span>{t("viewDetails.mobileNumber")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.countryCode || ""} {userData.appUser.mobileNumber || t("viewDetails.addNumber")}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <UserCheck size={13} />
                    <span>{t("viewDetails.emailDelegateTo")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.delegation?.delegatedToEmail || t("viewDetails.noDelegation")}
                  </div>
                </div>
              </div>

              {/* Document Status */}
              {documentStats && (
                <div>
                  <h6 className='text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)] mb-3'>
                    {t("viewDetails.documentStatus")}
                  </h6>

                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                    {statItems.map((stat, idx) => (
                      <div
                        key={idx}
                        className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] flex flex-col justify-between gap-1'
                      >
                        <div
                          className='text-xl font-bold leading-tight'
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </div>
                        <div className='text-xs font-medium text-[var(--modern-muted)]'>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>}

              {activeDetailsSection === "documents" && (
              <section className='space-y-3'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <h6 className='text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)] m-0'>
                    {t("viewDetails.documents", "Documents")}
                  </h6>
                  <div className='flex items-center gap-3'>
                    <span className='text-xs text-[var(--modern-muted)]'>
                      {userDocuments.length} {t("viewDetails.documentsCount", "documents")}
                    </span>
                    <button
                      type='button'
                      onClick={handleExportDetails}
                      className='inline-flex items-center gap-1.5 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-3 py-1.5 text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)]'
                    >
                      <Download size={13} />
                      {t("viewDetails.export", "Export to Excel")}
                    </button>
                  </div>
                </div>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-1'>
                    {documentFilters.map((filter) => {
                      const count = filter.id === "all"
                        ? userDocuments.length
                        : userDocuments.filter((doc) => normalizeDocumentStatus(doc) === filter.id).length;
                      const selected = documentStatusFilter === filter.id;
                      return (
                        <button
                          key={filter.id}
                          type='button'
                          onClick={() => setDocumentStatusFilter(filter.id)}
                          aria-pressed={selected}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${selected ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] border border-[var(--modern-border)]" : "border border-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"}`}
                        >
                          {filter.label}<span className='font-mono text-[10px] opacity-75'>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <label className='relative block w-full shrink-0 sm:w-56'>
                    <Search size={14} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--modern-muted)] rtl:left-auto rtl:right-3' />
                    <input
                      type='search'
                      value={documentNameQuery}
                      onChange={(event) => setDocumentNameQuery(event.target.value)}
                      placeholder={t("viewDetails.searchDocuments", "Filter by document name")}
                      aria-label={t("viewDetails.searchDocuments", "Filter by document name")}
                      className='w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] py-2 pl-9 pr-3 text-xs text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary,#4d8dff)] focus:outline-none rtl:pl-3 rtl:pr-9'
                    />
                  </label>
                </div>

                <div className='overflow-hidden rounded-xl border border-[var(--modern-border)]'>
                  <div className='max-h-72 overflow-auto'>
                    <table className='w-full border-collapse text-left text-xs'>
                      <thead className='sticky top-0 z-10 bg-[var(--modern-raised)] text-[var(--modern-muted)]'>
                        <tr>
                          <th className='px-3.5 py-2.5 font-semibold'>{t("viewDetails.documentName", "Document")}</th>
                          <th className='w-36 px-3.5 py-2.5 font-semibold'>{t("tablesLabel.status", "Status")}</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-[var(--modern-border)]'>
                        {visibleDocuments.map((doc, index) => (
                          <tr key={doc.masterDocID || doc.documentID || index} className='bg-[var(--modern-card)]'>
                            <td className='px-3.5 py-3 font-medium text-[var(--modern-text)]'>
                              <span className='inline-flex min-w-0 items-center gap-2'>
                                <FileText size={15} className='shrink-0 text-[var(--modern-muted)]' />
                                <span className='truncate' title={getDocumentName(doc)}>{getDocumentName(doc)}</span>
                              </span>
                            </td>
                            <td className='px-3.5 py-3 text-[var(--modern-muted)]'>{getDocumentStatus(doc)}</td>
                          </tr>
                        ))}
                        {visibleDocuments.length === 0 && (
                          <tr>
                            <td colSpan={2} className='px-3.5 py-8 text-center text-[var(--modern-muted)]'>
                              {userDocuments.length === 0
                                ? t("viewDetails.noDocuments", "No documents found for this team member.")
                                : t("viewDetails.noFilteredDocuments", "No documents match these filters.")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className='flex flex-wrap items-center justify-between gap-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-3.5 py-2.5'>
                    <span className='text-[11px] text-[var(--modern-muted)]'>
                      {filteredDocuments.length === 0 ? 0 : documentPage * effectiveDocumentPageSize + 1}–{Math.min((documentPage + 1) * effectiveDocumentPageSize, filteredDocuments.length)} {t("tablesLabel.of", "of")} {filteredDocuments.length}
                    </span>
                    <div className='flex items-center gap-2'>
                      <label className='flex items-center gap-1.5 text-[11px] text-[var(--modern-muted)]'>
                        {t("viewDetails.rowsPerPage", "Rows")}
                        <select
                          value={documentPageSize}
                          onChange={(event) => setDocumentPageSize(event.target.value)}
                          aria-label={t("viewDetails.rowsPerPage", "Rows per page")}
                          className='rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2 py-1 text-[11px] text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary,#4d8dff)]'
                        >
                          <option value='20'>20</option>
                          <option value='30'>30</option>
                          <option value='40'>40</option>
                          <option value='all'>{t("viewDetails.all", "All")}</option>
                        </select>
                      </label>
                      <button type='button' onClick={() => setDocumentPage((pageIndex) => Math.max(0, pageIndex - 1))} disabled={documentPage === 0} aria-label={t("tablesLabel.previousPage", "Previous page")} className='inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--modern-border)] text-[var(--modern-text)] disabled:cursor-not-allowed disabled:opacity-40'>
                        <ChevronLeft size={14} />
                      </button>
                      <span className='min-w-12 text-center font-mono text-[11px] text-[var(--modern-muted)]'>{documentPage + 1}/{documentPageCount}</span>
                      <button type='button' onClick={() => setDocumentPage((pageIndex) => Math.min(documentPageCount - 1, pageIndex + 1))} disabled={documentPage >= documentPageCount - 1} aria-label={t("tablesLabel.nextPage", "Next page")} className='inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--modern-border)] text-[var(--modern-text)] disabled:cursor-not-allowed disabled:opacity-40'>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              )}
            </div>
          )
        )}
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={onHide}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
        >
          {t("viewModal.close") || t("common.close") || "Close"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewTeamDetails;
