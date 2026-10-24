import React, { useState, useEffect } from "react";
import "./AuditTrailInternal.css";
import { useTheme } from "@/Context/ThemeContext";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import verificationService from "@/services/verificationService";

export default function AuditTrail({ url }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState();
  const [signatoryData, setSignatoryData] = useState({});
  const [receivers, setReceivers] = useState([]);

  const { theme } = useTheme();

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
      const response = await verificationService.getSignAuditStatusCompleted(pathAfterId);
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
    <Grid className='audit-trail-internal audit-trail-internal-container'>
      <div className='header'>
        {theme === "dark" ? <Icons.IamSignerLightMode /> : <Icons.StepperLogo />}
        <h4>{t("auditTrailScreen.auditTrail")}</h4>
      </div>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <div className='signers-info'>
        <div>
          <span className='info-title'>{t("tablesLabel.docInfo")}</span>
        </div>
        <TableContainer component={Paper} className='custom-table-container custom-table-scrollbar'>
          <Table stickyHeader style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.date")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.docName")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.documentID")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell>{signatoryData.docNames}</TableCell>
                <TableCell>{signatoryData.masterDocIDs}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className='signers-info'>
        <div>
          <span className='info-title'>{t("auditTrailModal.senderInfo")}</span>
        </div>
        <TableContainer component={Paper} className='custom-table-container custom-table-scrollbar'>
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.date")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.name")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.email")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell>{signatoryData.senderName}</TableCell>
                <TableCell>{signatoryData.senderEmail}</TableCell>
                <TableCell>{anyPending ? "Pending" : allSigned ? "Signed" : signatoryData.docStatus}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='signers-info mb-3'>
        <div>
          <span className='info-title'>{t("auditTrailModal.receiverInfo")}</span>
        </div>
        <TableContainer component={Paper} className='custom-table-container custom-table-scrollbar'>
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.name")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.email")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.status")}</TableCell>
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
                  <TableCell>{receiver.receiverName}</TableCell>
                  <TableCell>{receiver.receiverEmail}</TableCell>
                  <TableCell>{receiver.signStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='journal-info'>
        <div>
          <span className='info-title'>{t("auditTrailModal.usersActivity")}</span>
        </div>
        <TableContainer component={Paper} className='custom-table-container custom-table-scrollbar'>
          <Table style={{ border: "none" }}>
            <TableHead>
              <TableRow>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.date")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.actions")}</TableCell>
                <TableCell className='TableHeaderCell'>{t("tablesLabel.details")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan='4' className='no-docs'>
                    <Icons.BulkDocuments size={50} />
                    {t("dashboardCardStatuses.notDocsFound")}
                  </TableCell>
                </TableRow>
              )}
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Grid>
  );
}
