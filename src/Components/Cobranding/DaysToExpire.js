import React from "react";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import "./style.css";
import { Row, Col, Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function DaysToExpire() {
  const { user, userAccess } = useUser();
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <Accordion defaultActiveKey='0' className='accordion my-3'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>
            <div className='d-flex align-items-center gap-3'>
              <Icons.PricingPlan size={24} />
              <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("DaysToExpire.SubscribedPlanDetail")}</label>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className='main-container justify-content-start'>
              <label className='fs-20 PlanDetailsAccess mb-3'>{t("DaysToExpire.CurrentPlan")}</label>
            </div>
            <div className='PlanDetails'>
              <Row>
                <Col sm={6} md={3}>
                  <label className='fs-16 fw-bold'>{userAccess.packageName}</label>
                </Col>
              </Row>
              <Row className='mt-3'>
                <Col sm={6} md={3}>
                  <label className='PlanDetailsHeading'>{t("DaysToExpire.AccountHolder")}</label>
                  <div className='PlanDetailsAccess'>{user.fullName}</div>
                </Col>
                <Col sm={6} md={3}>
                  <label className='PlanDetailsHeading'>{t("DaysToExpire.DaysRemainingExpire")}</label>
                  <div className='PlanDetailsAccess'>
                    {userAccess.remainingDays} {t("DaysToExpire.days")}
                  </div>
                </Col>
                <Col sm={6} md={3}>
                  <label className='PlanDetailsHeading'>{t("DaysToExpire.TotalDays")}</label>
                  <div className='PlanDetailsAccess'>
                    {userAccess.totalDays} {t("DaysToExpire.days")}
                  </div>
                </Col>
                <Col sm={6} md={3}>
                  <label className='PlanDetailsHeading'>{t("DaysToExpire.planDays")}</label>
                  <div className='PlanDetailsAccess'>
                    {formatDate(userAccess.subscriptionStartDate)} - {formatDate(userAccess.subscriptionEndDate)}
                  </div>
                </Col>
              </Row>
              <Row className='mt-3'>
                <Col sm={6} md={3}>
                  <label className='PlanDetailsHeading'>{t("DaysToExpire.UserLicenseLimit")}</label>
                  <div className='PlanDetailsAccess'>
                    {userAccess.numUserLicenses || "N/A"} {t("DaysToExpire.users")}
                  </div>
                </Col>
              </Row>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default DaysToExpire;
