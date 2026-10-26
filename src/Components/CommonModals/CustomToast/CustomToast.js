import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomToast.css";
function CustomToaster() {
  return (
    <ToastContainer
      className='app-toast-container'
      toastClassName='app-toast'
      bodyClassName='app-toast-body'
      progressClassName='app-toast-progress'
      position='top-right'
      style={{ zIndex: "1050" }}
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
export default CustomToaster;
