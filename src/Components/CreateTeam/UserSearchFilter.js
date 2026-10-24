import React, { useState } from "react";
import { Navbar as Navbar } from "@/Components/UI/shadcnCompat";
import { Container as Container } from "@/Components/UI/shadcnCompat";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import { Form } from "@/Components/UI/shadcnCompat";
import "./style.css";

function UserSearchFilter({ fullName, emailID, role, isActive, department, setFullName, setEmailID, setRole, setIsActive, setDepartment, handleSearch, clearSearch, userRoles, departments, className }) {
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(true);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update the respective state
    switch (name) {
      case "fullName":
        setFullName(value);
        break;
      case "emailID":
        setEmailID(value);
        break;
      case "role":
        setRole(value);
        break;
      case "department":
        setDepartment(value);
        break;
      case "isActive":
        const isActiveValue = value === "true";
        setIsActive(isActiveValue);
        break;
      default:
        break;
    }
  };

  // Check if any filter has a value to enable/disable the apply button
  React.useEffect(() => {
    const hasAnyFilter = fullName.trim() !== "" || emailID.trim() !== "" || role !== "" || department !== "" || isActive !== undefined;
    setIsDisabled(!hasAnyFilter);
  }, [fullName, emailID, role, department, isActive]);

  const handleClearSearch = () => {
    clearSearch();
    setShowOffcanvas(false);
  };

  return (
    <Navbar expand={false} className={className}>
      <Container fluid>
        <Navbar.Toggle
          className='filterOpenBtn user-report-filter-trigger'
          aria-controls={`offcanvasNavbar`}
          onClick={() => setShowOffcanvas(true)} // Open Offcanvas
        >
          <CiFilter />
        </Navbar.Toggle>
        <Navbar.Offcanvas
          id={`offcanvasNavbar`}
          className={className ? `${className}-panel` : undefined}
          placement={document.documentElement.dir === "rtl" ? "start" : "end"}
          show={showOffcanvas} // Control visibility based on the state
          onHide={() => setShowOffcanvas(false)} // Close Offcanvas when it's closed by the user
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className='fw-bold'>{t("searchFilter.Filter")}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className='user-filter-fields'>
              <Form.Group controlId='fullName'>
                <Form.Label>{t("createTeam.fullName")}</Form.Label>
                <Form.Control name='fullName' type='text' className='input-field' placeholder={t("logScreens.name")} value={fullName} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group controlId='emailID'>
                <Form.Label>{t("createTeam.email")}</Form.Label>
                <Form.Control name='emailID' type='text' className='input-field' placeholder={t("logScreens.email")} value={emailID} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group controlId='role'>
                <Form.Label>{t("createTeam.role")}</Form.Label>
                <Form.Select as='select' name='role' value={role} onChange={handleInputChange}>
                  <option value='' disabled> {t("createTeam.choose")}</option>
                  {userRoles.map((roleItem) => (
                    <option key={roleItem.id} value={roleItem.roleNameEn}>
                      {roleItem.roleNameEn}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='department'>
                <Form.Label>{t("createTeam.department")}</Form.Label>
                <Form.Select as='select' name='department' value={department} onChange={handleInputChange}>
                  <option value='' disabled> {t("createTeam.choose")}</option>
                  {departments && departments.map((dept) => (
                    <option key={dept.departmentID} value={dept.title}>
                      {dept.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className='user-filter-status'>
                <label className='mb-2'>{t("tablesLabel.status")}</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className='radio-container'>
                    <input
                      type='radio'
                      id='active'
                      className='input-radio'
                      name='isActive'
                      value='true' // Pass 'true' for active
                      checked={isActive === true} // Check if isActive is true
                      onChange={handleInputChange}
                    />
                    <label htmlFor='active'>{t("emailTemplates.active")}</label>
                  </div>
                  <div className='radio-container'>
                    <input
                      type='radio'
                      id='inactive'
                      className='input-radio'
                      name='isActive'
                      value='false' // Pass 'false' for inactive
                      checked={isActive === false} // Check if isActive is false
                      onChange={handleInputChange}
                    />
                    <label htmlFor='inactive'>{t("emailTemplates.inactive")}</label>
                  </div>
                </div>
              </div>

              <div className='user-filter-actions'>
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
}

export default UserSearchFilter;
