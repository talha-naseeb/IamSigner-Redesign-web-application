import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "@/assets/Icons";
import { useTheme } from "@/Context/ThemeContext";

const SelfSignStepper = ({ activeStep, t, completedSteps }) => {
  const location = useLocation();
  const { theme } = useTheme();

  const isCompleted = (step) => completedSteps && completedSteps.includes(step);
  const isActive = (step) => activeStep === step;

  const templatesStepper = location.pathname.includes("/createTemplates") || location.pathname.includes("/editTemplates");

  return (
    <Nav className='step_number_holder d-none d-md-block'>
      <Nav.Item className='stepper-logo'>
        <Nav.Link as={Link} to='/home'>
          {theme === "dark" ? <Icons.IamSignerLightMode style={{ height: "30px", width: "100px" }} /> : <Icons.StepperLogo style={{ height: "30px", width: "100px" }} />}
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link className={`upload_step my-3 ${isCompleted(1) ? "completed" : isActive(1) ? "active" : "inactive"}`}>
          <span className='numb'>{isCompleted(1) ? <Icons.StepperCompleted /> : 1}</span>
          <em>{t("Stepper.uploadDocument")}</em>
        </Nav.Link>
      </Nav.Item>
      <div className='d-flex justify-content-center align-items-center' style={{ width: "30%" }}>
        <div className={`stepper-line ${isCompleted(1) ? "stepper-line-completed" : isActive(1) ? "stepper-line-active" : ""}`}></div>
      </div>

      <Nav.Item>
        <Nav.Link className={`upload_step signatories_step my-3 ${isCompleted(2) ? "completed" : isActive(2) ? "active" : "inactive"}`}>
          <span className='numb'>{isCompleted(2) ? <Icons.StepperCompleted /> : 2}</span>
          <em>{t("Stepper.placeSignatories")}</em>
        </Nav.Link>
      </Nav.Item>

      {!templatesStepper ? (
        <>
          <div className='d-flex justify-content-center align-items-center' style={{ width: "30%" }}>
            <div className={`stepper-line ${isCompleted(3) ? "stepper-line-completed" : isActive(3) ? "stepper-line-active" : ""}`}></div>
          </div>

          <Nav.Item>
            <Nav.Link className={`upload_step sign_step my-3 ${isCompleted(4) ? "completed" : isActive(3) ? "active" : "inactive"}`}>
              <span className='numb'>{isCompleted(3) ? <Icons.StepperCompleted /> : 3}</span>
              <em>{t("Stepper.signandSave")}</em>
            </Nav.Link>
          </Nav.Item>
        </>
      ) : null}
    </Nav>
  );
};

export default SelfSignStepper;
