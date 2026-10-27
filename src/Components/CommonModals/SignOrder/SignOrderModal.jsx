import React, { useMemo } from "react";
import { Modal, Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { CheckCircle2, Clock, XCircle, Eye, RefreshCw, FileText, ArrowDown, ArrowRight, UserCheck } from "lucide-react";

export const STATUS_MAP = {
  originator: {
    label: "Originator",
    color: "#64748b",
    icon: UserCheck,
    bg: "rgba(100, 116, 139, 0.1)",
    border: "rgba(100, 116, 139, 0.3)",
  },
  signed: {
    label: "Signed",
    color: "#10b981",
    icon: CheckCircle2,
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
    icon: Clock,
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
  },
  notstarted: {
    label: "Not Started",
    color: "#94a3b8",
    icon: Clock,
    bg: "rgba(148, 163, 184, 0.1)",
    border: "rgba(148, 163, 184, 0.3)",
  },
  declined: {
    label: "Declined",
    color: "#ef4444",
    icon: XCircle,
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
  },
  viewed: {
    label: "Viewed",
    color: "#6366f1",
    icon: Eye,
    bg: "rgba(99, 102, 241, 0.1)",
    border: "rgba(99, 102, 241, 0.3)",
  },
  recalled: {
    label: "Recalled",
    color: "#06b6d4",
    icon: RefreshCw,
    bg: "rgba(6, 182, 212, 0.1)",
    border: "rgba(6, 182, 212, 0.3)",
  },
};

export const getStatusMeta = (status) => {
  if (!status) return STATUS_MAP.pending;
  const key = String(status).toLowerCase().replace(/[\s_-]/g, "");
  return STATUS_MAP[key] || STATUS_MAP.pending;
};

export const SignOrderModal = ({
  show = false,
  onHide,
  isLoading = false,
  data = null,
  error = null,
  onRetry,
}) => {
  const { t } = useTranslation();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const colorOptions = useMemo(
    () => [
      { key: "originator", color: "#64748b", name: t("signOrderDaigram.originator") || "Originator" },
      { key: "signed", color: "#10b981", name: t("signOrderDaigram.signed") || "Signed" },
      { key: "pending", color: "#f59e0b", name: t("signOrderDaigram.pending") || "Pending" },
      { key: "notstarted", color: "#94a3b8", name: t("signOrderDaigram.notStarted") || "Not Started" },
      { key: "declined", color: "#ef4444", name: t("signOrderDaigram.declined") || "Declined" },
      { key: "viewed", color: "#6366f1", name: t("signOrderDaigram.viewed") || "Viewed" },
      { key: "recalled", color: "#06b6d4", name: t("signOrderDaigram.recalled") || "Recalled" },
    ],
    [t]
  );

  const rawList = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.response)) return data.response;
    if (Array.isArray(data.response?.signatories)) return data.response.signatories;
    if (Array.isArray(data.signatories)) return data.signatories;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const uniqueSignatories = useMemo(() => {
    const list = [];
    const seen = new Set();
    rawList.forEach((signatory, index) => {
      const email = (signatory.email || signatory.createdBy || "").trim().toLowerCase();
      if (index === 0 || !email || !seen.has(email)) {
        if (email) seen.add(email);
        list.push(signatory);
      }
    });
    return list;
  }, [rawList]);

  const originator = useMemo(() => {
    if (uniqueSignatories.length > 0) {
      return {
        name:
          uniqueSignatories[0].createdByName ||
          uniqueSignatories[0].name ||
          uniqueSignatories[0].createdBy ||
          t("signOrderDaigram.originator") ||
          "Originator",
        email: uniqueSignatories[0].createdBy || uniqueSignatories[0].email || "",
      };
    }
    return null;
  }, [uniqueSignatories, t]);

  const progressSummary = useMemo(() => {
    if (uniqueSignatories.length === 0) return { signedCount: 0, total: 0, percent: 0 };
    const signedCount = uniqueSignatories.filter((s) => {
      const st = String(s.signStatus || "").toLowerCase();
      return st.includes("sign") || st.includes("complet");
    }).length;
    const total = uniqueSignatories.length;
    return {
      signedCount,
      total,
      percent: Math.round((signedCount / total) * 100),
    };
  }, [uniqueSignatories]);

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(" ");
      return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size='lg'
      centered
      backdrop='static'
      keyboard={false}
      className='sign-order-modal'
    >
      {/* Enhanced Header */}
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-primary)] shrink-0'>
            <Icons.SignOrder size={20} />
          </div>
          <div>
            <Modal.Title className='text-base md:text-lg font-semibold text-[var(--modern-text)] m-0 leading-tight'>
              {t("signOrderDaigram.Signorder") || "Signature Order & Workflow"}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("signOrderDaigram.workflowSubtitle") ||
                "Sequential signing route and real-time delivery status."}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-4 md:p-6 max-h-[75vh] overflow-y-auto space-y-5 custom-table-scrollbar'>
        {/* Status Legend Bar */}
        <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 p-3 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
          {colorOptions.map((item) => (
            <div
              key={item.key}
              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--modern-card)] border border-[var(--modern-border)] text-xs text-[var(--modern-text)]'
            >
              <span
                className='w-2 h-2 rounded-full shrink-0'
                style={{ backgroundColor: item.color }}
              />
              <span className='font-medium whitespace-nowrap'>{item.name}</span>
            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className='flex flex-col items-center justify-center py-16 gap-3 text-[var(--modern-muted)]'>
            <div className='w-8 h-8 rounded-full border-2 border-[var(--modern-primary)] border-t-transparent animate-spin' />
            <span className='text-sm font-medium'>
              {t("signOrderDaigram.loading") || "Loading signature order..."}
            </span>
          </div>
        )}

        {/* Error or Empty State */}
        {!isLoading && (error || uniqueSignatories.length === 0) && (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center space-y-3'>
            <div className='w-12 h-12 rounded-2xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)]'>
              <Icons.SignOrder size={24} />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-[var(--modern-text)] m-0'>
                {error || t("signOrderDaigram.notDocsFound") || "No sign order information available"}
              </p>
              <p className='text-xs text-[var(--modern-muted)] m-0 max-w-sm'>
                {t("signOrderDaigram.emptyDescription") ||
                  "No signatories were recorded for this document."}
              </p>
            </div>
            {onRetry && (
              <Button variant='secondary' size='sm' onClick={onRetry} className='mt-2'>
                {t("common.retry") || "Retry"}
              </Button>
            )}
          </div>
        )}

        {/* Enhanced Workflow Timeline Diagram */}
        {!isLoading && !error && uniqueSignatories.length > 0 && (
          <div className='space-y-5'>
            {/* Workflow Progress Banner */}
            <div className='flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)]'>
              <div className='flex items-center gap-2'>
                <FileText size={16} className='text-[var(--modern-primary)]' />
                <span className='text-xs font-semibold text-[var(--modern-text)]'>
                  {t("signOrderDaigram.workflowProgress") || "Workflow Progress"}:
                </span>
                <span className='text-xs text-[var(--modern-muted)]'>
                  {progressSummary.signedCount} {t("signOrderDaigram.of") || "of"}{" "}
                  {progressSummary.total} {t("signOrderDaigram.signed") || "completed"}
                </span>
              </div>
              <div className='flex items-center gap-2 min-w-[120px]'>
                <div className='flex-1 h-2 rounded-full bg-[var(--modern-raised)] overflow-hidden border border-[var(--modern-border)]'>
                  <div
                    className='h-full bg-emerald-500 transition-all duration-300'
                    style={{ width: `${progressSummary.percent}%` }}
                  />
                </div>
                <span className='text-xs font-bold text-[var(--modern-text)]'>
                  {progressSummary.percent}%
                </span>
              </div>
            </div>

            {/* Visual Flow Track */}
            <div className={`relative ${isRtl ? "pr-4 pl-2" : "pl-4 pr-2"} space-y-4`}>
              {/* Originator Node */}
              <div className='relative flex items-start gap-3.5'>
                <div className='flex flex-col items-center shrink-0'>
                  <div className='w-8 h-8 rounded-full bg-[var(--modern-raised)] border-2 border-[var(--modern-border-strong)] flex items-center justify-center text-xs font-bold text-[var(--modern-text)]'>
                    {getInitials(originator?.name, originator?.email)}
                  </div>
                  <div className='w-0.5 h-10 bg-[var(--modern-border)] my-1' />
                </div>

                <div className='flex-1 p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex flex-wrap items-center justify-between gap-2'>
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <div className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--modern-card)] border border-[var(--modern-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                      <UserCheck size={11} className='text-slate-500' />
                      {t("signOrderDaigram.originator") || "Originator"}
                    </div>
                    <div className='font-semibold text-sm text-[var(--modern-text)]'>
                      {originator?.name}
                    </div>
                    {originator?.email && (
                      <div className='text-xs text-[var(--modern-muted)]'>{originator.email}</div>
                    )}
                  </div>
                  <span
                    className='home-status-pill text-xs'
                    style={{ "--status-color": "#64748b" }}
                  >
                    <span className='status-dot' />
                    {t("signOrderDaigram.creator") || "Document Creator"}
                  </span>
                </div>
              </div>

              {/* Signatories Sequence Nodes */}
              {uniqueSignatories.map((signatory, index) => {
                const meta = getStatusMeta(signatory.signStatus);
                const isSigned =
                  String(signatory.signStatus || "").toLowerCase().includes("sign") ||
                  String(signatory.signStatus || "").toLowerCase().includes("complet");
                const isLast = index === uniqueSignatories.length - 1;

                return (
                  <div
                    key={signatory.signatoriesID || signatory.email || index}
                    className='relative flex items-start gap-3.5'
                  >
                    {/* Vertical Connector Line & Step Circle */}
                    <div className='flex flex-col items-center shrink-0'>
                      <div
                        className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors'
                        style={{
                          backgroundColor: isSigned ? "#10b981" : "var(--modern-card)",
                          borderColor: isSigned ? "#10b981" : meta.color,
                          color: isSigned ? "#ffffff" : "var(--modern-text)",
                        }}
                      >
                        {isSigned ? <CheckCircle2 size={16} /> : index + 1}
                      </div>
                      {!isLast && (
                        <div
                          className='w-0.5 h-12 my-1'
                          style={{
                            backgroundColor: isSigned ? "#10b981" : "var(--modern-border)",
                          }}
                        />
                      )}
                    </div>

                    {/* Signatory Card */}
                    <div className='flex-1 p-3.5 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] hover:border-[var(--modern-border-strong)] transition-colors flex flex-wrap items-center justify-between gap-3'>
                      <div className={`min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--modern-raised)] text-[var(--modern-muted)] border border-[var(--modern-border)]'>
                            {t("signOrderDaigram.step") || "Step"} {index + 1}
                          </span>
                          <span className='font-semibold text-sm text-[var(--modern-text)] truncate'>
                            {signatory.name || signatory.email || "Signatory"}
                          </span>
                        </div>
                        {signatory.email && (
                          <div className='text-xs text-[var(--modern-muted)] truncate'>
                            {signatory.email}
                          </div>
                        )}
                        {signatory.signingDate && (
                          <div className='text-[10px] text-[var(--modern-muted)] mt-1 flex items-center gap-1'>
                            <Clock size={11} />
                            <span>{signatory.signingDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Pill with colored dot */}
                      <span
                        className='home-status-pill text-xs'
                        style={{ "--status-color": meta.color }}
                      >
                        <span className='status-dot' />
                        {signatory.signStatus || t("signOrderDaigram.pending") || "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex justify-end'>
        <Button
          variant='secondary'
          onClick={onHide}
          className='px-5 py-2 text-xs font-semibold rounded-lg'
        >
          {t("signOrderDaigram.close") || "Close"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignOrderModal;
