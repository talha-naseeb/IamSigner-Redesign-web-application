import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Accordion } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import UserSearchFilter from "@/Components/CreateTeam/UserSearchFilter";
import Loader from "@/Components/CommonModals/Loader/Loader";
import UserLisence from "@/Components/UserLisence/UserLisence";
import userService from "@/services/userService";

function AppUserReport() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { user, userAccess, showCompanyName } = useUser();
  const [fullName, setFullName] = useState("");
  const [emailID, setEmailID] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(undefined);
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [departments, setDepartments] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
      const response = await userService.getAccountDepartments(user.AccountID);

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

  const columns = [
    { label: t("tablesLabel.serialNo"), key: "Sr.No" },
    { label: t("tablesLabel.name"), key: "fullName" },
    { label: t("tablesLabel.email"), key: "emailID" },
    { label: t("tablesLabel.role"), key: "roleNameEn" },
    { label: t("createTeam.department"), key: "title" },
    { label: t("tablesLabel.status"), key: "isActive" },
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

  const exportToExcel = () => {
    const worksheetData = searchResults.map((row) => ({
      Name: row.fullName,
      Email: row.emailID,
      Role: row.roleNameEn,
      CreatedOn: row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "",
      Department: row.department,
      "Country Code": row.countryCode || "",
      "Mobile Number": row.mobileNumber || "",
      Status: row.isActive ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Members");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "TeamMembers.xlsx");
  };

  const exportToWord = () => {
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
    const footer = "</body></html>";

    let htmlTable =
      '<table border="1" style="border-collapse: collapse; width: 100%;">' +
      "<tr><th>Name</th><th>Email</th><th>Role</th><th>Created On</th><th>Department</th><th>Country Code</th><th>Mobile Number</th><th>Status</th></tr>";

    searchResults.forEach((row) => {
      htmlTable += `<tr>
        <td>${row.fullName}</td>
        <td>${row.emailID}</td>
        <td>${row.roleNameEn}</td>
        <td>${row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</td>
        <td>${row.department || ""}</td>
        <td>${row.countryCode || ""}</td>
        <td>${row.mobileNumber || ""}</td>
        <td>${row.isActive ? "Active" : "Inactive"}</td>
      </tr>`;
    });

    htmlTable += "</table>";

    const sourceHTML = header + htmlTable + footer;

    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });

    saveAs(blob, "TeamMembers.doc");
  };

  return (
    <div className='container my-3'>
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
            <div>
              {userAccess.teams === true ? (
                <>
                  <Accordion defaultActiveKey='0'>
                    <Accordion.Item eventKey='0'>
                      <Accordion.Header>
                        <div className='d-flex align-items-center justify-content-between w-100'>
                          <div className='d-flex align-items-center gap-3'>
                            <Icons.Users size={30} />
                            <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("createTeam.userLicenseDetails")}</label>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className='d-flex justify-content-between align-items-center mb-3 flex-wrap'>
                          {showCompanyName && (
                            <div className='text-muted'>
                              <span className='fw-semibold'>{showCompanyName}</span> {t("createTeam.appUsers")}
                            </div>
                          )}
                          <div className='d-flex align-items-center'>
                            <Dropdown>
                              <Dropdown.Toggle variant='success' size='sm' className='d-flex align-items-center gap-2'>
                                <Icons.Download size={14} />
                                {t("createTeam.Export")}
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item onClick={exportToExcel} className='d-flex gap-2 align-items-center'>
                                  <Icons.Excel size={22} />
                                  {t("createTeam.exportExcel")}
                                </Dropdown.Item>

                                <Dropdown.Item onClick={exportToWord} className='d-flex gap-2 align-items-center'>
                                  <Icons.Word size={20} />
                                  {t("createTeam.exportWord")}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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
                        <div>
                          <Grid>
                            <Grid item xs={12}>
                              <div>
                                <TableContainer
                                  component={Paper}
                                  className='custom-table-scrollbar'
                                  style={{
                                    maxWidth: "100%",
                                    overflowX: "auto",
                                    height: "57vh",
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
                                      {searchResults.length === 0 && (
                                        <TableRow>
                                          <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                              <Icons.Users size={50} />
                                              {t("tablesLabel.notTeamFound")}
                                            </div>
                                          </td>
                                        </TableRow>
                                      )}

                                      {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={index}>
                                          <TableCell className='TableCell'>{page * rowsPerPage + index + 1}</TableCell>
                                          <TableCell className='TableCell'>{row.fullName}</TableCell>
                                          <TableCell className='TableCell'>{row.emailID}</TableCell>
                                          <TableCell className='TableCell'>{row.roleNameEn}</TableCell>
                                          <TableCell className='TableCell'>{row.department}</TableCell>

                                          <TableCell className='TableCell'>
                                            <label
                                              style={{
                                                padding: "2px 12px",
                                                borderRadius: "12px",
                                                color: row.isActive ? "#19d157" : "#6c757d",
                                                border: `1px solid ${row.isActive ? "#19d157" : "#6c757d"}`,
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {row.isActive ? "Active" : "Inactive"}
                                            </label>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                {/* Pagination */}
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
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
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
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
    </div>
  );
}

export default AppUserReport;
