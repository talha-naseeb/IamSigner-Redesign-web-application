import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Icons } from "@/assets/Icons";
import CreateDepartment from "./CreateDepartment";
import UpdateDepartment from "./UpdateDepartment";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useParams } from "react-router-dom";
import { Button, Dropdown, Modal } from "react-bootstrap";
import DepartmentSearchFilters from "./DepartmentSearchFilters";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";

const DepartmentList = () => {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToToggle, setTemplateToToggle] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDepartCanvas, setShowDepartCanvas] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState("");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedDepartmentTitle, setSelectedDepartmentTitle] = useState("");
  const { user, userAccess } = useUser();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch departments using the accountId from the URL
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAccountDepartments(accountId);

      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      } else {
        toast.error(t("departmentList.errorFetching"));
      }
    } catch (error) {
      toast.error(t("departmentList.errorFetching"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchDepartments();
    }
  }, [accountId]);

  const handleOpenUpdateModal = (department) => {
    setSelectedDepartment(department);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleOpenConfirmModal = (department) => {
    setTemplateToToggle(department);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleToggleStatus = async () => {
    if (templateToToggle) {
      const updatedData = {
        DepartmentID: templateToToggle.departmentID,
        Title: templateToToggle.title,
        Description: templateToToggle.description,
        IsActive: !templateToToggle.isActive,
      };

      try {
        const response = await userService.updateAccountDepartment(updatedData);

        if (response.data.statusCode === "1") {
          toast.success(t("departmentList.updateSuccess"));
          fetchDepartments();
        } else {
          toast.error(t("departmentList.updateFailed"));
        }
      } catch (error) {
        toast.error(t("departmentList.updateFailed"));
      } finally {
        setShowConfirmModal(false);
      }
    }
  };

  const fetchDepartmentFilter = async (filters = {}) => {
    try {
      setIsLoading(true);

      const params = {
        ...filters,
      };

      const response = await userService.getAccountDepartments(accountId, params);
      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      } else {
        toast.error(t("departmentList.errorFetching"));
      }
    } catch (error) {
      toast.error(t("departmentList.errorFetching"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDepartmentFilter({
      title,
      description,
      isActive: isActive === "" ? "" : isActive === "true",
    });
  };

  const clearSearch = () => {
    setTitle("");
    setDescription("");
    setIsActive("");
    fetchDepartments();
  };

  const columns = [
    { label: t("tablesLabel.departName"), key: "title" },
    { label: t("departmentList.description"), key: "description" },
    { label: t("tablesLabel.date"), key: "createdon" },
    { label: t("tablesLabel.status"), key: "status" },
    { label: t("departmentList.createdby"), key: "createdby" },
    { label: "", key: "actions" },
  ];

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

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const handleDescriptionClick = (description, title) => {
    setSelectedDescription(description);
    setSelectedDepartmentTitle(title);
    setShowDescriptionModal(true);
  };

  const handleCloseDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedDescription("");
    setSelectedDepartmentTitle("");
  };

  return (
    <>
      {user.AccountType === "B" && user.RoleID === 2 && userAccess.remainingDays <= 0 ? (
        <>
          <UserLisence />
        </>
      ) : (
        <>
          {userAccess.teams === true ? (
            <>
              <Grid className='container mt-3'>
                {isLoading && (
                  <div className='loader-overlay'>
                    <Loader />
                  </div>
                )}

                <div className='createTemplate'>
                  <CreateDepartment accountID={accountId} fetchDepartments={fetchDepartments} showOffcanvas={showDepartCanvas} setShowOffcanvas={setShowDepartCanvas} />
                </div>

                <div className='py-3 p-3 mt-3 container pendingtable'>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <h4>{t("departmentList.departmentListTitle")}</h4>
                    <div className='search-filters-container'>
                      <DepartmentSearchFilters
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        isActive={isActive}
                        setIsActive={setIsActive}
                        handleSearch={handleSearch}
                        clearSearch={clearSearch}
                      />
                    </div>
                  </div>

                  <TableContainer
                    component={Paper}
                    className='custom-table-scrollbar'
                    style={{
                      maxWidth: "100%",
                      overflowX: "auto",
                      height: "60vh",
                    }}
                  >
                    <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell key={column.label} style={{ backgroundColor: "#F0F3F4" }} className='TableHeaderCell'>
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departments.length === 0 ? (
                          <TableRow>
                            <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                              <Icons.Department size={50} />
                              <p>{t("departmentList.noDepartmentsFound")}</p>
                            </td>
                          </TableRow>
                        ) : (
                          departments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((department, index) => (
                            <TableRow key={index}>
                              <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                                {department.title}
                              </TableCell>
                              <TableCell
                                className={`TableCell truncate-cell ${department.description?.length > 50 ? "cursor-pointer" : ""}`}
                                onClick={(e) => (department.description?.length > 50 ? handleDescriptionClick(department.description, department.title) : handleCellClick(e))}
                                style={{ cursor: department.description?.length > 50 ? "pointer" : "default" }}
                              >
                                {department.description}
                              </TableCell>
                              <TableCell className='TableCell'>{department.createdOnFormatted ? formatDate(department.createdOnFormatted) : ""}</TableCell>
                              <TableCell className='TableCell'>
                                <label
                                  style={{
                                    padding: "2px 12px",
                                    borderRadius: "12px",
                                    color: department.isActive ? "#19d157" : "#6c757d",
                                    border: `1px solid ${department.isActive ? "#19d157" : "#6c757d"}`,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {department.isActive ? "Active" : "Inactive"}
                                </label>
                              </TableCell>
                              <TableCell className='TableCell'>{department.createdbyName}</TableCell>

                              <TableCell className='py-0'>
                                <Dropdown>
                                  <Dropdown.Toggle as={CustomToggle} />
                                  <Dropdown.Menu>
                                    {department.isActive ? (
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenConfirmModal(department)}>
                                        <Icons.InactiveAction size={20} />
                                        {t("departmentList.deactivate")}
                                      </Dropdown.Item>
                                    ) : (
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenConfirmModal(department)}>
                                        <Icons.Active size={20} color='#19d157' />
                                        {t("departmentList.activate")}
                                      </Dropdown.Item>
                                    )}
                                    <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenUpdateModal(department)}>
                                      <Icons.EditSquare size={20} />
                                      {t("userProfile.update")}
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                    <div className='showHideNoDocs'>
                      {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, departments.length)} {t("departmentList.departmentof")} {departments.length} {t("departmentList.department")}
                    </div>
                    <Stack spacing={2}>
                      <Pagination
                        count={Math.ceil(departments.length / rowsPerPage)}
                        variant='outlined'
                        shape='rounded'
                        page={page + 1}
                        onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                      />
                    </Stack>
                  </div>
                </div>
              </Grid>

              <UpdateDepartment show={showUpdateModal} handleClose={handleCloseUpdateModal} selectedDepartment={selectedDepartment} fetchDepartments={fetchDepartments} />

              {/* Confirmation Modal */}
              <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
                <Modal.Header>
                  <Modal.Title>
                    <div className='header-content'>
                      <div className='header-icon'>{templateToToggle && templateToToggle.isActive ? <Icons.InactiveAction size={25} /> : <Icons.Active size={25} color='#19d157' />}</div>

                      <div className='header-text'>
                        <Modal.Title>{t("emailTemplates.Confirmation")}</Modal.Title>
                      </div>
                    </div>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-3'>{templateToToggle && templateToToggle.isActive ? t("departmentList.sureDeactivate") : t("departmentList.sureActive")}</Modal.Body>
                <Modal.Footer className='d-flex justify-content-end gap-5'>
                  <Button variant='secondary' className='modalCancelButton' onClick={handleCloseConfirmModal}>
                    {t("dashboardCardStatuses.cancel")}
                  </Button>
                  <Button variant='primary' className='applyBtn' onClick={handleToggleStatus}>
                    {t("dashboardCardStatuses.confirm")}
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Description Modal */}
              <Modal show={showDescriptionModal} onHide={handleCloseDescriptionModal} dialogClassName='custom-modal-width'>
                <Modal.Header>
                  <Modal.Title>{selectedDepartmentTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-4'>
                  <h6>{t("departmentList.description")}</h6>
                  <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedDescription}</p>
                </Modal.Body>
              </Modal>
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export default DepartmentList;
