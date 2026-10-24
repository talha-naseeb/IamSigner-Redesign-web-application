import React from "react";
import { Nav } from "@/Components/UI/shadcnCompat";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "@/assets/Icons";
import { useTheme } from "@/Context/ThemeContext";

const SelfSignStepper = ({ activeStep, t, completedSteps }) => {
  const location = useLocation();
  const { theme } = useTheme();

  const isCompleted = (step) => completedSteps && completedSteps.includes(step);
  const isActive = (step) => activeStep === step;
  const markerClass = (step) => `inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--modern-raised)] px-0 py-1 text-sm font-normal text-foreground ${isCompleted(step) ? "bg-[var(--modern-success)] text-white" : isActive(step) ? "bg-[var(--modern-primary)] text-white" : ""}`;
  const lineClass = (step) => `relative h-5 w-[3px] rounded-[5px] bg-[var(--modern-raised)] ${isCompleted(step) ? "bg-[var(--modern-success)]" : isActive(step) ? "before:absolute before:left-0 before:top-0 before:h-1/2 before:w-full before:rounded-[5px] before:bg-[var(--modern-border-strong)] before:content-['']" : ""}`;

  const templatesStepper = location.pathname.includes("/createTemplates") || location.pathname.includes("/editTemplates");

  return (
    <Nav className='fixed left-0 top-0 z-[1035] flex h-full w-[15%] flex-nowrap flex-col items-stretch gap-0 border-r border-border bg-background rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l'>
      <Nav.Item className='flex w-full justify-start border-b border-border p-[11px]'>
        <Nav.Link as={Link} to='/home' className='w-full justify-start rounded-none p-0 hover:bg-transparent'>
          {theme === "dark" ? <Icons.IamSignerLightMode className='h-[30px] w-[100px]' /> : <Icons.StepperLogo className='h-[30px] w-[100px]' />}
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
          <Nav.Link className='my-3 flex flex-wrap items-center gap-2.5'>
            <span className={markerClass(1)}>{isCompleted(1) ? <Icons.StepperCompleted /> : 1}</span>
            <em className='text-sm font-medium not-italic text-foreground'>{t("Stepper.uploadDocument")}</em>
        </Nav.Link>
      </Nav.Item>
      <div className='flex h-5 w-[30%] items-center justify-center'>
        <div className={lineClass(1)}></div>
      </div>

      <Nav.Item>
          <Nav.Link className='my-3 flex flex-wrap items-center gap-2.5'>
            <span className={markerClass(2)}>{isCompleted(2) ? <Icons.StepperCompleted /> : 2}</span>
            <em className='text-sm font-medium not-italic text-foreground'>{t("Stepper.placeSignatories")}</em>
        </Nav.Link>
      </Nav.Item>

      {!templatesStepper ? (
        <>
          <div className='flex h-5 w-[30%] items-center justify-center'>
            <div className={lineClass(3)}></div>
          </div>

          <Nav.Item>
            <Nav.Link className='my-3 flex flex-wrap items-center gap-2.5'>
              <span className={markerClass(3)}>{isCompleted(3) ? <Icons.StepperCompleted /> : 3}</span>
              <em className='text-sm font-medium not-italic text-foreground'>{t("Stepper.signandSave")}</em>
            </Nav.Link>
          </Nav.Item>
        </>
      ) : null}
    </Nav>
  );
};

export default SelfSignStepper;
