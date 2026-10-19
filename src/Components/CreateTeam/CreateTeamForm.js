import React, { useState, useEffect } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import PhoneInput from "react-phone-input-2";
import userService from "@/services/userService";

function CreateTeamForm({ fetchTeam }) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const { user } = useUser();
  const [departments, setDepartments] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [formData, setFormData] = useState({
    AccountID: user.AccountID,
    AccountType: user.AccountType,
    FullName: "",
    UserName: "",
    RoleID: "",
    DepartmentID: null, // reset
    MobileNumber: "",
    EmailID: "",
  });

  const [errors, setErrors] = useState({
    FullName: "",
    UserName: "",
    RoleID: "",
    DepartmentID: "", // reset
    MobileNumber: "",
    EmailID: "",
  });

  const fetchRoles = async () => {
    try {
      const response = await userService.getUserRoles();

      if (response.data.successStatus) {
        setRoles(response.data.response);
      } else {
        console.error(t("createTeam.errRoles"));
      }
    } catch (error) {
      console.error(t("createTeam.errRoles"));
    }
  };

  // Get departments
  const fetchDepartments = async () => {
    try {
      const response = await userService.getActiveAccountDepartments(user.AccountID);

      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      } else {
        console.error(t("createTeam.errDepartments"));
      }
    } catch (error) {
      console.error(t("createTeam.errDepartments"));
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      // Ensure that UserName is always set to EmailID value when EmailID changes
      if (name === "EmailID") {
        return {
          ...prevData,
          [name]: value,
          UserName: value, // Set UserName to the value of EmailID
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });

    // Clear field-specific error when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handlePhoneChange = (phone) => {
    setPhoneNumber(phone);
    setFormData((prevData) => ({
      ...prevData,
      MobileNumber: phone,
    }));

    // Clear mobile number error when user starts typing
    if (phone.length >= 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        MobileNumber: "",
      }));
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Validate FullName
    if (!formData.FullName) {
      formErrors.FullName = t("createTeam.fullNameRequired");
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.EmailID) {
      formErrors.EmailID = t("createTeam.emailRequired");
      isValid = false;
    } else if (!emailPattern.test(formData.EmailID)) {
      formErrors.EmailID = t("createTeam.invalidEmail");
      isValid = false;
    }

    // Validate RoleID
    if (!formData.RoleID) {
      formErrors.RoleID = t("createTeam.roleRequired");
      isValid = false;
    }

    // Validate DepartmentID
    // if (!formData.DepartmentID) {
    //   formErrors.DepartmentID = t("createTeam.departmentRequired");
    //   isValid = false;
    // }

    // Validate MobileNumber (optional but if provided, must be valid)
    if (phoneNumber && phoneNumber.length < 10) {
      formErrors.MobileNumber = t("createTeam.invalidMobile");
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const CreateAppUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Extract country code and mobile number from the combined phone input
      let mobileData = {};
      if (phoneNumber) {
        const countryCode = phoneNumber.substring(0, phoneNumber.length - 10); // Assuming 10 digits for mobile
        const mobileNumber = phoneNumber.substring(phoneNumber.length - 10);
        mobileData = {
          MobileNumber: mobileNumber,
          CountryCode: countryCode,
        };
      }

      const userData = {
        ...formData,
        // Convert empty string to null for DepartmentID
        DepartmentID: formData.DepartmentID === "" ? null : formData.DepartmentID,
        ...mobileData,
      };

      const response = await userService.createAppUser(userData);
      if (response.data.statusCode === "1") {
        toast.success(t("createTeam.userAddSuccess"));
        fetchTeam();
        handleCancel();
      } else if (response.data.statusCode === "10") {
        toast.info("Account Exists");
      } else if (response.data.statusCode === "12" || "3") {
        toast.info(t("createTeam.userLimit"));
        handleCancel();
      }
    } catch (error) {
      console.log(error);
      toast.error(t("createTeam.errUser"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      AccountID: user.AccountID,
      AccountType: user.AccountType,
      RoleID: "",
      MobileNumber: "",
      DepartmentID: null, // reset to null instead of empty string
      FullName: "",
      UserName: "",
      EmailID: "",
    });
    setPhoneNumber("");
    setErrors({
      FullName: "",
      UserName: "",
      RoleID: "",
      // DepartmentID: "", // reset
      MobileNumber: "",
      EmailID: "",
    });
    setShowCreateTeam(false);
  };

  const handleCloseCreateTeam = () => {
    setShowCreateTeam(false);
    handleCancel();
  };

  return (
    <div>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='createTemplate'>
        <button onClick={() => setShowCreateTeam(true)} className='templateButton mb-3'>
          {t("createTeam.createTeam")}
        </button>
      </div>

      <Offcanvas show={showCreateTeam} onHide={handleCloseCreateTeam} scroll={true} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='fw-bold'>{t("createTeam.AddNewTeam")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr style={{ margin: " auto 0", borderColor: "black" }} />
        <Offcanvas.Body>
          <Form>
            <Form.Group className='mt-2' controlId='FullName'>
              <Form.Label>
                {t("createTeam.fullName")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Control type='text' placeholder={t("createTeam.enterfullName")} name='FullName' value={formData.FullName} onChange={handleInputChange} />
              {errors.FullName && <div className='text-danger'>{errors.FullName}</div>}
            </Form.Group>

            <Form.Group className='mt-2' controlId='EmailID'>
              <Form.Label>
                {t("createTeam.email")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Control type='email' placeholder={t("createTeam.enterEmail")} name='EmailID' value={formData.EmailID} onChange={handleInputChange} required />
              {errors.EmailID && <div className='text-danger'>{errors.EmailID}</div>}
            </Form.Group>

            <Form.Group className='mt-2' controlId='RoleID'>
              <Form.Label>
                {t("createTeam.role")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Select as='select' name='RoleID' value={formData.RoleID} onChange={handleInputChange}>
                <option value=''>{t("createTeam.choose")}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleNameEn}
                  </option>
                ))}
              </Form.Select>
              {errors.RoleID && <div className='text-danger'>{errors.RoleID}</div>}
            </Form.Group>

            <Form.Group className='mt-2' controlId='DepartmentID'>
              <Form.Label>
                {t("createTeam.department")}
                <span className='mx-1 text-muted'>({t("createTeam.optional")})</span>
              </Form.Label>
              <Form.Select as='select' name='DepartmentID' value={formData.DepartmentID || ""} onChange={handleInputChange}>
                <option value=''>{t("createTeam.choose")}</option>
                {departments.map((dept) => (
                  <option key={dept.departmentID} value={dept.departmentID}>
                    {dept.title}
                  </option>
                ))}
              </Form.Select>
              {/* {errors.DepartmentID && <div className='text-danger'>{errors.DepartmentID}</div>} */}
            </Form.Group>

            <Form.Group className='mt-2' controlId='MobileNumber'>
              <Form.Label>
                {t("createTeam.mobileNumber")}
                <span className='mx-1 text-muted'>({t("createTeam.optional")})</span>
              </Form.Label>
              <PhoneInput
                excludeCountries={["il"]}
                country={"sa"}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputStyle={{
                  width: "100%",
                  height: "38px",
                  fontSize: "16px",
                  border: "1px solid #ced4da",
                  borderRadius: "0.375rem",
                }}
                containerStyle={{
                  width: "100%",
                }}
                buttonStyle={{
                  border: "1px solid #ced4da",
                  borderRight: "none",
                  borderRadius: "0.375rem 0 0 0.375rem",
                }}
              />
              {errors.MobileNumber && <div className='text-danger'>{errors.MobileNumber}</div>}
            </Form.Group>

            <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
              <Button variant='none' className='modalCancelButton' onClick={handleCancel}>
                {t("createTeam.cancel")}
              </Button>
              <Button variant='none' onClick={CreateAppUser} className='applyBtn'>
                {t("createTeam.createTeam")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default CreateTeamForm;
