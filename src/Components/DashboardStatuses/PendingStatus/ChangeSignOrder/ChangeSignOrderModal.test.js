import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure helper logic mirrored from ChangeSignOrderModal for automated testing
 */
export const determineFieldVisibility = (notificationType, verificationType, email) => {
  let showEmail = false;
  let showMobile = false;

  if (email) {
    showEmail = true;
  }

  if (notificationType === "Email") {
    if (verificationType === "SMS" || verificationType === "WhatsApp") {
      showEmail = true;
      showMobile = true;
    } else {
      showEmail = true;
      showMobile = false;
    }
  } else if (notificationType === "SMS" || notificationType === "WhatsApp") {
    if (verificationType === "Email") {
      showEmail = true;
      showMobile = true;
    } else {
      showEmail = false;
      showMobile = true;
    }
  }

  return { showEmail, showMobile };
};

export const validateEmail = (val) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(val || "").trim());
};

export const validateSignatoryForms = (forms) => {
  let hasErrors = false;
  const emailSet = new Set();

  const errors = forms.map((form) => {
    const formErrors = {};

    if (!form.name || !form.name.trim()) {
      formErrors.name = "Name is required";
      hasErrors = true;
    }

    if (form.showEmail) {
      if (!form.email || !form.email.trim()) {
        formErrors.email = "Email is required";
        hasErrors = true;
      } else if (!validateEmail(form.email)) {
        formErrors.email = "Please enter a valid email";
        hasErrors = true;
      } else if (emailSet.has(form.email.toLowerCase().trim())) {
        formErrors.email = "Email is already used";
        hasErrors = true;
      } else {
        emailSet.add(form.email.toLowerCase().trim());
      }
    }

    if (form.showMobile && (!form.mobile || !form.countryCode)) {
      formErrors.mobile = "Phone and country code are required";
      hasErrors = true;
    }

    return formErrors;
  });

  return { isValid: !hasErrors, errors };
};

export const buildUpdateSignatoriesPayload = (registerSignID, isSerial, forms) => {
  return {
    RegisterSignID: registerSignID,
    IsSerial: isSerial,
    Signatories: forms.map((form, index) => ({
      Name: form.name.trim(),
      NotificationType: form.notificationType,
      Email: form.showEmail ? form.email.trim() : "",
      AdditionalEmails: (form.additionalEmails || []).join(",") || "None",
      CountryCode: form.showMobile ? form.countryCode : "",
      Mobile: form.showMobile ? form.mobile : "",
      Company: form.company || "",
      SignOrder: index + 1,
      SignatureType: form.signatureType || "Needs To Sign",
      SignatureColor: form.signatureColor || "#8b6cff",
      SignPage: "FirstPage",
      SignPosition: "TopLeft",
      IsMobile: Boolean(form.showMobile),
      ExpiryDate: form.expiryDate || "2026-12-16",
      IsExpiring: Boolean(form.isExpiring),
      IsPasswordProtected: form.verificationType !== "None",
      LanguageType: form.languageType || "English",
      VerificationType: form.verificationType || "None",
      SignatoriesID: form.signatoriesID,
    })),
  };
};

