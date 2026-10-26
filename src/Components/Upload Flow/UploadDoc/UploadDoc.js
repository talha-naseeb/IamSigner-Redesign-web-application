import React, { useEffect, useState } from "react";
import FirstStep from "../Step1/FirstStep";
import Secondstep from "../Step2/Secondstep";
import Thirdstep from "../Step3/Thirdstep";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UserProvider } from "@/Context/UserContext";
import Stepper from "../Stepper/Stepper";
import { useUser } from "@/Context/UserContext";
import UserLisence from "../../UserLisence/UserLisence";
import Signatories from "../Signatories/Signatories";

const UploadDoc = () => {
  const { t } = useTranslation();

  const { user, userAccess } = useUser("");

  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    retrieveSavedStep();
  }, [userAccess]);

  async function retrieveSavedStep() {
    const storedRegisterSignID = localStorage.getItem("registerSignID");
    try {
      const response = await uploadFlowService.getSignWorkFlowActivity(storedRegisterSignID);

      const currentStep = response.data.response.signWorkFlowActivityRef;

      let newActiveStep;

      switch (currentStep) {
        case "1":
          newActiveStep = 1;
          break;
        case "2":
          newActiveStep = 2;
          break;
        case "3":
          newActiveStep = 3;
          break;
        case "4":
          newActiveStep = 4;
          break;
        default:
          newActiveStep = 1;
          break;
      }
      setActiveStep(newActiveStep);

      if (newActiveStep === 2) {
        setCompletedSteps([1]);
      } else if (newActiveStep === 3) {
        setCompletedSteps([1, 2]);
      } else if (newActiveStep === 4) {
        setCompletedSteps([1, 2, 3]);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <UserProvider>
      <div className='relative h-full'>
        {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
          <>
            <UserLisence />
          </>
        ) : (
          <>
            {!isLoading && (
              <div>
                <Stepper activeStep={activeStep} t={t} completedSteps={completedSteps} />

                <div className='ms-[15%] max-md:ms-0'>
                  {activeStep === 1 && <FirstStep setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />}
                  {activeStep === 2 && <Signatories setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />}
                  {activeStep === 3 && <Secondstep setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />}
                  {activeStep === 4 && <Thirdstep setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserProvider>
  );
};

export default UploadDoc;
