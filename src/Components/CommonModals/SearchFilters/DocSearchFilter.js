import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Offcanvas from "react-bootstrap/Offcanvas";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";

function DocumentSearchFilters({ startDate, endDate, referenceNo, docNumber, docName, setStartDate, setEndDate, setReferenceNo, setDocNumber, setDocName, handleSearch, clearSearch }) {
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
      if (!docName && !docNumber && !referenceNo) {
        setIsDisabled(true);
      }
    }
  };

  const dateValue = startDate && endDate ? [new DateObject(startDate), new DateObject(endDate)] : [];

  return (
    <Navbar expand={false}>
      <Container fluid>
        <Navbar.Toggle className='filterOpenBtn' aria-controls={`offcanvasNavbar`}>
          <CiFilter />
        </Navbar.Toggle>
        <Navbar.Offcanvas id={`offcanvasNavbar-expand-${false}`} aria-labelledby={`offcanvasNavbarLabel-expand-${false}`} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${false}`} className='fw-bold'>
              {t("searchFilter.Filter")}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr style={{ margin: "auto 0", borderColor: "black" }} />
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
                    setIsDisabled(e.target.value.trim() === "" && !docNumber && !referenceNo && !startDate);
                  }}
                />
              </div>

              <div>
                <label className='mb-2'>{t("searchFilter.docNum")}</label>
                <input
                  name='docNumber'
                  type='text'
                  className={`input-field ${docNumber ? "active" : ""}`}
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value);
                    setIsDisabled(e.target.value.trim() === "" && !docName && !referenceNo && !startDate);
                  }}
                />
              </div>
              <div>
                <label className='mb-2'>{t("searchFilter.refNum")}</label>
                <input
                  name='referenceNo'
                  type='text'
                  className={`input-field ${referenceNo ? "active" : ""}`}
                  value={referenceNo}
                  onChange={(e) => {
                    setReferenceNo(e.target.value);
                    setIsDisabled(e.target.value.trim() === "" && !docName && !docNumber && !startDate);
                  }}
                />
              </div>

              <div>
                <label className='mb-2'>{t("searchFilter.FilterRange")}</label>
                <DateRangePicker value={dateValue} onChange={handleDateChange} />
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
