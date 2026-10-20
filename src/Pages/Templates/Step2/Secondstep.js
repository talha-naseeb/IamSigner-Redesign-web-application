import React, { useEffect, useRef, useState } from "react";
import "./Secondstep.css";
import { Button, Col, Dropdown, DropdownButton, Row } from "react-bootstrap";
import { Icons } from "@/assets/Icons";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import DraggableButton from "@/Components/DocumentPreparation/Step2_Canvas/DraggableButtons";
import ImageWithDropZone from "./DisplayCenterImage";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageThumbnails from "@/Components/ImageThumbnails/ImageThumbnails";
import PageNavigations from "@/Components/PageNavigations";
import SearchControls from "@/Components/SearchControls";
import Loader from "@/Components/CommonModals/Loader/Loader";

const Secondstep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [imageButtonsMap, setImageButtonsMap] = useState({});
  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState();
  const [selectedName, setSelectedName] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [imagesData, setImagesData] = useState([]);
  const [standardFields, setStandardFields] = useState([]);
  const [signatoryColors, setSignatoryColors] = useState({});
  const [selectedSignatoryID, setSelectedSignatoryID] = useState();
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [controls, setControls] = useState();
  const [signatureType, setSignatureType] = useState();
  const [buttonClicked, setButtonClicked] = useState();
  const [buttonLabel, setButtonLabel] = useState();
  const [controlID, setControlID] = useState();
  const [hoveredSignatory, setHoveredSignatory] = useState(null);

  const storedTemplateID = sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
  const navigate = useNavigate();
  const mainDocumentRef = useRef(null);

  const handleDraggbleButtonClick = (label, icon, controlID, index, value) => {
    setButtonClicked(value);
    setButtonLabel(label);
    setControlID(controlID);
  };

  const colorMapping = {
    "#00B2B0": "#00807E",
    "#9F467B": "#6E3055",
    "#E8AC00": "#B28400",
    "#E84600": "#B23600",
    "#29C785": "#219C68",
    "#6F29C7": "#4E1D8C",
    "#C729B7": "#941F88",
    "#E11919": "#AA1313",
    "#84B300": "#577500",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (storedTemplateID) {
        try {
          setIsLoading(true);
          const response = await templateService.getTemplateData(storedTemplateID);
          if (response.data.successStatus) {
            setFormData(response.data.response);

            const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
            setMasterDocIDs(masterDocIDs);
            setDefaultMasterDocID(masterDocIDs[0]);
            const firstDocument = response.data.response.primaryDocs[0];
            const firstDocName = firstDocument.docName;
            const truncatedName = firstDocName.length > 10 ? firstDocName.slice(0, 7) + ".." : firstDocName;
            setSelectedFolder(truncatedName);

            const firstMasterDocID = firstDocument.masterDocID;

            setSelectedMasterDocID(firstMasterDocID);
            fetchImagesForDocument(firstMasterDocID);

            const firstSignatory = response.data.response.templateSignatory[0];

            const firstSignatoryID = firstSignatory.templateSignatoryID;
            setSelectedSignatoryID(firstSignatoryID);

            const firstName = firstSignatory.name;
            const truncatedSignatoryName = firstName.length > 4 ? firstName.slice(0, 4) + ".." : firstName;
            setSelectedName(truncatedSignatoryName);

            const initialSignatoryColors = {};
            response.data.response.templateSignatory.forEach((signatory) => {
              initialSignatoryColors[signatory.templateSignatoryID] = signatory.signatureColor;
            });
            setSignatoryColors(initialSignatoryColors);

            const initialSignatureTypes = {};
            response.data.response.templateSignatory.forEach((signatory) => {
              initialSignatureTypes[signatory.templateSignatoryID] = signatory.signatureType;
            });
            setSignatureType(initialSignatureTypes);
            setIsLoading(false);
          }
        } catch (error) {
          toast.info(t("uploadDocFlow.sessionExpire"));
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [storedTemplateID]);

  const fetchStandardFields = async () => {
    try {
      const response = await uploadFlowService.getControls();

      if (response.data.successStatus) {
        const standardFieldsData = response.data.response;
        const updatedStandardFields = standardFieldsData.map((field) => ({
          icon: field.icon,
          label: field.controlName,
          controlID: field.controlID,
          controlUniqueIdentifier: field.controlUniqueIdentifier,
        }));
        setStandardFields(updatedStandardFields);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchStandardFields();
  }, []);

  const filteredFields = standardFields.filter((field) => field.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const fetchImagesForDocument = async (masterDocID) => {
    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);
      setImagesData(response.data.response);
    } catch (error) {}
  };

  const handleDocSelect = async (masterDocID, selectedFolderName) => {
    const truncatedName = selectedFolderName.length > 10 ? selectedFolderName.slice(0, 7) + ".." : selectedFolderName;
    setSelectedFolder(truncatedName);
    setSelectedMasterDocID(masterDocID);

    fetchImagesForDocument(masterDocID);
    // fetchButtonPositions(masterDocID);
  };

  const handleNameSelect = (templateSignatoryID, selectedName) => {
    const truncatedName = selectedName.length > 10 ? selectedName.slice(0, 7) + ".." : selectedName;
    setSelectedName(truncatedName);
    setSelectedSignatoryID(templateSignatoryID);
  };

  const handleFinish = async () => {
    navigate("/templates-page");
  };

  const handleBack = async () => {
    setActiveStep(2);
    setCompletedSteps([1]);
  };

  const handleImageSelect = (image, id) => {
    setMasterDocPagesId(id);
    setSelectedImage(image);
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='secondstep-container'>
        <Row className='main-content p-0 m-0'>
          {/* <Col md={10} className='p-0 m ' style={{ marginRight: "15%" }}> */}
          <Col md={10} className='p-0 m'>
            <Row
              className='signatories-row m-0 p-0 row-signatories-wrapper'
              style={{
                position: "fixed",
                top: "var(--editor-header-height, 67px)",
                width: "100%",
                zIndex: "30",
              }}
            >
              <div className='signatories-container'>
                {formData &&
                  formData.templateSignatory.map((signatory) => {
                    const isHovered = hoveredSignatory === signatory.signatoriesID;
                    const originalColor = signatory.signatureColor;
                    const hoverColor = colorMapping[originalColor];
                    return (
                      <div
                        key={signatory.templateSignatoryID}
                        className={`d-flex align-items-center flex-row ${selectedSignatoryID === signatory.templateSignatoryID ? "selected-item" : "not-selected-item"}`}
                        onClick={() => handleNameSelect(signatory.templateSignatoryID, signatory.name)}
                        onMouseEnter={() => setHoveredSignatory(signatory.templateSignatoryID)}
                        onMouseLeave={() => setHoveredSignatory(null)}
                        style={{
                          display: "inline-block",
                          border: selectedSignatoryID === signatory.templateSignatoryID ? `1px solid ${originalColor}` : "",
                        }}
                      >
                        <div className='signatory-item' style={{ backgroundColor: isHovered ? hoverColor : originalColor }}>
                          <Icons.Profile className='mx-2' size={18} />
                        </div>
                        {signatory.name}
                      </div>
                    );
                  })}
              </div>
            </Row>

            <Row className='draggable-content mb-3 m-0  ' style={{ position: "fixed", top: "calc(var(--editor-header-height, 67px) + 69px)", width: "71%", zIndex: "30" }}>
              {/* <Col md={1} className='left-sidebar p-0'> */}
              <div className='menu-list'>
                <SearchControls t={t} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchClicked={searchClicked} setSearchClicked={setSearchClicked} />

                <div className='list d-flex px-1 overflow-x-auto'>
                  {filteredFields.length > 0 ? (
                    filteredFields.map((field, index) => (
                      <DraggableButton
                        key={index}
                        index={index}
                        icon={field.icon}
                        label={field.label}
                        controlID={field.controlID}
                        data={field.label}
                        // selectedColorIndex={selectedColorIndex}
                        signatoryColors={signatoryColors}
                        selectedSignatoryID={selectedSignatoryID}
                        MasterDocPagesId={masterDocPagesId}
                        signatureType={signatureType}
                        onButtonClick={handleDraggbleButtonClick}
                        controlUniqueIdentifier={field.controlUniqueIdentifier}
                      />
                    ))
                  ) : (
                    <p className='error-message'>{t("uploadDocFlow.notItemsFound")}</p>
                  )}
                </div>
              </div>

              {/* </Col> */}
            </Row>

            <Row className='center-doc-image  image-col mx-0 mb-0' style={{ marginTop: "calc(var(--editor-header-height, 67px) + 68px)" }}>
              {/* <Col md={11} className='p-0'> */}
              <div className='scrollable-content px-0' ref={mainDocumentRef}>
                {!imagesData ? (
                  <div className='image-loader-container'>
                    {" "}
                    <div className='image-loader'></div>
                  </div>
                ) : (
                  imagesData && (
                    <ImageWithDropZone
                      selectedImage={selectedImage}
                      // selectedColorIndex={selectedColorIndex}
                      imageButtonsMap={imageButtonsMap}
                      setImageButtonsMap={setImageButtonsMap}
                      signatoryColors={signatoryColors}
                      selectedSignatoryID={selectedSignatoryID}
                      selectedMasterDocID={selectedMasterDocID}
                      masterDocPagesId={masterDocPagesId}
                      TemplateID={storedTemplateID}
                      // defaultMasterDocID={defaultMasterDocID}
                      // imagesData={imagesData}
                      setControls={setControls}
                      buttonClicked={buttonClicked}
                      setButtonClicked={setButtonClicked}
                      buttonLabel={buttonLabel}
                      controlID={controlID}
                    />
                  )
                )}
              </div>
              {/* </Col> */}
            </Row>
          </Col>

          <Col md={2} className='page-display p-0' style={{ position: "fixed", top: "var(--editor-header-height, 67px)", zIndex: "30" }}>
            <>
              <div className='documents-dropdown'>
                <DropdownButton
                  title={selectedFolder || ""}
                  onSelect={(eventKey) => {
                    const [masterDocID, selectedFolderName] = eventKey.split(",");
                    handleDocSelect(masterDocID, selectedFolderName);
                  }}
                  id='doc-dropdown'
                  className='border border-0 w-100'
                  variant='none'
                >
                  {formData &&
                    formData.primaryDocs.map((doc) => {
                      const truncatedName = doc.docName.length > 10 ? doc.docName.slice(0, 7) + ".." : doc.docName;
                      return (
                        <Dropdown.Item key={doc.masterDocID} eventKey={`${doc.masterDocID},${doc.docName}`} className='truncate-text'>
                          {doc.docName}
                        </Dropdown.Item>
                      );
                    })}
                </DropdownButton>
              </div>

              <hr className='m-0' />

              <div className='doc-pages d-none d-md-block'>
                <ImageThumbnails
                  controls={controls}
                  t={t}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  setMasterDocPagesId={setMasterDocPagesId}
                  imagesData={imagesData}
                  setImagesData={setImagesData}
                  buttons={true}
                />
              </div>
            </>
          </Col>
        </Row>

        <div className='fixed-button-container'>
          <Button className='backBtn' id='hide_part_one' onClick={handleBack}>
            {t("uploadDocFlow.back")}
          </Button>

          <PageNavigations imagesData={imagesData} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onImageSelect={handleImageSelect} />

          <Button className='Continue-btn' id='hide_part_one' onClick={handleFinish}>
            {t("uploadDocFlow.finish")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Secondstep;
