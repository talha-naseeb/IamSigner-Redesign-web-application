import React from "react";
import { Button } from "react-bootstrap";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { GrPowerReset } from "react-icons/gr";

import { useControls } from "react-zoom-pan-pinch";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="d-flex justify-content-center fixed controls ">
      <Button onClick={() => zoomIn()}>
        <AiOutlineZoomIn />
      </Button>
      <Button onClick={() => zoomOut()}>
        <AiOutlineZoomOut />
      </Button>
      <Button onClick={() => resetTransform()}>
        <GrPowerReset />
      </Button>
    </div>
  );
};

export default Controls;
