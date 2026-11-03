import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import bulkService from "@/services/bulkService";
import { toast } from "react-toastify";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import { useForm } from "react-hook-form";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyState,
  TableHead,
  TableRow,
  Stack,
  Pagination,
  UserInitialsBadge,
} from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";
import { StatusBadge, formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";

const BulkSignatoriesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { docName, registerSignID, masterDocID } = useParams();
  const [dataRow, setDataRow] = useState();
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const { reset } = useForm();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle opening the share modal
  const handleShareModalShow = async (row) => {
    try {
      const shareData = {
        ...shareFormData,
        MasterDocID: masterDocID,
        RegisterSignID: row.registerSignID,
        IsDocShared: true,
        IsAuditTrailDocShared: false,
        IsSupportingDocShared: true,
      };
      setShareFormData(shareData);
      setShowShareModal(true);
    } catch (error) {
      console.log(t("dashboardCardStatuses.shareFiletoastErr"), error);
      toast.error(t("dashboardCardStatuses.shareFiletoastErr"));
    }
  };

  // Function to handle submitting share data
  const handleShareDocument = async () => {
    setIsLoading(true);
    try {
      const response = await userService.createDocShared(shareFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.shareFileSucessToast"));
      } else if (response.data.statusCode === "3") {
        toast.info(t("dashboardCardStatuses.shareFileInfo"));
      }
      setShowShareModal(false);
      setIsLoading(false);
      reset();
    } catch (error) {
      console.log(error);
      if (error.response && error.response.statusCode === "4") {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
      } else if (error.response && error.response.statusCode === "500") {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
      } else {
        toast.error(t("dashboardCardStatuses.shareFileToastErr"));
      }
      setIsLoading(false);
    }
  };

  // Fetch Bulk Signatories api
  const FetchBulkDocumentsList = async () => {
    setIsLoading(true);
    try {
      const response = await bulkService.getBulkSignatories(registerSignID, masterDocID);
      if (response.data.successStatus) {
        setData(response.data.response || []);
        setSearchResults(response.data.response || []);
      } else {
        console.error("API Error:", response.data.message);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"), error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchBulkDocumentsList();
  }, [registerSignID, masterDocID]);

  // Handle download and View
  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
  };

  const handleView = async (row) => {
    setIsLoading(true);
    try {
      const { signedDocKey } = row;
      const response = await userService.downloadDoc(signedDocKey);
      const pdfUrl = response.data.response.document;
      setPdfUrl(pdfUrl);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  const columns = [
    { label: t("tablesLabel.name"), key: "name" },
    { label: t("tablesLabel.email"), key: "email" },
    { label: t("tablesLabel.date"), key: "signDate" },
    { label: t("tablesLabel.status"), key: "signStatus" },
    { label: "", key: "actions", align: "right" },
  ];

  const goBack = () => navigate(-1);

  const filteredSignatories = searchResults.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (row.name || "").toLowerCase().includes(q) ||
      (row.email || "").toLowerCase().includes(q) ||
      (row.signStatus || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className='bulk-signatories-route w-full max-w-none mt-4 px-3 sm:px-6 text-foreground [font-family:var(--modern-font-ui)]'>
      <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-5 md:p-6 text-foreground'>
        {/* Top Header & Breadcrumb Toolbar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--modern-border)]'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={goBack}
              className='w-9 h-9 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] hover:border-[var(--theme-color)] hover:text-[var(--theme-color)] hover:bg-[var(--modern-primary-bg)] text-[var(--modern-text)] flex items-center justify-center transition-colors shrink-0 shadow-none outline-none cursor-pointer active:scale-[0.98]'
              aria-label={t("common.back") || "Go back"}
            >
              <Icons.Back className={document.documentElement.dir === "rtl" ? "scale-x-[-1]" : ""} size={16} />
            </button>
            <div className='w-10 h-10 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] flex items-center justify-center shrink-0'>
              <Icons.BulkDocuments size={20} color='var(--theme-color)' />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <Link
                  to="/bulk-documents"
                  className='breadcrumb-nav-link text-xs font-medium text-[var(--modern-muted)] hover:text-[var(--theme-color)] transition-colors inline-flex items-center no-underline hover:no-underline'
                >
                  {t("Sidebar.BulkDocuments") || "Bulk Documents"}
                </Link>
                <span className='text-xs text-[var(--modern-muted)]'>/</span>
                <h1 className='text-base md:text-lg font-bold text-[var(--modern-text)] tracking-tight truncate m-0'>
                  {docName ? decodeURIComponent(docName) : t("Sidebar.BulkSignatories")}
                </h1>
                <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                  {filteredSignatories.length}
                </span>
              </div>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("Sidebar.BulkSignatories")}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className='relative w-full sm:w-64'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder={t("searchFilter.searchPlaceholder") || "Search signatories..."}
              className={`w-full h-9 ${
                document.documentElement.dir === "rtl" ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
              } text-xs rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--theme-color)] transition-colors`}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--modern-muted)] pointer-events-none ${
                document.documentElement.dir === "rtl" ? "right-3" : "left-3"
              }`}
            >
              <Icons.Search size={15} />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)] mt-4'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            minHeight: "440px",
            height: "calc(100vh - 280px)",
            maxHeight: "calc(100vh - 280px)",
          }}
        >
          <Table stickyHeader style={{ border: "none", minWidth: "750px" }}>
            <TableHead className='customTableHead'>
              <TableRow>
                {columns.map((column, idx) => (
                  <TableCell
                    key={column.key || idx}
                    className='TableHeaderCell'
                    align={column.align || "left"}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredSignatories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                    <TableEmptyState
                      icon={<Icons.BulkDocuments size={48} className='text-[var(--modern-muted)]' />}
                      title={t("dashboardCardStatuses.notDocsFound")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredSignatories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={row.registerSignID || index} hover className='transition-colors hover:bg-[var(--modern-raised)]/50'>
                    <TableCell className='TableCell'>
                      <div className='flex items-center gap-2.5 min-w-0'>
                        <UserInitialsBadge name={row.name} avatarOnly />
                        <span className='font-semibold text-sm text-[var(--modern-text)] truncate block'>
                          {row.name || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='TableCell text-xs text-[var(--modern-muted)] font-mono'>
                      {row.email || "—"}
                    </TableCell>
                    <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                      {row.signDate ? formatTableDate(row.signDate) : "—"}
                    </TableCell>
                    <TableCell className='TableCell'>
                      <StatusBadge status={row.signStatus || "pending"} />
                    </TableCell>

                    <TableCell className='TableCell p-0 text-right' align='right'>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu align='end'>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                            <Icons.Download size={20} />
                            {t("dashboardCardStatuses.download")}
                          </Dropdown.Item>

                          {userAccess.docShare === true && (
                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                              <Icons.Share size={20} />
                              {t("dashboardCardStatuses.share")}
                            </Dropdown.Item>
                          )}

                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                            <Icons.View size={20} />
                            {t("dashboardCardStatuses.view")}
                          </Dropdown.Item>

                          {userAccess.auditTrail === true && (
                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                              <Icons.AuditTrail size={20} />
                              {t("dashboardCardStatuses.viewAuditTrail")}
                            </Dropdown.Item>
                          )}

                          <Dropdown.Item>
                            <DashboardComments registerSignID={row.registerSignID} />
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
          <div>
            {filteredSignatories.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, filteredSignatories.length)} {t("tablesLabel.documentsof")} {filteredSignatories.length} {t("tablesLabel.document")}
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.max(1, Math.ceil(filteredSignatories.length / rowsPerPage))}
              variant='outlined'
              shape='rounded'
              page={Math.min(page + 1, Math.max(1, Math.ceil(filteredSignatories.length / rowsPerPage)))}
              onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
            />
          </Stack>
        </div>
      </div>

      {/* Share and View modals */}
      <ShareModal
        show={showShareModal}
        handleClose={() => setShowShareModal(false)}
        formData={shareFormData}
        handleShare={handleShareDocument}
        handleChange={(e) => setShareFormData({ ...shareFormData, [e.target.name]: e.target.value })}
        masterDocID={masterDocID}
        registerSignID={registerSignID}
      />

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />

      <DownloadModal
        show={showDownloadModal}
        dataRow={dataRow}
        handleClose={() => {
          setShowDownloadModal(false);
        }}
      />

      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
      />
    </div>
  );
};

export default BulkSignatoriesList;
