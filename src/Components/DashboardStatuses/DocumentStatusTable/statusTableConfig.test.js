import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatTableDate,
  getStatusBadgeClass,
  computePaginationRange,
  formatScope,
} from "./statusTableConfig.js";

describe("Document Status Table Config Unit Tests (ENG-02)", () => {
  describe("formatTableDate", () => {
    it("formats ISO date string properly to D/M/YYYY - H:MM AM/PM", () => {
      const formatted = formatTableDate("2026-10-24T14:30:00Z");
      assert.match(formatted, /^\d{1,2}\/\d{1,2}\/\d{4} - \d{1,2}:\d{2} (AM|PM)$/);
    });

    it("returns dash for null, undefined, or empty date inputs", () => {
      assert.equal(formatTableDate(null), "—");
      assert.equal(formatTableDate(undefined), "—");
      assert.equal(formatTableDate(""), "—");
    });

    it("returns dash for invalid date strings", () => {
      assert.equal(formatTableDate("invalid-date-string"), "—");
    });
  });

  describe("getStatusBadgeClass", () => {
    it("returns emerald badge class for completed and active statuses", () => {
      assert.match(getStatusBadgeClass("Completed"), /bg-emerald-100/);
      assert.match(getStatusBadgeClass("Active"), /bg-emerald-100/);
      assert.match(getStatusBadgeClass("Signed"), /bg-emerald-100/);
    });

    it("returns amber badge class for pending and waiting statuses", () => {
      assert.match(getStatusBadgeClass("Pending"), /bg-amber-100/);
      assert.match(getStatusBadgeClass("PendingWithMe"), /bg-amber-100/);
      assert.match(getStatusBadgeClass("Waiting"), /bg-amber-100/);
    });

    it("returns rose badge class for declined and rejected statuses", () => {
      assert.match(getStatusBadgeClass("Declined"), /bg-rose-100/);
      assert.match(getStatusBadgeClass("Failed"), /bg-rose-100/);
      assert.match(getStatusBadgeClass("Expired"), /bg-rose-100/);
    });

    it("returns indigo badge class for recall statuses", () => {
      assert.match(getStatusBadgeClass("Recall"), /bg-indigo-100/);
      assert.match(getStatusBadgeClass("Recalled"), /bg-indigo-100/);
    });

    it("falls back to slate badge class for drafts, inactive, or unknown statuses", () => {
      assert.match(getStatusBadgeClass("Draft"), /bg-slate-100/);
      assert.match(getStatusBadgeClass("InActive"), /bg-slate-100/);
      assert.match(getStatusBadgeClass("unknown_status"), /bg-slate-100/);
      assert.match(getStatusBadgeClass(null), /bg-slate-100/);
    });

    it("contains zero box-shadow utility classes in all return values", () => {
      const statuses = ["Completed", "Pending", "Declined", "Recall", "Draft", "InActive"];
      for (const s of statuses) {
        assert.doesNotMatch(getStatusBadgeClass(s), /shadow/);
      }
    });
  });

  describe("computePaginationRange", () => {
    it("calculates startItem and endItem for initial page", () => {
      const result = computePaginationRange(0, 30, 45);
      assert.equal(result.currentPage, 0);
      assert.equal(result.startItem, 1);
      assert.equal(result.endItem, 30);
      assert.equal(result.totalPages, 2);
      assert.equal(result.hasPrevious, false);
      assert.equal(result.hasNext, true);
    });

    it("calculates bounds for the last page", () => {
      const result = computePaginationRange(1, 30, 45);
      assert.equal(result.currentPage, 1);
      assert.equal(result.startItem, 31);
      assert.equal(result.endItem, 45);
      assert.equal(result.hasPrevious, true);
      assert.equal(result.hasNext, false);
    });

    it("handles 0 total items safely without negative index", () => {
      const result = computePaginationRange(0, 30, 0);
      assert.equal(result.startItem, 0);
      assert.equal(result.endItem, 0);
      assert.equal(result.totalPages, 1);
      assert.equal(result.hasPrevious, false);
      assert.equal(result.hasNext, false);
    });

    it("clamps out-of-bounds page requests safely", () => {
      const result = computePaginationRange(10, 30, 45);
      assert.equal(result.currentPage, 1);
      assert.equal(result.startItem, 31);
      assert.equal(result.endItem, 45);
    });
  });

  describe("formatScope", () => {
    it("formats Individual and Company codes", () => {
      assert.equal(formatScope("I"), "Individual");
      assert.equal(formatScope("B"), "Company");
      assert.equal(formatScope("X"), "X");
      assert.equal(formatScope(null), "—");
    });
  });
});
