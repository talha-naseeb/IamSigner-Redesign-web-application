import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import thankyou from "@/assets/images/thankyouIcon.svg";

const ResetPasswordSuccess = ({ message }) => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      pageNavigation();
    }, 5000);
  }, []);

  const pageNavigation = () => {
    
    if (sessionStorage.getItem("token")) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  return (
    <div className='declined-message-container'>
      <div className='message-box d-flex flex-column justify-content-center align-items-center'>
        <img src={thankyou} alt='iconLoading' />
        <h4 style={{ marginTop: "1rem", color: "#24B032" }}>Thanks you</h4>
        <p>{message}</p>

        <Button variant='none' onClick={pageNavigation} style={{ backgroundColor: "#24B032", outline: "none", color: "white" }}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess;
