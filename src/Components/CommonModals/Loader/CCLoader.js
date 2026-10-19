import React from "react";
import Lottie from "react-lottie";
import animationData from "./CCLoader.json";

const CCLoader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className='loader'>
      <Lottie options={defaultOptions} height={250} width={250} />
    </div>
  );
};

export default CCLoader;
