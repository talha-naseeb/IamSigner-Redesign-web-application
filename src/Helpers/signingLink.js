// Backend returns absolute signing links with a fixed https scheme, which the
// http:// local dev server cannot serve. Links pointing at this host+port are
// rebuilt from window.location so the opened tab loads and keeps its
// window.opener back-pointer; links for other hosts pass through untouched.
export const normalizeSigningLink = (signingLink) => {
  try {
    const url = new URL(signingLink, window.location.origin);
    if (url.host === window.location.host) {
      return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
    }
    return signingLink;
  } catch (error) {
    return signingLink;
  }
};
