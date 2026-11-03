import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import PhoneInput from "react-phone-input-2";
import userService from "@/services/userService";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import "./style.css";

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
    <div className='inline-flex'>
      <button type='button' onClick={() => setShowCreateTeam(true)} className='templateButton'>
        <Plus size={16} />
        <span>{t("createTeam.createTeam")}</span>
      </button>

      <Modal
        show={showCreateTeam}
        onHide={handleCloseCreateTeam}
        centered
        dialogClassName='max-w-xl'
        contentClassName='overflow-visible'
        backdrop='static'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)] rounded-t-xl'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
              <UserPlus size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {t("createTeam.AddNewTeam")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("createTeam.enterDetails") || "Add a new member to collaborate in your organization"}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <Form onSubmit={(e) => { e.preventDefault(); CreateAppUser(); }}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Full Name */}
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.fullName")} <span className='text-rose-500'>*</span>
                </label>
                <Form.Control
                  type='text'
                  placeholder={t("createTeam.enterfullName")}
                  name='FullName'
                  value={formData.FullName}
                  onChange={handleInputChange}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                />
                {errors.FullName && <div className='text-xs text-rose-500 mt-1'>{errors.FullName}</div>}
              </div>

              {/* Email */}
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.email")} <span className='text-rose-500'>*</span>
                </label>
                <Form.Control
                  type='email'
                  placeholder={t("createTeam.enterEmail")}
                  name='EmailID'
                  value={formData.EmailID}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                />
                {errors.EmailID && <div className='text-xs text-rose-500 mt-1'>{errors.EmailID}</div>}
              </div>

              {/* Role */}
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.role")} <span className='text-rose-500'>*</span>
                </label>
                <Form.Select
                  as='select'
                  name='RoleID'
                  value={formData.RoleID}
                  onChange={handleInputChange}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                >
                  <option value=''>{t("createTeam.choose")}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleNameEn}
                    </option>
                  ))}
                </Form.Select>
                {errors.RoleID && <div className='text-xs text-rose-500 mt-1'>{errors.RoleID}</div>}
              </div>

              {/* Department (Optional) */}
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.department")}{" "}
                  <span className='text-xs text-[var(--modern-muted)] font-normal'>
                    ({t("createTeam.optional")})
                  </span>
                </label>
                <Form.Select
                  as='select'
                  name='DepartmentID'
                  value={formData.DepartmentID || ""}
                  onChange={handleInputChange}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                >
                  <option value=''>{t("createTeam.choose")}</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentID} value={dept.departmentID}>
                      {dept.title}
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Mobile Number (Optional) */}
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.mobileNumber")}{" "}
                  <span className='text-xs text-[var(--modern-muted)] font-normal'>
                    ({t("createTeam.optional")})
                  </span>
                </label>
                <PhoneInput
                  excludeCountries={["il"]}
                  country={"sa"}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  containerClass={`phone-input-container create-team-phone-input ${errors.MobileNumber ? "is-invalid" : ""}`}
                />
                {errors.MobileNumber && (
                  <div className='text-xs text-rose-500 mt-1'>{errors.MobileNumber}</div>
                )}
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-4 flex items-center justify-end gap-3 bg-[var(--modern-card)] rounded-b-xl'>
          <Button
            variant='none'
            type='button'
            onClick={handleCancel}
            disabled={isLoading}
            className='px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
          >
            {t("createTeam.cancel")}
          </Button>
          <Button
            variant='none'
            type='button'
            onClick={CreateAppUser}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
          >
            {isLoading && <Loader2 size={16} className='animate-spin' />}
            <span>{t("createTeam.createTeam")}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CreateTeamForm;
