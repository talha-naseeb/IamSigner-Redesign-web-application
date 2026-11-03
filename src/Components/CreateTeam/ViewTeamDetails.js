import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import userService from "@/services/userService";
import documentService from "@/services/documentService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Mail, Phone, UserCheck, User } from "lucide-react";

const ViewTeamDetails = ({ show, onHide, appUserID }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [documentStats, setDocumentStats] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!appUserID) return;
      setIsLoading(true);
      try {
        // Fetch user data
        const userResponse = await userService.getAppUserData(appUserID);
        setUserData(userResponse.data.response);

        // Fetch document statistics for the user's account
        if (userResponse.data.response.appUser?.appUserID) {
          const statsResponse = await documentService.getAppUserDocsCount(appUserID);
          if (statsResponse.data.statusCode === "1") {
            setDocumentStats(statsResponse.data.response);
          }
        }
      } catch (error) {
        toast.error(t("navbar.errFetchUserData"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [appUserID, t]);

  const statItems = documentStats
    ? [
        { label: t("viewDetails.pending"), value: documentStats.pendingCount || 0, color: "var(--pending-status, #f59e0b)" },
        { label: t("viewDetails.completed"), value: documentStats.completedCount || 0, color: "var(--completed-status, #10b981)" },
        { label: t("viewDetails.draft"), value: documentStats.draftCount || 0, color: "var(--draft-status, #6366f1)" },
        { label: t("viewDetails.declined"), value: documentStats.declineCount || 0, color: "var(--decline-status, #ef4444)" },
        { label: t("viewDetails.shared"), value: documentStats.sharedCount || 0, color: "var(--share-status, #0ea5e9)" },
        { label: t("viewDetails.inactive"), value: documentStats.inActiveCount || 0, color: "var(--inactive-status, #64748b)" },
        { label: t("viewDetails.recalled"), value: documentStats.recalledCount || 0, color: "var(--recall-status, #f97316)" },
        { label: t("viewDetails.bulk"), value: documentStats.bulkCount || 0, color: "var(--theme-color, #6366f1)" },
      ]
    : [];

  return (
    <Modal show={show} className='team-details-dialog' onHide={onHide} backdrop='static' keyboard={false} size='lg' centered>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='w-11 h-11 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] font-bold text-base flex items-center justify-center shrink-0'>
            {userData?.appUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className='min-w-0'>
            <Modal.Title className='text-base font-bold text-[var(--modern-text)] truncate m-0'>
              {userData?.appUser?.fullName || t("viewDetails.userDetails")}
            </Modal.Title>
            {userData?.appUser?.emailID && (
              <div className='text-xs text-[var(--modern-muted)] truncate mt-0.5'>
                {userData?.appUser?.emailID}
              </div>
            )}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-5 custom-table-scrollbar bg-[var(--modern-card)] text-[var(--modern-text)]'>
        {isLoading ? (
          <div className='py-12 flex flex-col items-center justify-center gap-2 text-[var(--modern-muted)]'>
            <Loader2 size={24} className='animate-spin text-[var(--theme-color)]' />
          </div>
        ) : (
          userData && (
            <div className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <User size={13} />
                    <span>{t("viewDetails.name")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.fullName || "—"}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <Mail size={13} />
                    <span>{t("viewDetails.emailAccount")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.emailID || "—"}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <Phone size={13} />
                    <span>{t("viewDetails.mobileNumber")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.appUser.countryCode || ""} {userData.appUser.mobileNumber || t("viewDetails.addNumber")}
                  </div>
                </div>

                <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)] mb-1'>
                    <UserCheck size={13} />
                    <span>{t("viewDetails.emailDelegateTo")}</span>
                  </div>
                  <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                    {userData.delegation?.delegatedToEmail || t("viewDetails.noDelegation")}
                  </div>
                </div>
              </div>

              {/* Document Status */}
              {documentStats && (
                <div>
                  <h6 className='text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)] mb-3'>
                    {t("viewDetails.documentStatus")}
                  </h6>

                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                    {statItems.map((stat, idx) => (
                      <div
                        key={idx}
                        className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] flex flex-col justify-between gap-1'
                      >
                        <div
                          className='text-xl font-bold leading-tight'
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </div>
                        <div className='text-xs font-medium text-[var(--modern-muted)]'>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={onHide}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
        >
          {t("viewModal.close") || t("common.close") || "Close"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewTeamDetails;
