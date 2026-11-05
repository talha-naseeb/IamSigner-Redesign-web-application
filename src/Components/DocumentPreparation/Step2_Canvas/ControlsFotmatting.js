import React, { useEffect, useState } from "react";
import { Button, Dropdown, Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import { CopyPlus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import uploadFlowService from "@/services/uploadFlowService";
import mobileService from "@/services/mobileService";

const ControlsFotmatting = ({ show, onHide, button, onUpdateControlsLocation, selectedImage, onUpdateQRDetails, buttons, categoryMap, setCategoryMap, fetchButtonPositions, auth, signatoryColor = "#4d8dff" }) => {
  const { t } = useTranslation();
  const fontOptions = ["Jost", "Arial", "Times New Roman", "Verdana", "Georgia"];
  const fontSizeOptions = [10, 12, 14, 16, 18];
  const fontColorOptions = ["black", "red", "green", "blue"];
  const [selectedFont, setSelectedFont] = useState();
  const [selectedFontSize, setSelectedFontSize] = useState();
  const [selectedFontColor, setSelectedFontColor] = useState();
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const [xLocation, setXLocation] = useState();
  const [yLocation, setYLocation] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailOptions] = useState(["Name", "Email", "Date", "Mobile"]);
  const [detail1, setDetail1] = useState("");
  const [detail2, setDetail2] = useState("");
  const [detail3, setDetail3] = useState("");
  const [detail4, setDetail4] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [focusedField, setFocusedField] = useState("detail1");
  const [signatureType, setSignatureType] = useState("ESign");
  const { user } = useUser();
  const location = useLocation();

  const handlePasteControl = () => {
    pasteControlOnAllPages(button);
  };

  const pasteControlOnAllPages = async (button) => {
    const isBulkFlow =
      location.pathname.includes("/upload-bulk") ||
      location.pathname.toLowerCase().includes("bulk") ||
      Boolean(button?.BulkID);

    const bulkId = button.BulkID ?? button.controlLocationID;
    const data = {
      BulkID: bulkId,
      ControlLocationID: button.controlLocationID ?? bulkId,
      ControlID: button.controlID,
      MasterDocID: button.masterDocID,
      RegisterSignID: button.registerSignID,
      SignatoriesID: button.selectedSignatoryID || null,
      IsQrCode: button.label === "QR Code" ? true : false,
    };

    setIsLoading(true);

    try {
      let response;
      if (location.pathname.includes("/MobileAppSignPage/id/")) {
        response = await mobileService.applyControlsLocationOnAllPages(data, auth);
      } else if (isBulkFlow) {
        response = await uploadFlowService.applyControlsLocationOnAllPagesBulk(data);
      } else {
        response = await uploadFlowService.applyControlsLocationOnAllPages(data);
      }

      if (
        response?.data?.statusCode === "1" ||
        response?.data?.successStatus ||
        response?.status === 200
      ) {
        toast.success(t("controlsFormatting.successPaste"));
        if (typeof fetchButtonPositions === "function") {
          await fetchButtonPositions(button.masterDocID);
        }
        onHide();
      } else {
        toast.error(t("controlsFormatting.failedPaste"));
        onHide();
      }
    } catch (error) {
      console.error("Error:", error);

      if (!error.response) {
        // Handle network errors like ERR_NAME_NOT_RESOLVED
        toast.error(t("controlsFormatting.errorGeneric"));
      }
      toast.error(t("controlsFormatting.errorGeneric"));
      onHide();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsRequired(event.target.checked);
  };

  const userDetailMapping = {
    Name: user.fullName,
    Email: user.email,
    Date: new Date().toLocaleDateString(),
  };

  const handleDetailSelect = (detail) => {
    setSelectedDetail(detail);
    const detailValue = userDetailMapping[detail] || "";

    if (focusedField === "detail1") setDetail1(`${detail}: ${detailValue}`);
    if (focusedField === "detail2") setDetail2(`${detail}: ${detailValue}`);
    if (focusedField === "detail3") setDetail3(`${detail}: ${detailValue}`);
    if (focusedField === "detail4") setDetail4(`${detail}: ${detailValue}`);
  };

  useEffect(() => {
    setWidth(Math.max(80, parseFloat(button.width) || 80));
    setHeight(Math.max(30, parseFloat(button.height) || 30));
    setXLocation(button.position.x);
    setYLocation(button.position.y);
    setSelectedFontColor(button.fontColor || button.FontColor || "");
    setSelectedFont(button.fontStyle || button.FontStyle || "");
    setPlaceholder(button.customPlaceHolder);
    setIsRequired(button.isRequired);

    if (button.label === "Signature") {
      const sign = button.isDigitalSignature ? "digital" : "ESign";
      setSignatureType(sign);
    }

    const rawSize = button.fontSize || button.FontSize;
    if (rawSize !== undefined && rawSize !== "" && !isNaN(parseInt(rawSize))) {
      setSelectedFontSize(parseInt(rawSize));
    } else {
      setSelectedFontSize(14);
    }

    if (button.label === "QR Code") {
      setDetail1(button.qrCodeDetails1);
      setDetail2(button.qrCodeDetails2);
      setDetail3(button.qrCodeDetails3);
      setDetail4(button.qrCodeDetails4);
    }
  }, [button]);

  useEffect(() => {
    let img = new Image();
    img.onload = function () {
      setImgWidth(this.naturalWidth);
      setImgHeight(this.naturalHeight);
    };

    img.src = selectedImage;
  }, [selectedImage]);

  const handleInputChange = (e, setValue, minValue, maxValue) => {
    const newValue = e.target.value;
    if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
      setValue(newValue);
    }
  };

  const handleStyleSelect = (style) => {
    setSelectedFont(style);
  };

  const handleSizeSelect = (size) => {
    setSelectedFontSize(parseInt(size));
  };

  const handleColorSelect = (color) => {
    setSelectedFontColor(color);
  };

  const radioButtons = buttons.filter((button) => button.controlName === "Radio");

  const categories = radioButtons.map((_, index) => `Category ${index + 1}`);

  const handleCategorySelect = (buttonId, selectedCategory) => {
    setCategoryMap((prev) => ({ ...prev, [buttonId]: selectedCategory }));
  };

  const handleSaveProperties = async () => {
    try {
      setIsLoading(true);
      const safeWidth = Math.max(80, Math.min(300, parseFloat(width) || 80));
      const safeHeight = Math.max(30, Math.min(300, parseFloat(height) || 30));

      if (button.label === "QR Code") {
        await onUpdateQRDetails(button.controlLocationID, button.ID, button.selectedSignatoryID, detail1, detail2, detail3, detail4, xLocation, yLocation, safeWidth, safeHeight);
      } else {
        const signature = signatureType === "digital" ? true : false;
        const selectedCategory = categoryMap[button.controlLocationID] || "Category 1";

        await onUpdateControlsLocation(
          button.controlLocationID,
          button.controlIdentifier,
          button.textEditor,
          xLocation,
          yLocation,
          safeHeight,
          safeWidth,
          selectedFont,
          selectedFontSize,
          selectedFontColor,
          placeholder,
          isRequired,
          signature,
          selectedCategory
        );
      }

      toast.success(t("controlsFormatting.successUpdate"));
    } catch (error) {
      toast.error(t("controlsFormatting.errorUpdate"));
    } finally {
      setIsLoading(false);
      onHide();
    }
  };

  return (
    <Offcanvas
      show={show}
      placement={document.documentElement.dir === "rtl" ? "start" : "end"}
      className="!w-full !max-w-[360px] border-l rtl:border-l-0 rtl:border-r border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] text-[var(--modern-text,#0f172a)] z-[1055]"
      onHide={onHide}
    >
      <Offcanvas.Header closeButton className="border-b border-[var(--modern-border,#e2e8f0)] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[var(--modern-text,#0f172a)]">
            {button.label || t("controlsFormatting.fieldProperties", "Field Properties")}
          </span>
          <span className="rounded-full bg-[var(--modern-primary,#4d8dff)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--modern-primary,#4d8dff)]">
            {button.controlIdentifier || "Control"}
          </span>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-4 space-y-4 overflow-y-auto text-xs">
        {/* Identifier */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
            {t("controlsFormatting.controlIdentifier", "Control Identifier")}
          </label>
          <input
            type="text"
            value={button.controlIdentifier || ""}
            readOnly
            onClick={(event) => event.target.select()}
            disabled
            className="w-full h-9 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)] px-3 text-xs text-[var(--modern-muted,#64748b)] cursor-not-allowed outline-none"
          />
        </div>

        {/* Custom Placeholder */}
        {button.label !== "QR Code" && button.label !== "Date" && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
              {t("controlsFormatting.placeholder", "Placeholder / Label")}
            </label>
            <input
              type="text"
              value={placeholder || ""}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full h-9 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3 text-xs text-[var(--modern-text,#0f172a)] placeholder:text-[var(--modern-muted)] outline-none focus:border-[var(--modern-primary,#4d8dff)]"
              placeholder={t("controlsFormatting.placeholderInput", "Enter placeholder text...")}
            />
          </div>
        )}

        {/* Required Switch */}
        {(button.label === "Date" ||
          button.label === "Text" ||
          button.label === "Number" ||
          button.label === "Checkbox" ||
          button.label === "Radio") && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
            <div>
              <div className="text-xs font-semibold text-[var(--modern-text,#0f172a)]">
                {t("controlsFormatting.required", "Required Field")}
              </div>
              <div className="text-[11px] text-[var(--modern-muted,#64748b)]">
                {t("controlsFormatting.setRequired", "Signer must complete this field")}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-[var(--modern-border-strong,#cbd5e1)] text-[var(--modern-primary,#4d8dff)] focus:ring-[var(--modern-primary,#4d8dff)] cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Radio Group Category */}
        {button.label === "Radio" && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
              {t("controlsFormatting.category", "Radio Group")}
            </label>
            <Dropdown onSelect={(e) => handleCategorySelect(button.controlLocationID, e)}>
              <Dropdown.Toggle
                variant=""
                id="category"
                className="w-full h-9 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3 text-xs text-[var(--modern-text,#0f172a)] flex items-center justify-between"
              >
                {categoryMap[button.controlLocationID] || "Category 1"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-full max-h-48 overflow-y-auto">
                {categories.map((category, index) => (
                  <Dropdown.Item key={index} eventKey={category} className="text-xs">
                    {category}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        {/* Position (X, Y) */}
        <div className="space-y-2 p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
              {t("controlsFormatting.location", "Coordinates")}
            </span>
            <span className="font-mono text-[10px] text-[var(--modern-muted,#64748b)]">
              px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">X</label>
              <input
                type="number"
                value={xLocation ?? ""}
                min={0}
                max={imgWidth - 108}
                onChange={(e) => handleInputChange(e, setXLocation, 0, imgWidth - 108)}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">Y</label>
              <input
                type="number"
                value={yLocation ?? ""}
                min={0}
                max={imgHeight - 41}
                onChange={(e) => handleInputChange(e, setYLocation, 0, imgHeight - 41)}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Dimensions (Width, Height) */}
        <div className="space-y-2 p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)]">
              {t("controlsFormatting.size", "Size")}
            </span>
            <span className="font-mono text-[10px] text-[var(--modern-muted,#64748b)]">
              min 80x30 / max 300px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">
                {t("controlsFormatting.width", "Width")} (min 80)
              </label>
              <input
                type="number"
                value={width ?? ""}
                min={80}
                max={300}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setWidth("");
                  } else {
                    setWidth(parseFloat(val) || "");
                  }
                }}
                onBlur={() => {
                  const num = parseFloat(width);
                  if (isNaN(num) || num < 80) {
                    setWidth(80);
                  } else if (num > 300) {
                    setWidth(300);
                  }
                }}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">
                {t("controlsFormatting.height", "Height")} (min 30)
              </label>
              <input
                type="number"
                value={height ?? ""}
                min={30}
                max={300}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setHeight("");
                  } else {
                    setHeight(parseFloat(val) || "");
                  }
                }}
                onBlur={() => {
                  const num = parseFloat(height);
                  if (isNaN(num) || num < 30) {
                    setHeight(30);
                  } else if (num > 300) {
                    setHeight(300);
                  }
                }}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary)]"
              />
            </div>
          </div>
        </div>

        {/* QR Code Details or Font Formatting */}
        {button.label === "QR Code" ? (
          <div className="space-y-2 p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)] block">
              {t("controlsFormatting.qrCodeDetails", "QR Code Details")}
            </span>
            <Dropdown onSelect={handleDetailSelect}>
              <Dropdown.Toggle
                variant=""
                id="dropdown-basic"
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] flex items-center justify-between"
              >
                {selectedDetail || t("controlsFormatting.selectDetail", "Select Autofill Field")}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-full">
                {detailOptions.map((detail, index) => (
                  <Dropdown.Item key={index} eventKey={detail} className="text-xs">
                    {detail}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <div className="space-y-1.5 pt-1">
              <input
                type="text"
                value={detail1}
                onChange={(e) => setDetail1(e.target.value)}
                onFocus={() => setFocusedField("detail1")}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none"
                placeholder={t("controlsFormatting.qrDetail1Placeholder", "Detail line 1")}
              />
              <input
                type="text"
                value={detail2}
                onChange={(e) => setDetail2(e.target.value)}
                onFocus={() => setFocusedField("detail2")}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none"
                placeholder={t("controlsFormatting.qrDetail2Placeholder", "Detail line 2")}
              />
              <input
                type="text"
                value={detail3}
                onChange={(e) => setDetail3(e.target.value)}
                onFocus={() => setFocusedField("detail3")}
                className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2.5 text-xs text-[var(--modern-text)] outline-none"
                placeholder={t("controlsFormatting.qrDetail3Placeholder", "Detail line 3")}
              />
              <textarea
                value={detail4}
                onChange={(e) => setDetail4(e.target.value)}
                onFocus={() => setFocusedField("detail4")}
                rows={2}
                className="w-full rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] p-2 text-xs text-[var(--modern-text)] outline-none"
                placeholder={t("controlsFormatting.qrDetail4Placeholder", "Detail line 4 / Notes")}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted,#64748b)] block">
              {t("controlsFormatting.formatting", "Typography")}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">Font</label>
                <Dropdown onSelect={handleStyleSelect}>
                  <Dropdown.Toggle
                    variant=""
                    id="fontSelect"
                    className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2 text-[11px] text-[var(--modern-text)] truncate flex items-center justify-between"
                  >
                    {selectedFont || "Jost"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {fontOptions.map((font, index) => (
                      <Dropdown.Item key={index} eventKey={font} className="text-xs">
                        {font}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">Size</label>
                <Dropdown onSelect={handleSizeSelect}>
                  <Dropdown.Toggle
                    variant=""
                    id="fontSizeSelect"
                    className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2 text-[11px] text-[var(--modern-text)] flex items-center justify-between"
                  >
                    {selectedFontSize ? `${selectedFontSize}px` : "16px"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {fontSizeOptions.map((size, index) => (
                      <Dropdown.Item key={index} eventKey={size} className="text-xs">
                        {size}px
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[var(--modern-muted)] block mb-1">Color</label>
                <Dropdown onSelect={handleColorSelect}>
                  <Dropdown.Toggle
                    variant=""
                    id="fontColorSelect"
                    className="w-full h-8 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2 text-[11px] text-[var(--modern-text)] capitalize flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: selectedFontColor || signatoryColor || "#4d8dff" }}
                      />
                      {selectedFontColor ? selectedFontColor : t("controlsFormatting.signerColor", "Signer Color")}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="" className="text-xs">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-black/20"
                          style={{ backgroundColor: signatoryColor || "#4d8dff" }}
                        />
                        <span>{t("controlsFormatting.signerColorDefault", "Signer Color (Default)")}</span>
                      </span>
                    </Dropdown.Item>
                    {fontColorOptions.map((color, index) => (
                      <Dropdown.Item key={index} eventKey={color} className="text-xs capitalize">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-black/20"
                            style={{ backgroundColor: color }}
                          />
                          {color}
                        </span>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        )}

        {/* Paste on All Pages Action */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/60">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-[var(--modern-text,#0f172a)]">
              {t("controlsFormatting.pasteOnAllPages", "Paste on all pages")}
            </div>
            <div className="text-[11px] text-[var(--modern-muted,#64748b)]">
              {t("controlsFormatting.pasteOnAllPagesDesc", "Duplicate across all document pages")}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePasteControl}
            disabled={isLoading}
            className="!h-8 !px-3 !rounded-lg border-[var(--modern-border-strong,#cbd5e1)] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <CopyPlus size={14} />
            <span>{t("controlsFormatting.apply", "Apply")}</span>
          </Button>
        </div>
      </Offcanvas.Body>

      {/* Sticky Bottom Actions: Real Cancel and Real Save */}
      <div className="mt-auto border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/80 p-3.5 flex items-center justify-end gap-2.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onHide}
          className="!h-9 !rounded-full !px-4 text-xs font-semibold cursor-pointer"
        >
          {t("uploadDocFlow.cancel", "Cancel")}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSaveProperties}
          disabled={isLoading}
          className="!h-9 !rounded-full !px-5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : null}
          <span>{t("controlsFormatting.save", "Save Changes")}</span>
        </Button>
      </div>
    </Offcanvas>
  );
};

export default ControlsFotmatting;
