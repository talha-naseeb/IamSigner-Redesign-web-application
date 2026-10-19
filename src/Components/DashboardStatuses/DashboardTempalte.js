import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import "@/Pages/Templates/templates.css";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import templateService from "@/services/templateService";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";

const DashboardTemplate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplatesData = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.getAllTemplates();
      if (response.data) {
        setSearchResults(response.data.response || []);

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const handleViewAllTemplate = () => {
    localStorage.removeItem("templateID");
    navigate("/templates-page");
  };

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const columns = [
    { label: t("tablesLabel.name"), key: "templateName" },
    { label: t("tablesLabel.status"), key: "templateName" },
  ];

  return (
    <>
      <Grid>
        <Grid item xs={12}>
          {/* Loader overlay */}
          {isLoading && (
            <div className='loader-overlay'>
              <Loader />
            </div>
          )}

          <section className='dashboard-template-card' aria-labelledby='dashboard-template-heading'>
            <div className='dashboard-template-header'>
              <h2 id='dashboard-template-heading' className='dashboard-template-title'>{t("tablesLabel.latestTemplates")}</h2>

              <Button onClick={handleViewAllTemplate} variant='none' className='viewAllltemBtn'>
                {t("tablesLabel.View")}
              </Button>
            </div>

            {/* Table */}
            <TableContainer
              component={Paper}
              elevation={0}
              className='custom-table-scrollbar DashboardTemplate'
              role='region'
              tabIndex={0}
              aria-label={t("tablesLabel.latestTemplates")}
              style={{
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table stickyHeader style={{ border: "none" }}>
                {/* Table Headers */}
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.label} className='TableHeaderCell'>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                  {searchResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='dashboard-template-empty-state'>
                        <div>
                          <Icons.BulkDocuments size={50} />
                          {t("dashboardCardStatuses.notDocsFound")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {searchResults.map((row, index) => (
                    <TableRow key={row.templateID || row.templateName || index}>
                      <TableCell className='TableCell truncate-cell-template' onClick={(e) => handleCellClick(e)}>
                        {row.templateName}
                      </TableCell>
                      <TableCell className='TableCell'>
                        <span
                          className='home-status-pill'
                          style={{ "--status-color": row.isActive ? "var(--completed-status)" : "var(--inactive-status)" }}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardTemplate;
