import React, { useState } from "react";
import { Navbar as Navbar } from "@/Components/UI/shadcnCompat";
import { Container as Container } from "@/Components/UI/shadcnCompat";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";

const DepartmentSearchFilters = ({ title, setTitle, description, setDescription, isActive, setIsActive, handleSearch, clearSearch }) => {
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(true);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "isActive":
        setIsActive(value);
        break;
      default:
        break;
    }

    // Enable button if any field has a value
    const hasTitle = title.trim() !== "";
    const hasDescription = description.trim() !== "";
    const hasStatus = name === "isActive" ? true : isActive !== "";
    
    setIsDisabled(!(hasTitle || hasDescription || hasStatus));
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowOffcanvas(false);
  };

  return (
    <Navbar expand={false} className='department-filter-navbar'>
      <Container fluid>
        <Navbar.Toggle className='filterOpenBtn department-filter-trigger' aria-controls={`offcanvasNavbar`} onClick={() => setShowOffcanvas(true)}>
          <CiFilter />
        </Navbar.Toggle>
        <Navbar.Offcanvas id={`offcanvasNavbar`} className='department-filter-panel' placement={document.documentElement.dir === "rtl" ? "start" : "end"} show={showOffcanvas} onHide={() => setShowOffcanvas(false)}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className='fw-bold'>{t("searchFilter.Filter")}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className='department-filter-fields'>
              <div>
                <label>{t("departmentList.title")}</label>
                <input name='title' type='text' className='department-filter-input' value={title} onChange={handleInputChange} />
              </div>
              <div>
                <label>{t("departmentList.description")}</label>
                <input name='description' type='text' className='department-filter-input' value={description} onChange={handleInputChange} />
              </div>

              <div>
                <label className='mb-2'>{t("tablesLabel.status")}</label>
                <div className='department-status-options'>
                  <div className='radio-container'>
                    <input type='radio' id='active' className='input-radio' name='isActive' value='true' checked={isActive === "true"} onChange={handleInputChange} />
                    <label htmlFor='active'>{t("emailTemplates.active")}</label>
                  </div>
                  <div className='radio-container'>
                    <input type='radio' id='inactive' className='input-radio' name='isActive' value='false' checked={isActive === "false"} onChange={handleInputChange} />
                    <label htmlFor='inactive'>{t("emailTemplates.inactive")}</label>
                  </div>
                </div>
              </div>

              <div className='department-filter-actions'>
                <button className='resetBtn' onClick={handleClearSearch}>
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
};

export default DepartmentSearchFilters;
