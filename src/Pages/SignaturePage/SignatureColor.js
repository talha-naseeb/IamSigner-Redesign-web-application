import React, { useState } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import { SketchPicker } from "react-color";
import colorIcon from "@/assets/images/color-wheel.webp";
const colorOptions = ["black", "blue", "green", "red"];

const SignatureColor = ({ selectedColor, setSelectedColor }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleCustomColorChange = (color) => {
    setSelectedColor(color.hex);
    // setShowPicker(false);
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className='color-options'>
      {colorOptions.map((color) => (
        <Button
          key={color}
          style={{
            backgroundColor: color,
            width: "8px",
            height: "27px",
            borderRadius: "50%",
            opacity: ` ${selectedColor === color ? 1 : 0.5}`,
            border: `2px solid ${selectedColor === color ? "#333" : "#ccc"}`,
            verticalAlign: "middle",
            margin: "0",
          }}
          onClick={() => handleColorChange(color)}
        />
      ))}

      <span
        style={{
          cursor: "pointer",
          margin: "0 4px",
          display: "inline-flex",
          alignItems: "center",
        }}
        onClick={togglePicker}
      >
        <img src={colorIcon} alt='color picker' style={{ width: "20px", height: "22px", display: "block" }} />
      </span>
      <Modal show={showPicker} onHide={togglePicker} style={{ width: "370px", translate: "25%" }}>
        <Modal.Body>
          <SketchPicker color={selectedColor} onChangeComplete={handleCustomColorChange} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SignatureColor;
