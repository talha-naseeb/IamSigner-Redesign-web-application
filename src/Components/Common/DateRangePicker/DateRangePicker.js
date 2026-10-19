import React from "react";
import DatePicker from "react-multi-date-picker";

const DateRangePicker = ({
  value,
  onChange,
  minDate,
  isInvalid,
  errorMessage,
  numberOfMonths = 1,
  format = "YYYY-MM-DD",
  inputClass = "form-control",
  containerClassName = "",
  range = true,
  disabled = false,
  placeholder = "",
  zIndex,
  portal,
  ...rest
}) => {
  return (
    <div className={`range-picker-container ${containerClassName}`.trim()}>
      <DatePicker
        value={value}
        onChange={onChange}
        range={range}
        minDate={minDate}
        numberOfMonths={numberOfMonths}
        {...(range ? { rangeHover: true } : {})}
        format={format}
        inputClass={`${inputClass} ${isInvalid ? "is-invalid" : ""}`.trim()}
        disabled={disabled}
        placeholder={placeholder}
        {...(zIndex != null ? { zIndex } : {})}
        {...(portal != null ? { portal } : {})}
        {...rest}
      />
      {isInvalid && errorMessage && (
        <div className='text-danger' style={{ fontSize: "14px", marginTop: "4px" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/** Serialize react-multi-date-picker value for APIs expecting `YYYY-MM-DD`. */
export const formatPickerDate = (dateValue) => dateValue?.format?.("YYYY-MM-DD") ?? null;

export default DateRangePicker;
