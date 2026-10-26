import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Stack, Pagination } from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { Button, Modal, Dropdown } from "@/Components/UI/shadcnCompat";
import { useNavigate } from "react-router-dom";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";

import integrationService from "@/services/integrationService";
import uploadFlowService from "@/services/uploadFlowService";

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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    AIGeneratedPDFID();
  }, [AIGeneratedPDFID]);

  const columns = [
    { label: t("tablesLabel.name"), key: "name" },
    { label: t("tablesLabel.docType"), key: "documentType" },
    { label: t("tablesLabel.otherType"), key: "customDocumentType" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.modifiedOn"), key: "modifiedOn" },
    { label: t("tablesLabel.details"), key: "extraDetails" },
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

    return `${day}/${month}/${year} - ${hours}:${formattedMinutes} ${ampm}`;
  };

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

  const handleUploadClick = async (generatedDocumentPath, name, documentType) => {
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

  return (
    <div className='container mt-3'>

      <Modal show={pdfModal} onHide={closePdfModal} size='xl'>
        <Modal.Header closeButton>
          <Modal.Title>{t("macAi.viewFile")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <embed src={pdfUrl} type='application/pdf' width='100%' height='500px' />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={closePdfModal}>
            {t("macAi.close")}
          </Button>
        </Modal.Footer>
      </Modal>

      {userAccess.macAI === true && userAccess.remainingDays > 0 ? (
        <>
          {userAccess.macAI === true ? (
            <div className='userProfile-form container mb-2'>
              <div className='d-flex align-items-center gap-2 mb-4'>
                <Icons.Back className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} onClick={goBack} style={{ cursor: "pointer" }} />
                <label style={{ fontSize: "20px", fontWeight: "600" }}>{t("macAi.listMac")}</label>
              </div>

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
                <Table stickyHeader style={{ border: "none" }}>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.label} className='TableHeaderCell'>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {textData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                          <TableEmptyState
                            icon={<Icons.BulkDocuments size={50} />}
                            title={t("dashboardCardStatuses.notDocsFound")}
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {textData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className='TableCell'>{row.name}</TableCell>
                        <TableCell className='TableCell'>{row.documentType}</TableCell>
                        <TableCell className='TableCell'>{row.customDocumentType}</TableCell>
                        <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                        <TableCell className='TableCell'>{row.modifiedOnFormatted ? formatDate(row.modifiedOnFormatted) : ""}</TableCell>
                        <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                          {row.extraDetails}
                        </TableCell>

                        <TableCell className='py-0'>
                          <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} />

                            <Dropdown.Menu>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row.generatedDocumentPath, row.name)}>
                                <Icons.Download size={22} />
                                {t("dashboardCardStatuses.download")}
                              </Dropdown.Item>

                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row.generatedDocumentPath)}>
                                <Icons.View size={20} />
                                {t("dashboardCardStatuses.view")}
                              </Dropdown.Item>

                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleEditClick(row)}>
                                <Icons.EditSquare size={22} />
                                {t("dashboardCardStatuses.edit")}
                              </Dropdown.Item>

                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUploadClick(row.generatedDocumentPath, row.name, row.documentType)}>
                                <Icons.SelfSign size={22} />
                                {t("dashboardCardStatuses.SignDoc")}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
                <div>
                  {textData.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, textData.length)} {t("tablesLabel.documentsof")} {textData.length} {t("tablesLabel.document")}
                </div>
                <Stack spacing={2}>
                  <Pagination
                    count={Math.max(1, Math.ceil(textData.length / rowsPerPage))}
                    variant='outlined'
                    shape='rounded'
                    page={Math.min(page + 1, Math.max(1, Math.ceil(textData.length / rowsPerPage)))}
                    onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                  />
                </Stack>
              </div>
            </div>
          ) : (
            <></>
          )}
        </>
      ) : (
        <UserLisence />
      )}
    </div>
  );
}

export default ListOfDocuments;
