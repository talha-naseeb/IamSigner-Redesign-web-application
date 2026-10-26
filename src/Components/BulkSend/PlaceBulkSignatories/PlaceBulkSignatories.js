import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Icons } from "@/assets/Icons";
import { Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@/Components/UI/dataPrimitives";
import uploadFlowService from "@/services/uploadFlowService";
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
    <div className='container max-w-5xl mx-auto px-4 mt-4'>

      <div
        className='flex items-center justify-center gap-2 p-3.5 rounded-md cursor-pointer bg-[var(--modern-primary,#6366f1)] text-white font-semibold hover:opacity-90 transition-opacity'
        onClick={downloadSampleCSV}
      >
        <Icons.DownloadAction size={22} />
        <label className='m-0 cursor-pointer'>{t("uploadDocFlow.DownloadCSV")}</label>
      </div>

      {!fileName && (
        <div
          {...getRootProps()}
          className='border-2 border-dashed border-[var(--modern-border-strong)] rounded-lg p-10 bg-[var(--modern-card)] flex flex-col items-center justify-center gap-2 text-center mt-4 transition-colors hover:border-[var(--modern-primary)] cursor-pointer'
        >
          <input {...getInputProps()} />
          <Icons.UploadCSV size={45} color='var(--modern-primary,#6366f1)' />
          <p className='text-base text-[var(--modern-text)] m-0'>
            {t("uploadDocFlow.DragCsv")}{" "}
            <span className='text-[var(--modern-primary,#6366f1)] underline mx-1 font-medium'>{t("uploadDocFlow.here")}</span>
          </p>
        </div>
      )}

      {fileName && (
        <div className='flex items-center justify-between p-3.5 rounded-md border border-[var(--modern-border)] bg-[var(--modern-raised)] mt-4'>
          <label className='flex items-center gap-2 text-sm font-medium text-[var(--modern-text)] m-0'>
            <Icons.UploadCSV size={24} />
            {fileName}
          </label>
          <Icons.DeleteAction size={22} className='cursor-pointer text-[var(--modern-danger,#ef4444)] hover:opacity-80' onClick={handleDelete} />
        </div>
      )}

      {fileName && (
        <Grid className='my-4'>
          <div className='mb-20 p-4 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)]'>
            <TableContainer component={Paper} className='border border-[var(--modern-border)] rounded-md bg-[var(--modern-card)] shadow-none'>
              <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.label}
                        className='bg-[var(--modern-raised)] text-[var(--modern-text)] border-b border-[var(--modern-border)] font-semibold'
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index} className='hover:bg-[var(--modern-raised)]/50 transition-colors'>
                      <TableCell className='text-[var(--modern-text)] border-b border-[var(--modern-border)]'>{row.name}</TableCell>
                      <TableCell className='text-[var(--modern-text)] border-b border-[var(--modern-border)]'>{row.email}</TableCell>
                      <TableCell className='border-b border-[var(--modern-border)]'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.emailStatus === "Valid"
                              ? "bg-[var(--modern-success,#16a34a)]/15 text-[var(--modern-success,#16a34a)] border border-[var(--modern-success,#16a34a)]/30"
                              : "bg-[var(--modern-muted,#64748b)]/15 text-[var(--modern-muted,#64748b)] border border-[var(--modern-muted,#64748b)]/30"
                          }`}
                        >
                          {row.emailStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-[var(--modern-muted)]'>
              <div>
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

      <div className='fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)]'>
        <Button variant='outline' id='hide_part_one' onClick={handleBack} disabled={isLoading}>
          {t("uploadDocFlow.back")}
        </Button>

        <Button variant='primary' onClick={handleContinue} id='hide_part_one' disabled={!isFileValid || isLoading}>
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
              {t("uploadDocFlow.Continue")}
            </span>
          ) : (
            t("uploadDocFlow.Continue")
          )}
        </Button>
      </div>
    </div>
  );
}

export default PlaceBulkSignatories;
