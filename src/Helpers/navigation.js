import { useNavigate } from "react-router-dom";

let navigateFunction = null;

/**
 * Component to capture the navigate function from React Router context.
 * Must be rendered inside a Router.
 */
export const NavigationSetter = () => {
  const navigate = useNavigate();
  navigateFunction = navigate;
  return null;
};

/**
 * Programmatic navigation helper for use in non-component files.
 * @param {string} to - The path to navigate to.
 * @param {Object} [options] - Optional transition options.
 */
export const navigateTo = (to, options) => {
  if (navigateFunction) {
    navigateFunction(to, options);
  } else {
    // Fallback if navigation setter isn't ready
    window.location.replace(to);
  }
};
