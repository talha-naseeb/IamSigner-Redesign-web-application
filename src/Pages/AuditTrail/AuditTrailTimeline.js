import React from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  Mail,
  Eye,
  FileSignature,
  MessageSquare,
  Download,
  XCircle,
  CheckCircle2,
  Activity,
  X,
  FileText,
} from "lucide-react";

export const formatTimelineDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const parsed = new Date(String(dateInput).replace(" ", "T"));
    if (!isNaN(parsed.getTime())) return formatTimelineDate(parsed);
    return String(dateInput);
  }
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}:${seconds}`;
};

export const getTimelineIcon = (status, message = "") => {
  const s = String(status || "").toLowerCase();
  const m = String(message || "").toLowerCase();

  if (s.includes("sent") || m.includes("sent") || s.includes("workflow") || m.includes("initiated")) {
    return {
      icon: Send,
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }
  if (s.includes("email") || m.includes("email") || m.includes("delivered")) {
    return {
      icon: Mail,
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }
  if (s.includes("view") || m.includes("view") || s.includes("opened") || m.includes("opened")) {
    return {
      icon: Eye,
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }
  if (s.includes("sign") || m.includes("sign") || s.includes("stamp") || m.includes("stamp")) {
    return {
      icon: FileSignature,
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (s.includes("comment") || m.includes("comment")) {
    return {
      icon: MessageSquare,
      className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
  }
  if (s.includes("download") || m.includes("download")) {
    return {
      icon: Download,
      className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    };
  }
  if (s.includes("decline") || s.includes("reject") || m.includes("decline") || m.includes("reject")) {
    return {
      icon: XCircle,
      className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    };
  }
  if (s.includes("complete") || m.includes("complete")) {
    return {
      icon: CheckCircle2,
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  return {
    icon: Activity,
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
};

export const renderStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  let dotColor = "bg-slate-400";
  let textColor = "text-[var(--modern-text)]";
  let bgColor = "bg-[var(--modern-raised)]";
  let borderColor = "border-[var(--modern-border)]";

  if (s.includes("signed") || s.includes("completed") || s.includes("success")) {
    dotColor = "bg-emerald-500";
    textColor = "text-emerald-600 dark:text-emerald-400";
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/25";
  } else if (s.includes("pending") || s.includes("wait")) {
    dotColor = "bg-amber-500";
    textColor = "text-amber-600 dark:text-amber-400";
    bgColor = "bg-amber-500/10";
    borderColor = "border-amber-500/25";
  } else if (s.includes("decline") || s.includes("reject") || s.includes("failed")) {
    dotColor = "bg-rose-500";
    textColor = "text-rose-600 dark:text-rose-400";
    bgColor = "bg-rose-500/10";
    borderColor = "border-rose-500/25";
  } else {
    dotColor = "bg-blue-500";
    textColor = "text-blue-600 dark:text-blue-400";
    bgColor = "bg-blue-500/10";
    borderColor = "border-blue-500/25";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgColor} ${textColor} ${borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status || "—"}</span>
    </span>
  );
};

export const renderTimelineMessage = (item) => {
  const raw = String(item.message || item.status || "").trim();

  // 1. Comment messages: e.g. "Talha Naseeb added a new comment [helo]" or "Talha Naseeb edited comment as [Heloo talha]"
  const commentMatch = raw.match(/^(.*?)(?:added a new comment|added comment|edited comment as|edited comment)\s*\[(.*?)\]\s*$/i);
  if (commentMatch) {
    const actor = commentMatch[1].trim();
    const commentText = commentMatch[2].trim();
    const isEdit = /edited/i.test(raw);

    return (
      <div className='flex flex-col gap-1'>
        <p className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] leading-snug m-0'>
          {actor ? <span className='font-bold text-[var(--modern-text)]'>{actor}</span> : null}{" "}
          <span className='font-normal text-[var(--modern-muted)]'>
            {isEdit ? "edited a comment" : "added a comment"}
          </span>
        </p>
        <div className='mt-1 p-2.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-xs text-[var(--modern-text)] flex items-start gap-2 shadow-xs'>
          <MessageSquare size={13} className='text-[var(--modern-primary,#4d8dff)] mt-0.5 shrink-0' />
          <span className='italic font-medium text-[var(--modern-text)] break-words leading-relaxed'>
            “{commentText}”
          </span>
        </div>
      </div>
    );
  }

  // 1b. Fallback bracket comment: e.g. "... [some text]"
  const genericBracketMatch = raw.match(/^(.*?)\[(.*?)\]\s*$/);
  if (genericBracketMatch) {
    const prefix = genericBracketMatch[1].trim();
    const content = genericBracketMatch[2].trim();

    return (
      <div className='flex flex-col gap-1'>
        <p className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] leading-snug m-0'>
          {prefix}
        </p>
        <div className='mt-1 p-2.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-xs text-[var(--modern-text)] flex items-start gap-2 shadow-xs'>
          <MessageSquare size={13} className='text-[var(--modern-primary,#4d8dff)] mt-0.5 shrink-0' />
          <span className='italic font-medium text-[var(--modern-text)] break-words leading-relaxed'>
            “{content}”
          </span>
        </div>
      </div>
    );
  }

  // 2. File view / download messages: e.g. "Talha Naseeb viewed First Floor Plan and 3D Interior Layout-2.png file" or "... downloaded ... file"
  const fileActionMatch = raw.match(/^(.*?)(viewed|downloaded)\s+(.*?)(?:\s+file)?$/i);
  if (fileActionMatch) {
    const actor = fileActionMatch[1].trim();
    const action = fileActionMatch[2].toLowerCase();
    const fileName = fileActionMatch[3].trim();

    return (
      <div className='flex flex-col gap-1'>
        <p className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] leading-snug m-0'>
          {actor ? <span className='font-bold text-[var(--modern-text)]'>{actor}</span> : null}{" "}
          <span className='font-normal text-[var(--modern-muted)]'>
            {action === "viewed" ? "viewed document" : "downloaded document"}
          </span>
        </p>
        <div className='mt-1 inline-flex items-center gap-2 p-2 px-2.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-xs text-[var(--modern-text)] shadow-xs max-w-full'>
          <FileText size={13} className='text-[var(--modern-primary,#4d8dff)] shrink-0' />
          <span className='font-mono text-[11px] font-semibold text-[var(--modern-text)] truncate' title={fileName}>
            {fileName}
          </span>
        </div>
      </div>
    );
  }

  // 3. Signature upload messages: e.g. "Talha Naseeb uploaded Signature for all relevant sections"
  const sigMatch = raw.match(/^(.*?)(uploaded Signature.*?)$/i);
  if (sigMatch) {
    const actor = sigMatch[1].trim();
    const action = sigMatch[2].trim();

    return (
      <p className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] leading-snug break-words m-0'>
        {actor ? <span className='font-bold text-[var(--modern-text)]'>{actor}</span> : null}{" "}
        <span className='font-medium text-[var(--modern-text)]'>{action}</span>
      </p>
    );
  }

  // 4. Default clean render
  return (
    <p className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] leading-snug break-words m-0'>
      {raw}
    </p>
  );
};

export default function AuditTrailTimeline({
  data = [],
  signatoryData = {},
  isLoading = false,
  onClose,
}) {
  const { t } = useTranslation();

  const receivers = signatoryData?.receivers || [];
  const allSigned =
    receivers.length > 0 && receivers.every((r) => r.signStatus === "Signed");
  const anyPending = receivers.some((r) => r.signStatus === "Pending");
  const computedStatus =
    anyPending
      ? signatoryData?.docStatus || "Pending"
      : allSigned
      ? "Signed"
      : signatoryData?.docStatus || (signatoryData?.docStatus === "Signed" ? "Signed" : "Pending");

  const isCompleted =
    computedStatus === "Signed" ||
    computedStatus === "Completed" ||
    signatoryData?.docStatus === "Signed" ||
    signatoryData?.docStatus === "Completed" ||
    allSigned;

  const docTitle = signatoryData?.docNames || "";
  const senderName = signatoryData?.senderName || t("auditTrailModal.sender", "Sender");

  return (
    <div className='audit-trail-timeline-card w-full flex flex-col text-[var(--modern-text)]'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='text-lg md:text-xl font-bold text-[var(--modern-text)] tracking-tight m-0'>
            {t("auditTrailModal.auditTrail", "Audit trail")}
          </h3>
          <p className='text-xs md:text-sm text-[var(--modern-muted)] mt-1 truncate font-normal m-0'>
            {docTitle || t("auditTrailModal.document", "Document")} · {senderName}
          </p>

          {/* Document Information (ID & Status) */}
          {(signatoryData?.masterDocIDs || computedStatus) && (
            <div className='mt-2.5 flex items-center justify-between gap-3 text-xs text-[var(--modern-muted)] flex-wrap'>
              {signatoryData?.masterDocIDs && (
                <div className='flex items-center gap-1.5 min-w-0'>
                  <span className='text-[10px] uppercase font-semibold tracking-wider text-[var(--modern-muted)]'>
                    {t("tablesLabel.documentID", "Document ID")}:
                  </span>
                  <span
                    className='text-[11px] font-mono font-medium text-[var(--modern-text)] truncate max-w-[210px]'
                    title={signatoryData.masterDocIDs}
                  >
                    {signatoryData.masterDocIDs}
                  </span>
                </div>
              )}
              <div className='flex items-center gap-1.5 shrink-0 ml-auto rtl:ml-0 rtl:mr-auto'>
                <span className='text-[10px] uppercase font-semibold tracking-wider text-[var(--modern-muted)]'>
                  {t("tablesLabel.status", "Status")}:
                </span>
                {renderStatusBadge(computedStatus)}
              </div>
            </div>
          )}
        </div>

        {onClose && (
          <button
            type='button'
            onClick={onClose}
            aria-label={t("auditTrailModal.close", "Close")}
            className='w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--modern-border)] bg-[var(--modern-raised)]/60 hover:bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] transition-colors shrink-0'
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Timeline Content */}
      <div className='mt-6 min-h-[160px] flex flex-col'>
        {isLoading ? (
          <div className='space-y-4 py-2'>
            {[1, 2, 3].map((n) => (
              <div key={n} className='flex items-start gap-3.5 animate-pulse'>
                <div className='w-8 h-8 rounded-full bg-[var(--modern-raised)] shrink-0' />
                <div className='flex-1 space-y-2 pt-1'>
                  <div className='h-4 bg-[var(--modern-raised)] rounded w-3/4' />
                  <div className='h-3 bg-[var(--modern-raised)] rounded w-1/3' />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 text-[var(--modern-muted)] text-center'>
            <FileText size={32} className='mb-2 opacity-40' />
            <p className='text-xs font-normal m-0'>
              {t("auditTrailModal.noActivity", "No activity recorded yet.")}
            </p>
          </div>
        ) : (
          <div className='space-y-0 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar'>
            {data.map((item, index) => {
              const { icon: IconComp, className: iconClass } = getTimelineIcon(item.status, item.message);
              const isLast = index === data.length - 1;
              return (
                <div key={item.signActivityID || index} className='relative flex items-stretch gap-3.5 group'>
                  {/* Left Column: Icon Node + Continuous Connector Line */}
                  <div className='flex flex-col items-center shrink-0 w-8'>
                    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full border shrink-0 bg-[var(--modern-card)] ${iconClass}`}>
                      <IconComp size={14} />
                    </div>
                    {!isLast && (
                      <div className='w-0.5 flex-1 min-h-[22px] bg-[var(--modern-border)] my-1' />
                    )}
                  </div>

                  {/* Right Column: Message & Timestamp */}
                  <div className='flex-1 min-w-0 pt-0.5 pb-4'>
                    {renderTimelineMessage(item)}
                    <span className='block text-[11px] font-mono text-[var(--modern-muted)] mt-1 tracking-wide'>
                      {formatTimelineDate(item.createdOn || item.createdOnFormatted)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Hash / Notice Banner */}
      <div className='mt-6 py-3 px-4 rounded-xl bg-[var(--modern-raised)]/70 border border-[var(--modern-border)] text-center'>
        <p className='text-[11px] sm:text-xs font-mono text-[var(--modern-muted)] leading-relaxed m-0 break-words'>
          {isCompleted
            ? signatoryData?.masterDocIDs
              ? `Document Hash: ${signatoryData.masterDocIDs}`
              : t("auditTrailModal.hashCompletedNotice", "The document hash is verified and secured.")
            : t("auditTrailModal.hashPendingNotice", "The document hash is generated when signing completes.")}
        </p>
      </div>
    </div>
  );
}
