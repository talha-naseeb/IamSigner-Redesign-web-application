/**
 * Common validation patterns and functions
 */

export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  mobile: /^\+?[1-9]\d{1,14}$/,
};

export const validate = {
  email: (val) => patterns.email.test(val),
  password: (val) => patterns.password.test(val),
  name: (val) => patterns.name.test(val),
  mobile: (val) => patterns.mobile.test(val),
  required: (val) => val !== undefined && val !== null && val !== "",
};
