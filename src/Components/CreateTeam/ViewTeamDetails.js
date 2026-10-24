import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import userService from "@/services/userService";
import documentService from "@/services/documentService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loader from "@/Components/CommonModals/Loader/Loader";

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
  }, [appUserID]);

  return (
    <Modal show={show} className='team-details-dialog' onHide={onHide} backdrop='static' keyboard={false} size='lg' centered>
      <Modal.Header closeButton className='-bottom'>
        <Modal.Title className='d-flex align-items-center gap-2'>
          <div className='viewerProfile'>{userData?.appUser?.fullName?.charAt(0)?.toUpperCase() || "U"}</div>
          <div>
            <div className='team-details-name'>{userData?.appUser?.fullName || t("viewDetails.userDetails")}</div>
            <div className='team-details-email'>{userData?.appUser?.emailID}</div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='p-4 custom-table-scrollbar'>
        {isLoading ? (
          <div className='d-flex justify-content-center align-items-center' style={{ height: "200px" }}>
            <Loader />
          </div>
        ) : (
          userData && (
            <div>
              {/* Basic Information */}
              <div className='mb-4'>
                <div className='row mb-3'>
                  <div className='col-md-6 mb-3 mb-md-0 team-details-field'>
                    <label className='form-label text-muted small'>{t("viewDetails.name")}</label>
                    <div className='viewDetails'>{userData.appUser.fullName}</div>
                  </div>

                  <div className='col-md-6 team-details-field'>
                    <label className='form-label  text-muted small'>{t("viewDetails.emailAccount")}</label>
                    <div className='viewDetails'>{userData.appUser.emailID}</div>
                  </div>
                </div>

                <div className='row'>
                  <div className='col-md-6 mb-3 mb-md-0 team-details-field'>
                    <label className='form-label text-muted small'>{t("viewDetails.mobileNumber")}</label>
                    <div className='viewDetails'>
                      {userData.appUser.countryCode || ""} {userData.appUser.mobileNumber || t("viewDetails.addNumber")}
                    </div>
                  </div>

                  <div className='col-md-6 team-details-field'>
                    <label className='form-label text-muted small'>{t("viewDetails.emailDelegateTo")}</label>
                    <div className='viewDetails'>{userData.delegation?.delegatedToEmail || t("viewDetails.noDelegation")}</div>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              {documentStats && (
                <div>
                  <h6 className='team-details-section-title'>
                    {t("viewDetails.documentStatus")}
                  </h6>

                  <div className='row g-3'>
                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--pending'>{documentStats.pendingCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.pending")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--completed'>{documentStats.completedCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.completed")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--draft'>{documentStats.draftCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.draft")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--declined'>{documentStats.declineCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.declined")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--shared'>{documentStats.sharedCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.shared")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--inactive'>{documentStats.inActiveCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.inactive")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--recalled'>{documentStats.recalledCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.recalled")}</div>
                      </div>
                    </div>

                    <div className='col-lg-4 col-6'>
                      <div className='viewDetailsCard'>
                        <div className='team-stat-number team-stat-number--bulk'>{documentStats.bulkCount || 0}</div>
                        <div className='team-stat-label'>{t("viewDetails.bulk")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ViewTeamDetails;
