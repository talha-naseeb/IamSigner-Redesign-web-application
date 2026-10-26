import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import bulkService from "@/services/bulkService";
import { toast } from "react-toastify";
import { Dropdown as Dropdown } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import { useForm } from "react-hook-form";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";

const BulkSignatoriesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerSignID, masterDocID } = useParams();
  const [dataRow, setDataRow] = useState();
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const { reset } = useForm();
  const [searchResults, setSearchResults] = useState([]);

  const statusColors = {
    signed: "var(--completed-status)",
    completed: "var(--completed-status)",
    draft: "var(--draft-status)",
    declined: "var(--decline-status)",
    inactive: "var(--inactive-status)",
    pending: "var(--pending-status)",
    share: "var(--share-status)",
    recalled: "var(--recall-status)",
  };
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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
      } else if (error.response.statusCode === "500") {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
      } else {
        toast.error(t("dashboardCardStatuses.shareFileToastErr"));
      }
      setIsLoading(false);
    }
  };

  // Completed api
  const FetchBulkDocumentsList = async () => {
    setIsLoading(true);
    try {
      const response = await bulkService.getBulkSignatories(registerSignID, masterDocID);
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);

        setIsLoading(false);
      } else {
        console.error("API Error:", response.data.message);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };
  useEffect(() => {
    FetchBulkDocumentsList();
  }, []);

  //handle download and View
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
    { label: t("tablesLabel.name"), key: "docName" },
    { label: t("tablesLabel.email"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "completedDate" },
    { label: t("tablesLabel.status"), key: "signStatus" },
    { label: "", key: "actions" },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedMinutes = (minutes < 10 ? "0" : "") + minutes;

    return `${day}/${month}/${year} ${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const goBack = () => navigate(-1);

  return (
    <Grid className='container' style={{ marginTop: "12px" }}>
      <Grid>

        <div className='py-3 p-3 container pendingtable'>
          <div style={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "1rem" }}>
            <Icons.Back size={22} className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} onClick={goBack} style={{ cursor: "pointer" }} />
            <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("Sidebar.BulkSignatories")}</label>
          </div>

          {/* Table */}
          <TableContainer
            component={Paper}
            className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              minHeight: "440px",
              height: "calc(100vh - 280px)",
              maxHeight: "calc(100vh - 280px)",
            }}
          >
            <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
              {/* Table Headers */}
              <TableHead className='customTableHead'>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.label} className='TableHeaderCell'>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {searchResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                      <TableEmptyState
                        icon={<Icons.BulkDocuments size={50} />}
                        title={t("dashboardCardStatuses.notDocsFound")}
                      />
                    </TableCell>
                  </TableRow>
                )}

                {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    {/* Table Cells */}
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      <div className='flex items-center gap-2'>
                        <UserInitialsBadge name={row.name} />
                        <span>{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className='TableCell'>{row.email}</TableCell>
                    <TableCell className='TableCell'>{row.signDate ? formatDate(row.signDate) : ""}</TableCell>
                    <TableCell className='TableCell'>
                      {(() => {
                        const rawStatus = (row.signStatus || "pending").toLowerCase();
                        const statusColor = statusColors[rawStatus] || "var(--inactive-status)";
                        return (
                          <span
                            className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold'
                            style={{
                              color: statusColor,
                              backgroundColor: `color-mix(in srgb, ${statusColor} 12%, var(--modern-card))`,
                              border: `1px solid color-mix(in srgb, ${statusColor} 35%, var(--modern-border))`,
                            }}
                          >
                            {row.signStatus || "Pending"}
                          </span>
                        );
                      })()}
                    </TableCell>

                    {userAccess.remainingDays <= 0 ? (
                      <>
                        <TableCell className='TableCell p-0'>
                          <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} />
                          </Dropdown>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className='TableCell p-0'>
                          <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} />

                            <Dropdown.Menu>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                                <Icons.Download size={20} />
                                {t("dashboardCardStatuses.download")}
                              </Dropdown.Item>

                              {userAccess.docShare === true ? (
                                <>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                                    <Icons.Share size={20} />
                                    {t("dashboardCardStatuses.share")}
                                  </Dropdown.Item>
                                </>
                              ) : (
                                <></>
                              )}

                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                                <Icons.View size={20} />
                                {t("dashboardCardStatuses.view")}
                              </Dropdown.Item>

                              {userAccess.auditTrail === true ? (
                                <>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                                    <Icons.AuditTrail size={20} />
                                    {t("dashboardCardStatuses.viewAuditTrail")}
                                  </Dropdown.Item>
                                </>
                              ) : (
                                <></>
                              )}

                              <Dropdown.Item>
                                <DashboardComments registerSignID={row.registerSignID} />
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
            <div>
              {data.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
            </div>
            <Stack spacing={2}>
              <Pagination
                count={Math.max(1, Math.ceil(data.length / rowsPerPage))}
                variant='outlined'
                shape='rounded'
                page={Math.min(page + 1, Math.max(1, Math.ceil(data.length / rowsPerPage)))}
                onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
              />
            </Stack>
          </div>
        </div>
      </Grid>

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
    </Grid>
  );
};
export default BulkSignatoriesList;
