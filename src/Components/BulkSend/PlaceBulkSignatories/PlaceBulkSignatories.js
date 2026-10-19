import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Icons } from "@/assets/Icons";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import "./style.css";
import uploadFlowService from "@/services/uploadFlowService";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

function PlaceBulkSignatories({ setActiveStep, setCompletedSteps }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFileValid, setIsFileValid] = useState(false);
  const { t } = useTranslation("");

  useEffect(() => {
    const storedData = sessionStorage.getItem("parsedData");
    const storedFileName = sessionStorage.getItem("fileName");

    if (storedData && storedFileName) {
      setData(JSON.parse(storedData));
      setFileName(storedFileName);
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // ✅ UTF-8 Arabic-safe CSV parser
  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result.replace(/^\uFEFF/, ""); // remove BOM
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: (result) => {
          const parsedData = result.data.map((row) => ({
            name: row.Name || row.name || "",
            email: row.Email || row.email || "",
            emailStatus: validateEmail(row.Email || row.email) ? "Valid" : "Invalid",
          }));

          setData(parsedData);
          setIsFileValid(parsedData.every((row) => row.emailStatus === "Valid"));
          sessionStorage.setItem("parsedData", JSON.stringify(parsedData));
          sessionStorage.setItem("fileName", file.name);
        },
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  // ✅ UTF-8 safe Base64 conversion
  const fileToBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const textData = reader.result;
      const base64Data = btoa(unescape(encodeURIComponent(textData))); // encode Arabic properly
      handleCreateBulkSignatories(base64Data);
      sessionStorage.setItem("base64CSV", base64Data);
    };
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = (acceptedFiles) => {
    const csvFile = acceptedFiles.find((file) => file.name.toLowerCase().endsWith(".csv"));

    if (!csvFile) {
      toast.error(t("uploadDocFlow.uploadCSV"));
      return;
    }

    setFileName(csvFile.name);
    parseCSV(csvFile);
    fileToBase64(csvFile);
  };

  const validateEmail = (email) => {
    const validateEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return validateEmailRegex.test(String(email).toLowerCase());
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const handleDelete = () => setShowModal(true);

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      const registerSignID = localStorage.getItem("registerSignID");

      await uploadFlowService.deleteSignatoriesFromCSV(registerSignID);

      toast.success(t("uploadDocFlow.signatoriesDeleted"));
      setFileName(null);
      setData([]);
      setShowModal(false);
      setIsFileValid(false);
      sessionStorage.removeItem("parsedData");
      sessionStorage.removeItem("fileName");
      sessionStorage.removeItem("base64CSV");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("uploadDocFlow.failedDelete"));
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => setShowModal(false);

  const handleBack = () => {
    setActiveStep(1);
    setCompletedSteps([0]);
  };

  const handleContinue = () => {
    setActiveStep(3);
    setCompletedSteps([1, 2]);
  };

  const handleCreateBulkSignatories = async (base64Data) => {
    try {
      setIsLoading(true);
      const registerSignID = localStorage.getItem("registerSignID");

      await uploadFlowService.createBulkSignatoryFromCSV({
        RegisterSignID: registerSignID,
        Base64CSV: base64Data,
      });

      toast.success(t("uploadDocFlow.BulkCreated"));
    } catch (error) {
      console.error("Upload error:", error);
      sessionStorage.removeItem("parsedData");
      sessionStorage.removeItem("fileName");
      sessionStorage.removeItem("base64CSV");
      toast.error(t("uploadDocFlow.FailedBulk"));
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { label: t("tablesLabel.name"), key: "name" },
    { label: t("tablesLabel.email"), key: "email" },
    { label: t("tablesLabel.status"), key: "emailStatus" },
  ];

  const downloadSampleCSV = () => {
    const sampleData = [
      ["Name", "Email"],
      ["John Doe", "john.doe@example.com"],
      ["Jane Smith", "jane.smith@example.com"],
    ];

    const csvContent = sampleData.map((e) => e.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_signers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setIsFileValid(data.length > 0 && data.every((row) => row.emailStatus === "Valid"));
  }, [data]);

  return (
    <div className='container mt-3'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='upload-csv' onClick={downloadSampleCSV}>
        <Icons.DownloadAction size={22} />
        <label className='m-0'>{t("uploadDocFlow.DownloadCSV")}</label>
      </div>

      {!fileName && (
        <div {...getRootProps()} className='csv-drag-container'>
          <input {...getInputProps()} />
          <Icons.UploadCSV size={45} color='var(--theme-color)' />
          <label>
            {t("uploadDocFlow.DragCsv")} <label className='drag-here'>{t("uploadDocFlow.here")}</label>
          </label>
        </div>
      )}

      {fileName && (
        <div className='file-info'>
          <label className='file-name'>
            <Icons.UploadCSV size={24} />
            {fileName}
          </label>
          <Icons.DeleteAction size={22} className='delete-icon' onClick={handleDelete} />
        </div>
      )}

      {fileName && (
        <Grid className='my-3'>
          <div style={{ marginBottom: "5rem" }} className='py-3 p-3 container pendingtable'>
            <TableContainer component={Paper} className='custom-table-scrollbar'>
              <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                <TableHead className='customTableHead'>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.label} style={{ backgroundColor: "#eee" }} className='TableHeaderCell'>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className='TableCell'>{row.name}</TableCell>
                      <TableCell className='TableCell'>{row.email}</TableCell>
                      <TableCell className='TableCell'>
                        <label
                          style={{
                            padding: "2px 12px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            color: row.emailStatus === "Valid" ? "#19d157" : "#6c757d",
                            border: `1px solid ${row.emailStatus === "Valid" ? "#19d157" : "#6c757d"}`,
                          }}
                        >
                          {row.emailStatus}
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.signatoriesof")} {data.length} {t("tablesLabel.signatories")}
              </div>
              <Stack spacing={2}>
                <Pagination count={Math.ceil(data.length / rowsPerPage)} variant='outlined' shape='rounded' page={page + 1} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
              </Stack>
            </div>
          </div>
        </Grid>
      )}

      <DeleteConfirmationModal
        show={showModal}
        onHide={cancelDelete}
        title={t("Folder.deleteConfirmation")}
        subtitle={t("uploadDocFlow.confirmDelete")}
        warningText={t("uploadDocFlow.sureDelete")}
        itemTitle={t("tablesLabel.signatories")}
        itemName={fileName || ""}
        onConfirm={confirmDelete}
        confirmText={t("uploadDocFlow.delete")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIconSrc={Icons.DeleteAction}
        itemIconSrc={Icons.Upload}
      />

      <div className='fixed-button-container'>
        <Button className='backBtn' id='hide_part_one' onClick={handleBack}>
          {t("uploadDocFlow.back")}
        </Button>

        <Button className='Continue-btn' onClick={handleContinue} id='hide_part_one' disabled={!isFileValid}>
          {t("uploadDocFlow.Continue")}
        </Button>
      </div>
    </div>
  );
}

export default PlaceBulkSignatories;
