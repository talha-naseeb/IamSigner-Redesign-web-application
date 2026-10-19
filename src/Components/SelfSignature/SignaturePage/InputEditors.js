import React, { useEffect, useState } from "react";

const InputEditors = ({ control, textInput, setEditingStates, handleTextButton }) => {
  const [text, setText] = useState();

  useEffect(() => {
    setText(textInput);
  }, [textInput]);

  return (
    <>
      {control.controlName === "Number" ? (
        <input
          style={{
            width: control.width,
            height: control.height,
            overflow: "auto",
            resize: "none",
          }}
          type='number'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            // Clear editing state for this control when blurred
            setEditingStates((prevState) => ({
              ...prevState,
              [control.controlLocationID]: false,
            }));
            handleTextButton(control.controlLocationID, text);
          }}
          autoFocus
        />
      ) : (
        <textarea
          style={{
            width: control.width,
            height: control.height,
            overflow: "auto",
            resize: "none",
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            // Clear editing state for this control when blurred
            setEditingStates((prevState) => ({
              ...prevState,
              [control.controlLocationID]: false,
            }));
            handleTextButton(control.controlLocationID, text);
          }}
          autoFocus
        />
      )}
    </>
  );
};

export default InputEditors;
