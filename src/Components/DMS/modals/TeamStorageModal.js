import { useEffect, useMemo, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Modal, Form, Spinner, Button } from "react-bootstrap";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import { parseDmsTeamStorageRows, summarizeDmsTeamStorage } from "../utils/dmsHelpers";

const getUsageLevel = (percent) => {
  if (percent == null) return "none";
  if (percent >= 90) return "critical";
  if (percent >= 75) return "high";
  if (percent >= 50) return "medium";
  return "low";
};

const getUsageFillClass = (percent) => {
  const level = getUsageLevel(percent);
  return level === "none" ? "" : `dms-storage-fill--${level}`;
};

const getUsagePctClass = (percent) => {
  const level = getUsageLevel(percent);
  return level === "none" ? "" : `dms-team-storage-usage-pct--${level}`;
};

const TeamStorageModal = ({ show, onHide }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const loadTeamStorage = async () => {
    setLoading(true);
    try {
      const res = await userService.getDmsAllUsersStorage();
      setRows(parseDmsTeamStorageRows(res));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    setSearch("");
    void loadTeamStorage();
  }, [show]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = rows.filter((row) => {
        const haystack = [row.displayName, row.email, row.userId].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }
    return [...list].sort((a, b) => (b.usedBytes ?? 0) - (a.usedBytes ?? 0));
  }, [rows, search]);

  const summary = useMemo(() => summarizeDmsTeamStorage(filteredRows), [filteredRows]);

  const columns = [
    { label: t("DMS.storageUser"), key: "user" },
    { label: t("DMS.storageUsage"), key: "usage" },
    { label: t("DMS.documents"), key: "documents", align: "right" },
    { label: t("DMS.folders"), key: "folders", align: "right" },
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      scrollable
      dialogClassName="dms-team-storage-modal"
    >
      <Modal.Header closeButton className="dms-team-storage-header">
        <div className="dms-team-storage-header-inner">
          <span className="dms-team-storage-header-icon" aria-hidden>
            <StorageOutlinedIcon />
          </span>
          <div>
            <Modal.Title className="dms-team-storage-title">{t("DMS.teamStorageTitle")}</Modal.Title>
            <p className="dms-team-storage-subtitle mb-0">{t("DMS.teamStorageSubtitle")}</p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="dms-team-storage-body">
        {loading ? (
          <div className="dms-team-storage-loading">
            <Spinner animation="border" size="sm" />
            <span>{t("DMS.teamStorageLoading")}</span>
          </div>
        ) : (
          <>
            <div className="dms-team-storage-summary">
              <div className="dms-team-storage-summary-card dms-team-storage-summary-card--primary">
                <span className="dms-team-storage-summary-icon">
                  <PeopleOutlineIcon fontSize="small" />
                </span>
                <div className="dms-team-storage-summary-text">
                  <span className="dms-team-storage-summary-value">{summary.memberCount}</span>
                  <span className="dms-team-storage-summary-label">{t("DMS.teamStorageMembers")}</span>
                </div>
              </div>
              <div className="dms-team-storage-summary-card">
                <span className="dms-team-storage-summary-icon">
                  <StorageOutlinedIcon fontSize="small" />
                </span>
                <div className="dms-team-storage-summary-text">
                  <span className="dms-team-storage-summary-value">
                    {summary.usedFormatted && summary.totalFormatted
                      ? `${summary.usedFormatted} / ${summary.totalFormatted}`
                      : summary.usedFormatted ?? summary.totalFormatted ?? "—"}
                  </span>
                  <span className="dms-team-storage-summary-label">{t("DMS.storageUsage")}</span>
                  {summary.usagePercent != null ? (
                    <div className="dms-storage-bar dms-team-storage-summary-bar">
                      <div
                        className={`dms-storage-fill ${getUsageFillClass(summary.usagePercent)}`}
                        style={{ width: `${summary.usagePercent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="dms-team-storage-summary-card">
                <span className="dms-team-storage-summary-icon">
                  <InsertDriveFileOutlinedIcon fontSize="small" />
                </span>
                <div className="dms-team-storage-summary-text">
                  <span className="dms-team-storage-summary-value">{summary.totalDocuments}</span>
                  <span className="dms-team-storage-summary-label">{t("DMS.documents")}</span>
                </div>
              </div>
              <div className="dms-team-storage-summary-card">
                <span className="dms-team-storage-summary-icon">
                  <FolderOutlinedIcon fontSize="small" />
                </span>
                <div className="dms-team-storage-summary-text">
                  <span className="dms-team-storage-summary-value">{summary.totalFolders}</span>
                  <span className="dms-team-storage-summary-label">{t("DMS.folders")}</span>
                </div>
              </div>
            </div>

            <div className="dms-team-storage-toolbar">
              <div className="dms-team-storage-search">
                <SearchIcon className="dms-team-storage-search-icon" sx={{ fontSize: 18 }} />
                <Form.Control
                  type="search"
                  className="dms-team-storage-search-input"
                  placeholder={t("DMS.teamStorageSearchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={t("DMS.teamStorageSearchPlaceholder")}
                />
              </div>
              <div className="dms-team-storage-toolbar-actions">
                <span className="dms-team-storage-count">
                  {t("DMS.teamStorageShowing", {
                    count: filteredRows.length,
                    total: rows.length,
                  })}
                </span>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  className="dms-team-storage-refresh"
                  onClick={() => void loadTeamStorage()}
                  disabled={loading}
                >
                  <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                  {t("DMS.teamStorageRefresh")}
                </Button>
              </div>
            </div>

            <TableContainer
              component={Paper}
              className="custom-table-scrollbar dms-table-wrap--bordered"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            >
              <Table stickyHeader style={{ border: "none", minWidth: "720px" }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="TableHeaderCell" align={column.align}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" style={{ border: "none" }}>
                        <div className="dms-team-storage-empty">
                          <StorageOutlinedIcon sx={{ fontSize: 48, opacity: 0.35 }} />
                          <p className="mb-0">
                            {rows.length === 0 ? t("DMS.noTeamStorageRows") : t("DMS.teamStorageNoResults")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow key={row.key} hover className="dms-team-storage-row">
                        <TableCell className="TableCell">
                          <div className="dms-team-storage-user">
                            <span className="dms-team-storage-avatar" aria-hidden>
                              {row.initials}
                            </span>
                            <div className="dms-team-storage-user-text">
                              <span className="dms-team-storage-user-name" title={row.displayName}>
                                {row.displayName}
                              </span>
                              {row.email && row.email !== row.displayName ? (
                                <span className="dms-team-storage-user-email" title={row.email}>
                                  {row.email}
                                </span>
                              ) : row.userId ? (
                                <span className="dms-team-storage-user-email" title={row.userId}>
                                  {row.userId}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="TableCell">
                          <div className="dms-team-storage-usage">
                            <div className="dms-team-storage-usage-top">
                              <span className="dms-team-storage-usage-value">{row.usageLabel}</span>
                              {row.usagePercent != null ? (
                                <span
                                  className={`dms-team-storage-usage-pct ${getUsagePctClass(row.usagePercent)}`}
                                >
                                  {row.usagePercent}%
                                </span>
                              ) : null}
                            </div>
                            {row.usagePercent != null ? (
                              <div className="dms-storage-bar">
                                <div
                                  className={`dms-storage-fill ${getUsageFillClass(row.usagePercent)}`}
                                  style={{ width: `${row.usagePercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="TableCell" align="right">
                          <span className="dms-team-storage-stat">{row.totalDocuments}</span>
                        </TableCell>
                        <TableCell className="TableCell" align="right">
                          <span className="dms-team-storage-stat">{row.totalFolders}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TeamStorageModal;
