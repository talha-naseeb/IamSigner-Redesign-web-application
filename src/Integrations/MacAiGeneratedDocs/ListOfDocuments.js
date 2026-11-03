import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
} from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { Button, Modal, Dropdown } from "@/Components/UI/shadcnCompat";
import { useNavigate } from "react-router-dom";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";
import integrationService from "@/services/integrationService";
import uploadFlowService from "@/services/uploadFlowService";
import { Bot, ArrowLeft, Plus, Eye, Download, Edit3, PenTool, FileText, X } from "lucide-react";

function ListOfDocuments({ registerSignID }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [textData, setTextData] = useState([]);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const rowsPerPage = 30;
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isSerial = true;
  const description = "";
  const referenceNumber = "";
  const { user, userAccess } = useUser();

  const goBack = () => navigate(-1);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const AIGeneratedPDFID = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.getAITextDocument();

      if (response.data.statusCode === "1") {
        const responseData = response.data.response;
        setTextData(responseData || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    AIGeneratedPDFID();
  }, [AIGeneratedPDFID]);

  const columns = [
    { label: t("tablesLabel.name"), key: "name", width: "26%" },
    { label: t("tablesLabel.docType"), key: "documentType", width: "16%" },
    { label: t("tablesLabel.otherType"), key: "customDocumentType", width: "14%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "16%" },
    { label: t("tablesLabel.modifiedOn"), key: "modifiedOn", width: "16%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const handleView = (generatedDocumentPath) => {
    setPdfUrl(generatedDocumentPath);
    setPdfModal(true);
  };

  const closePdfModal = () => {
    setPdfUrl("");
    setPdfModal(false);
  };

  const handleEditClick = (row) => {
    navigate("/mac-ai", { state: { row } });
  };

  const handleFileDownload = async (generatedDocumentPath, name) => {
    try {
      const fileName = name || getFileNameFromUrl(generatedDocumentPath);
      const downloadedBlob = await downloadURL(generatedDocumentPath);
      const url = URL.createObjectURL(downloadedBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("uploadDocFlow.errorDownloadingFile"));
    }
  };

  async function downloadURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  const handleUploadClick = async (generatedDocumentPath, name) => {
    const docDetails = `${name}.pdf`;

    setIsLoading(true);
    try {
      const baseResponse = await fetch(generatedDocumentPath);
      if (!baseResponse.ok) {
        throw new Error("Failed to fetch the document");
      }
      const blob = await baseResponse.blob();
      const base64 = await blobToBase64(blob);

      const fileNameExt = getFileNameFromUrl(generatedDocumentPath);
      const fileExtension = fileNameExt.split(".").pop();

      const body = {
        ReferenceNumber: referenceNumber,
        Description: description,
        CreatedBy: user.email,
        IsSerial: isSerial,
        isOnlySigner: false,
        registerSignID: registerSignID,
        PrimaryDocs: [
          {
            DocName: docDetails,
            DocExtension: fileExtension,
            DocFile: base64,
            IsPasswordProtected: false,
          },
        ],
      };

      const response = await uploadFlowService.registerDocs(body);

      if (response.data.statusCode === "1") {
        localStorage.setItem("registerSignID", response.data.response.registerSignID);
        toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
        navigate("/upload-doc");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error(`${t("uploadDocFlow.errorUploadFile")}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(blob);
    });

  function getFileNameFromUrl(url) {
    const parts = url.split("/");
    return parts[parts.length - 1];
  }

  if (!userAccess?.macAI || userAccess?.remainingDays <= 0) {
    return <UserLisence />;
  }

  return (
    <div className='macai-docs-page w-full px-4 sm:px-6 pt-3 pb-8'>
      {/* Modern Card Shell */}
      <div className='p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] pendingtable'>
        {/* Table Header Toolbar */}
        <div className='flex flex-wrap items-center justify-between gap-3 mb-4 p-1'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={goBack}
              aria-label={t("common.back") || "Back"}
              className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] cursor-pointer transition-colors'
            >
              <ArrowLeft size={18} className='rtl:rotate-180' />
            </button>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                <Bot size={20} />
              </div>
              <div>
                <h1 className='text-lg font-bold tracking-tight text-[var(--modern-text)] m-0'>
                  {t("macAi.listMac")}
                </h1>
                <span className='text-xs text-[var(--modern-muted)]'>
                  {textData.length} {t("tablesLabel.document")}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant='none'
            onClick={() => navigate("/mac-ai")}
            className='inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity'
          >
            <Plus size={16} />
            <span>{t("macAi.GenerateAItext") || "Create AI Document"}</span>
          </Button>
        </div>

        {/* Table Container */}
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            minHeight: "440px",
            height: "calc(100vh - 300px)",
            maxHeight: "calc(100vh - 300px)",
          }}
        >
          <Table stickyHeader style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    style={{ width: column.width, textAlign: column.align || "left" }}
                    className='TableHeaderCell font-semibold text-xs text-[var(--modern-muted)] uppercase tracking-wider'
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {textData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='table-empty-state-cell py-12'>
                    <TableEmptyState
                      icon={<Icons.BulkDocuments size={48} />}
                      title={t("dashboardCardStatuses.notDocsFound")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                textData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.aiTextID || index} hover className='transition-colors'>
                      <TableCell
                        className='TableCell truncate-cell font-medium text-[var(--modern-text)]'
                        title={row.name}
                        onClick={handleCellClick}
                      >
                        <div className='flex items-center gap-2.5'>
                          <FileText size={16} className='text-[var(--modern-muted)] shrink-0' />
                          <span className='truncate'>{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className='TableCell text-sm text-[var(--modern-text)]'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
                          {row.documentType || "—"}
                        </span>
                      </TableCell>
                      <TableCell className='TableCell text-sm text-[var(--modern-muted)]'>
                        {row.customDocumentType || "—"}
                      </TableCell>
                      <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                        {row.createdOnFormatted ? formatTableDate(row.createdOnFormatted) : "—"}
                      </TableCell>
                      <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                        {row.modifiedOnFormatted ? formatTableDate(row.modifiedOnFormatted) : "—"}
                      </TableCell>
                      <TableCell className='TableCell p-0 text-right' align='right'>
                        <Dropdown>
                          <Dropdown.Toggle as={CustomToggle} />
                          <Dropdown.Menu align='end'>
                            <Dropdown.Item
                              className='d-flex gap-2 align-items-center'
                              onClick={() =>
                                handleFileDownload(row.generatedDocumentPath, row.name)
                              }
                            >
                              <Download size={16} />
                              <span>{t("dashboardCardStatuses.download")}</span>
                            </Dropdown.Item>

                            <Dropdown.Item
                              className='d-flex gap-2 align-items-center'
                              onClick={() => handleView(row.generatedDocumentPath)}
                            >
                              <Eye size={16} />
                              <span>{t("dashboardCardStatuses.view")}</span>
                            </Dropdown.Item>

                            <Dropdown.Item
                              className='d-flex gap-2 align-items-center'
                              onClick={() => handleEditClick(row)}
                            >
                              <Edit3 size={16} />
                              <span>{t("dashboardCardStatuses.edit")}</span>
                            </Dropdown.Item>

                            <Dropdown.Item
                              className='d-flex gap-2 align-items-center'
                              onClick={() =>
                                handleUploadClick(row.generatedDocumentPath, row.name)
                              }
                            >
                              <PenTool size={16} />
                              <span>{t("dashboardCardStatuses.SignDoc")}</span>
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

        {/* Pagination Bar */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-[var(--modern-border)] text-xs text-[var(--modern-muted)]'>
          <div>
            {textData.length ? page * rowsPerPage + 1 : 0} -{" "}
            {Math.min((page + 1) * rowsPerPage, textData.length)}{" "}
            {t("tablesLabel.documentsof")} {textData.length} {t("tablesLabel.document")}
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.max(1, Math.ceil(textData.length / rowsPerPage))}
              variant='outlined'
              shape='rounded'
              page={Math.min(
                page + 1,
                Math.max(1, Math.ceil(textData.length / rowsPerPage))
              )}
              onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
            />
          </Stack>
        </div>
      </div>

      {/* PDF View Modal */}
      <Modal show={pdfModal} onHide={closePdfModal} size='xl' centered>
        <Modal.Header className='border-b border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText size={18} className='text-[var(--theme-color)]' />
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("macAi.viewFile")}
            </Modal.Title>
          </div>
          <button
            type='button'
            onClick={closePdfModal}
            className='inline-flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-[var(--modern-muted)] hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)] cursor-pointer'
          >
            <X size={18} />
          </button>
        </Modal.Header>
        <Modal.Body className='p-0 bg-[var(--modern-card)]'>
          <embed src={pdfUrl} type='application/pdf' width='100%' height='560px' />
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5 flex items-center justify-end'>
          <Button
            variant='none'
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
            onClick={closePdfModal}
          >
            {t("macAi.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListOfDocuments;