describe("ChangeSignOrderModal Business Logic Tests", () => {
  describe("Field Visibility Resolution", () => {
    it("enables email only when notificationType is Email and verification is None", () => {
      const visibility = determineFieldVisibility("Email", "None", "");
      assert.equal(visibility.showEmail, true);
      assert.equal(visibility.showMobile, false);
    });

    it("enables both email and mobile when notificationType is Email but verification is SMS", () => {
      const visibility = determineFieldVisibility("Email", "SMS", "");
      assert.equal(visibility.showEmail, true);
      assert.equal(visibility.showMobile, true);
    });

    it("enables mobile only when notificationType is SMS and verification is None", () => {
      const visibility = determineFieldVisibility("SMS", "None", "");
      assert.equal(visibility.showEmail, false);
      assert.equal(visibility.showMobile, true);
    });

    it("enables both mobile and email when notificationType is SMS and verification is Email", () => {
      const visibility = determineFieldVisibility("SMS", "Email", "");
      assert.equal(visibility.showEmail, true);
      assert.equal(visibility.showMobile, true);
    });

    it("sets showMobile true and showEmail false when notificationType is SMS and verification is None even if email was previously set", () => {
      const visibility = determineFieldVisibility("SMS", "None", "existing@example.com");
      assert.equal(visibility.showEmail, false);
      assert.equal(visibility.showMobile, true);
    });
  });

  describe("Form Validation Rules", () => {
    it("fails when name is missing", () => {
      const forms = [
        {
          name: "",
          showEmail: true,
          email: "user@example.com",
          showMobile: false,
        },
      ];
      const result = validateSignatoryForms(forms);
      assert.equal(result.isValid, false);
      assert.equal(result.errors[0].name, "Name is required");
    });

    it("fails when email format is invalid", () => {
      const forms = [
        {
          name: "John Doe",
          showEmail: true,
          email: "invalid-email",
          showMobile: false,
        },
      ];
      const result = validateSignatoryForms(forms);
      assert.equal(result.isValid, false);
      assert.equal(result.errors[0].email, "Please enter a valid email");
    });

    it("fails when duplicate emails are used across different signatories", () => {
      const forms = [
        {
          name: "Signer One",
          showEmail: true,
          email: "alice@example.com",
          showMobile: false,
        },
        {
          name: "Signer Two",
          showEmail: true,
          email: "alice@example.com",
          showMobile: false,
        },
      ];
      const result = validateSignatoryForms(forms);
      assert.equal(result.isValid, false);
      assert.equal(result.errors[1].email, "Email is already used");
    });

    it("fails when mobile is visible but country code or phone is missing", () => {
      const forms = [
        {
          name: "Signer One",
          showEmail: false,
          showMobile: true,
          countryCode: "",
          mobile: "1234567890",
        },
      ];
      const result = validateSignatoryForms(forms);
      assert.equal(result.isValid, false);
      assert.equal(result.errors[0].mobile, "Phone and country code are required");
    });

    it("passes when all required fields are valid and distinct", () => {
      const forms = [
        {
          name: "Signer One",
          showEmail: true,
          email: "alice@example.com",
          showMobile: false,
        },
        {
          name: "Signer Two",
          showEmail: true,
          email: "bob@example.com",
          showMobile: true,
          countryCode: "+1",
          mobile: "5551234567",
        },
      ];
      const result = validateSignatoryForms(forms);
      assert.equal(result.isValid, true);
      assert.equal(Object.keys(result.errors[0]).length, 0);
      assert.equal(Object.keys(result.errors[1]).length, 0);
    });
  });

  describe("API Payload Builder", () => {
    it("constructs compliant payload preserving signOrder and verification protection", () => {
      const forms = [
        {
          name: "Alice",
          notificationType: "Email",
          email: "alice@example.com",
          showEmail: true,
          showMobile: false,
          additionalEmails: ["cc1@example.com", "cc2@example.com"],
          company: "Acme",
          verificationType: "None",
          languageType: "English",
          signatoriesID: 101,
        },
        {
          name: "Bob",
          notificationType: "SMS",
          email: "",
          showEmail: false,
          showMobile: true,
          countryCode: "+966",
          mobile: "501234567",
          additionalEmails: [],
          company: "",
          verificationType: "SMS",
          languageType: "Arabic",
          signatoriesID: 102,
        },
      ];

      const payload = buildUpdateSignatoriesPayload(555, true, forms);

      assert.equal(payload.RegisterSignID, 555);
      assert.equal(payload.IsSerial, true);
      assert.equal(payload.Signatories.length, 2);

      // Signatory 1
      assert.equal(payload.Signatories[0].SignOrder, 1);
      assert.equal(payload.Signatories[0].Name, "Alice");
      assert.equal(payload.Signatories[0].AdditionalEmails, "cc1@example.com,cc2@example.com");
      assert.equal(payload.Signatories[0].IsPasswordProtected, false);
      assert.equal(payload.Signatories[0].SignatoriesID, 101);

      // Signatory 2
      assert.equal(payload.Signatories[1].SignOrder, 2);
      assert.equal(payload.Signatories[1].Name, "Bob");
      assert.equal(payload.Signatories[1].CountryCode, "+966");
      assert.equal(payload.Signatories[1].Mobile, "501234567");
      assert.equal(payload.Signatories[1].AdditionalEmails, "None");
      assert.equal(payload.Signatories[1].IsPasswordProtected, true);
      assert.equal(payload.Signatories[1].LanguageType, "Arabic");
      assert.equal(payload.Signatories[1].SignatoriesID, 102);
    });
  });
});
