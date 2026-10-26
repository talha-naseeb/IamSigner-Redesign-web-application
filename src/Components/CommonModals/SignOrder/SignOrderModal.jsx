import React, { useMemo } from "react";
import { Modal, Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";

export const STATUS_MAP = {
  originator: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    dot: "#94a3b8",
  },
  signed: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    dot: "#10b981",
  },
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
    dot: "#f59e0b",
  },
  notstarted: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    dot: "#94a3b8",
  },
  declined: {
    bg: "bg-rose-50 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800",
    dot: "#ef4444",
  },
  viewed: {
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
    dot: "#6366f1",
  },
  recalled: {
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-800",
    dot: "#06b6d4",
  },
  review: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-800",
    dot: "#a855f7",
  },
};

export const getStatusStyle = (status) => {
  if (!status) return STATUS_MAP.notstarted;
  const key = String(status).toLowerCase().replace(/[\s_-]/g, "");
  return STATUS_MAP[key] || STATUS_MAP.pending || STATUS_MAP.notstarted;
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
      { key: "originator", color: "#94a3b8", name: t("signOrderDaigram.originator") || "Originator" },
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
        name: uniqueSignatories[0].createdByName || uniqueSignatories[0].name || uniqueSignatories[0].createdBy || t("signOrderDaigram.originator") || "Originator",
        email: uniqueSignatories[0].createdBy || uniqueSignatories[0].email || "",
      };
    }
    return null;
  }, [uniqueSignatories, t]);

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
      <Modal.Header closeButton>
        <Modal.Title className='flex items-center gap-2 text-base md:text-lg font-semibold text-[var(--modern-text)]'>
          <Icons.SignOrder size={20} className='text-[var(--modern-primary)] shrink-0' />
          <span>{t("signOrderDaigram.Signorder") || "Sign Order"}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='p-4 md:p-6 max-h-[75vh] overflow-y-auto space-y-4'>
        {/* Status Legend */}
        <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 p-3 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
          {colorOptions.map((item) => (
            <div
              key={item.key}
              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--modern-card)] border border-[var(--modern-border)] text-xs text-[var(--modern-text)]'
            >
              <span
                className='w-2.5 h-2.5 rounded-full shrink-0'
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
            <div className='w-12 h-12 rounded-full bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)]'>
              <Icons.SignOrder size={24} />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-[var(--modern-text)]'>
                {error || t("signOrderDaigram.notDocsFound") || "No sign order information available"}
              </p>
              <p className='text-xs text-[var(--modern-muted)] max-w-sm'>
                {t("signOrderDaigram.emptyDescription") || "No signatories were found for this document."}
              </p>
            </div>
            {onRetry && (
              <Button
                variant='secondary'
                size='sm'
                onClick={onRetry}
                className='mt-2'
              >
                {t("common.retry") || "Retry"}
              </Button>
            )}
          </div>
        )}

        {/* Sign Order Flow Diagram */}
        {!isLoading && !error && uniqueSignatories.length > 0 && (
          <div className='sign-order-flow space-y-4'>
            {/* Desktop Table Header */}
            <div className='hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-[var(--modern-border)] text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)] text-center'>
              <div className='col-span-3'>{t("signOrderDaigram.originator") || "Originator"}</div>
              <div className='col-span-6'>{t("signOrderDaigram.signatories") || "Signatories"}</div>
              <div className='col-span-3'>{t("signOrderDaigram.status") || "Status"}</div>
            </div>

            {/* Desktop Grid Layout */}
            <div className='hidden md:grid grid-cols-12 gap-4 items-start pt-2'>
              {/* Originator Column */}
              <div className='col-span-3 flex justify-center'>
                <div
                  className='w-full max-w-[180px] p-3 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border-strong)] text-center transition-colors'
                  title={originator?.email || originator?.name}
                >
                  <div className='text-xs font-medium text-[var(--modern-muted)] uppercase tracking-wider mb-1'>
                    {t("signOrderDaigram.originator") || "Originator"}
                  </div>
                  <div className='font-semibold text-sm text-[var(--modern-text)] break-words line-clamp-2'>
                    {originator?.name}
                  </div>
                  {originator?.email && (
                    <div className='text-[11px] text-[var(--modern-muted)] break-all mt-0.5 line-clamp-1'>
                      {originator.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow + Signatories Stack Column */}
              <div className='col-span-6 flex flex-col items-center relative'>
                {/* Horizontal Connector Arrow from Originator */}
                <div
                  className='absolute top-4 -left-4 flex items-center justify-center text-[var(--modern-muted)]'
                  style={{ transform: isRtl ? "rotate(180deg)" : "none" }}
                  aria-hidden='true'
                >
                  <Icons.ArrowRightLong size={22} />
                </div>

                {/* Signatories Stack */}
                <div className='w-full flex flex-col items-center space-y-2'>
                  {uniqueSignatories.map((signatory, index) => {
                    const statusStyle = getStatusStyle(signatory.signStatus);
                    return (
                      <React.Fragment key={signatory.signatoriesID || signatory.email || index}>
                        <div
                          className={`w-full max-w-[240px] p-3 rounded-xl bg-[var(--modern-card)] border-2 ${statusStyle.border} text-center transition-colors`}
                          title={signatory.email || signatory.name}
                        >
                          <div className='flex items-center justify-center gap-1.5 mb-0.5'>
                            <span className='inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--modern-raised)] text-[10px] font-bold text-[var(--modern-muted)]'>
                              {index + 1}
                            </span>
                            <span className='font-semibold text-sm text-[var(--modern-text)] break-words line-clamp-1'>
                              {signatory.name || signatory.email || "Signatory"}
                            </span>
                          </div>
                          {signatory.email && (
                            <div className='text-[11px] text-[var(--modern-muted)] break-all line-clamp-1'>
                              {signatory.email}
                            </div>
                          )}
                        </div>

                        {index < uniqueSignatories.length - 1 && (
                          <div className='py-1 text-[var(--modern-muted)]' aria-hidden='true'>
                            <Icons.ArrowDownLong size={20} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Status Column */}
              <div className='col-span-3 flex flex-col items-center space-y-2'>
                {uniqueSignatories.map((signatory, index) => {
                  const statusStyle = getStatusStyle(signatory.signStatus);
                  const isLast = index === uniqueSignatories.length - 1;
                  return (
                    <div
                      key={`status-${signatory.signatoriesID || signatory.email || index}`}
                      className='w-full flex items-center justify-center'
                      style={{
                        minHeight: isLast ? "64px" : "96px",
                        alignItems: "flex-start",
                        paddingTop: "10px",
                      }}
                    >
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        title={signatory.signStatus || "Status"}
                      >
                        {signatory.signStatus || t("signOrderDaigram.pending") || "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className='md:hidden space-y-5 pt-1'>
              {/* Originator Box */}
              <div className='space-y-2 text-center'>
                <div className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>
                  {t("signOrderDaigram.originator") || "Originator"}
                </div>
                <div
                  className='mx-auto max-w-sm p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border-strong)] text-center'
                  title={originator?.email || originator?.name}
                >
                  <div className='font-semibold text-sm text-[var(--modern-text)] break-words'>
                    {originator?.name}
                  </div>
                  {originator?.email && (
                    <div className='text-xs text-[var(--modern-muted)] break-all mt-0.5'>
                      {originator.email}
                    </div>
                  )}
                </div>
                <div className='flex justify-center text-[var(--modern-muted)] py-1'>
                  <Icons.ArrowDownLong size={22} />
                </div>
              </div>

              {/* Signatories List */}
              <div className='space-y-3'>
                <div className='text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)] text-center'>
                  {t("signOrderDaigram.signatories") || "Signatories"} & {t("signOrderDaigram.status") || "Status"}
                </div>

                <div className='space-y-2.5'>
                  {uniqueSignatories.map((signatory, index) => {
                    const statusStyle = getStatusStyle(signatory.signStatus);
                    return (
                      <div
                        key={`mob-${signatory.signatoriesID || signatory.email || index}`}
                        className={`p-3.5 rounded-xl bg-[var(--modern-card)] border-2 ${statusStyle.border} space-y-2`}
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--modern-raised)] text-xs font-bold text-[var(--modern-muted)] shrink-0'>
                              {index + 1}
                            </span>
                            <div className='min-w-0'>
                              <div className='font-semibold text-sm text-[var(--modern-text)] truncate'>
                                {signatory.name || signatory.email || "Signatory"}
                              </div>
                              {signatory.email && (
                                <div className='text-xs text-[var(--modern-muted)] truncate'>
                                  {signatory.email}
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {signatory.signStatus || t("signOrderDaigram.pending") || "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className='border-t border-[var(--modern-border)] px-4 py-3 flex justify-end'>
        <Button
          variant='secondary'
          onClick={onHide}
          className='px-5 py-2 text-sm font-medium rounded-lg'
        >
          {t("signOrderDaigram.close") || "Close"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignOrderModal;
