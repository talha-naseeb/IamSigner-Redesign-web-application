import React, { useEffect, useState } from "react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";

const DeclinedDocs = () => {
  const { t } = useTranslation();
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dataRow, setDataRow] = useState();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchDeclinedData = async () => {
    try {
      //DEcline Api
      setIsLoading(true);
      const response = await dashboardService.getRegisterSignDeclined();
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);
        if (response.data.response && response.data.response.length > 0) {
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclinedData();
  }, [userAccess]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getRegisterSignDeclined({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          DocNumber: docNumber,
          DocName: docName,
        });
      }
      setSearchResults(response?.data?.response || []);
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setStartDate("");
    setEndDate("");
    setReferenceNo("");
    setDocNumber("");
    setDocName("");
    handleSearch();
    fetchDeclinedData();
  };

  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
  };

  async function downloadURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${t("dashboardCardStatuses.httpErr")} ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw new Error(`${t("dashboardCardStatuses.errDownload")} ${error.message}`);
    }
  }

  const handleView = async (row) => {
    setIsLoading(true);
    try {
      const { signedDocKey } = row;
      const response = await documentService.downloadDoc({
        SignAuth: signedDocKey,
      });
      const pdfUrl = response.data.response.document;
      setIsLoading(false);
      setPdfUrl(pdfUrl);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
    }
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "24%" },
    { label: t("tablesLabel.docNumber"), key: "regCompanyPrefixNo", width: "16%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "16%" },
    { label: t("tablesLabel.Remarks"), key: "declinedReason", width: "16%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "12%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "10%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  return (
    <Grid className='container' style={{ marginTop: "12px" }}>
      <Grid item xs={12}>
        <DocumentStatusTable
          title={t("menuButtons.declinedDocs")}
          count={searchResults.length}
          searchFilter={
            <DocumentSearchFilters
              startDate={startDate}
              endDate={endDate}
              referenceNo={referenceNo}
              docNumber={docNumber}
              docName={docName}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setReferenceNo={setReferenceNo}
              setDocNumber={setDocNumber}
              setDocName={setDocName}
              handleSearch={handleSearch}
              clearSearch={clearSearch}
            />
          }
          columns={columns}
          data={searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          totalItems={searchResults.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          tableContainerStyle={{ maxHeight: "calc(100vh - 280px)" }}
          renderRow={(row, index) => (
            <TableRow key={row.masterDocID || index} hover>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} style={{ width: "24%" }}>
                {row.docName}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "16%" }}>
                {row.regCompanyPrefixNo || "—"}
              </TableCell>
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "16%" }}>
                {row.declinedDate ? formatTableDate(row.declinedDateFormatted || row.declinedDate) : "—"}
              </TableCell>
              <TableCell className='TableCell truncate-cell' title={row.declinedReason} onClick={(e) => handleCellClick(e)} style={{ width: "16%" }}>
                {row.declinedReason || "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} style={{ width: "12%" }}>
                {row.referenceNumber || "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "10%" }}>
                <UserInitialsBadge name={row.createdByName} />
              </TableCell>
              <TableCell className='TableCell py-0 text-right' style={{ width: "6%" }}>
                {userAccess.remainingDays <= 0 ? (
                  <Dropdown />
                ) : (
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} />
                    <Dropdown.Menu>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                        <Icons.Download size={20} />
                        {t("dashboardCardStatuses.download")}
                      </Dropdown.Item>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                        <Icons.View size={20} />
                        {t("dashboardCardStatuses.view")}
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <SignOrder masterDocID={row.masterDocID} />
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </TableCell>
            </TableRow>
          )}
        />
      </Grid>

      <DownloadModal
        show={showDownloadModal}
        dataRow={dataRow}
        handleClose={() => {
          setShowDownloadModal(false);
        }}
      />

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />
    </Grid>
  );
};

export default DeclinedDocs;
