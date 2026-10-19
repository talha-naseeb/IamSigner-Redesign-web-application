import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./scrollstyle.css";

function ScrollButton() {
  const [scrollDirection, setScrollDirection] = useState("down");


const handleScrollToTop = () => {
  const firstImage = document.querySelector(`.image-div:first-child`);
  if (firstImage) {
    firstImage.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

  const handleScrollToBottom = () => {
    const lastImageElement = document.querySelector(`.image-div:last-child`);
    if (lastImageElement) {
      lastImageElement.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };



  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setScrollDirection("down");
      } else if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        setScrollDirection("up");
      } else {
        setScrollDirection("down");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button className='scrollToTopButton' onClick={scrollDirection === "up" ? handleScrollToTop : handleScrollToBottom} title={scrollDirection === "up" ? "Go to top" : "Go to bottom"}>
      {scrollDirection === "up" ? <FaArrowUp size={20} /> : <FaArrowDown size={20} />}
    </button>
  );
}

export default ScrollButton;
