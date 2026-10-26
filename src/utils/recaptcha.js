const SITE_KEY = process.env.REACT_APP_SITE_KEY_RECAPTCHA_V3;

const recaptchaError = (cause) => {
  const error = new Error("Google reCAPTCHA is unavailable.");
  error.code = "RECAPTCHA_UNAVAILABLE";
  if (cause) error.cause = cause;
  return error;
};

export const getRecaptchaToken = (action) =>
  new Promise((resolve, reject) => {
    const recaptcha = window.grecaptcha?.enterprise || window.grecaptcha;
    if (!SITE_KEY || !recaptcha?.ready) {
      return reject(recaptchaError());
    }

    recaptcha.ready(async () => {
      try {
        const token = await recaptcha.execute(SITE_KEY, { action });
        if (token) {
          resolve(token);
        } else {
          reject(recaptchaError());
        }
      } catch (error) {
        reject(recaptchaError(error));
      }
    });
  });
