import React from "react";
import Lottie from "react-lottie";
import animationData from "./Dashboard.json";

const AdminDashboardLoader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div style={{ margin: "20px" }}>
      <Lottie options={defaultOptions} height={300} width={300} />
    </div>
  );
};

export default AdminDashboardLoader;
