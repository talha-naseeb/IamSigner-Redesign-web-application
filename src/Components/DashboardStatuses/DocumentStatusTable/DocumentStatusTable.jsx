import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyState,
  TableHead,
  TableRow,
  Stack,
  Pagination,
} from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { computePaginationRange, getStatusBadgeClass } from "./statusTableConfig";

/**
 * StatusBadge component renders a token-styled badge for document statuses.
 */
export const StatusBadge = ({ status, label, className = "" }) => {
  const displayLabel = label || status || "—";
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass} ${className}`.trim()}
    >
      {displayLabel}
    </span>
  );
};

/**
 * DocumentStatusTable
 * Centralized, reusable table component for all dashboard status lists (ENG-02).
 */
export const DocumentStatusTable = ({
  title,
  icon,
  count,
  searchFilter,
  actionButton,
  columns = [],
  data = [],
  isLoading = false,
  emptyStateTitle,
  emptyStateIcon,
  emptyStateAction,
  page = 0,
  rowsPerPage = 30,
  totalItems,
  onPageChange,
  renderRow,
  children,
  tableContainerStyle,
  minTableWidth = "750px",
  className = "",
  showPagination = true,
}) => {
  const { t } = useTranslation();

  const total = totalItems !== undefined ? totalItems : data.length;
  const pagination = computePaginationRange(page, rowsPerPage, total);

  // Default container style with dynamic height that hugs few rows and scrolls smoothly
  const defaultContainerStyle = {
    maxWidth: "100%",
    overflowX: "auto",
    minHeight: "440px",
    height: "calc(100vh - 280px)",
    maxHeight: "calc(100vh - 280px)",
    ...tableContainerStyle,
  };

  return (
    <div
      className={`py-4 px-4 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] pendingtable ${className}`.trim()}
    >
      {/* Table Header Toolbar */}
      {(title || searchFilter || actionButton) && (
        <div className="flex flex-wrap justify-between items-center gap-3 p-1 mb-4">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-[var(--modern-primary,#6366f1)]">{icon}</span>}
            {title && (
              <h3 className="font-semibold text-lg text-[var(--modern-text,#0f172a)] m-0">
                {title}
              </h3>
            )}
            {count !== undefined && count > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-muted,#64748b)] border border-[var(--modern-border,#e2e8f0)]">
                {count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {searchFilter && <div className="search-filters-container">{searchFilter}</div>}
            {actionButton}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <TableContainer
        component={Paper}
        className="custom-table-scrollbar"
        style={defaultContainerStyle}
      >
        <Table stickyHeader className="w-full" style={{ border: "none", minWidth: minTableWidth }}>
          {/* Table Header */}
          {columns.length > 0 && (
            <TableHead className="customTableHead">
              <TableRow>
                {columns.map((column, idx) => (
                  <TableCell
                    key={column.key || column.label || idx}
                    className={`TableHeaderCell ${column.className || ""}`.trim()}
                    align={column.align || "left"}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          {/* Table Body */}
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 6}
                  className="table-empty-state-cell p-0"
                >
                  <TableEmptyState
                    icon={emptyStateIcon || <Icons.BulkDocuments size={50} />}
                    title={emptyStateTitle || t("dashboardCardStatuses.notDocsFound", "No Documents Found")}
                    action={emptyStateAction}
                  />
                </TableCell>
              </TableRow>
            ) : renderRow ? (
              data.map((row, index) => renderRow(row, index))
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Standardized Bottom Pagination */}
      {showPagination && total > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-[var(--modern-border,#e2e8f0)]">
          <div className="text-xs text-[var(--modern-muted,#64748b)]">
            {pagination.startItem} - {pagination.endItem} {t("tablesLabel.documentsof", "of")} {pagination.totalItems} {t("tablesLabel.document", "documents")}
          </div>

          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              variant="outlined"
              shape="rounded"
              page={pagination.currentPage + 1}
              onChange={(event, newPage) => onPageChange?.(event, newPage - 1)}
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default DocumentStatusTable;
