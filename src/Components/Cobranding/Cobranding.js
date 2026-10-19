import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, Form, Col, Row, Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import "./style.css";
import Loader from "@/Components/CommonModals/Loader/Loader";
import DaysToExpire from "./DaysToExpire";
import userService from "@/services/userService";

function CoBrandingDetails() {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, reset, watch } = useForm();
  const { userAccess, user, accountId } = useUser("");
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [objectives, setObjectives] = useState("");
  const [companyPrefix, setCompanyPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(Icons.Building);
  const [displayedStampImage, setDisplayedStampImage] = useState(Icons.Stamp);
  const [logoImgError, setLogoImgError] = useState(false);
  const [stampImgError, setStampImgError] = useState(false);

  const [base64Image, setBase64Image] = useState(null);
  const [base64StampImage, setBase64StampImage] = useState(null);
  const [IsGoogleDrive, setIsGoogleDrive] = useState(false);
  const [IsOneDrive, setIsOneDrive] = useState(false);
  const [IsDropbox, setIsDropbox] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState("");

  const [coBrandingData, setCoBrandingData] = useState({
    accountLogoPath: "",
    accountLogoFile: "",
    companyStampPath: "",
    companyStampFile: "",
    companyRefPrefix: "",
    objectives: "",
    IsGoogleDrive: false,
    IsOneDrive: false,
    IsDropbox: false,
    SessionTimeOut: "",
  });

  useEffect(() => {
    if (coBrandingData) {
      setObjectives(coBrandingData.objectives || "");
      setCompanyPrefix(coBrandingData.companyRefPrefix || "");
      setIsGoogleDrive(coBrandingData.IsGoogleDrive);
      setIsOneDrive(coBrandingData.IsOneDrive);
      setIsDropbox(coBrandingData.IsDropbox);
      setDisplayedImage(coBrandingData.accountLogoPath && coBrandingData.accountLogoFile ? `${coBrandingData.accountLogoPath}${coBrandingData.accountLogoFile}` : Icons.Building);
      setDisplayedStampImage(coBrandingData.companyStampPath && coBrandingData.companyStampFile ? `${coBrandingData.companyStampPath}${coBrandingData.companyStampFile}` : Icons.Stamp);
      setLogoImgError(false);
      setStampImgError(false);

      // ✅ Set session time
      const timeout = coBrandingData.sessionTimeOut?.toString();
      const knownDurations = ["30", "60", "120", "360", "720", "1080", "1440"];
      if (knownDurations.includes(timeout)) {
        setSelectedSessionDuration(timeout);
      } else {
        setSelectedSessionDuration("30");
      }
      reset({
        CompanyRefPrefix: coBrandingData.companyRefPrefix,
        Objectives: coBrandingData.objectives,
      });
    }
  }, [coBrandingData, reset]);

  const handleCheckboxChange = (checkboxName, isChecked) => {
    switch (checkboxName) {
      case "googleDrive":
        setIsGoogleDrive(isChecked);
        break;
      case "oneDrive":
        setIsOneDrive(isChecked);
        break;
      case "dropbox":
        setIsDropbox(isChecked);
        break;
      default:
        break;
    }

    setIsFormChanged(true);
  };

  useEffect(() => {
    fetchCoBrandingData(accountId);
  }, [accountId]);

  const fetchCoBrandingData = async (accountId) => {
    try {
      if (!accountId) {
        return;
      }
      setIsLoading(true);
      const response = await userService.getCoBranding(accountId);
      if (response.data.statusCode === "1") {
        const { accountLogoFile, accountLogoPath, companyRefPrefix, objectives, companyStampPath, companyStampFile, isGoogleDrive, isOneDrive, isDropbox, sessionTimeOut } =
          response.data.response;

        setCoBrandingData({
          companyStampFile,
          companyStampPath,
          accountLogoFile,
          accountLogoPath,
          companyRefPrefix,
          objectives,
          IsGoogleDrive: isGoogleDrive,
          IsOneDrive: isOneDrive,
          IsDropbox: isDropbox,
          sessionTimeOut,
        });
      }
    } catch (error) {
      console.error("Error fetching cobranding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      data.AccountLogoFile = base64Image;
      data.AccountLogoExtension = ".png";
      data.CompanyStampFile = base64StampImage;
      data.CompanyStampExtention = ".png";
      data.IsGoogleDrive = IsGoogleDrive;
      data.IsOneDrive = IsOneDrive;
      data.IsDropbox = IsDropbox;
      data.SessionTimeOut = Number(selectedSessionDuration);

      const response = await userService.updateCoBranding(data);
      if (response.data.statusCode === "1") {
        toast.success(t("coBranding.accountUpdate"));
        setIsFormChanged(false);
        fetchCoBrandingData(accountId);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(t("coBranding.errWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setDisplayedImage(imageUrl);
      setLogoImgError(false);

      try {
        await convertToBase64(file);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast.error(error.message);
      }
    }
    setIsFormChanged(true);
  };

  const handleStampImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const stampUrl = URL.createObjectURL(file);
      setDisplayedStampImage(stampUrl);
      setStampImgError(false);

      try {
        await convertStampToBase64(file);
      } catch (error) {
        console.error("Error converting stamp image to base64:", error);
        toast.error(error.message);
      }
    }
    setIsFormChanged(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      if (file.name.endsWith(".png") || file.name.endsWith(".jpeg") || file.name.endsWith(".jpg")) {
        reader.onload = () => {
          let base64String = reader.result?.split(",")[1];
          base64String = base64String.replace(/["',:;]/g, "");
          setBase64Image(base64String);
          resolve(base64String);
        };
      } else {
        reject(new Error("Invalid file format. Please upload a PNG or JPG file."));
      }

      reader.onerror = (error) => reject(error);
    });
  };

  const convertStampToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      if (file.name.endsWith(".png") || file.name.endsWith(".jpeg") || file.name.endsWith(".jpg")) {
        reader.onload = () => {
          let base64String = reader.result?.split(",")[1];
          base64String = base64String.replace(/["',:;]/g, "");
          setBase64StampImage(base64String);
          resolve(base64String);
        };
      } else {
        reject(new Error("Invalid file format. Please upload a PNG or JPG file."));
      }

      reader.onerror = (error) => reject(error);
    });
  };

  const handleObjectivesChange = (e) => {
    setObjectives(e.target.value);
    setValue("Objectives", e.target.value);
    setIsFormChanged(true);
  };

  const handleCompanyPrefixChange = (e) => {
    setCompanyPrefix(e.target.value);
    setValue("CompanyRefPrefix", e.target.value);
    setIsFormChanged(true);
  };

  const handleCancelChanges = () => {
    setIsFormChanged(false);
    fetchCoBrandingData(accountId);
  };

  const sessionOptions = [
    { label: t("session.30mins"), value: "30" },
    { label: t("session.1hour"), value: "60" },
    { label: t("session.6hours"), value: "360" },
    { label: t("session.12hours"), value: "720" },
    { label: t("session.18hours"), value: "1080" },
    { label: t("session.24hours"), value: "1440" },
  ];

  return (
    <div className='cobranding-page container mt-3'>
      {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays > 0 ? (
        <>
          {userAccess.coBrand === true ? (
            <>
              <Accordion className='cobranding-accordion' defaultActiveKey='0'>
                <Accordion.Item eventKey='2'>
                  <Accordion.Header>
                    <div className='d-flex align-items-center gap-3'>
                      <Icons.CoBranding size={24} />
                      <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("coBranding.coBranding")}</label>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className='main-container'>
                      {isLoading && (
                        <div className='loader-overlay'>
                          <Loader />
                        </div>
                      )}
                      <div className='main-container-form'>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                          <Row>
                            <Col md={6}>
                              <div className='profile-Form'>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {displayedImage && (
                                    !logoImgError && typeof displayedImage === "string" ? (
                                      <img src={displayedImage} alt='displayedImage' className='Imageshown' onError={() => setLogoImgError(true)} />
                                    ) : (
                                      <div
                                        className='Imageshown d-flex align-items-center justify-content-center'
                                      >
                                        <Icons.Building size={18} />
                                      </div>
                                    )
                                  )}

                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <Form.Label style={{ fontSize: "18px", fontWeight: "600" }}>{t("coBranding.CompanyLogo")}</Form.Label>
                                    <Form.Label>{t("coBranding.uploadCompanyLogo")}</Form.Label>
                                  </div>
                                </div>
                                <Form.Label className='uploadProfilebtn' htmlFor='accountLogoImg'>
                                  <Form.Control id='accountLogoImg' style={{ display: "none" }} name='accountLogoImg' accept='.jpg, .jpeg, .png' type='file' onChange={handleImageChange} />
                                  {t("coBranding.uploadNewLogo")}
                                </Form.Label>
                              </div>
                            </Col>

                            <Col md={6}>
                              <div className='profile-Form'>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {displayedStampImage && (
                                    !stampImgError && typeof displayedStampImage === "string" ? (
                                      <img src={displayedStampImage} alt='displayedStampImage' className='Imageshown' onError={() => setStampImgError(true)} />
                                    ) : (
                                      <div
                                        className='Imageshown d-flex align-items-center justify-content-center'
                                      >
                                        <Icons.Stamp size={18} />
                                      </div>
                                    )
                                  )}

                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <Form.Label style={{ fontSize: "18px", fontWeight: "600" }}>{t("coBranding.CompanyStamp")}</Form.Label>
                                    <Form.Label>{t("coBranding.uploadCompanysStamp")}</Form.Label>
                                  </div>
                                </div>

                                <Form.Label className='uploadProfilebtn' htmlFor='CompanyStampFile'>
                                  <Form.Control id='CompanyStampFile' style={{ display: "none" }} name='CompanyStampFile' accept='.jpg, .jpeg, .png' type='file' onChange={handleStampImageChange} />
                                  {t("coBranding.uploadStamp")}
                                </Form.Label>
                              </div>
                            </Col>

                            <Col md={6}>
                              <Col>
                                <div style={{ marginTop: "12px" }}>
                                  <Form.Label>{t("coBranding.companyName")}</Form.Label>
                                </div>
                                <Form.Control
                                  {...register("CompanyRefPrefix")}
                                  onChange={handleCompanyPrefixChange}
                                  value={watch("CompanyRefPrefix") || ""}
                                  placeholder={t("coBranding.enterCompanyName")}
                                />
                              </Col>

                              <Col className='my-3'>
                                <label>{t("coBranding.FileSources")}</label>

                                <Row>
                                  <Col md={4}>
                                    <div className={`custom-card active`}>
                                      <div className='d-flex justify-content-between align-items-center'>
                                        <div className='d-flex align-items-center'>
                                          <Icons.Local width={24} height={24} />

                                          <span className='mx-2'>{t("coBranding.System")}</span>
                                        </div>
                                        <Icons.Check className='checkmarkSource' />
                                      </div>
                                    </div>
                                  </Col>

                                  {userAccess.googDrive === true && (
                                    <Col md={4}>
                                      <div className={`custom-card ${IsGoogleDrive ? "active" : ""}`} onClick={() => handleCheckboxChange("googleDrive", !IsGoogleDrive)}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                          <div className='d-flex align-items-center'>
                                            <Icons.GoogleDrive width={24} height={24} />

                                            <span className='mx-2'>{t("coBranding.GoogleDrive")}</span>
                                          </div>
                                          {IsGoogleDrive && <Icons.Check className='checkmarkSource' />}
                                        </div>
                                      </div>
                                    </Col>
                                  )}

                                  {userAccess.dropbox === true && (
                                    <Col md={4}>
                                      <div className={`custom-card ${IsDropbox ? "active" : ""}`} onClick={() => handleCheckboxChange("dropbox", !IsDropbox)}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                          <div className='d-flex align-items-center'>
                                            <Icons.Dropbox width={24} height={24} />

                                            <span className='mx-2'>{t("coBranding.Dropbox")}</span>
                                          </div>
                                          {IsDropbox && <Icons.Check className='checkmarkSource' />}
                                        </div>
                                      </div>
                                    </Col>
                                  )}

                                  {userAccess.oneDrive === true && (
                                    <Col md={4}>
                                      <div className={`custom-card ${IsOneDrive ? "active" : ""}`} onClick={() => handleCheckboxChange("oneDrive", !IsOneDrive)}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                          <div className='d-flex align-items-center'>
                                            <Icons.OneDrive width={24} height={24} />

                                            <span className='mx-2'>{t("coBranding.OneDrive")}</span>
                                          </div>
                                          {IsOneDrive && <Icons.Check className='checkmarkSource' />}
                                        </div>
                                      </div>
                                    </Col>
                                  )}
                                </Row>
                              </Col>
                            </Col>

                            <Col md={6}>
                              <div style={{ marginTop: "12px" }}>
                                <Form.Label htmlFor='objectives'>{t("coBranding.description")}</Form.Label>
                              </div>
                              <Form.Control
                                as='textarea'
                                rows={5}
                                id='objectives'
                                {...register("Objectives")}
                                onChange={handleObjectivesChange}
                                value={watch("Objectives") || ""}
                                placeholder={t("coBranding.enterDescription")}
                              />
                            </Col>

                            <Col md={6}>
                              <label className='my-3'>{t("coBranding.Session")}</label>
                              <Row>
                                {sessionOptions.map(({ label, value }) => (
                                  <Col md={4} key={value}>
                                    <div
                                      className={`custom-card ${selectedSessionDuration === value ? "active" : ""}`}
                                      onClick={() => {
                                        setSelectedSessionDuration(value);
                                        setIsFormChanged(true);
                                      }}
                                    >
                                      <div className='d-flex justify-content-between align-items-center'>
                                        <span>{label}</span>
                                        {selectedSessionDuration === value && <Icons.Check className='checkmarkSource' />}
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </Col>

                            <div className='d-flex gap-2 justify-content-start mt-5'>
                              {isFormChanged && (
                                <>
                                  <Button variant='none' className='ImageDoneBtn' onClick={handleSubmit(onSubmit)}>
                                    {t("userProfile.update")}
                                  </Button>
                                  <Button variant='none' className='ImageCancelBtn' onClick={handleCancelChanges}>
                                    {t("coBranding.cancel")}
                                  </Button>
                                </>
                              )}
                            </div>
                          </Row>
                        </Form>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </>
          ) : (
            <></>
          )}
          <DaysToExpire />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default CoBrandingDetails;
