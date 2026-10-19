import React, { useState, useEffect } from "react";
import { Form, Navbar,Container,Offcanvas } from "react-bootstrap";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";

function DocStatusFilter({ fullName, emailID, setFullName, setEmailID, handleSearch, clearSearch }) {
  const { t } = useTranslation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "fullName":
        setFullName(value);
        break;
      case "emailID":
        setEmailID(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const hasAnyFilter = (fullName && fullName.trim() !== "") || (emailID && emailID.trim() !== "");

    setIsDisabled(!hasAnyFilter);
  }, [fullName, emailID]);

  const handleClearSearch = () => {
    clearSearch();
    setShowOffcanvas(false);
  };

  const handleApply = () => {
    handleSearch();
    setShowOffcanvas(false);
  };

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
          <hr style={{ margin: " auto 0", borderColor: "black" }} />
          <Offcanvas.Body>
            <div className='d-flex flex-column gap-3'>
              <Form.Group controlId='fullName'>
                <Form.Label>{t("createTeam.fullName")}</Form.Label>
                <Form.Control name='fullName' type='text' placeholder={t("logScreens.name")} value={fullName} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group controlId='emailID'>
                <Form.Label>{t("createTeam.email")}</Form.Label>
                <Form.Control name='emailID' type='email' placeholder={t("logScreens.email")} value={emailID} onChange={handleInputChange} />
              </Form.Group>

              <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                <button className='resetBtn' onClick={handleClearSearch}>
                  {t("searchFilter.reset")}
                </button>
                <button className='applyBtn' onClick={handleApply} disabled={isDisabled}>
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

export default DocStatusFilter;
