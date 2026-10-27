let listeners = new Set();
let currentState = {
  isOpen: false,
  isLoading: false,
  registerSignID: null,
  comments: [],
  error: null,
};

export const commentsManager = {
  getState: () => currentState,

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  open: (registerSignID) => {
    currentState = {
      isOpen: true,
      isLoading: true,
      registerSignID,
      comments: [],
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("commentsManager listener error:", e);
      }
    });
  },

  setComments: (comments) => {
    currentState = {
      ...currentState,
      isLoading: false,
      comments: Array.isArray(comments) ? comments : [],
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("commentsManager listener error:", e);
      }
    });
  },

  setLoading: (isLoading) => {
    currentState = {
      ...currentState,
      isLoading: Boolean(isLoading),
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("commentsManager listener error:", e);
      }
    });
  },

  setError: (error) => {
    currentState = {
      ...currentState,
      isLoading: false,
      error,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("commentsManager listener error:", e);
      }
    });
  },

  close: () => {
    currentState = {
      isOpen: false,
      isLoading: false,
      registerSignID: null,
      comments: [],
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("commentsManager listener error:", e);
      }
    });
  },

  hasListeners: () => listeners.size > 0,
};

export default commentsManager;
