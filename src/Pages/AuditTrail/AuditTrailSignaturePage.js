import React, { useState, useEffect } from "react";
import verificationService from "@/services/verificationService";
import "./AuditTrail.css";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { applyThemeToDocument, getInitialTheme } from "@/Context/themeUtils";

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
    <Grid className='audit-trail-container'>
      <div className='header'>
        <Icons.StepperLogo style={{ width: "140px", height: "40px" }} />
        <h4>{t("auditTrailScreen.auditTrail")}</h4>
      </div>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='signers-info'>
        <div>
          <span style={{ fontSize: "18px" }} className='fw-bold'>
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
          <Table style={{ border: "none" }}>
            <TableHead style={{ backgroundColor: "#f0f3f4" }}>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.date")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.docName")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.documentID")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.docNames}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.masterDocIDs}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className='signers-info'>
        <div>
          <span style={{ fontSize: "18px" ,marginBottom:"1rem" }} className='fw-bold'>
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
            <TableHead style={{ backgroundColor: "#f0f3f4" }}>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.date")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.name")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.email")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.createdOn ? formatDate(signatoryData.createdOn) : ""}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.senderName}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{signatoryData.senderEmail}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{anyPending ? "Pending" : allSigned ? "Signed" : signatoryData.docStatus}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='signers-info'>
        <div>
          <span style={{ fontSize: "18px" }} className='fw-bold'>
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
            <TableHead style={{ backgroundColor: "#f0f3f4" }}>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.name")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.email")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan='4' className='no-docs'>
                    <Icons.BulkDocuments size={50} color='#F0F3F4' />
                    {t("dashboardCardStatuses.notDocsFound")}
                  </TableCell>
                </TableRow>
              )}
              {receivers.map((receiver, index) => (
                <TableRow key={index}>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{index + 1}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{receiver.receiverName}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{receiver.receiverEmail}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{receiver.signStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className='journal-info'>
        <div>
          <span style={{ fontSize: "18px" }} className='fw-bold'>
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
            <TableHead style={{ backgroundColor: "#f0f3f4" }}>
              <TableRow>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.serialNo") || "S.No."}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.date")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.actions")}</TableCell>
                <TableCell style={{ fontFamily: "Times New Roman" }}>{t("tablesLabel.details")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan='4' className='no-docs'>
                    <Icons.BulkDocuments size={50} color='#F0F3F4' />
                    {t("dashboardCardStatuses.notDocsFound")}
                  </TableCell>
                </TableRow>
              )}
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{index + 1}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{row.status}</TableCell>
                  <TableCell style={{ fontFamily: "Times New Roman" }}>{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Grid>
  );
}
