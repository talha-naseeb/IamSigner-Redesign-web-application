import React, { useState, useEffect } from "react";
import verificationService from "@/services/verificationService";
import "./AuditTrail.css";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { applyThemeToDocument, getInitialTheme } from "@/Context/themeUtils";

const renderStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  let dotColor = "bg-slate-400";
  let textColor = "text-[var(--modern-text)]";
  let bgColor = "bg-[var(--modern-raised)]";
  let borderColor = "border-[var(--modern-border)]";

  if (s.includes("signed") || s.includes("completed") || s.includes("success")) {
    dotColor = "bg-emerald-500";
    textColor = "text-emerald-700 dark:text-emerald-400";
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/20";
  } else if (s.includes("pending") || s.includes("wait")) {
    dotColor = "bg-amber-500";
    textColor = "text-amber-700 dark:text-amber-400";
    bgColor = "bg-amber-500/10";
    borderColor = "border-amber-500/20";
  } else if (s.includes("decline") || s.includes("reject") || s.includes("failed")) {
    dotColor = "bg-rose-500";
    textColor = "text-rose-700 dark:text-rose-400";
    bgColor = "bg-rose-500/10";
    borderColor = "border-rose-500/20";
  } else if (s.includes("view") || s.includes("open") || s.includes("send")) {
    dotColor = "bg-blue-500";
    textColor = "text-blue-700 dark:text-blue-400";
    bgColor = "bg-blue-500/10";
    borderColor = "border-blue-500/20";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status || "—"}</span>
    </span>
  );
};

export default function AuditTrailSignaturePage({ url }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState();
  const [signatoryData, setSignatoryData] = useState({});
  const [receivers, setReceivers] = useState([]);

  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");
  const idIndex = parts.indexOf("id");

  useEffect(() => {
    if (idIndex !== -1 && idIndex < parts.length - 1) {
      const pathAfterId = parts.slice(idIndex + 1).join("/");
      getAuditTrail(pathAfterId);
      getAuditCompletedStatus(pathAfterId);
    }
  }, []);

  useEffect(() => {
    // Force light theme for external audit trail (public signing flow)
    const prev = document.documentElement.getAttribute("data-theme");
    applyThemeToDocument("light");
    document.body.classList.add("force-light-body");
    
    return () => {
      applyThemeToDocument(prev || getInitialTheme());
      document.body.classList.remove("force-light-body");
    };
  }, []);

  const getAuditTrail = async (pathAfterId) => {
    setIsLoading(true);
    try {
      const response = await verificationService.getAuditTrail(url, pathAfterId);
      setData(response.data.response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getAuditCompletedStatus = async (pathAfterId) => {
    setIsLoading(true);
    try {
      const response = await verificationService.getSignAuditStatusVerification(pathAfterId);
      const signatoryResponse = response.data.response;
      setSignatoryData({
        senderName: signatoryResponse.senderName,
        senderEmail: signatoryResponse.senderEmail,
        docStatus: allSigned ? "Signed" : signatoryResponse.docStatus,
        createdOn: signatoryResponse.createdOnFormatted,
        docNames: signatoryResponse.docNames,
        masterDocIDs: signatoryResponse.masterDocIDs,
      });
      setReceivers(signatoryResponse.receivers);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

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

  // Check if all receivers have signed
  const allSigned = receivers.every((receiver) => receiver.signStatus === "Signed");

  // Check if any receiver is pending
  const anyPending = receivers.some((receiver) => receiver.signStatus === "Pending");

  return (
    <Grid className='audit-trail audit-trail-container'>
      <div className='header'>
        <Icons.StepperLogo />
        <h4>{t("auditTrailScreen.auditTrail")}</h4>
      </div>
      <div className='signers-info'>
        <div>
          <span className='info-title fw-bold'>
            {t("tablesLabel.docInfo")}
          </span>
        </div>
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table stickyHeader style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("tablesLabel.date")}</TableCell>
                <TableCell>{t("tablesLabel.docName")}</TableCell>
                <TableCell>{t("tablesLabel.documentID")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell className='font-medium text-[var(--modern-text)]'>{signatoryData.docNames}</TableCell>
                <TableCell className='text-[var(--modern-muted)]'>{signatoryData.masterDocIDs}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className='signers-info'>
        <div>
          <span className='info-title fw-bold'>
            {t("auditTrailModal.senderInfo")}
          </span>
        </div>
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("tablesLabel.date")}</TableCell>
                <TableCell>{t("tablesLabel.name")}</TableCell>
                <TableCell>{t("tablesLabel.email")}</TableCell>
                <TableCell>{t("tablesLabel.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell>
                  <UserInitialsBadge name={signatoryData.senderName} />
                </TableCell>
                <TableCell className='text-[var(--modern-muted)]'>{signatoryData.senderEmail}</TableCell>
                <TableCell>
                  {renderStatusBadge(anyPending ? "Pending" : allSigned ? "Signed" : signatoryData.docStatus)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='signers-info'>
        <div>
          <span className='info-title fw-bold'>
            {t("auditTrailModal.receiverInfo")}
          </span>
        </div>
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell>{t("tablesLabel.name")}</TableCell>
                <TableCell>{t("tablesLabel.email")}</TableCell>
                <TableCell>{t("tablesLabel.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan='4' className='no-docs'>
                    <Icons.BulkDocuments size={50} color='var(--modern-border)' />
                    {t("dashboardCardStatuses.notDocsFound")}
                  </TableCell>
                </TableRow>
              )}
              {receivers.map((receiver, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <UserInitialsBadge name={receiver.receiverName} />
                  </TableCell>
                  <TableCell className='text-[var(--modern-muted)]'>{receiver.receiverEmail}</TableCell>
                  <TableCell>{renderStatusBadge(receiver.signStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='journal-info'>
        <div>
          <span className='info-title fw-bold'>
            {t("auditTrailModal.usersActivity")}
          </span>
        </div>
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell>{t("tablesLabel.date")}</TableCell>
                <TableCell>{t("tablesLabel.actions")}</TableCell>
                <TableCell>{t("tablesLabel.details")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan='4' className='no-docs'>
                    <Icons.BulkDocuments size={50} color='var(--modern-border)' />
                    {t("dashboardCardStatuses.notDocsFound")}
                  </TableCell>
                </TableRow>
              )}
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className='text-[var(--modern-muted)]'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                  <TableCell>{renderStatusBadge(row.status)}</TableCell>
                  <TableCell className='text-sm text-[var(--modern-text)]'>{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Grid>
  );
}
