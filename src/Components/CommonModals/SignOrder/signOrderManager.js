let listeners = new Set();
let currentState = {
  isOpen: false,
  isLoading: false,
  masterDocID: null,
  data: null,
  error: null,
};

export const signOrderManager = {
  getState: () => currentState,

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  open: (masterDocID) => {
    currentState = {
      isOpen: true,
      isLoading: true,
      masterDocID,
      data: null,
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("signOrderManager listener error:", e);
      }
    });
  },

  setData: (data) => {
    currentState = {
      ...currentState,
      isLoading: false,
      data,
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("signOrderManager listener error:", e);
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
        console.error("signOrderManager listener error:", e);
      }
    });
  },

  close: () => {
    currentState = {
      isOpen: false,
      isLoading: false,
      masterDocID: null,
      data: null,
      error: null,
    };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("signOrderManager listener error:", e);
      }
    });
  },

  hasListeners: () => listeners.size > 0,
};

export default signOrderManager;
