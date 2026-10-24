import React, { useState } from "react";
import { Navbar as Navbar } from "@/Components/UI/shadcnCompat";
import { Container as Container } from "@/Components/UI/shadcnCompat";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";

function FolderFilter({ fromDate, toDate, folderName, docName, setFromDate, setToDate, setFolderName, setDocName, handleSearch, clearSearch }) {
  const { t } = useTranslation();

  const [isDisabled, setIsDisabled] = useState(true);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setFromDate(dates[0].format("YYYY-MM-DD"));
      setToDate(dates[1].format("YYYY-MM-DD"));
      setIsDisabled(false);
    } else {
      setFromDate("");
      setToDate("");
      if (!docName && !folderName) {
        setIsDisabled(true);
      }
    }
  };

  const dateValue = fromDate && toDate ? [new DateObject(fromDate), new DateObject(toDate)] : [];

  return (
    <Navbar expand={false}>
      <Container fluid>
        <Navbar.Toggle className='filterOpenBtn' aria-controls={`offcanvasNavbar`}>
          <Icons.Filter />
        </Navbar.Toggle>
        <Navbar.Offcanvas id={`offcanvasNavbar-expand-${false}`} aria-labelledby={`offcanvasNavbarLabel-expand-${false}`} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${false}`} className='fw-bold'>
              {t("searchFilter.Filter")}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr className='m-0 border-[var(--modern-border)] opacity-100' />
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
                    setIsDisabled(e.target.value.trim() === "" && !folderName && !fromDate);
                  }}
                />
              </div>

              <div>
                <label className='mb-2'>{t("Folder.folderName")}</label>
                <input
                  name='folderName'
                  type='text'
                  className={`input-field ${folderName ? "active" : ""}`}
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    setIsDisabled(e.target.value.trim() === "" && !docName && !fromDate);
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

export default FolderFilter;
