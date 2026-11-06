import React, { useState, useEffect } from "react";
import verificationService from "@/services/verificationService";
import AuditTrailTimeline from "./AuditTrailTimeline";
import "./AuditTrail.css";

export default function AuditTrailSignaturePage({ url }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signatoryData, setSignatoryData] = useState({});

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
      setData(response.data.response || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getAuditCompletedStatus = async (pathAfterId) => {
    setIsLoading(true);
    try {
      const response = await verificationService.getSignAuditStatusVerification(pathAfterId);
      const sig = response.data.response || {};
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
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className='audit-trail-page w-full min-h-screen bg-[var(--modern-bg)] text-[var(--modern-text)] flex items-center justify-center p-4'>
      <div className='w-full max-w-[500px] rounded-2xl bg-[var(--modern-card)] border border-[var(--modern-border)] shadow-2xl p-6'>
        <AuditTrailTimeline
          data={data}
          signatoryData={signatoryData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
