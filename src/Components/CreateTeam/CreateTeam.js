import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import "./style.css";
import { Dropdown as Dropdown } from "@/Components/UI/shadcnCompat";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Stack } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import CreateTeamForm from "./CreateTeamForm";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import UserLisence from "@/Components/UserLisence/UserLisence";

import Loader from "@/Components/CommonModals/Loader/Loader";
import UserSearchFilter from "./UserSearchFilter";
import ViewTeamDetails from "./ViewTeamDetails";
import PhoneInput from "react-phone-input-2";

import userService from "@/services/userService";

function CreateTeam() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedAppUserId, setSelectedAppUserId] = useState("");
  const [selectedIsActive, setSelectedIsActive] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { user, userAccess } = useUser();
  const [fullName, setFullName] = useState("");
  const [emailID, setEmailID] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(undefined);
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [viewDetailsAppUserID, setViewDetailsAppUserID] = useState("");
  const [departments, setDepartments] = useState([]);
  const [updatePhoneNumber, setUpdatePhoneNumber] = useState("");
  const { register, reset } = useForm();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [updateUserData, setUpdateUserData] = useState({
    UserName: "",
    FullName: "",
    EmailID: "",
    DepartmentID: "",
    MobileNumber: "",
    RoleID: "",
  });

  const [errors, setErrors] = useState({
    FullName: "",
    UserName: "",
    RoleID: "",
    // DepartmentID: "",
    MobileNumber: "",
    EmailID: "",
  });

  const handleUpdate = (email) => {
    const selectedUser = data.find((user) => user.emailID === email);

    setUpdateUserData({
      UserName: selectedUser.userName,
      FullName: selectedUser.fullName,
      EmailID: selectedUser.emailID,
      MobileNumber: selectedUser.mobileNumber,
      RoleID: selectedUser.roleID,
      DepartmentID: selectedUser.departmentID || null,
    });

    // Set phone number with country code for the update modal
    if (selectedUser.countryCode && selectedUser.mobileNumber) {
      setUpdatePhoneNumber(selectedUser.countryCode + selectedUser.mobileNumber);
    } else if (selectedUser.mobileNumber) {
      setUpdatePhoneNumber(selectedUser.mobileNumber);
    } else {
      setUpdatePhoneNumber("");
    }

    reset();
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    reset();
    setErrors({
      FullName: "",
      UserName: "",
      RoleID: "",
      MobileNumber: "",
      EmailID: "",
    });
    setUpdatePhoneNumber("");
    setShowUpdateModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "UserName") {
      setUpdateUserData({
        ...updateUserData,
        UserName: value,
        EmailID: value,
      });
    } else if (name === "RoleID") {
      setUpdateUserData({
        ...updateUserData,
        RoleID: value,
      });
    } else {
      setUpdateUserData({
        ...updateUserData,
        [name]: value,
      });
    }
    // Clear error when the user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleUpdatePhoneChange = (phone) => {
    setUpdatePhoneNumber(phone);
    setUpdateUserData((prevData) => ({
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

  // form validations
  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Validate FullName
    if (!updateUserData.FullName) {
      formErrors.FullName = t("createTeam.fullNameRequired");
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!updateUserData.EmailID) {
      formErrors.EmailID = t("createTeam.emailRequired");
      isValid = false;
    } else if (!emailPattern.test(updateUserData.EmailID)) {
      formErrors.EmailID = t("createTeam.invalidEmail");
      isValid = false;
    }

    // Validate RoleID
    if (!updateUserData.RoleID) {
      formErrors.RoleID = t("createTeam.roleRequired");
      isValid = false;
    }

    // Validate DepartmentID
    // if (!updateUserData.DepartmentID) {
    //   formErrors.DepartmentID = t("createTeam.departmentRequired");
    //   isValid = false;
    // }

    // Validate MobileNumber (optional but if provided, must be valid)
    if (updatePhoneNumber && updatePhoneNumber.length < 10) {
      formErrors.MobileNumber = t("createTeam.invalidMobile");
      isValid = false;
    }
    setErrors(formErrors);
    return isValid;
  };

  //update user api
  const updateUser = async () => {
    if (!validateForm()) {
      return;
    }
    const { FullName, RoleID, UserName, EmailID, DepartmentID } = updateUserData;

    try {
      setIsLoading(true);

      // Extract country code and mobile number from the combined phone input
      let mobileData = {};
      if (updatePhoneNumber) {
        const countryCode = updatePhoneNumber.substring(0, updatePhoneNumber.length - 10); // Assuming 10 digits for mobile
        const mobileNumber = updatePhoneNumber.substring(updatePhoneNumber.length - 10);
        mobileData = {
          MobileNumber: mobileNumber,
          CountryCode: countryCode,
        };
      }

      const stringifiedRoleID = String(RoleID);

      const response = await userService.updateAppUser({
        FullName,
        RoleID: stringifiedRoleID,
        UserName,
        DepartmentID: DepartmentID === "" ? null : DepartmentID,
        EmailID,
        ...mobileData,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("createTeam.userUpdateSuccess"));
        setShowUpdateModal(false);
        reset();
        setUpdatePhoneNumber("");
        fetchTeamMembers();
      } else {
        toast.error(t("createTeam.failedToUpdateUser"));
      }
    } catch (error) {
      toast.error(t("createTeam.errUpdateUser"));
    } finally {
      setIsLoading(false);
    }
  };

  const openDeactivateModal = () => {
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
  };

  const openActiveModal = () => {
    setShowActiveModal(true);
  };

  const closeActiveModal = () => {
    setShowActiveModal(false);
  };

  //Get Team APi
  const fetchTeamMembers = async () => {
    try {
      if (!user.AccountID) {
        return;
      }
      setIsLoading(true);
      const response = await userService.getAppUserTeam(user.AccountID);
      setData(response.data.response || []);
      const sortedResults = sortTeamMembers(response.data.response || []);
      setSearchResults(sortedResults); // Apply sorted data
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // In CreateTeam component's handleUserSearch function
  const handleUserSearch = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAppUserTeam(user.AccountID, {
        fullName,
        emailID,
        role,
        isActive,
        department,
      });
      const sortedResults = sortTeamMembers(response.data.response || []);
      setSearchResults(sortedResults);
    } catch (error) {
      toast.error("Error fetching user data.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserSearch = () => {
    setFullName("");
    setEmailID("");
    setRole("");
    setIsActive(undefined);
    setDepartment("");
    fetchTeamMembers();
  };
  //Roles Api
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

  const fetchDepartments = async () => {
    try {
      const response = await userService.getActiveAccountDepartments(user.AccountID, isActive);
      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      } else {
        toast.error(t("createTeam.errDepartments"));
      }
    } catch (error) {
      toast.error(t("createTeam.errDepartments"));
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartments();
    fetchRoles();
  }, [user.AccountID, userAccess.remainingDays]);

  const handleDeactivate = (email, isActive) => {
    setSelectedEmail(email);
    setSelectedAppUserId(user.AccountID);
    setSelectedIsActive(!isActive);
    openDeactivateModal();
  };

  const handleActiveAgain = (email, isActive) => {
    setSelectedEmail(email);
    setSelectedAppUserId(user.AccountID);
    setSelectedIsActive(!isActive);
    openActiveModal();
  };

  //User Deactivate
  const userDeactivate = async () => {
    const requestBody = {
      AccountID: selectedAppUserId,
      EmailID: selectedEmail,
      IsActive: selectedIsActive,
    };
    setIsLoading(true);
    try {
      const response = await userService.updateAppUserStatus(requestBody);
      if (response.data.statusCode === "12") {
        toast.info("User license is not valid or subscription has expired.");
      } else if (response.data.response === false) {
        toast.success(t("createTeam.userDeactivateSuccess"));
      } else if (response.data.response === true) {
        toast.success("User Activated successfully");
      } else if (response.data.statusCode === "3") {
        toast.info("User license is not valid or subscription has expired.");
      }
    } catch (error) {
      toast.error(t("createTeam.errDeactivate"));
    } finally {
      setIsLoading(false);
      fetchTeamMembers();
      closeActiveModal();
      closeDeactivateModal();
    }
  };

  const columns = [
    { label: t("tablesLabel.name"), key: "fullName" },
    { label: t("tablesLabel.email"), key: "emailID" },
    { label: t("tablesLabel.role"), key: "roleNameEn" },
    { label: t("departmentList.createdon"), key: "createdon" },
    { label: t("createTeam.department"), key: "title" },
    { label: t("tablesLabel.status"), key: "isActive" },
    { label: "", key: "actions" },
  ];

  // handle the order of role first will come the admin , app user and viewer

  const sortTeamMembers = (teamMembers) => {
    // Define the order for roles
    const roleOrder = {
      "Super Admin": 1,
      Admin: 2,
      "App User": 3,
      Viewer: 4,
    };

    return teamMembers.sort((a, b) => {
      // First, sort by roleNameEn (Admin > App User > Viewer)
      if (roleOrder[a.roleNameEn] !== roleOrder[b.roleNameEn]) {
        return roleOrder[a.roleNameEn] - roleOrder[b.roleNameEn];
      }
      return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
    });
  };

  const handleViewDetails = (row) => {
    setViewDetailsAppUserID(row.appUserID);
    setShowViewDetailsModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedMinutes = (minutes < 10 ? "0" : "") + minutes;

    return `${day}/${month}/${year} - ${hours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <div className='team-members-page container my-3'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      {user.AccountType === "B" && user.RoleID === 2 && userAccess.remainingDays <= 0 ? (
        <>
          <UserLisence />
        </>
      ) : (
        <>
          {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
            <div className='d-flex flex-column'>
              {userAccess.teams === true ? (
                <>
                  <div className='createTemplate'>
                    <CreateTeamForm fetchTeam={fetchTeamMembers} />
                  </div>

                  <div className='py-3 p-3 pendingtable'>
                    <Grid>
                      <Grid item xs={12}>
                        <div>
                          <div className='team-members-toolbar'>
                            <h4 className='team-members-heading'>{t("createTeam.MyTeam")}</h4>

                            <div className='search-filters-container'>
                              <UserSearchFilter
                                fullName={fullName}
                                emailID={emailID}
                                role={role}
                                isActive={isActive}
                                department={department}
                                setFullName={setFullName}
                                setEmailID={setEmailID}
                                setRole={setRole}
                                setIsActive={setIsActive}
                                setDepartment={setDepartment}
                                handleSearch={handleUserSearch}
                                clearSearch={clearUserSearch}
                                userRoles={roles} //pass roles
                                departments={departments} //pass departments
                              />
                            </div>
                          </div>

                          <TableContainer
                            component={Paper}
                            className='custom-table-scrollbar team-members-table'
                            style={{
                              maxWidth: "100%",
                              overflowX: "auto",
                              height: "60vh",
                            }}
                          >
                            <Table stickyHeader className='team-members-table-content'>
                              <TableHead className=''>
                                <TableRow>
                                  {columns.map((column) => (
                                    <TableCell key={column.label} className='TableHeaderCell'>
                                      {column.label}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {searchResults.length === 0 && (
                                  <TableRow>
                                    <td colSpan='6' className='team-empty-state p-5 text-center'>
                                      <div className='report-empty-content'>
                                        <Icons.Users size={50} />
                                        {t("tablesLabel.notTeamFound")}
                                      </div>
                                    </td>
                                  </TableRow>
                                )}

                                {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell className='TableCell'>{row.fullName}</TableCell>
                                    <TableCell className='TableCell'>{row.emailID}</TableCell>
                                    <TableCell className='TableCell'>{row.roleNameEn}</TableCell>
                                    <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                                    <TableCell className='TableCell'>{row.department}</TableCell>

                                    <TableCell className='TableCell'>
                                    <label className={`team-status-pill ${row.isActive ? "is-active" : "is-inactive"}`}>
                                        {row.isActive ? "Active" : "Inactive"}
                                      </label>
                                    </TableCell>
                                    <TableCell className='py-0'>
                                      <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} />
                                        <Dropdown.Menu>
                                          {row.isActive ? (
                                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeactivate(row.emailID, row.isActive)}>
                                              <Icons.InactiveAction size={20} />
                                              {t("createTeam.deactivateUser")}
                                            </Dropdown.Item>
                                          ) : (
                                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleActiveAgain(row.emailID, row.isActive)}>
                                              <Icons.Active size={20} color='var(--modern-success, #16a34a)' />
                                              {t("createTeam.activateUser")}
                                            </Dropdown.Item>
                                          )}
                                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdate(row.emailID)}>
                                            <Icons.EditProfile size={22} />
                                            {t("createTeam.updateUser")}
                                          </Dropdown.Item>

                                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDetails(row)}>
                                            <Icons.ViewDetails size={23} />
                                            {t("createTeam.viewDetails")}
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {/* Pagination */}
                          <div className='team-members-pagination'>
                            <div className='showHideNoDocs'>
                              {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.existing")} {data.length} {t("tablesLabel.existingUser")}
                            </div>
                            <Stack spacing={2}>
                              <Pagination
                                count={Math.ceil(data.length / rowsPerPage)}
                                variant='outlined'
                                shape='rounded'
                                page={page + 1}
                                onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                              />
                            </Stack>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </>
      )}
      {/* Update user  */}
      <Offcanvas show={showUpdateModal} className='team-form-panel' onHide={handleCloseUpdateModal} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("createTeam.updateUser")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className='team-form-divider' />
        <Offcanvas.Body>
          <Form>
            <Form.Group controlId='updateEmailID'>
              <Form.Label>{t("createTeam.email")}</Form.Label>
              <Form.Control type='email' {...register("EmailID", { required: true })} name='EmailID' value={updateUserData.EmailID} onChange={handleInputChange} disabled />
            </Form.Group>
            <Form.Group className='mt-2' controlId='updateUserName'>
              <Form.Label>
                {t("createTeam.fullName")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Control
                type='text'
                placeholder={t("createTeam.enterfullName")}
                {...register("FullName", { required: true })}
                name='FullName'
                value={updateUserData.FullName}
                onChange={handleInputChange}
              />
              {errors.FullName && <div className='text-danger'>{errors.FullName}</div>}
            </Form.Group>

            <Form.Group className='mt-2' controlId='updateRoleID'>
              <Form.Label>
                {t("createTeam.role")}
                <span className='text-danger mx-1'>*</span>
              </Form.Label>
              <Form.Select as='select' {...register("RoleID", { required: true })} value={updateUserData.RoleID} onChange={handleInputChange}>
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
                <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
              </Form.Label>
              <Form.Select as='select' {...register("DepartmentID")} value={updateUserData.DepartmentID} onChange={handleInputChange}>
                <option value=''>{t("createTeam.choose")}</option>
                {departments.map((dept) => (
                  <option key={dept.departmentID} value={dept.departmentID}>
                    {dept.title}
                  </option>
                ))}
              </Form.Select>
              {/* {errors.DepartmentID && <div className='text-danger'>{errors.DepartmentID}</div>} */}
            </Form.Group>

            <Form.Group className='mt-2' controlId='updateMobileNumber'>
              <Form.Label>
                {t("createTeam.mobileNumber")}
                <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
              </Form.Label>
              <PhoneInput
                excludeCountries={["il"]}
                country={"sa"}
                value={updatePhoneNumber}
                onChange={handleUpdatePhoneChange}
                containerClass='team-phone-control'
                inputClass='team-phone-input'
                buttonClass='team-phone-country'
              />
              {errors.MobileNumber && <div className='text-danger'>{errors.MobileNumber}</div>}
            </Form.Group>

            <div className='team-form-actions'>
              <Button variant='none' className='modalCancelButton ' onClick={handleCloseUpdateModal}>
                {t("createTeam.cancel")}
              </Button>
              <Button variant='none' onClick={updateUser} className='applyBtn '>
                {t("createTeam.updateUser")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* deactivate User */}
      <Modal show={showDeactivateModal} className='team-confirm-dialog team-confirm-dialog--deactivate' backdrop='static' keyboard={false} onHide={closeDeactivateModal} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <Modal.Title>
            <div className='header-content'>
              <div className='header-icon'>
                <Icons.InactiveAction size={25} />
              </div>
              <div className='header-text'>
                <Modal.Title>{t("AuthIntegration.Confirmation")}</Modal.Title>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          <div>
            <p className='team-confirm-copy'>
              {t("createTeam.confirmDeactivate")}
            </p>
            <div className='team-confirm-email'>
              <div className='team-confirm-email-label'>
                {t("createTeam.email")}
              </div>
              <div className='team-confirm-email-value'>
                {selectedEmail}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='none' onClick={closeDeactivateModal} className='modalCancelButton'>
            {t("createTeam.cancel")}
          </Button>
          <Button variant='none' onClick={userDeactivate} className='applyBtn'>
            {t("createTeam.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* activate user */}
      <Modal show={showActiveModal} className='team-confirm-dialog team-confirm-dialog--activate' backdrop='static' keyboard={false} onHide={closeActiveModal} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.Active size={25} color='var(--modern-success, #16a34a)' />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("AuthIntegration.Confirmation")}</Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          <div>
            <p>{t("createTeam.confirmActivate")}</p>
            <div className='team-confirm-email'>
              <div className='team-confirm-email-label'>
                {t("createTeam.email")}
              </div>
              <div className='team-confirm-email-value'>
                {selectedEmail}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='none' onClick={closeActiveModal} className='modalCancelButton'>
            {t("createTeam.cancel")}
          </Button>
          <Button variant='none' onClick={userDeactivate} className='applyBtn'>
            {t("createTeam.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      <ViewTeamDetails show={showViewDetailsModal} onHide={() => setShowViewDetailsModal(false)} appUserID={viewDetailsAppUserID} />
    </div>
  );
}

export default CreateTeam;
