import React, { useEffect, useRef, useState } from "react";
import { Col, Dropdown, DropdownButton, Row } from "@/Components/UI/shadcnCompat";
import mobileService from "@/services/mobileService";
import { toast } from "react-toastify";
import { DraggableButton, PageNavigations, SearchControls } from "@/Components/DocumentPreparation";
import ImageWithDropZone from "./DisplayCenterImage";
import { useNavigate } from "react-router-dom";
import MobileImageThumbnails from "./MobileImageThumbnails";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";

const Secondstep = ({ setActiveStep }) => {
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
  const [controlLocationID, setControlLocationID] = useState();
  const [controls, setControls] = useState();
  const [signatureType, setSignatureType] = useState();
  const [auth, setAuth] = useState();
  const [registerSignID, setRegisterSignID] = useState();
  const [buttonClicked, setButtonClicked] = useState();
  const [buttonLabel, setButtonLabel] = useState();
  const [controlID, setControlID] = useState();

  const navigate = useNavigate();
  const mainDocumentRef = useRef(null);

  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");

  const idIndex = parts.indexOf("id");

  useEffect(() => {
    if (idIndex !== -1 && idIndex < parts.length - 1) {
      const pathAfterId = parts.slice(idIndex + 1).join("/");
      setAuth(pathAfterId);
    }
  }, []);

  const handleDraggbleButtonClick = (label, icon, controlID, index, value) => {
    setButtonClicked(value);
    setButtonLabel(label);
    setControlID(controlID);
  };

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const response = await mobileService.getRegisterSignData(auth);

        if (response.data.successStatus) {
          setFormData(response.data.response);
          setRegisterSignID(response.data.response.registerSignID);

          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);
          // setDefaultMasterDocID(masterDocIDs[0]);
          const firstDocument = response.data.response.primaryDocs[0];
          const firstDocName = firstDocument.docName;
          const truncatedName = firstDocName.length > 10 ? firstDocName.slice(0, 7) + ".." : firstDocName;
          setSelectedFolder(truncatedName);

          const firstMasterDocID = firstDocument.masterDocID;

          setSelectedMasterDocID(firstMasterDocID);
          fetchImagesForDocument(firstMasterDocID);

          const firstSignatory = response.data.response.signatories[0];

          const firstSignatoryID = firstSignatory.signatoriesID;
          setSelectedSignatoryID(firstSignatoryID);

          const firstName = firstSignatory.name;
          const truncatedSignatoryName = firstName.length > 4 ? firstName.slice(0, 4) + ".." : firstName;
          setSelectedName(truncatedSignatoryName);

          const initialSignatoryColors = {};
          response.data.response.signatories.forEach((signatory) => {
            initialSignatoryColors[signatory.signatoriesID] = signatory.signatureColor;
          });
          setSignatoryColors(initialSignatoryColors);

          const initialSignatureTypes = {};
          response.data.response.signatories.forEach((signatory) => {
            initialSignatureTypes[signatory.signatoriesID] = signatory.signatureType;
          });
          setSignatureType(initialSignatureTypes);
          setIsLoading(false);
        }
      } catch (error) {
        if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
          sessionStorage.removeItem("token");
          const currentTheme = localStorage.getItem("theme");
          localStorage.clear();
          if (currentTheme) {
            localStorage.setItem("theme", currentTheme);
          }
          setIsLoading(false);
          navigate("/");
          toast.info(t("uploadDocFlow.sessionExpire"));
        }
        setIsLoading(false);
      }
    };

    if (auth) {
      fetchData();
    }
  }, [auth]);

  const fetchStandardFields = async () => {
    try {
      const response = await mobileService.getControls(auth);

      if (response.data.successStatus) {
        const standardFieldsData = response.data.response;
        const updatedStandardFields = standardFieldsData.map((field) => ({
          icon: field.icon,
          label: field.controlName,
          controlID: field.controlID,
        }));
        setStandardFields(updatedStandardFields);
      }
    } catch (error) {
      if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
        sessionStorage.removeItem("token");
        localStorage.clear();
        setIsLoading(false);
        navigate("/");
        toast.info(t("uploadDocFlow.sessionExpire"));
      } else {
        toast.error(t("uploadDocFlow.errorfetchingfields"));
      }
    }
  };

  useEffect(() => {
    if (auth) {
      fetchStandardFields();
    }
  }, [auth]);

  const filteredFields = standardFields.filter((field) => field.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const fetchImagesForDocument = async (masterDocID) => {
    setIsLoading(true);

    try {
      const response = await mobileService.getMasterDocPages(masterDocID, auth);

      setImagesData(response.data.response);

      response.data.response.map((doc) => doc.masterDocPagesID);

      setIsLoading(false);
    } catch (error) {
      // toast.error("Error in loading data", { position: "top-right" });
      setIsLoading(false);
      if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
        sessionStorage.removeItem("token");
        localStorage.clear();
        setIsLoading(false);
        navigate("/");
        toast.info(t("uploadDocFlow.sessionExpire"));
      }
    }
  };

  const handleDocSelect = async (masterDocID, selectedFolderName) => {
    const truncatedName = selectedFolderName.length > 10 ? selectedFolderName.slice(0, 7) + ".." : selectedFolderName;
    setSelectedFolder(truncatedName);
    setSelectedMasterDocID(masterDocID);

    fetchImagesForDocument(masterDocID);
    // fetchButtonPositions(masterDocID);
  };

  const handleNameSelect = (signatoriesID, selectedName) => {
    const truncatedName = selectedName.length > 10 ? selectedName.slice(0, 7) + ".." : selectedName;
    setSelectedName(truncatedName);
    setSelectedSignatoryID(signatoriesID);
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

      <div className='secondstep-container mobile-page'>
        <Row className='main-content p-0 m-0'>
          <Col md={10} className='p-0' style={{ background: "#ececec" }}>
            <Row
              className='signatories-row m-0 p-0 row-signatories-wrapper'
              style={{
                position: "fixed",
                top: "67px",
                width: "100%",
                zIndex: "5",
              }}
            >
              <div className='signatories-container'>
                {formData &&
                  formData.signatories.map((signatory) => (
                    <div
                      key={signatory.signatoriesID}
                      className={`flex-row ${selectedName === signatory.name ? "selected-item" : "not-selected-item"}`}
                      onClick={() => handleNameSelect(signatory.signatoriesID, signatory.name)}
                    >
                      <div
                        className='signatory-item'
                        style={{
                          background: `${signatory.signatureColor}`,
                        }}
                      >
                        <Icons.Profile />
                      </div>

                      {signatory.name}
                    </div>
                  ))}
              </div>
            </Row>

            <Row className='draggable-content mb-3 m-0 bg-white' style={{ position: "fixed", top: "130px", width: "inherit", zIndex: "5" }}>
              <div className='menu-list'>
                <SearchControls t={t} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchClicked={searchClicked} setSearchClicked={setSearchClicked} />

                <div className='list d-flex px-md-4 px-1  pt-1 overflow-x-auto'>
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
                        controlLocationID={controlLocationID}
                        signatureType={signatureType}
                        onButtonClick={handleDraggbleButtonClick}
                      />
                    ))
                  ) : (
                    <p className='error-message'>{t("uploadDocFlow.notItemsFound")}</p>
                  )}
                </div>
              </div>
            </Row>

            <Row className='center-doc-image mx-0 mb-0 '>
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
                      imageButtonsMap={imageButtonsMap}
                      setImageButtonsMap={setImageButtonsMap}
                      signatoryColors={signatoryColors}
                      selectedSignatoryID={selectedSignatoryID}
                      selectedMasterDocID={selectedMasterDocID}
                      masterDocPagesId={masterDocPagesId}
                      RegisterSignID={registerSignID}
                      setControls={setControls}
                      auth={auth}
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

          <Col md={2} className='page-display p-0' style={{ position: "fixed", top: "0px", zIndex: "5" }}>
            <div className='documents-dropdown'>
              <DropdownButton
                title={selectedFolder || ""}
                onSelect={(eventKey) => {
                  const [masterDocID, selectedFolderName] = eventKey.split(",");
                  handleDocSelect(masterDocID, selectedFolderName);
                }}
                id='doc-dropdown'
                className='border border-0'
                variant='none'
              >
                {formData &&
                  formData.primaryDocs.map((doc) => {
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
              <MobileImageThumbnails
                controls={controls}
                t={t}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                setMasterDocPagesId={setMasterDocPagesId}
                imagesData={imagesData}
                setImagesData={setImagesData}
                buttons={true}
                auth={auth}
              />
            </div>
          </Col>
        </Row>

        <div className='my-2'>
          <div className='fixed-button-mobileView'>
            <PageNavigations imagesData={imagesData} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onImageSelect={handleImageSelect} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Secondstep;
