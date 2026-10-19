// Sign Now opens the signing link in a new tab; these helpers hand the user
// back to the tab that opened this one instead of starting a session here.
export const hasOpenerTab = () => {
  try {
    return Boolean(window.opener && !window.opener.closed && window.opener.location.origin === window.location.origin);
  } catch (error) {
    return false;
  }
};

// Focuses the opener tab and closes this one. Returns false when the caller
// should navigate locally instead (email-opened link, blocked close, etc.).
export const returnToOpenerTab = () => {
  if (!hasOpenerTab()) return false;
  window.opener.focus();
  window.close();
  return true;
};
