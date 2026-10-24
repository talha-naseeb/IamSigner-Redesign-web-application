import React, { useState } from "react";
import { Navbar as Navbar } from "@/Components/UI/shadcnCompat";
import { Container as Container } from "@/Components/UI/shadcnCompat";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { CiFilter } from "react-icons/ci";
import "./style.css";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";

function DocumentSearchFilters({
  startDate,
  endDate,
  referenceNo,
  docName,
  requestNo,
  setStartDate,
  setEndDate,
  setReferenceNo,
  setRequestNo,
  setDocName,
  handleSearch,
  clearSearch,
  hideRequestNo = false,
}) {
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0].format("YYYY-MM-DD"));
      setEndDate(dates[1].format("YYYY-MM-DD"));
      setIsDisabled(false);
    } else {
      setStartDate("");
      setEndDate("");
      if (!docName && !requestNo && !referenceNo) {
        setIsDisabled(true);
      }
    }
  };

  const dateValue = startDate && endDate ? [new DateObject(startDate), new DateObject(endDate)] : [];

  const expand = false;
  return (
    <Navbar expand={expand}>
      <Container fluid>
        <Navbar.Toggle className='filterOpenBtn' aria-controls={`offcanvasNavbar`}>
          <CiFilter />
        </Navbar.Toggle>
        <Navbar.Offcanvas id={`offcanvasNavbar-expand-${expand}`} aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title tle id={`offcanvasNavbarLabel-expand-${expand}`} className='fw-bold'>
              {t("searchFilter.Filter")}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr style={{ margin: " auto 0", borderColor: "black" }} />
          <Offcanvas.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label className='mb-2'>{t("searchFilter.docName")}</label>
                <input
                  name='docName'
                  type='text'
                  className={`input-field ${docName ? "active" : ""}`}
                  value={docName}
                  onChange={(e) => {
                    setDocName(e.target.value);
                    setIsDisabled(e.target.value.trim() === "" && !requestNo && !referenceNo && !startDate);
                  }}
                />
              </div>

              {!hideRequestNo && (
                <div>
                  <label className='mb-2'> {t("searchFilter.requestNum")}</label>
                  <input
                    name='requestNo'
                    type='text'
                    className={`input-field ${requestNo ? "active" : ""}`}
                    value={requestNo || ""}
                    onChange={(e) => {
                      if (setRequestNo) setRequestNo(e.target.value);
                      setIsDisabled(e.target.value.trim() === "" && !docName && !referenceNo && !startDate);
                    }}
                  />
                </div>
              )}

              <div>
                <label className='mb-2'>{t("searchFilter.refNum")}</label>
                <input
                  name='referenceNo'
                  type='text'
                  className={`input-field ${referenceNo ? "active" : ""}`}
                  value={referenceNo}
                  onChange={(e) => {
                    setReferenceNo(e.target.value);
                    setIsDisabled(e.target.value.trim() === "" && !docName && !requestNo && !startDate);
                  }}
                />
              </div>

              <div>
                <label className='mb-2'>{t("searchFilter.FilterRange")}</label>
                <DateRangePicker value={dateValue} onChange={handleDateChange}/>
              </div>

              <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                <button className='resetBtn' onClick={clearSearch}>
                  {t("searchFilter.reset")}
                </button>
                <button className='applyBtn' onClick={handleSearch} disabled={isDisabled}>
                  {t("searchFilter.apply")}
                </button>
              </div>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default DocumentSearchFilters;
