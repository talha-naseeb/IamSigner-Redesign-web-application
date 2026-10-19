const SITE_KEY = process.env.REACT_APP_SITE_KEY_RECAPTCHA_V3;
const SCRIPT_ID = "google-recaptcha-v3";

let scriptPromise;

const recaptchaError = (cause) => {
  const error = new Error("Google reCAPTCHA v3 is unavailable.");
  error.code = "RECAPTCHA_UNAVAILABLE";
  if (cause) error.cause = cause;
  return error;
};

const loadRecaptcha = () => {
  if (window.grecaptcha?.execute && window.grecaptcha?.ready) {
    return Promise.resolve(window.grecaptcha);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha?.execute && window.grecaptcha?.ready) {
        resolve(window.grecaptcha);
      } else {
        script.remove();
        reject(recaptchaError());
      }
    };
    script.onerror = () => {
      script.remove();
      reject(recaptchaError());
    };
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = undefined;
    throw error?.code === "RECAPTCHA_UNAVAILABLE" ? error : recaptchaError(error);
  });

  return scriptPromise;
};

export const getRecaptchaToken = async (action) => {
  if (!SITE_KEY) throw recaptchaError();

  try {
    const grecaptcha = await loadRecaptcha();
    return await new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        try {
          Promise.resolve(grecaptcha.execute(SITE_KEY, { action }))
            .then((token) => (token ? resolve(token) : reject(recaptchaError())))
            .catch((error) => reject(recaptchaError(error)));
        } catch (error) {
          reject(recaptchaError(error));
        }
      });
    });
  } catch (error) {
    throw error?.code === "RECAPTCHA_UNAVAILABLE" ? error : recaptchaError(error);
  }
};
