import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { CiSearch } from "react-icons/ci";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./style.css";
import { useTranslation } from "react-i18next";
import { TbFileSearch } from "react-icons/tb";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";

const SideDocFilter = ({ startDate, endDate, referenceNo, docNumber, docName, setStartDate, setEndDate, setReferenceNo, setDocNumber, setDocName, handleSearch, clearSearch }) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className='filters-container'>
      <div>
        <Button style={{ border: "1px solid #ccc" }} id='search-filters-button' aria-controls='search-filters-menu' aria-haspopup='true' onClick={handleClick}>
          {/* <FaFilter /> */}
          <TbFileSearch style={{ color: "#292D32" }} size={25} />
          {/* {t("searchFilter.OpenFilters")} */}
        </Button>

        <Menu className='filters-menu' id='search-filters-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <div className='filter-items'>
            <MenuItem>
              <TextField style={{ padding: "0px" }} label={t("searchFilter.refNum")} value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
            </MenuItem>
            <MenuItem>
              <TextField style={{ padding: "0px" }} label={t("searchFilter.docNum")} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
            </MenuItem>
            <MenuItem>
              <TextField style={{ padding: "0px" }} label={t("searchFilter.docName")} value={docName} onChange={(e) => setDocName(e.target.value)} />
            </MenuItem>

            <MenuItem style={{ display: "block" }}>
              <label className='mb-1' style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>
                {t("searchFilter.FilterRange")}
              </label>
              <DateRangePicker
                value={startDate && endDate ? [new DateObject(startDate), new DateObject(endDate)] : []}
                onChange={(dates) => {
                  if (dates && dates.length === 2) {
                    setStartDate(dates[0].format("YYYY-MM-DD"));
                    setEndDate(dates[1].format("YYYY-MM-DD"));
                  } else {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
              />
            </MenuItem>

            <MenuItem className='d-flex gap-1'>
              <Button variant='contained' onClick={handleSearch}>
                <CiSearch size={25} />
                {t("searchFilter.search")}
              </Button>
              <Button style={{ marginLeft: "5px" }} variant='contained' onClick={clearSearch}>
                {t("searchFilter.clear")}
              </Button>
            </MenuItem>
          </div>
        </Menu>
      </div>
    </div>
  );
};

export default SideDocFilter;
