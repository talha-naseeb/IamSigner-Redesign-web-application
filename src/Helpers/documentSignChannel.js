const CHANNEL_NAME = "iamsigner-document-sign";
const DOCUMENT_SIGNED_TYPE = "DOCUMENT_SIGNED";

/**
 * Notifies other tabs that a document has just been signed.
 * Used by the signing tab so the opener tab (e.g. Pending With Me)
 * can refresh its list or show a dedicated screen.
 */
export const notifyDocumentSigned = (payload = {}) => {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: DOCUMENT_SIGNED_TYPE, ...payload });
    channel.close();
  } catch (error) {
    // BroadcastChannel unavailable — opener tab simply won't auto-refresh
  }
};

/**
 * Subscribes to document-signed notifications from other tabs.
 * @returns {Function} Unsubscribe function.
 */
export const onDocumentSigned = (callback) => {
  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === DOCUMENT_SIGNED_TYPE) {
        callback(event.data);
      }
    };
  } catch (error) {
    channel = null;
  }
  return () => {
    if (channel) {
      channel.close();
      channel = null;
    }
  };
};
