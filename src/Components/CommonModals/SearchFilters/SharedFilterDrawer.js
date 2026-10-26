import React, { useMemo, useState } from "react";
import { Navbar, Container, Offcanvas, Form } from "@/Components/UI/shadcnCompat";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import "./style.css";

function isFieldFilled(field) {
  if (!field || field.hidden) return false;
  if (field.type === "dateRange") {
    return Boolean(
      (field.startDate && String(field.startDate).trim() !== "") ||
        (field.endDate && String(field.endDate).trim() !== "")
    );
  }
  if (field.type === "radio") {
    return field.value !== undefined && field.value !== null && field.value !== "";
  }
  if (typeof field.value === "string") {
    return field.value.trim() !== "";
  }
  return field.value !== undefined && field.value !== null && field.value !== "";
}

function SharedFilterDrawer({
  fields = [],
  children,
  onApply,
  onReset,
  handleSearch,
  clearSearch,
  isApplyDisabled,
  title,
  resetLabel,
  applyLabel,
  className,
  triggerClassName,
  panelClassName,
  icon,
  closeOnApply = true,
  closeOnReset = true,
}) {
  const { t } = useTranslation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const visibleFields = useMemo(
    () => fields.filter((field) => field && !field.hidden),
    [fields]
  );

  const computedDisabled = useMemo(() => {
    if (typeof isApplyDisabled === "boolean") {
      return isApplyDisabled;
    }
    return !visibleFields.some(isFieldFilled);
  }, [isApplyDisabled, visibleFields]);

  const applyHandler = onApply || handleSearch;
  const resetHandler = onReset || clearSearch;

  const handleApplyClick = () => {
    if (typeof applyHandler === "function") {
      applyHandler();
    }
    if (closeOnApply) {
      setShowOffcanvas(false);
    }
  };

  const handleResetClick = () => {
    if (typeof resetHandler === "function") {
      resetHandler();
    }
    if (closeOnReset) {
      setShowOffcanvas(false);
    }
  };

  const placement =
    typeof document !== "undefined" && document.documentElement.dir === "rtl"
      ? "start"
      : "end";

  return (
    <Navbar expand={false} className={className}>
      <Container fluid>
        <Navbar.Toggle
          className={`filterOpenBtn ${triggerClassName || ""}`.trim()}
          aria-controls="shared-filter-offcanvas"
          aria-label={title || t("searchFilter.Filter")}
          onClick={() => setShowOffcanvas(true)}
        >
          {icon || <CiFilter />}
        </Navbar.Toggle>
        <Navbar.Offcanvas
          id="shared-filter-offcanvas"
          className={`shared-filter-offcanvas ${panelClassName || ""}`.trim()}
          aria-labelledby="shared-filter-offcanvas-title"
          placement={placement}
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="shared-filter-offcanvas-title" className="fw-bold">
              {title || t("searchFilter.Filter")}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="filter-offcanvas-body">
            <div className="filter-offcanvas-layout">
              <div className="filter-offcanvas-fields">
                {visibleFields.map((field, index) => {
                  const key = field.name || field.id || `filter-field-${index}`;

                  if (field.type === "dateRange") {
                    const dateValue =
                      field.startDate && field.endDate
                        ? [new DateObject(field.startDate), new DateObject(field.endDate)]
                        : [];

                    const handleDateChange = (dates) => {
                      if (dates && dates.length === 2) {
                        field.onStartDateChange?.(dates[0].format("YYYY-MM-DD"));
                        field.onEndDateChange?.(dates[1].format("YYYY-MM-DD"));
                      } else {
                        field.onStartDateChange?.("");
                        field.onEndDateChange?.("");
                      }
                    };

                    return (
                      <div key={key}>
                        {field.label && <label className="mb-2">{field.label}</label>}
                        <DateRangePicker value={dateValue} onChange={handleDateChange} />
                      </div>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={key}>
                        {field.label && <label className="mb-2">{field.label}</label>}
                        <Form.Select
                          as="select"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange?.(e.target.value, e)}
                          className={`input-field ${field.value ? "active" : ""}`}
                        >
                          <option
                            value=""
                            disabled={Boolean(field.disabledPlaceholder)}
                            className="text-muted"
                          >
                            {field.placeholder || t("createTeam.choose")}
                          </option>
                          {(field.options || []).map((opt, optIdx) => (
                            <option
                              key={opt.key ?? opt.value ?? optIdx}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    );
                  }

                  if (field.type === "radio") {
                    return (
                      <div key={key} className="user-filter-status">
                        {field.label && <label className="mb-2">{field.label}</label>}
                        <div className="d-flex flex-wrap gap-3">
                          {(field.options || []).map((opt, optIdx) => {
                            const radioId = opt.id || `${key}-radio-${optIdx}`;
                            const isChecked =
                              opt.checked !== undefined
                                ? opt.checked
                                : field.value === opt.value;
                            return (
                              <div key={radioId} className="radio-container d-inline-flex align-items-center gap-2">
                                <input
                                  type="radio"
                                  id={radioId}
                                  name={field.name}
                                  className="input-radio"
                                  value={String(opt.value)}
                                  checked={Boolean(isChecked)}
                                  onChange={(e) => field.onChange?.(opt.value, e)}
                                />
                                <label htmlFor={radioId} className="m-0">
                                  {opt.label}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      {field.label && <label className="mb-2">{field.label}</label>}
                      <input
                        name={field.name}
                        type={field.type || "text"}
                        placeholder={field.placeholder || ""}
                        className={`input-field ${field.value ? "active" : ""}`}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange?.(e.target.value, e)}
                      />
                    </div>
                  );
                })}
                {children}
              </div>

              <div className="filter-offcanvas-footer newComment d-flex align-items-center justify-content-between w-100">
                <button type="button" className="resetBtn" onClick={handleResetClick}>
                  {resetLabel || t("searchFilter.reset")}
                </button>
                <button
                  type="button"
                  className="applyBtn"
                  onClick={handleApplyClick}
                  disabled={computedDisabled}
                >
                  {applyLabel || t("searchFilter.apply")}
                </button>
              </div>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default SharedFilterDrawer;
