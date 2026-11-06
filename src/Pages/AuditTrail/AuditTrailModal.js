import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import verificationService from "@/services/verificationService";
import AuditTrailTimeline from "./AuditTrailTimeline";
import "./AuditTrail.css";

const AuditTrailModal = ({ show, handleClose, auditTrailURL, className }) => {
  const [data, setData] = useState([]);
  const [signatoryData, setSignatoryData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show || !auditTrailURL) return;

    const isDownload = auditTrailURL.includes("DownloadAuditTrail");
    const parts = auditTrailURL.split("/id/");
    const pathAfterId = parts[1] || "";

    if (!pathAfterId) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [activityRes, statusRes] = await Promise.all([
          verificationService.getAuditTrail(
            isDownload ? "/v1.0/api/GetSignActivityVerification" : "/v1.0/api/GetSignActivityCompleted",
            pathAfterId
          ),
          isDownload
            ? verificationService.getSignAuditStatusVerification(pathAfterId)
            : verificationService.getSignAuditStatusCompleted(pathAfterId),
        ]);

        if (isMounted) {
          setData(activityRes?.data?.response || []);
          const sig = statusRes?.data?.response || {};
          setSignatoryData({
            senderName: sig.senderName,
            senderEmail: sig.senderEmail,
            docStatus: sig.docStatus,
            createdOn: sig.createdOnFormatted || sig.createdOn,
            docNames: sig.docNames,
            masterDocIDs: sig.masterDocIDs,
            receivers: sig.receivers || [],
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [show, auditTrailURL]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered={true}
      backdrop={true}
      dialogClassName='!max-w-[500px] w-full mx-auto px-4'
      className={`audit-trail-modal ${className || ""}`}
      contentClassName='!p-6 !rounded-2xl !bg-[var(--modern-card)] !border !border-[var(--modern-border)] shadow-2xl'
    >
      <AuditTrailTimeline
        data={data}
        signatoryData={signatoryData}
        isLoading={isLoading}
        onClose={handleClose}
      />
    </Modal>
  );
};

export default AuditTrailModal;
