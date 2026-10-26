import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasSelectedChild,
  getFolderTreeKey,
  parseDmsScope,
  DMS_SCOPE_OWN,
  DMS_SCOPE_SHARED,
  DMS_SCOPE_SHARED_OTHERS,
} from "./dmsHelpers.js";

describe("DMS Helpers Unit Tests", () => {
  describe("hasSelectedChild", () => {
    const mockTree = {
      id: "dms-my-folders",
      treeKey: "dms-my-folders",
      name: "My Folders",
      children: [
        {
          id: 101,
          treeKey: "own:101",
          name: "Contracts",
          children: [
            {
              id: 201,
              treeKey: "own:201",
              name: "2026 Q1",
              children: [],
            },
          ],
        },
        {
          id: 102,
          treeKey: "own:102",
          name: "Invoices",
          children: [],
        },
      ],
    };

    it("returns true when target key matches the root node itself", () => {
      assert.strictEqual(hasSelectedChild(mockTree, "dms-my-folders"), true);
    });

    it("returns true when target key matches a direct child", () => {
      assert.strictEqual(hasSelectedChild(mockTree, "own:101"), true);
      assert.strictEqual(hasSelectedChild(mockTree, "own:102"), true);
    });

    it("returns true when target key matches a deeply nested descendant", () => {
      assert.strictEqual(hasSelectedChild(mockTree, "own:201"), true);
    });

    it("returns false when target key belongs to a different branch or is absent", () => {
      assert.strictEqual(hasSelectedChild(mockTree, "own:999"), false);
      assert.strictEqual(hasSelectedChild(mockTree, "shared:101"), false);
    });

    it("returns false safely when node or key is null or undefined", () => {
      assert.strictEqual(hasSelectedChild(null, "own:101"), false);
      assert.strictEqual(hasSelectedChild(mockTree, null), false);
      assert.strictEqual(hasSelectedChild(undefined, undefined), false);
    });
  });

  describe("getFolderTreeKey", () => {
    it("preserves synthetic root ids", () => {
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_OWN, "dms-my-folders"), "dms-my-folders");
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_SHARED, "dms-shared-me"), "dms-shared-me");
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_SHARED_OTHERS, "dms-shared-others"), "dms-shared-others");
    });

    it("prefixes regular folder IDs by scope", () => {
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_OWN, 42), "own:42");
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_SHARED, 42), "shared:42");
      assert.strictEqual(getFolderTreeKey(DMS_SCOPE_SHARED_OTHERS, 42), "sharedOthers:42");
    });
  });

  describe("parseDmsScope", () => {
    it("parses scope parameters correctly", () => {
      assert.strictEqual(parseDmsScope(new URLSearchParams("?scope=shared")), DMS_SCOPE_SHARED);
      assert.strictEqual(parseDmsScope(new URLSearchParams("?scope=sharedothers")), DMS_SCOPE_SHARED_OTHERS);
      assert.strictEqual(parseDmsScope(new URLSearchParams("?scope=own")), DMS_SCOPE_OWN);
      assert.strictEqual(parseDmsScope(new URLSearchParams("")), DMS_SCOPE_OWN);
    });
  });
});
