import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import UserLisence from "../../UserLisence/UserLisence";
import { UserProvider } from "@/Context/UserContext";
import FirstStep from "../Step1/FirstStep";
import SecondStep from "../Step2/Secondstep";
import SelfSignStepper from "../Stepper/SelfSignStepper";
import SignaturePageSelf from "../SignaturePage/SignaturePageSelf";

const SelfSignatureFlow = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    retrieveSavedStep();
  }, [userAccess]);

  function retrieveSavedStep() {
    // Retrieve saved activeStep and completedSteps from sessionStorage (with fallback)
    const storedActiveStep = sessionStorage.getItem("activeStepBulk") || localStorage.getItem("activeStepBulk");
    const storedCompletedSteps = sessionStorage.getItem("completedStepsBulk") || localStorage.getItem("completedStepsBulk");

    if (storedActiveStep) {
      setActiveStep(parseInt(storedActiveStep));
    }

    if (storedCompletedSteps) {
      setCompletedSteps(JSON.parse(storedCompletedSteps));
    }
  }

  const handleSetActiveStep = (step) => {
    setActiveStep(step);
    sessionStorage.setItem("activeStepBulk", step);
  };

  const handleSetCompletedSteps = (steps) => {
    setCompletedSteps(steps);
    sessionStorage.setItem("completedStepsBulk", JSON.stringify(steps));
  };

  return (
    <UserProvider>
      <div className='relative h-full'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <UserLisence />
        ) : (
          <>
            {userAccess.isbulkCSVflow === true ? (
              <div>
                <SelfSignStepper activeStep={activeStep} t={t} completedSteps={completedSteps} />
                <div className='ms-[15%] max-md:ms-0'>
                  {activeStep === 1 && <FirstStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                  {activeStep === 2 && <SecondStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                  {activeStep === 3 && <SignaturePageSelf setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </UserProvider>
  );
};

export default SelfSignatureFlow;
