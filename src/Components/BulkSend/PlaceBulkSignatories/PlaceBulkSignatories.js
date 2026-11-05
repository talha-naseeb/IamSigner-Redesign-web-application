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

function PlaceBulkSignatories({ setActiveStep, setCompletedSteps, onPreviewSync }) {
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
    if (typeof onPreviewSync === "function") {
      const recipientChips = data.map((row, idx) => ({
        name: row.name || `Signer ${idx + 1}`,
        email: row.email || "",
        signColor: "#4d8dff",
        signatureType: "Needs To Sign",
      }));
      onPreviewSync({ recipients: recipientChips });
    }
  }, [data, onPreviewSync]);

  return (
    <div className='flex flex-col h-full min-h-[480px] bg-[var(--modern-card,#ffffff)]'>
      {/* Studio Panel Header */}
      <div className='px-5 pt-5 pb-3.5 shrink-0 border-b border-[var(--modern-border,#e2e8f0)]'>
        <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
          {t("uploadDocFlow.step", "STEP")} 2 {t("uploadDocFlow.of", "OF")} 4
        </small>
        <h1 className='mt-0.5 text-[22px] font-bold tracking-tight text-[var(--modern-text)]'>
          {t("uploadDocFlow.importSigners", "Import Signers")}
        </h1>
        <p className='mt-1 text-[13px] text-[var(--modern-muted)] leading-relaxed'>
          {t(
            "uploadDocFlow.uploadCSVDesc",
            "Upload a CSV file containing your recipients (Name and Email columns) for bulk document generation."
          )}
        </p>

        {/* Sample CSV Download Pill Button */}
        <button
          type='button'
          onClick={downloadSampleCSV}
          className='mt-3 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] hover:bg-[var(--modern-card,#ffffff)] text-[var(--modern-primary,#4d8dff)] text-xs font-semibold transition-colors cursor-pointer'
        >
          <Icons.DownloadAction size={15} />
          <span>{t("uploadDocFlow.downloadSample", "Download Sample CSV")}</span>
        </button>
      </div>

      {/* Studio Scrollable Body */}
      <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4'>
        {/* CSV Dropzone */}
        {!fileName && (
          <div
            {...getRootProps()}
            className='border-2 border-dashed border-[var(--modern-border-strong,#cbd5e1)] hover:border-[var(--modern-primary,#4d8dff)] rounded-2xl p-6 bg-[var(--modern-raised)]/40 hover:bg-[var(--modern-raised)] flex flex-col items-center justify-center text-center transition-colors cursor-pointer'
          >
            <input {...getInputProps()} />
            <div className='w-12 h-12 rounded-xl bg-[var(--modern-primary)]/10 text-[var(--modern-primary)] flex items-center justify-center mb-3'>
              <Icons.UploadCSV size={24} />
            </div>
            <p className='text-sm font-semibold text-[var(--modern-text)] m-0'>
              {t("uploadDocFlow.DragCsv", "Drag-drop, or upload CSV")}{" "}
              <span className='text-[var(--modern-primary)] underline cursor-pointer'>{t("uploadDocFlow.here", "here")}</span>
            </p>
            <p className='text-xs text-[var(--modern-muted)] mt-1.5 max-w-[260px]'>
              {t("uploadDocFlow.csvRequirement", "Supports .csv files with Name and Email headers (UTF-8 encoded)")}
            </p>
          </div>
        )}

        {/* Uploaded File Pill Card */}
        {fileName && (
          <div className='flex items-center justify-between p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]/70'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='w-9 h-9 rounded-lg bg-[var(--modern-primary)]/15 text-[var(--modern-primary)] flex items-center justify-center shrink-0'>
                <Icons.UploadCSV size={20} />
              </div>
              <div className='min-w-0'>
                <div className='text-xs font-semibold text-[var(--modern-text)] truncate max-w-[190px]'>{fileName}</div>
                <div className='text-[11px] text-[var(--modern-muted)] mt-0.5 flex items-center gap-1.5 flex-wrap'>
                  <span>{data.length} {t("tablesLabel.signatories", "Signatories")}</span>
                  <span>·</span>
                  {isFileValid ? (
                    <span className='text-[var(--modern-success,#16a34a)] font-medium'>
                      ✓ {t("uploadDocFlow.allValid", "All valid")}
                    </span>
                  ) : (
                    <span className='text-[var(--modern-danger,#ef4444)] font-medium'>
                      ⚠ {t("uploadDocFlow.containsInvalid", "Invalid emails")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type='button'
              onClick={handleDelete}
              className='p-1.5 rounded-lg text-[var(--modern-muted)] hover:text-[var(--modern-danger,#ef4444)] hover:bg-[var(--modern-card)] transition-colors cursor-pointer border-0 bg-transparent'
              aria-label='Delete CSV file'
              title={t("uploadDocFlow.delete", "Delete")}
            >
              <Icons.DeleteAction size={18} />
            </button>
          </div>
        )}

        {/* CSV Preview Table */}
        {fileName && data.length > 0 && (
          <div className='rounded-xl border border-[var(--modern-border)] overflow-hidden bg-[var(--modern-card)]'>
            <div className='px-3.5 py-2.5 bg-[var(--modern-raised)] border-b border-[var(--modern-border)] flex items-center justify-between'>
              <span className='text-xs font-semibold text-[var(--modern-text)]'>
                {t("uploadDocFlow.signatoriesPreview", "Recipients Preview")}
              </span>
              <span className='text-[11px] text-[var(--modern-muted)] font-mono'>
                {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} / {data.length}
              </span>
            </div>

            <div className='overflow-x-auto'>
              <Table className='w-full text-xs'>
                <TableHead>
                  <TableRow className='bg-[var(--modern-raised)]/60'>
                    {columns.map((column) => (
                      <TableCell
                        key={column.label}
                        className='text-[var(--modern-text)] border-b border-[var(--modern-border)] font-semibold py-2 px-3 text-xs'
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index} className='hover:bg-[var(--modern-raised)]/50 transition-colors border-b border-[var(--modern-border)]'>
                      <TableCell className='text-[var(--modern-text)] py-2 px-3 font-medium text-xs truncate max-w-[100px]'>{row.name || "—"}</TableCell>
                      <TableCell className='text-[var(--modern-muted)] py-2 px-3 font-mono text-[11px] truncate max-w-[130px]'>{row.email || "—"}</TableCell>
                      <TableCell className='py-2 px-3'>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.emailStatus === "Valid"
                              ? "bg-[var(--modern-success,#16a34a)]/15 text-[var(--modern-success,#16a34a)] border border-[var(--modern-success,#16a34a)]/30"
                              : "bg-[var(--modern-danger,#ef4444)]/15 text-[var(--modern-danger,#ef4444)] border border-[var(--modern-danger,#ef4444)]/30"
                          }`}
                        >
                          {row.emailStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='p-3 border-t border-[var(--modern-border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--modern-muted)]'>
              <div className='text-[11px]'>
                {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.signatoriesof", "of")} {data.length}
              </div>
              {Math.ceil(data.length / rowsPerPage) > 1 && (
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(data.length / rowsPerPage)}
                    size='small'
                    variant='outlined'
                    shape='rounded'
                    page={page + 1}
                    onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                  />
                </Stack>
              )}
            </div>
          </div>
        )}
      </div>

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

      {/* Studio Sticky Footer */}
      <div className='mt-auto flex items-center justify-between gap-2.5 border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/80 px-5 py-3.5 shrink-0'>
        <Button
          variant='outline'
          id='hide_part_one'
          onClick={handleBack}
          disabled={isLoading}
          className='!h-[42px] !rounded-full !px-4 font-semibold shrink-0 hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] hover:bg-[color-mix(in_srgb,var(--modern-primary)_8%,var(--modern-card))] transition-all'
        >
          {t("uploadDocFlow.back")}
        </Button>

        <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isFileValid
                ? "bg-[var(--modern-success,#10b981)]"
                : "bg-[var(--modern-warning,#f59e0b)]"
            }`}
          />
          <span className='truncate'>
            {data.length > 0
              ? `${data.length} ${t("tablesLabel.signatories", "signatories")}`
              : t("uploadDocFlow.uploadCsvToContinue", "Upload CSV to continue")}
          </span>
        </div>

        <Button
          variant='primary'
          onClick={handleContinue}
          id='hide_part_one'
          disabled={!isFileValid || isLoading}
          className='!h-[42px] !rounded-full !px-6 font-semibold shrink-0 inline-flex items-center gap-2'
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin' />
              <span>{t("uploadDocFlow.Continue")}</span>
            </span>
          ) : (
            <span>{t("uploadDocFlow.Continue")}</span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PlaceBulkSignatories;
