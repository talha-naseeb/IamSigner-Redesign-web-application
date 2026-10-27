import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { commentsManager } from "./commentsManager.js";

describe("Comments Manager Decoupling Tests", () => {
  it("initializes with closed state", () => {
    commentsManager.close();
    const state = commentsManager.getState();
    assert.equal(state.isOpen, false);
    assert.equal(state.registerSignID, null);
    assert.deepEqual(state.comments, []);
  });

  it("subscribes and receives state updates on open", () => {
    let capturedState = null;
    const unsubscribe = commentsManager.subscribe((state) => {
      capturedState = state;
    });

    assert.equal(commentsManager.hasListeners(), true);

    commentsManager.open("REG-12345");
    assert.equal(capturedState.isOpen, true);
    assert.equal(capturedState.isLoading, true);
    assert.equal(capturedState.registerSignID, "REG-12345");

    commentsManager.setComments([
      { docCommentsID: 1, comments: "First test comment", createdBy: "user@test.com" },
    ]);
    assert.equal(capturedState.isLoading, false);
    assert.equal(capturedState.comments.length, 1);
    assert.equal(capturedState.comments[0].comments, "First test comment");

    commentsManager.close();
    assert.equal(capturedState.isOpen, false);

    unsubscribe();
  });

  it("handles error states cleanly", () => {
    let lastState = null;
    const unsub = commentsManager.subscribe((st) => {
      lastState = st;
    });

    commentsManager.open("REG-ERR");
    commentsManager.setError("Network timeout");

    assert.equal(lastState.isLoading, false);
    assert.equal(lastState.error, "Network timeout");

    commentsManager.close();
    unsub();
  });
});
