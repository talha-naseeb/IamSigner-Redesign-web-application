import React, { useState, useEffect, useCallback } from "react";
import { Accordion, Dropdown } from "react-bootstrap";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DocStatusFilter from "./DocStatusFilter";
import Loader from "@/Components/CommonModals/Loader/Loader";
import documentService from "@/services/documentService";
import userService from "@/services/userService";

function UserDocReport() {
  const { t } = useTranslation();
  const { user, showCompanyName, userAccess } = useUser();

  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fullName, setFullName] = useState("");
  const [emailID, setEmailID] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch document statistics for users
  const fetchDocumentStatistics = useCallback(async (users) => {
    const statsPromises = users.map(async (user) => {
      try {
        setIsLoading(true);
        const response = await documentService.getAppUserDocsCount(user.appUserID);

        return {
          appUserID: user.appUserID,
          stats: response.data.statusCode === "1" ? response.data.response : null,
        };
      } catch (error) {
        return {
          appUserID: user.appUserID,
          stats: null,
        };
      } finally {
        setIsLoading(false);
      }
    });

    try {
      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach((result) => {
        if (result.stats) {
          statsMap[result.appUserID] = result.stats;
        }
      });

      return statsMap; // Return the statsMap for immediate use
    } catch (error) {
      console.error("Error fetching document statistics:", error);
      return {};
    }
  }, []);

  // Fetch team members with document status
  const fetchUserDocumentStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user.AccountID) {
        return;
      }
      const response = await userService.getAppUserTeam(user.AccountID);

      const users = response.data.response || [];

      // Fetch document statistics for all users
      const statsMap = await fetchDocumentStatistics(users);

      // Process the data to include document status counts from API
      const processedData = users.map((user) => {
        const userStats = statsMap[user.appUserID] || {};
        return {
          ...user,
          draft: userStats.draftCount || 0,
          completed: userStats.completedCount || 0,
          pending: userStats.pendingCount || 0,
          shared: userStats.sharedCount || 0,
          declined: userStats.declineCount || 0,
          inactive: userStats.inActiveCount || 0,
          recalled: userStats.recalledCount || 0,
        };
      });

      setSearchResults(processedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [user.AccountID, fetchDocumentStatistics]);

  // Search function
  const handleUserSearch = async () => {
    try {
      const response = await userService.getAppUserTeam(user.AccountID, {
        fullName,
        emailID,
      });

      const users = response.data.response || [];

      const statsMap = await fetchDocumentStatistics(users);

      const processedData = users.map((user) => {
        const userStats = statsMap[user.appUserID] || {};
        return {
          ...user,
          draft: userStats.draftCount || 0,
          completed: userStats.completedCount || 0,
          pending: userStats.pendingCount || 0,
          shared: userStats.sharedCount || 0,
          declined: userStats.declineCount || 0,
          inactive: userStats.inActiveCount || 0,
          recalled: userStats.recalledCount || 0,
        };
      });

      setSearchResults(processedData);
    } catch (error) {
      console.log(error);
    }
  };

  // Clear search function
  const clearUserSearch = () => {
    setFullName("");
    setEmailID("");
    fetchUserDocumentStatus();
  };

  useEffect(() => {
    fetchUserDocumentStatus();
  }, [fetchUserDocumentStatus]);

  const columns = [
    { label: t("tablesLabel.serialNo"), key: "srNo" },
    { label: t("tablesLabel.name"), key: "fullName" },
    { label: t("tablesLabel.email"), key: "emailID" },
    { label: t("menuButtons.draft"), key: "draft" },
    { label: t("menuButtons.completed"), key: "completed" },
    { label: t("menuButtons.pending"), key: "pending" },
    { label: t("menuButtons.shared"), key: "shared" },
    { label: t("menuButtons.declined"), key: "declined" },
    { label: t("menuButtons.inactive"), key: "inactive" },
    { label: t("menuButtons.recalled"), key: "recalled" },
  ];

  const exportToExcel = () => {
    const worksheetData = searchResults.map((row, index) => ({
      "Sr. No": index + 1,
      Name: row.fullName,
      Email: row.emailID,
      Draft: row.draft,
      Completed: row.completed,
      Pending: row.pending,
      Shared: row.shared,
      Declined: row.declined,
      Inactive: row.inactive,
      Recalled: row.recalled,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Document Status");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data_blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data_blob, "UserDocumentStatus.xlsx");
  };

  const exportToWord = () => {
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>User Document Status</title></head><body>";
    const footer = "</body></html>";

    let htmlTable =
      '<table border="1" style="border-collapse: collapse; width: 100%;">' +
      "<tr><th>Sr. No</th><th>Name</th><th>Email</th><th>Draft</th><th>Completed</th><th>Pending</th><th>Shared</th><th>Declined</th><th>Inactive</th><th>Recalled</th></tr>";

    searchResults.forEach((row, index) => {
      htmlTable += `<tr>
        <td>${index + 1}</td>
        <td>${row.fullName}</td>
        <td>${row.emailID}</td>
        <td>${row.draft}</td>
        <td>${row.completed}</td>
        <td>${row.pending}</td>
        <td>${row.shared}</td>
        <td>${row.declined}</td>
        <td>${row.inactive}</td>
        <td>${row.recalled}</td>
      </tr>`;
    });

    htmlTable += "</table>";
    const sourceHTML = header + htmlTable + footer;
    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });
    saveAs(blob, "UserDocumentStatus.doc");
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
        <div className='my-3 container'>
          <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
              <Accordion.Header>
                <div className='d-flex align-items-center justify-content-between w-100'>
                  <div className='d-flex align-items-center gap-3'>
                    <Icons.Users size={30} />
                    <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("createTeam.userDocStatus")}</label>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className='d-flex justify-content-between align-items-center mb-3 flex-wrap'>
                  {showCompanyName && (
                    <div className='text-muted'>
                      <span className='fw-semibold'>{showCompanyName}</span> {t("createTeam.userDocs")}
                    </div>
                  )}
                  <div className='d-flex align-items-center flex-wrap'>
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
                    <div className='search-filters-container'>
                      <DocStatusFilter fullName={fullName} emailID={emailID} setFullName={setFullName} setEmailID={setEmailID} handleSearch={handleUserSearch} clearSearch={clearUserSearch} />
                    </div>
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
                                  <td colSpan={columns.length} className='p-5 text-center'>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                      <Icons.Users size={50} />
                                      {t("createTeam.noUserFound")}
                                    </div>
                                  </td>
                                </TableRow>
                              )}

                              {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell className='TableCell'>{page * rowsPerPage + index + 1}</TableCell>
                                  <TableCell className='TableCell'>{row.fullName}</TableCell>
                                  <TableCell className='TableCell'>{row.emailID}</TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid #0d6efd", color: "#0d6efd" }}>
                                      {row.draft}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid #19d157", color: "#19d157" }}>
                                      {row.completed}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid #f9ba05", color: "#f9ba05" }}>
                                      {row.pending}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid #6cc4f2", color: "#6cc4f2" }}>
                                      {row.shared}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid #e32626", color: "#e32626" }}>
                                      {row.declined}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid rgb(188, 196, 200)", color: "rgb(188, 196, 200)" }}>
                                      {row.inactive}
                                    </span>
                                  </TableCell>
                                  <TableCell className='TableCell'>
                                    <span className='docsCounts' style={{ border: "1px solid rgb(122, 229, 244)", color: "rgb(122, 229, 244)" }}>
                                      {row.recalled}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                          <div className='showHideNoDocs'>
                            {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, searchResults.length)} {t("tablesLabel.existing")} {searchResults.length} {t("tablesLabel.existingUser")}
                          </div>
                          <Stack spacing={2}>
                            <Pagination
                              count={Math.ceil(searchResults.length / rowsPerPage)}
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
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default UserDocReport;
