import React from "react";
import pageNotFoundImg from "@/assets/images/pagenotfound.webp";
import "./pagenotfound.css";

function PageNotFound() {
  return (
    <div className='parentClass'>
      <div>
        <h1 className='text-center fw-bold'>Oops!</h1>
        <h1 className='text-center'>We’re working on it!</h1>
        <img src={pageNotFoundImg} alt='ImageLoading' />
      </div>
    </div>
  );
}

export default PageNotFound;
