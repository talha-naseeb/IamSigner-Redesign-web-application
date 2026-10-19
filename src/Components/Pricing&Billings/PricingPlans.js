import React, { useEffect, useState } from "react";
import { Row, Button, Col } from "react-bootstrap";
import pricingIcon from "@/assets/images/pricingIcons.svg";
import circleIcon from "@/assets/images/Check Circle.svg";
import callIcon from "@/assets/images/call.svg";
import "./pricingStyle.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import pricingService from "@/services/pricingService";
import { toast } from "react-toastify";
import Loader from "@/Components/CommonModals/Loader/Loader";

function PricingPage() {
  const { t } = useTranslation();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("Trial");

  useEffect(() => {
    const fetchPricingPlan = async () => {
      setIsLoading(true);
      try {
        const response = await pricingService.getPackages();
        // console.log("API Response:", response.data);
        if (response.data.statusCode === "1") {
          setPricingPlans(response.data.response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Pricing Error!", error);
        toast.info("Visit Later or Refresh the Page!");
      }
    };

    fetchPricingPlan();
  }, []);

  const filteredPlans = pricingPlans.filter((plan) => plan.packageName === viewMode);

  const handlePlanId = (packageID) => {
    // console.log("packageID:", packageID);
  };
  return (
    <div className='container'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <section className='parentPricing  '>
        <div className='my-3 container'>
          <div className='mt-5 text-center'>
            <h1 className='fw-bold'>{t("pricing.ChoosePlan")}</h1>
            <p>
              {t("pricing.esign")}
              <br />
              {t("pricing.carry")}
            </p>
          </div>

          <div className='d-flex justify-content-center align-items-center'>
            <div className='d-flex gap-3 text-center '>
              <Button className={`SignButton ${viewMode === "Trial" ? "active" : ""}`} onClick={() => setViewMode("Trial")}>
                {t("pricing.free")}
              </Button>
              <Button className={`SignButton ${viewMode === "Basic" ? "active" : ""}`} onClick={() => setViewMode("Basic")}>
                {t("pricing.Basic")}
              </Button>
              <Button className={`SignButton ${viewMode === "Premium" ? "active" : ""}`} onClick={() => setViewMode("Premium")}>
                {t("pricing.Premium")}
              </Button>
              <Button className={`SignButton ${viewMode === "Premium Package" ? "active" : ""}`} onClick={() => setViewMode("Premium Package")}>
                {t("pricing.PremiumPackage")}
              </Button>
            </div>
          </div>

          <Row className='pricingRows'>
            {filteredPlans.map((plan) => (
              <div className='MainBox' key={plan.packageID} onClick={() => handlePlanId(plan.packageID)}>
                <div className='MainboxFirsStarter'>
                  <img src={plan.packageName === "Premium Package" ? callIcon : pricingIcon} alt='Pricing Icon' />
                  <div>
                    <h3 style={{ fontWeight: "500" }}>{plan.packageName}</h3>
                    <p className='m-0' style={{ fontWeight: "500" }}>
                      {plan.description}
                    </p>
                  </div>
                </div>
                <div className='MainboxFirsStarter'>
                  <label style={{ fontWeight: "700", fontSize: "40px" }}>${plan.price}</label>
                  <div>
                    <label style={{ fontWeight: "500" }}>/{plan.durationInDays} days</label>
                  </div>
                </div>
                <h4>{t("pricing.included")}</h4>
                <div className='IncludedDiv'>
                  {plan.packageDetails.map((detail) => (
                    <Col md={3} className='includedchilds' key={detail.detailID}>
                      <img src={circleIcon} alt='Check Mark' />
                      <label>{detail.accessName}</label>
                    </Col>
                  ))}
                </div>
              </div>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;
