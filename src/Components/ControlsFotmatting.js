import React, { useEffect, useState } from "react";
import { Button, Dropdown, Offcanvas } from "react-bootstrap";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { MdControlPointDuplicate } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import uploadFlowService from "@/services/uploadFlowService";
import mobileService from "@/services/mobileService";

const ControlsFotmatting = ({ show, onHide, button, onUpdateControlsLocation, selectedImage, onUpdateQRDetails, buttons, categoryMap, setCategoryMap, fetchButtonPositions, auth }) => {
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
    const data = {
      ControlLocationID: button.controlLocationID,
      ControlID: button.controlID,
      MasterDocID: button.masterDocID,
      RegisterSignID: button.registerSignID,
      SignatoriesID: button.selectedSignatoryID,
      IsQrCode: button.label === "QR Code" ? true : false,
    };

    setIsLoading(true);

    try {
      let response;
      if (location.pathname.includes("/MobileAppSignPage/id/")) {
        response = await mobileService.applyControlsLocationOnAllPages(data, auth);
      } else {
        response = await uploadFlowService.applyControlsLocationOnAllPages(data);
      }

      if (response.data.statusCode === "1") {
        toast.success(t("controlsFormatting.successPaste"));
        await fetchButtonPositions(button.masterDocID);
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
    setWidth(button.width);
    setHeight(button.height);
    setXLocation(button.position.x);
    setYLocation(button.position.y);
    setSelectedFontColor(button.fontColor);
    setSelectedFont(button.fontStyle);
    setPlaceholder(button.customPlaceHolder);
    setIsRequired(button.isRequired);

    if (button.label === "Signature") {
      const sign = button.isDigitalSignature ? "digital" : "ESign";
      setSignatureType(sign);
    }

    if (button.fontSize !== undefined || button.fontSize !== "") {
      setSelectedFontSize(parseInt(button?.fontSize));
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
      if (button.label === "QR Code") {
        await onUpdateQRDetails(button.controlLocationID, button.ID, button.selectedSignatoryID, detail1, detail2, detail3, detail4, xLocation, yLocation, width, height);
      } else {
        const signature = signatureType === "digital" ? true : false;
        const selectedCategory = categoryMap[button.controlLocationID] || "Category 1";

        await onUpdateControlsLocation(
          button.controlLocationID,
          button.controlIdentifier,
          button.textEditor,
          xLocation,
          yLocation,
          height,
          width,
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
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <Offcanvas show={show} placement={document.documentElement.dir === "rtl" ? "start" : "end"} style={{ width: "300px", zIndex: "1055" }} onHide={onHide}>
        <Offcanvas.Header style={{ borderBottom: "1px solid #ccc" }} closeButton>
          <Offcanvas.Title>{button.label}</Offcanvas.Title>
          <hr />
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: 0 }}>
          <div className='buttonProperties data label'>
            <h6>{t("controlsFormatting.controlIdentifier")}</h6>
            <div>
              <input type='text' value={button.controlIdentifier} readOnly onClick={(event) => event.target.select()} disabled style={{ background: "var(--bg-secondary)", cursor: "not-allowed" }} />
            </div>
          </div>

          {button.label !== "QR Code" && button.label !== "Date" && (
            <div className='buttonProperties data label'>
              <h6>{t("controlsFormatting.placeholder")}</h6>
              <div>
                <input type='text' value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} style={{ width: "100%" }} placeholder={t("controlsFormatting.placeholderInput")} />
              </div>
            </div>
          )}

          {/* {button.label === "Signature" && (
            <div className='buttonProperties data label'>
              <h6>Signature Type</h6>
              <div className='flex  justify-content-start mx-auto  align-items-center w-100'>
                <div className='me-5'>
                  <label style={{ display: "flex" }}>
                    <input type='radio' name='signatureType' value='ESign' checked={signatureType === "ESign"} onChange={handleSignatureChange} className='mx-2' />
                    ESign
                  </label>
                </div>

                <div className=''>
                  <label style={{ display: "flex" }}>
                    <input type='radio' name='signatureType' value='digital' checked={signatureType === "digital"} onChange={handleSignatureChange} className='mx-2' />
                    Digital
                  </label>
                </div>
              </div>
            </div>
          )} */}

          {(button.label === "Date" || button.label === "Text" || button.label === "Number" || button.label === "Checkbox" || button.label === "Radio") && (
            <div className='buttonProperties data label'>
              <h6>{t("controlsFormatting.required")}</h6>
              <div className='d-flex align-items-center justify-content-start'>
                <input type='checkbox' checked={isRequired} onChange={handleCheckboxChange} className='form-check-input d-flex align-items-center me-2' />
                {t("controlsFormatting.setRequired")}
              </div>
            </div>
          )}

          {button.label === "Radio" && (
            <div className='buttonProperties data label'>
              <h6>{t("controlsFormatting.category")}</h6>
              <Dropdown onSelect={(e) => handleCategorySelect(button.controlLocationID, e)}>
                <Dropdown.Toggle variant='' id='category'>
                  {categoryMap[button.controlLocationID] || "Category 1"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {categories.map((category, index) => (
                    <Dropdown.Item key={index} eventKey={category}>
                      {category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}

          <div className='buttonProperties locations'>
            <h6 className='d-flex justify-content-between'>
              {t("controlsFormatting.location")}{" "}
              <small style={{ fontWeight: "300" }}>
                ( x: 0 - {imgWidth - 108}px y: 0 - {imgHeight - 41}px )
              </small>
            </h6>
            <div>
              <label htmlFor='x-value'>x: </label>
              <input type='number' value={xLocation} min={0} max={imgWidth - 108} onChange={(e) => handleInputChange(e, setXLocation, 0, imgWidth - 108)} style={{ width: "80%" }} />
            </div>
            <div>
              {" "}
              <label htmlFor='y-value'>y: </label>
              <input type='number' value={yLocation} min={0} max={imgHeight - 41} onChange={(e) => handleInputChange(e, setYLocation, 0, imgHeight - 41)} style={{ width: "80%" }} />
            </div>
          </div>
          <div className='buttonProperties size'>
            <h6 className='d-flex justify-content-between'>
              {t("controlsFormatting.size")} <small style={{ fontWeight: "300" }}>( maxValues: 300px )</small>
            </h6>
            <div>
              <label htmlFor='width'>{t("controlsFormatting.width")}: </label>
              <input type='number' value={width} min={0} max={300} onChange={(e) => handleInputChange(e, setWidth, 0, 300)} style={{ width: "70%" }} />
            </div>
            <div>
              {" "}
              <label htmlFor='height'>{t("controlsFormatting.height")}: </label>
              <input type='number' value={height} min={0} max={300} onChange={(e) => handleInputChange(e, setHeight, 0, 300)} style={{ width: "70%" }} />
            </div>
          </div>

          {button.label === "QR Code" ? (
            <div className='buttonProperties formatting'>
              <h6>{t("controlsFormatting.qrCodeDetails")}</h6>

              <div>
                <label htmlFor='details'>{t("controlsFormatting.detail")}</label>
                <Dropdown onSelect={handleDetailSelect} style={{ width: "70%" }}>
                  <Dropdown.Toggle variant='' id='dropdown-basic'>
                    {selectedDetail || t("controlsFormatting.selectDetail")}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {detailOptions.map((detail, index) => (
                      <Dropdown.Item key={index} eventKey={detail}>
                        {detail}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label htmlFor='detail'>{t("controlsFormatting.detail1")}: </label>
                <input
                  type='text'
                  value={detail1}
                  onChange={(e) => setDetail1(e.target.value)}
                  onFocus={() => setFocusedField("detail1")}
                  style={{ width: "70%" }}
                  placeholder={t("controlsFormatting.qrDetail1Placeholder")}
                />
              </div>
              <div>
                <label htmlFor='detail'>{t("controlsFormatting.detail2")}: </label>
                <input
                  type='text'
                  value={detail2}
                  onChange={(e) => setDetail2(e.target.value)}
                  onFocus={() => setFocusedField("detail2")}
                  style={{ width: "70%" }}
                  placeholder={t("controlsFormatting.qrDetail2Placeholder")}
                />
              </div>
              <div>
                <label htmlFor='detail'>{t("controlsFormatting.detail3")}: </label>
                <input
                  type='text'
                  value={detail3}
                  onChange={(e) => setDetail3(e.target.value)}
                  onFocus={() => setFocusedField("detail3")}
                  style={{ width: "70%" }}
                  placeholder={t("controlsFormatting.qrDetail3Placeholder")}
                />
              </div>
              <div>
                <label htmlFor='detail'>{t("controlsFormatting.detail4")}: </label>
                <textarea
                  value={detail4}
                  onChange={(e) => setDetail4(e.target.value)}
                  onFocus={() => setFocusedField("detail4")}
                  style={{ width: "70%" }}
                  placeholder={t("controlsFormatting.qrDetail4Placeholder")}
                />
              </div>
            </div>
          ) : (
            <div className='buttonProperties formatting'>
              <h6>{t("controlsFormatting.formatting")}</h6>
              <div>
                <label htmlFor='font-style'> {t("controlsFormatting.fontStyle")}:</label>
                <Dropdown onSelect={handleStyleSelect}>
                  <Dropdown.Toggle variant='' id='fontSelect'>
                    {selectedFont || "Jost"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {fontOptions.map((font, index) => (
                      <Dropdown.Item key={index} eventKey={font}>
                        {font}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label htmlFor='font-style'> {t("controlsFormatting.fontSize")}:</label>
                <Dropdown onSelect={handleSizeSelect}>
                  <Dropdown.Toggle variant='' id='fontSizeSelect'>
                    {`${selectedFontSize}px` || `16px`}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {fontSizeOptions.map((size, index) => (
                      <Dropdown.Item key={index} eventKey={size}>
                        {size}px
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label htmlFor='font-style'> {t("controlsFormatting.fontColor")}:</label>
                <Dropdown onSelect={handleColorSelect}>
                  <Dropdown.Toggle variant='' id='fontColorSelect'>
                    {selectedFontColor || "black"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {fontColorOptions.map((color, index) => (
                      <Dropdown.Item key={index} eventKey={color}>
                        {color}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          )}
          <div className='buttonProperties d-flex justify-content-between align-items-center '>
            <h6 className='m-0'>{t("controlsFormatting.pasteOnAllPages")}</h6>
            <Button className='modalCancelButton w-auto' style={{ border: "1px solid #ccc" }} onClick={handlePasteControl}>
              <MdControlPointDuplicate />
            </Button>
          </div>
          <div className='formatting-buttons d-flex justify-content-end p-2'>
            <Button className='applyBtn' onClick={handleSaveProperties}>
              {t("controlsFormatting.save")}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ControlsFotmatting;
