import React, { useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { SketchPicker } from "react-color";
import colorIcon from "@/assets/images/color-wheel.webp";

const colorPresets = [
  { name: "black", hex: "#0f172a" },
  { name: "blue", hex: "#2563eb" },
  { name: "green", hex: "#16a34a" },
  { name: "red", hex: "#dc2626" },
];

const SignatureColor = ({ selectedColor, setSelectedColor }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleCustomColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className='flex items-center gap-2'>
      {colorPresets.map(({ name, hex }) => {
        const isCurrent = selectedColor === hex || selectedColor === name;
        return (
          <button
            key={name}
            type='button'
            style={{ backgroundColor: hex }}
            onClick={() => handleColorChange(name)}
            aria-label={name}
            className={`w-6 h-6 rounded-full cursor-pointer transition-all border-0 appearance-none outline-none ${
              isCurrent
                ? "ring-2 ring-offset-2 ring-[var(--modern-primary,#4d8dff)] scale-110 shadow-xs"
                : "opacity-75 hover:opacity-100 hover:scale-105"
            }`}
          />
        );
      })}

      <button
        type='button'
        onClick={togglePicker}
        aria-label='Custom Color Picker'
        className='w-7 h-7 rounded-full cursor-pointer transition-all border border-[var(--modern-border)] bg-[var(--modern-card)] appearance-none outline-none p-0 flex items-center justify-center hover:border-[var(--modern-primary,#4d8dff)] hover:scale-105'
      >
        <img src={colorIcon} alt='color picker' className='w-4 h-4 rounded-full pointer-events-none' />
      </button>

      <Modal show={showPicker} onHide={togglePicker} centered className='custom-color-modal'>
        <Modal.Body className='p-3 bg-[var(--modern-card)] rounded-2xl flex justify-center'>
          <SketchPicker color={selectedColor} onChangeComplete={handleCustomColorChange} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SignatureColor;
