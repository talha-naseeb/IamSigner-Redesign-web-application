import { describe, it } from "node:test";
import assert from "node:assert";

import { evaluateAuthAccess, evaluateRoleAccess } from "./rbacRules.js";

describe("Route Guard Authorization Logic Unit Tests", () => {
  describe("AuthGuard Evaluation (RBAC-01)", () => {
    it("Allows access when authentication token exists", () => {
      assert.strictEqual(evaluateAuthAccess(true), true);
    });

    it("Denies access when unauthenticated (null or false token)", () => {
      assert.strictEqual(evaluateAuthAccess(false), false);
      assert.strictEqual(evaluateAuthAccess(null), false);
      assert.strictEqual(evaluateAuthAccess(undefined), false);
    });
  });

  describe("RoleGuard Account Type Enforcement (RBAC-02)", () => {
    it("Allows Business account when allowedAccountTypes includes 'B'", () => {
      const result = evaluateRoleAccess({
        user: { AccountType: "B" },
        allowedAccountTypes: ["B"],
      });
      assert.strictEqual(result.allowed, true);
    });

    it("Denies Individual account when Business account is required", () => {
      const result = evaluateRoleAccess({
        user: { AccountType: "I" },
        allowedAccountTypes: ["B"],
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "forbidden");
      assert.strictEqual(
        result.reason,
        "This feature is only available for Business accounts."
      );
    });

    it("Denies access when AccountType is missing or undefined", () => {
      const result = evaluateRoleAccess({
        user: {},
        allowedAccountTypes: ["B"],
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "forbidden");
    });
  });

  describe("RoleGuard Role ID Enforcement (RBAC-02)", () => {
    const allowed = [1, 2, 4]; // SuperAdmin (1), Standard (2), Admin (4)

    it("Allows SuperAdmin (1), Standard (2), and Admin (4)", () => {
      for (const roleId of [1, 2, 4]) {
        const result = evaluateRoleAccess({
          user: { RoleID: roleId },
          allowedRoleIds: allowed,
        });
        assert.strictEqual(result.allowed, true, `RoleID ${roleId} should be allowed`);
      }
    });

    it("Allows numeric string role IDs via coercion", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: "2" },
        allowedRoleIds: allowed,
      });
      assert.strictEqual(result.allowed, true);
    });

    it("Denies Restricted user (RoleID: 3)", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 3 },
        allowedRoleIds: allowed,
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "forbidden");
      assert.strictEqual(
        result.reason,
        "Your user role does not have permission to view this resource."
      );
    });

    it("Denies access when RoleID is missing or null", () => {
      const resultNull = evaluateRoleAccess({
        user: { RoleID: null },
        allowedRoleIds: allowed,
      });
      assert.strictEqual(resultNull.allowed, false);
      assert.strictEqual(resultNull.type, "forbidden");

      const resultUndefined = evaluateRoleAccess({
        user: {},
        allowedRoleIds: allowed,
      });
      assert.strictEqual(resultUndefined.allowed, false);
      assert.strictEqual(resultUndefined.type, "forbidden");
    });
  });

  describe("RoleGuard Subscription Validity Enforcement (RBAC-02)", () => {
    it("Allows write access when remainingDays > 0", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: { remainingDays: 14 },
        requireActiveSubscription: true,
      });
      assert.strictEqual(result.allowed, true);
    });

    it("Redirects to home with subscription prompt when remainingDays is 0", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: { remainingDays: 0 },
        requireActiveSubscription: true,
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "redirect");
      assert.strictEqual(result.redirectTo, "/home");
      assert.deepStrictEqual(result.state, { subscriptionExpiredPrompt: true });
    });

    it("Redirects to home when remainingDays is negative or expired", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: { remainingDays: -3 },
        requireActiveSubscription: true,
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "redirect");
    });

    it("Redirects to home when userAccess or remainingDays is absent", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: null,
        requireActiveSubscription: true,
      });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.type, "redirect");
    });
  });

  describe("RoleGuard Feature Entitlements Enforcement (RBAC-02 & RBAC-03)", () => {
    it("Allows access when required permission flag is true", () => {
      const result = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: { bulkDocUpload: true },
        requiredPermission: "bulkDocUpload",
      });
      assert.strictEqual(result.allowed, true);
    });

    it("Denies access with Forbidden403 reason when permission flag is false or absent", () => {
      const resultFalse = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: { bulkDocUpload: false },
        requiredPermission: "bulkDocUpload",
      });
      assert.strictEqual(resultFalse.allowed, false);
      assert.strictEqual(resultFalse.type, "forbidden");
      assert.strictEqual(
        resultFalse.reason,
        "This feature is not enabled for your account organization."
      );

      const resultAbsent = evaluateRoleAccess({
        user: { RoleID: 2 },
        userAccess: {},
        requiredPermission: "bulkDocUpload",
      });
      assert.strictEqual(resultAbsent.allowed, false);
      assert.strictEqual(resultAbsent.type, "forbidden");
    });
  });

  describe("Multi-Factor Declarative Combinations (RBAC-02)", () => {
    it("Bulk Upload: requires AccountType 'B', Role [1,2,4], bulkDocUpload permission, and active subscription", () => {
      const validAdmin = {
        user: { AccountType: "B", RoleID: 4 },
        userAccess: { bulkDocUpload: true, remainingDays: 30 },
        allowedAccountTypes: ["B"],
        allowedRoleIds: [1, 2, 4],
        requiredPermission: "bulkDocUpload",
        requireActiveSubscription: true,
      };
      assert.strictEqual(evaluateRoleAccess(validAdmin).allowed, true);

      // Fails on Individual account
      assert.strictEqual(
        evaluateRoleAccess({
          ...validAdmin,
          user: { AccountType: "I", RoleID: 4 },
        }).allowed,
        false
      );

      // Fails on Restricted role
      assert.strictEqual(
        evaluateRoleAccess({
          ...validAdmin,
          user: { AccountType: "B", RoleID: 3 },
        }).allowed,
        false
      );

      // Fails on expired subscription
      assert.strictEqual(
        evaluateRoleAccess({
          ...validAdmin,
          userAccess: { bulkDocUpload: true, remainingDays: 0 },
        }).allowed,
        false
      );

      // Fails on disabled permission
      assert.strictEqual(
        evaluateRoleAccess({
          ...validAdmin,
          userAccess: { bulkDocUpload: false, remainingDays: 30 },
        }).allowed,
        false
      );
    });
  });
});
