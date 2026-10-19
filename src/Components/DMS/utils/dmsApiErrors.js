/** @returns {number|null} */
export const getAxiosStatus = (error) => error?.response?.status ?? null;

export const isAxiosAbortError = (error) =>
  error?.code === "ERR_CANCELED" ||
  error?.name === "CanceledError" ||
  error?.message === "canceled";

export const isAxiosForbiddenError = (error) => getAxiosStatus(error) === 403;

/** True when a failed fetch should not be cached as an empty successful result. */
export const shouldTreatAsEmptyFolderCache = (error) => {
  if (isAxiosAbortError(error)) return false;
  if (isAxiosForbiddenError(error)) return false;
  return true;
};
