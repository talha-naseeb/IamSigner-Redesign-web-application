import React, { useEffect, useState } from "react";
import { useUser } from "@/Context/UserContext";
import BulkStepper from "@/Components/BulkSend/Stepper/BulkStepper";
import PlaceBulkSignatories from "@/Components/BulkSend/PlaceBulkSignatories/PlaceBulkSignatories";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { UserProvider } from "@/Context/UserContext";
import FirstStep from "@/Components/BulkSend/Step1/FirstStep";
import SecondStep from "@/Components/BulkSend/Step2/Secondstep";
import ThirdStep from "@/Components/BulkSend/Step3/Thirdstep";

const UploadBulk = () => {
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
      <div className='uploadDoc-container'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <UserLisence />
        ) : (
          <>
            {userAccess.isbulkCSVflow === true ? (
                <div>
                  <BulkStepper activeStep={activeStep} completedSteps={completedSteps} />
                  <div className='formSteps'>
                    {activeStep === 1 && <FirstStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                    {activeStep === 2 && <PlaceBulkSignatories setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                    {activeStep === 3 && <SecondStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                    {activeStep === 4 && <ThirdStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
                  </div>
                </div>
            ) : null}
          </>
        )}
      </div>
    </UserProvider>
  );
};

export default UploadBulk;
