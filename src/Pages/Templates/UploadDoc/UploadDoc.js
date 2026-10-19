import React, { useEffect, useState } from "react";
import FirstStep from "../Step1/FirstStep";
import Secondstep from "../Step2/Secondstep";
import { useTranslation } from "react-i18next";
import { UserProvider } from "@/Context/UserContext";
import Stepper from "@/Components/Upload Flow/Stepper/Stepper";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import AddRecipient from "../Step1/AddRecipient/AddRecipient";

const UploadDoc = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  // Function to set active step and save it to localStorage
  const handleSetActiveStep = (step) => {
    setActiveStep(step);
    localStorage.setItem("activeStep", step);
  };

  // Function to set completed steps and save them to localStorage
  const handleSetCompletedSteps = (steps) => {
    setCompletedSteps(steps);
    localStorage.setItem("completedSteps", JSON.stringify(steps));
  };

  // Retrieve the saved steps from localStorage when the component mounts
  useEffect(() => {
    const storedActiveStep = localStorage.getItem("activeStep");
    const storedCompletedSteps = localStorage.getItem("completedSteps");

    if (storedActiveStep) {
      setActiveStep(parseInt(storedActiveStep));
    }

    if (storedCompletedSteps) {
      setCompletedSteps(JSON.parse(storedCompletedSteps));
    }
  }, []);

  return (
    <UserProvider>
      <div className='uploadDoc-container'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <UserLisence />
        ) : (
          <div>
            <Stepper activeStep={activeStep} t={t} completedSteps={completedSteps} />
            <div className='formSteps'>
              {activeStep === 1 && <FirstStep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
              {activeStep === 2 && <AddRecipient setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
              {activeStep === 3 && <Secondstep setActiveStep={handleSetActiveStep} setCompletedSteps={handleSetCompletedSteps} />}
            </div>
          </div>
        )}
      </div>
    </UserProvider>
  );
};

export default UploadDoc;
