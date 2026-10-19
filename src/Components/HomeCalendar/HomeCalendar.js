import React, { useState, useEffect } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_en from "react-date-object/locales/arabic_en";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { MdSwapHoriz } from "react-icons/md";
import "./HomeCalendar.css";

const HomeCalendar = () => {
  const [isHijri, setIsHijri] = useState(() => localStorage.getItem("calendarMode") === "hijri");
  const [selectedDate, setSelectedDate] = useState(new DateObject());

  const toggleMode = (val) => {
    setIsHijri(val);
    localStorage.setItem("calendarMode", val ? "hijri" : "gregorian");
  };

  // Converter
  const [swapped, setSwapped] = useState(false); // false = Gregorian→Hijri, true = Hijri→Gregorian

  const todayFormatted = (() => {
    const t = new Date();
    return `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
  })();

  const [inputDate, setInputDate] = useState(todayFormatted);
  const [convertedDate, setConvertedDate] = useState("");
  const [inputError, setInputError] = useState(false);

  const doConvert = (dateStr, isSwapped) => {
    if (!dateStr || dateStr.length < 10) {
      setConvertedDate("");
      setInputError(false);
      return;
    }
    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) { setInputError(true); return; }
      const [d, m, y] = parts.map(Number);
      if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) { setInputError(true); return; }

      const fromCal = isSwapped ? arabic : gregorian;
      const toCal   = isSwapped ? gregorian : arabic;
      const toLoc   = isSwapped ? gregorian_en : arabic_en;

      const date = new DateObject({ calendar: fromCal, day: d, month: m, year: y });
      if (!date.isValid) { setInputError(true); setConvertedDate(""); return; }
      date.convert(toCal, toLoc);

      setConvertedDate(
        `${String(date.day).padStart(2, "0")}-${String(date.month.number).padStart(2, "0")}-${date.year}`
      );
      setInputError(false);
    } catch {
      setInputError(true);
      setConvertedDate("");
    }
  };

  useEffect(() => {
    doConvert(todayFormatted, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-format input as DD-MM-YYYY while typing
  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    let fmt = raw;
    if (raw.length > 2) fmt = raw.slice(0, 2) + "-" + raw.slice(2);
    if (raw.length > 4) fmt = raw.slice(0, 2) + "-" + raw.slice(2, 4) + "-" + raw.slice(4);
    setInputDate(fmt);
    if (fmt.length === 10) {
      doConvert(fmt, swapped);
    } else {
      setConvertedDate("");
      setInputError(false);
    }
  };

  const handleSwap = () => {
    const next = !swapped;
    setSwapped(next);
    if (convertedDate) {
      const prev = inputDate;
      setInputDate(convertedDate);
      doConvert(convertedDate, next);
      // keep old converted as the new input just in case
      if (!convertedDate) setInputDate(prev);
    } else {
      setInputDate("");
      setConvertedDate("");
    }
  };

  return (
    <div className="home-calendar">
      {/* ── Gregorian / Hijri display toggle ── */}
      <div className="cal-mode-toggle">
        <span className={`cal-mode-label ${!isHijri ? "active" : ""}`}>Gregorian</span>
        <div
          className={`cal-toggle-track ${isHijri ? "on" : ""}`}
          onClick={() => toggleMode(!isHijri)}
          role="switch"
          aria-checked={isHijri}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && toggleMode(!isHijri)}
        >
          <div className="cal-toggle-thumb" />
        </div>
        <span className={`cal-mode-label ${isHijri ? "active" : ""}`}>Hijri</span>
      </div>

      {/* ── Inline calendar ── */}
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        calendar={isHijri ? arabic : gregorian}
        locale={isHijri ? arabic_en : gregorian_en}
        className="home-cal-inner"
        shadow={false}
      />

      {/* ── Date converter ── */}
      <div className="cal-converter">
        <div className="cal-conv-header">
          <span className={`cal-conv-label ${!swapped ? "active" : ""}`}>Gregorian</span>
          <button className="cal-swap-btn" onClick={handleSwap} title="Swap calendars">
            <MdSwapHoriz size={18} />
          </button>
          <span className={`cal-conv-label ${swapped ? "active" : ""}`}>Hijri</span>
        </div>

        <input
          className={`cal-conv-input ${inputError ? "error" : ""}`}
          type="text"
          placeholder="DD-MM-YYYY"
          value={inputDate}
          onChange={handleInputChange}
        />

        <div className={`cal-conv-result ${!convertedDate ? "empty" : ""}`}>
          {convertedDate || "—"}
        </div>
      </div>
    </div>
  );
};

export default HomeCalendar;
