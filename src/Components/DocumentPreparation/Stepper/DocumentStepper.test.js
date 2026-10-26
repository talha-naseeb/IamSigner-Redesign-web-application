import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  STEPPER_FLOWS,
  FLOW_STEP_DEFINITIONS,
  getStepsForFlow,
  isStepCompleted,
  isStepActive,
  getStepStatus,
  getMarkerClass,
  getLineClass,
} from "./stepperConfig.js";

describe("Document Stepper Engine Unit Tests (ENG-01)", () => {
  describe("Flow Step Definitions & Resolution", () => {
    test("resolves 4 steps for upload flow", () => {
      const steps = getStepsForFlow(STEPPER_FLOWS.UPLOAD);
      assert.equal(steps.length, 4);
      assert.deepEqual(
        steps.map((s) => s.stepNumber),
        [1, 2, 3, 4]
      );
      assert.equal(steps[0].labelKey, "Stepper.uploadDocument");
      assert.equal(steps[1].labelKey, "Stepper.AddSigners");
      assert.equal(steps[2].labelKey, "Stepper.placeSignatories");
      assert.equal(steps[3].labelKey, "Stepper.sendAndSign");
    });

    test("resolves 4 steps for bulk send flow", () => {
      const steps = getStepsForFlow(STEPPER_FLOWS.BULK);
      assert.equal(steps.length, 4);
      assert.deepEqual(
        steps.map((s) => s.stepNumber),
        [1, 2, 3, 4]
      );
      assert.equal(steps[0].labelKey, "Stepper.uploadDocument");
      assert.equal(steps[3].labelKey, "Stepper.sendAndSign");
    });

    test("resolves 3 steps for self sign flow", () => {
      const steps = getStepsForFlow(STEPPER_FLOWS.SELF_SIGN);
      assert.equal(steps.length, 3);
      assert.deepEqual(
        steps.map((s) => s.stepNumber),
        [1, 2, 3]
      );
      assert.equal(steps[0].labelKey, "Stepper.uploadDocument");
      assert.equal(steps[1].labelKey, "Stepper.placeSignatories");
      assert.equal(steps[2].labelKey, "Stepper.signandSave");
    });

    test("resolves 3 steps for templates flow", () => {
      const steps = getStepsForFlow(STEPPER_FLOWS.TEMPLATES);
      assert.equal(steps.length, 3);
      assert.deepEqual(
        steps.map((s) => s.stepNumber),
        [1, 2, 3]
      );
      assert.equal(steps[0].labelKey, "Stepper.uploadDocument");
      assert.equal(steps[1].labelKey, "Stepper.AddSigners");
      assert.equal(steps[2].labelKey, "Stepper.placeSignatories");
    });

    test("falls back to upload flow when unknown flowType passed", () => {
      const steps = getStepsForFlow("non_existent_flow");
      assert.equal(steps.length, 4);
      assert.equal(steps[3].labelKey, "Stepper.sendAndSign");
    });

    test("honors custom steps array override", () => {
      const custom = [
        { stepNumber: 1, labelKey: "Custom.one", defaultLabel: "Custom One" },
        { stepNumber: 2, labelKey: "Custom.two", defaultLabel: "Custom Two" },
      ];
      const steps = getStepsForFlow(STEPPER_FLOWS.UPLOAD, custom);
      assert.equal(steps.length, 2);
      assert.equal(steps[0].labelKey, "Custom.one");
    });
  });

  describe("Step Completion & Active Status Resolution", () => {
    test("isStepCompleted returns true when step is in completedSteps array", () => {
      assert.equal(isStepCompleted(1, [1, 2]), true);
      assert.equal(isStepCompleted(2, [1, 2]), true);
      assert.equal(isStepCompleted(3, [1, 2]), false);
      assert.equal(isStepCompleted(1, null), false);
      assert.equal(isStepCompleted(1, undefined), false);
    });

    test("isStepActive returns true when activeStep matches step number", () => {
      assert.equal(isStepActive(2, 2), true);
      assert.equal(isStepActive(1, 2), false);
      assert.equal(isStepActive(3, 2), false);
    });

    test("getStepStatus correctly resolves status precedence (completed > active > pending)", () => {
      // Step completed takes priority over active
      assert.equal(getStepStatus(1, 2, [1]), "completed");
      // Current active step
      assert.equal(getStepStatus(2, 2, [1]), "active");
      // Future pending step
      assert.equal(getStepStatus(3, 2, [1]), "pending");
      assert.equal(getStepStatus(4, 2, [1]), "pending");
    });
  });

  describe("Marker & Line Design Token Classes (UI-01 & UI-02)", () => {
    test("getMarkerClass applies token-based modern colors with zero decorative box-shadows", () => {
      const completedClass = getMarkerClass("completed");
      assert.match(completedClass, /var\(--modern-success\)/);
      assert.doesNotMatch(completedClass, /box-shadow/);
      assert.doesNotMatch(completedClass, /shadow-/);

      const activeClass = getMarkerClass("active");
      assert.match(activeClass, /var\(--modern-primary\)/);
      assert.doesNotMatch(activeClass, /box-shadow/);

      const pendingClass = getMarkerClass("pending");
      assert.match(pendingClass, /var\(--modern-raised\)/);
    });

    test("getLineClass applies token-based connecting line styles", () => {
      const completedLine = getLineClass("completed");
      assert.match(completedLine, /var\(--modern-success\)/);

      const activeLine = getLineClass("active");
      assert.match(activeLine, /var\(--modern-border-strong\)/);

      const pendingLine = getLineClass("pending");
      assert.match(pendingLine, /var\(--modern-raised\)/);
      assert.doesNotMatch(pendingLine, /before:/);
    });
  });
});
