import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Dropdown, DropdownButton, Row } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { DraggableButton, PageNavigations, SearchControls } from "@/Components/DocumentPreparation";
import ImageWithDropZone from "./DisplayCenterImage";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageThumbnails from "@/Components/ImageThumbnails/ImageThumbnails";
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
    <div className='w-full'>
      {isLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <Loader />
        </div>
      )}

      <div className='w-full'>
        <Row className='p-0 m-0'>
          <Col md={10} className='p-0 bg-[var(--modern-bg)]'>
            <Row
              className='m-0 p-0 overflow-x-auto w-full px-3 py-2 cursor-pointer flex items-center'
              style={{
                position: "fixed",
                top: "var(--editor-header-height, 67px)",
                width: "100%",
                zIndex: "30",
                background: "var(--modern-card)",
                borderBottom: "1px solid var(--modern-border)",
              }}
            >
              <div className='flex flex-row justify-start gap-2.5 overflow-x-auto max-w-[71%] whitespace-nowrap pb-1'>
                {formData &&
                  formData.templateSignatory.map((signatory) => {
                    const isHovered = hoveredSignatory === signatory.signatoriesID;
                    const originalColor = signatory.signatureColor;
                    const hoverColor = colorMapping[originalColor] || originalColor;
                    const isSelected = selectedSignatoryID === signatory.templateSignatoryID;
                    return (
                      <div
                        key={signatory.templateSignatoryID}
                        className={`inline-flex items-center gap-2 rounded-lg py-1.5 px-3 cursor-pointer transition-all text-xs font-medium text-[var(--modern-text)] ${
                          isSelected
                            ? "bg-[var(--modern-raised)] font-semibold"
                            : "bg-[var(--modern-card)] border border-[var(--modern-border)] hover:bg-[var(--modern-raised)]"
                        }`}
                        onClick={() => handleNameSelect(signatory.templateSignatoryID, signatory.name)}
                        onMouseEnter={() => setHoveredSignatory(signatory.templateSignatoryID)}
                        onMouseLeave={() => setHoveredSignatory(null)}
                        style={{
                          border: isSelected ? `1px solid ${originalColor}` : undefined,
                        }}
                      >
                        <div
                          className='w-[32px] h-[32px] rounded-full flex items-center justify-center text-white shrink-0'
                          style={{ backgroundColor: isHovered ? hoverColor : originalColor }}
                        >
                          <Icons.Profile size={17} />
                        </div>
                        <span className='truncate max-w-[120px]'>{signatory.name}</span>
                      </div>
                    );
                  })}
              </div>
            </Row>

            <Row
              className='mb-3 m-0'
              style={{
                position: "fixed",
                top: "calc(var(--editor-header-height, 67px) + 69px)",
                width: "71%",
                zIndex: "30",
                background: "var(--modern-card)",
                borderBottom: "1px solid var(--modern-border)",
              }}
            >
              <Col xs={12} className='p-0'>
                <div className='h-full flex justify-start items-center bg-[var(--modern-card)]'>
                  <SearchControls t={t} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchClicked={searchClicked} setSearchClicked={setSearchClicked} />

                  <div className='flex px-1 overflow-x-auto max-[576px]:w-full max-[576px]:flex-row max-[576px]:justify-evenly max-[576px]:gap-[15px] max-[576px]:border-b max-[576px]:border-[var(--modern-border)] max-[576px]:border-r-0 max-[576px]:pb-[13px]'>
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field, index) => (
                        <DraggableButton
                          key={index}
                          index={index}
                          icon={field.icon}
                          label={field.label}
                          controlID={field.controlID}
                          data={field.label}
                          signatoryColors={signatoryColors}
                          selectedSignatoryID={selectedSignatoryID}
                          MasterDocPagesId={masterDocPagesId}
                          signatureType={signatureType}
                          onButtonClick={handleDraggbleButtonClick}
                          controlUniqueIdentifier={field.controlUniqueIdentifier}
                        />
                      ))
                    ) : (
                      <p className='flex items-center my-3 text-[var(--modern-muted)] text-sm'>{t("uploadDocFlow.notItemsFound")}</p>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Row className='mx-0 mb-0' style={{ marginTop: "calc(var(--editor-header-height, 67px) + 68px)" }}>
              <div className='px-0 mb-[78px] overflow-auto w-full' ref={mainDocumentRef}>
                {!imagesData ? (
                  <div className='flex items-center justify-center p-8'>
                    <div className='w-8 h-8 rounded-full border-2 border-[var(--modern-primary)] border-t-transparent animate-spin' />
                  </div>
                ) : (
                  imagesData && (
                    <ImageWithDropZone
                      selectedImage={selectedImage}
                      imageButtonsMap={imageButtonsMap}
                      setImageButtonsMap={setImageButtonsMap}
                      signatoryColors={signatoryColors}
                      selectedSignatoryID={selectedSignatoryID}
                      selectedMasterDocID={selectedMasterDocID}
                      masterDocPagesId={masterDocPagesId}
                      TemplateID={storedTemplateID}
                      setControls={setControls}
                      buttonClicked={buttonClicked}
                      setButtonClicked={setButtonClicked}
                      buttonLabel={buttonLabel}
                      controlID={controlID}
                    />
                  )
                )}
              </div>
            </Row>
          </Col>

          <Col
            md={2}
            className='p-0 border-l border-[var(--modern-border)] rtl:border-r rtl:border-l-0 bg-[var(--modern-card)]'
            style={{ position: "fixed", top: "var(--editor-header-height, 67px)", zIndex: "30" }}
          >
            <div className='m-2 p-1.5 rounded-md border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] flex items-center'>
              <DropdownButton
                title={selectedFolder || ""}
                onSelect={(eventKey) => {
                  const [masterDocID, selectedFolderName] = eventKey.split(",");
                  handleDocSelect(masterDocID, selectedFolderName);
                }}
                id='doc-dropdown'
                className='border-0 w-full flex justify-between items-center text-[var(--modern-text)]'
                variant='none'
              >
                {formData &&
                  formData.primaryDocs.map((doc) => {
                    const truncatedName = doc.docName.length > 10 ? doc.docName.slice(0, 7) + ".." : doc.docName;
                    return (
                      <Dropdown.Item key={doc.masterDocID} eventKey={`${doc.masterDocID},${doc.docName}`} className='truncate text-[var(--modern-text)]'>
                        {doc.docName}
                      </Dropdown.Item>
                    );
                  })}
              </DropdownButton>
            </div>

            <hr className='m-0 border-[var(--modern-border)]' />

            <div className='hidden md:block'>
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
          </Col>
        </Row>

        <div className='fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)]'>
          <Button variant='outline' id='hide_part_one' onClick={handleBack} disabled={isLoading}>
            {t("uploadDocFlow.back")}
          </Button>

          <PageNavigations imagesData={imagesData} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onImageSelect={handleImageSelect} />

          <Button variant='primary' id='hide_part_one' onClick={handleFinish} disabled={isLoading}>
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                {t("uploadDocFlow.finish")}
              </span>
            ) : (
              t("uploadDocFlow.finish")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Secondstep;
