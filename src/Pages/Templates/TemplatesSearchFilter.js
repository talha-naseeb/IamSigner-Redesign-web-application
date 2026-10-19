import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import "./TemplateFilter.css";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";

function TemplatesSearchFilters({ templateName, setTemplateName, handleSearch, clearSearch, startDate, endDate, setStartDate, setEndDate, docStatus, setDocStatus, Scope, setScope }) {
  const { t } = useTranslation();

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0].format("YYYY-MM-DD"));
      setEndDate(dates[1].format("YYYY-MM-DD"));
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const dateValue = startDate && endDate ? [new DateObject(startDate), new DateObject(endDate)] : [];

  // Enable Apply when ANY filter has a value
  const canApply = Boolean(
    (templateName && templateName.trim() !== "") || (startDate && startDate !== "") || (endDate && endDate !== "") || (Scope && Scope !== "") || (docStatus && docStatus !== "")
  );

  const handleReset = () => {
    setTemplateName("");
    setStartDate("");
    setEndDate("");
    setScope("");
    setDocStatus("");
    if (typeof clearSearch === "function") clearSearch();
  };

  return (
    <Navbar expand={false}>
      <Container fluid>
        <Navbar.Toggle className='filterOpenBtn' aria-controls={`offcanvasNavbar`}>
          <Icons.Filter />
        </Navbar.Toggle>
        <Navbar.Offcanvas id={`offcanvasNavbar-expand-${false}`} aria-labelledby={`offcanvasNavbarLabel-expand-${false}`} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${false}`} className='fw-bold'>
              {t("templateUploadFlow.Filter")}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr style={{ margin: " auto 0", borderColor: "black" }} />
          <Offcanvas.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label className='mb-2'> {t("templateUploadFlow.TemplateName")}</label>
                <input
                  name='templateName'
                  type='text'
                  placeholder={t("editTemplateNameModal.enterTemplateName")}
                  className={`input-field ${templateName ? "active" : ""}`}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div>
                <label className='mb-2'> {t("tablesLabel.scope")}</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className='radio-container'>
                    <input id='individual' name='Scope' type='radio' className='input-radio' checked={Scope === "I"} value='I' onChange={(e) => setScope(e.target.value)} />
                    <label htmlFor='individual' className='radio-label'>
                      {t("templateUploadFlow.Individual")}
                    </label>
                  </div>
                  <div className='radio-container'>
                    <input id='company' name='Scope' type='radio' className='input-radio' checked={Scope === "B"} value='B' onChange={(e) => setScope(e.target.value)} />
                    <label htmlFor='company' className='radio-label'>
                      {t("templateUploadFlow.Company")}
                    </label>
                  </div>
                </div>
              </div>

              {/* <div>
                <label className='mb-2'>Status</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className='radio-container'>
                    <input id='active' name='docStatus' type='radio' className='input-radio' checked={docStatus === "Active"} value='Active' onChange={handleInputChange} />
                    <label htmlFor='active' className='radio-label'>
                      Active
                    </label>
                  </div>
                  <div className='radio-container'>
                    <input id='inactive' name='docStatus' type='radio' className='input-radio' checked={docStatus === "Inactive"} value='Inactive' onChange={handleInputChange} />
                    <label htmlFor='inactive' className='radio-label'>
                      Inactive
                    </label>
                  </div>
                </div>
              </div> */}

              <div>
                <label className='mb-2'>{t("searchFilter.FilterRange")}</label>
                <DateRangePicker value={dateValue} onChange={handleDateChange} />
              </div>

              <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                <button className='resetBtn' onClick={handleReset}>
                  {t("templateUploadFlow.Reset")}
                </button>
                <button className='applyBtn' onClick={handleSearch} disabled={!canApply}>
                  {t("templateUploadFlow.Apply")}
                </button>
              </div>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default TemplatesSearchFilters;
