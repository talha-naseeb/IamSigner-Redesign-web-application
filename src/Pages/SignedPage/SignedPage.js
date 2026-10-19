import React, { useEffect, useRef, useState } from "react";
import "../SignaturePage/SignaturePage.css";
import { Button, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import "./SignedPage.css";
import { usePDF } from "react-to-pdf";
import verificationService from "@/services/verificationService";

const SignedPage = () => {
  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState();
  const [fileName, setFileName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [imagesData, setImagesData] = useState([]);
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [controlData, setControlData] = useState([]);
  const [isToastDisplayed, setIsToastDisplayed] = useState(false);
  const [registerSignID, setRegisterSignID] = useState();
  const { toPDF, targetRef } = usePDF({ filename: "document.pdf" });
  const [auth, setAuth] = useState();
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

  useEffect(() => {
    const getControlsLocation = async () => {
      setIsLoading(true);
      try {
        const response = await verificationService.getControlLocationCompleted(selectedMasterDocID, auth);

        if (response.data.successStatus) {
          setControlData(response.data.response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (selectedMasterDocID) {
      getControlsLocation();
    }
  }, [selectedMasterDocID]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    try {
      const response = await verificationService.getMasterDocPagesCompleted(selectedMasterDocID, auth);

      setImagesData(response.data.response);

      response.data.response.map((doc) => doc.masterDocPagesID);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);

    const getRegisterSignDataComlpeted = async () => {
      try {
        const response = await verificationService.getRegisterSignDataCompleted(auth);

        // //console.log("registerSign Data Completed", response);

        if (response.data.successStatus) {
          setFormData(response.data.response);

          setRegisterSignID(response.data.response.registerSignID);
          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);
          setDefaultMasterDocID(masterDocIDs[0]);
          const firstDocument = response.data.response.primaryDocs[0];
          const firstDocName = firstDocument.docName;
          setFileName(firstDocName);
          const truncatedName = firstDocName.length > 4 ? firstDocName.slice(0, 4) + "..." : firstDocName;
          setSelectedFolder(truncatedName);

          const firstMasterDocID = firstDocument.masterDocID;

          setSelectedMasterDocID(firstMasterDocID);
          getMasterDocPages(firstMasterDocID);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    if (auth) {
      getRegisterSignDataComlpeted();
    }
  }, [auth]);

  // const handleDocSelect = async (masterDocID, selectedFolderName) => {
  //   //console.log(masterDocID);
  //   const truncatedName =
  //     selectedFolderName.length > 4
  //       ? selectedFolderName.slice(0, 4) + "..."
  //       : selectedFolderName;
  //   setSelectedFolder(truncatedName);
  //   setSelectedMasterDocID(masterDocID);

  //   getMasterDocPages(masterDocID);
  // };

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  const handleFileDownload = async () => {
    try {
      setIsLoading(true);
      const response = await verificationService.downloadDocVerification(auth);

      const response1 = await fetch(response.data.response.document);
      const blob = await response1.blob();
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${fileName}`;
      downloadLink.click();
      setIsLoading(false);
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("File not downloaded. Try again");
      setIsLoading(false);
    }
  };

  // const handleFileDownload = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get("/v1.0/api/DownloadDoc", {
  //       headers: {
  //         SignAuth: auth,
  //       },
  //     });

  //     const base64Data = response.data.response;
  //     const blob = base64toBlob(base64Data);
  //     const downloadLink = document.createElement("a");
  //     downloadLink.href = URL.createObjectURL(blob);
  //     downloadLink.download = "downloaded_document.pdf";
  //     document.body.appendChild(downloadLink);

  //     downloadLink.click();

  //     document.body.removeChild(downloadLink);
  //     setIsLoading(false);
  //     toast.success("File downloaded successfully");
  //   } catch (error) {
  //     toast.error("File not downloaded. Try again");
  //     setIsLoading(false);
  //   }
  // };

  function base64toBlob(base64Data) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray]);
  }

  const handleImageClick = (pagesPath, masterDocPagesID) => {
    setSelectedImage(pagesPath);
    setMasterDocPagesId(masterDocPagesID);
  };

  // const handleImageClick = (imagePath) => {
  //   const selectedImageElement = mainDocumentRef.current.querySelector(
  //     `img[src="${imagePath}"]`
  //   );

  //   if (selectedImageElement) {
  //     // Scroll to the selected image
  //     selectedImageElement.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //     });
  //   }
  // };

  return (
    <div className=''>
      <Row className='d-flex justify-content-lg-center align-items-center m-3'>
        <div className='button' onClick={handleFileDownload}>
          <div class='button-wrapper'>
            <div class='text'>Download</div>
            <span class='icon'>
              <svg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' width='2em' height='2em' preserveAspectRatio='xMidYMid meet' viewBox='0 0 24 24'>
                <path
                  fill='none'
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17'
                ></path>
              </svg>
            </span>
          </div>
        </div>
      </Row>
      <Row className='my-2  mx-0 '>
        <Col md={2}></Col>
        <Col md={8} className='p-0 '>
          <div
            className='main-document  scrollable-content '
            ref={mainDocumentRef}
            style={{
              position: "relative",
            }}
          >
            {/* <div
              className="large-image d-flex flex-column justify-content-center align-items-md-center"
              style={{ position: "relative" }}
            > */}
            {/* {imagesData &&
              imagesData.map((imageData, index) => ( */}
            <div className='image'>
              <div className='large-image'>
                <>
                  {isLoading && (
                    <div className='loader-overlay'>
                      <div className='loader'></div>
                    </div>
                  )}
                  <img src={selectedImage} alt='' className='doc-image' />

                  {controlData.map((control, index) => {
                    return (
                      control.masterDocPagesID === masterDocPagesId &&
                      control.controlStatus === "Signed" && (
                        <div
                          key={index}
                          className='draggable-button-container'
                          style={{
                            position: "absolute",
                            left: control.controlLocationX,
                            top: control.controlLocationY,
                          }}
                        >
                          {/* {//console.log("controls", control)} */}
                          {control.controlName === "Company" && control.company === "" ? null : (
                            <Button
                              className='field-button'
                              style={{
                                backgroundColor: "transparent",
                                color: "black",
                                border: "none",
                                width: control.width,
                                height: control.height,
                              }}
                            >
                              {control.controlName === "Signature" && (
                                <img
                                  src={control.signature}
                                  alt='Signature Image'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "none",
                                  }}
                                />
                              )}
                              {control.controlName === "Name" && control.name}
                              {control.controlName === "Initial" && (
                                <img
                                  src={control.signature}
                                  alt='Initial Image'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "none",
                                  }}
                                />
                              )}

                              {control.controlName === "Email" && control.email}
                              {control.controlName === "Company" && control.company}
                              {control.controlName === "Date Signed" && control.signDate}
                              {control.controlName === "Text" && control.textEditor}
                              {control.controlName === "Stamp" && (
                                <img
                                  src={control.signature}
                                  alt='stamp Image'
                                  style={{
                                    width: control.width,
                                    height: control.height,
                                    border: "none",
                                  }}
                                />
                              )}
                            </Button>
                          )}
                        </div>
                      )
                    );
                  })}
                </>
              </div>
            </div>
            {/* ))} */}
          </div>
          {/* </div> */}
        </Col>
        {/* <Col md={2}></Col> */}
        <Col md={2} className='page-display'>
          {/* <div className="documents text-center d-flex align-items-center p-1 mb-2">
            <h6 className="m-0 ps-2 d-flex">
              <GrDocumentText className="mb-1" /> Document:{" "}
            </h6>
            <DropdownButton
              title={selectedFolder || ""}
              onSelect={(eventKey) => {
                const [masterDocID, selectedFolderName] = eventKey.split(",");
                handleDocSelect(masterDocID, selectedFolderName);
              }}
              id="doc-dropdown"
              className="text-white"
              variant="none"
            >
              {formData &&
                formData.primaryDocs.map((doc) => {
                  const truncatedName =
                    doc.docName.length > 4
                      ? doc.docName.slice(0, 4) + "..."
                      : doc.docName;
                  return (
                    <Dropdown.Item
                      key={doc.masterDocID}
                      eventKey={`${doc.masterDocID},${doc.docName}`}
                      className="truncate-text"
                    >
                      {doc.docName}
                    </Dropdown.Item>
                  );
                })}
            </DropdownButton>
          </div> */}
          <div className='thumbnails'>
            {imagesData.length === 0 ? (
              <div className='no-pages-message'>No pages found</div>
            ) : (
              imagesData.map((imageData, index) => (
                <div
                  key={index}
                  className={`image-div my-3 mx-2 ${selectedImage === imageData.pagesPath ? "selected" : ""}`}
                  onClick={() => handleImageClick(imageData.pagesPath, imageData.masterDocPagesID)}
                >
                  <img src={imageData.pagesPath} alt={`Image ${index}`} />
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignedPage;
