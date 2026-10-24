import React from "react";
import { InputGroup, Form, Button } from "@/Components/UI/shadcnCompat";
import searchIcon from "@/assets/images/Search.svg";
import clearIcon from "@/assets/images/close-circle.svg";

function SearchControls({ t, searchTerm, setSearchTerm, searchClicked, setSearchClicked }) {
  const handleSearchClick = () => {
    setSearchClicked(true);
  };

  const handleClearClick = () => {
    setSearchTerm("");
    setSearchClicked(false);
  };

  const handleInputBlur = () => {
    if (searchTerm.trim() === "") {
      setSearchClicked(false);
    }
  };

  return (
    <div
      className='d-flex align-items-center'
      style={{
        background: "var(--modern-raised, var(--bg-primary))",
        borderRadius: "var(--modern-radius-sm, 6px)",
      }}
    >
      <InputGroup>
        <img
          src={searchIcon}
          alt='search'
          onClick={handleSearchClick}
          className='mx-3'
          style={{ cursor: "pointer" }}
        />
        {searchClicked && (
          <>
            <Form.Control
              placeholder={t("uploadDocFlow.searchFields")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={handleInputBlur}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--modern-text, inherit)",
              }}
            />
            <Button onClick={handleClearClick} variant='none' style={{ border: "none" }}>
              <img src={clearIcon} alt='clear' />
            </Button>
          </>
        )}
      </InputGroup>
    </div>
  );
}

export default SearchControls;
