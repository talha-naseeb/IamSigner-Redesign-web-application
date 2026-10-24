import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, Form, Col, Row, Accordion, Spinner } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import "./style.css";
import DaysToExpire from "./DaysToExpire";
import userService from "@/services/userService";

function CoBrandingDetails() {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, reset, watch } = useForm();
  const { userAccess = {}, user = {}, accountId } = useUser("");
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
  const [selectedSessionDuration, setSelectedSessionDuration] = useState("30");

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
      setIsGoogleDrive(Boolean(coBrandingData.IsGoogleDrive));
      setIsOneDrive(Boolean(coBrandingData.IsOneDrive));
      setIsDropbox(Boolean(coBrandingData.IsDropbox));
      setDisplayedImage(
        coBrandingData.accountLogoPath && coBrandingData.accountLogoFile
          ? `${coBrandingData.accountLogoPath}${coBrandingData.accountLogoFile}`
          : Icons.Building
      );
      setDisplayedStampImage(
        coBrandingData.companyStampPath && coBrandingData.companyStampFile
          ? `${coBrandingData.companyStampPath}${coBrandingData.companyStampFile}`
          : Icons.Stamp
      );
      setLogoImgError(false);
      setStampImgError(false);

      const timeout = coBrandingData.sessionTimeOut?.toString();
      const knownDurations = ["30", "60", "120", "360", "720", "1080", "1440"];
      if (knownDurations.includes(timeout)) {
        setSelectedSessionDuration(timeout);
      } else {
        setSelectedSessionDuration("30");
      }
      reset({
        CompanyRefPrefix: coBrandingData.companyRefPrefix || "",
        Objectives: coBrandingData.objectives || "",
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

  const fetchCoBrandingData = async (accId) => {
    try {
      if (!accId) {
        return;
      }
      setIsLoading(true);
      const response = await userService.getCoBranding(accId);
      if (response.data.statusCode === "1") {
        const {
          accountLogoFile,
          accountLogoPath,
          companyRefPrefix,
          objectives,
          companyStampPath,
          companyStampFile,
          isGoogleDrive,
          isOneDrive,
          isDropbox,
          sessionTimeOut,
        } = response.data.response;

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

  const hasAccess =
    user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && (userAccess.remainingDays > 0);

  return (
    <div className='cobranding-page'>
      {/* Top Page Header */}
      <div className='cobranding-header'>
        <h1 className='cobranding-header-title'>{t("coBranding.coBranding")}</h1>
        <p className='cobranding-header-subtitle'>{t("coBranding.Selectoptions")}</p>
      </div>

      {hasAccess ? (
        <>
          {userAccess.coBrand === true && (
            <Accordion className='cobranding-accordion' defaultActiveKey='0'>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <div className='d-flex align-items-center gap-3 w-100 me-3'>
                    <div className='cobranding-icon-pill'>
                      <Icons.CoBranding size={22} />
                    </div>
                    <span className='cobranding-title-text'>{t("coBranding.coBranding")}</span>
                  </div>
                </Accordion.Header>

                <Accordion.Body>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      {/* Company Logo Upload Card */}
                      <Col lg={6}>
                        <div className='cobranding-asset-card'>
                          <div className='d-flex align-items-center gap-3 min-w-0'>
                            <div className='cobranding-asset-preview'>
                              {displayedImage && !logoImgError && typeof displayedImage === "string" ? (
                                <img
                                  src={displayedImage}
                                  alt={t("coBranding.CompanyLogo")}
                                  onError={() => setLogoImgError(true)}
                                />
                              ) : (
                                <Icons.Building size={24} />
                              )}
                            </div>
                            <div className='cobranding-asset-info'>
                              <h3 className='cobranding-asset-title'>{t("coBranding.CompanyLogo")}</h3>
                              <p className='cobranding-asset-desc'>{t("coBranding.uploadCompanyLogo")}</p>
                            </div>
                          </div>

                          <label className='cobranding-upload-btn' htmlFor='accountLogoImg' tabIndex={0}>
                            <Form.Control
                              id='accountLogoImg'
                              style={{ display: "none" }}
                              name='accountLogoImg'
                              accept='.jpg, .jpeg, .png'
                              type='file'
                              onChange={handleImageChange}
                            />
                            {t("coBranding.uploadNewLogo")}
                          </label>
                        </div>
                      </Col>

                      {/* Company Stamp Upload Card */}
                      <Col lg={6}>
                        <div className='cobranding-asset-card'>
                          <div className='d-flex align-items-center gap-3 min-w-0'>
                            <div className='cobranding-asset-preview'>
                              {displayedStampImage && !stampImgError && typeof displayedStampImage === "string" ? (
                                <img
                                  src={displayedStampImage}
                                  alt={t("coBranding.CompanyStamp")}
                                  onError={() => setStampImgError(true)}
                                />
                              ) : (
                                <Icons.Stamp size={24} />
                              )}
                            </div>
                            <div className='cobranding-asset-info'>
                              <h3 className='cobranding-asset-title'>{t("coBranding.CompanyStamp")}</h3>
                              <p className='cobranding-asset-desc'>{t("coBranding.uploadCompanysStamp")}</p>
                            </div>
                          </div>

                          <label className='cobranding-upload-btn' htmlFor='CompanyStampFile' tabIndex={0}>
                            <Form.Control
                              id='CompanyStampFile'
                              style={{ display: "none" }}
                              name='CompanyStampFile'
                              accept='.jpg, .jpeg, .png'
                              type='file'
                              onChange={handleStampImageChange}
                            />
                            {t("coBranding.uploadStamp")}
                          </label>
                        </div>
                      </Col>

                      {/* Company Reference Prefix Input */}
                      <Col lg={6}>
                        <div className='cobranding-field-group'>
                          <label className='cobranding-label' htmlFor='companyRefPrefixInput'>
                            {t("coBranding.companyName")}
                          </label>
                          <Form.Control
                            id='companyRefPrefixInput'
                            className='cobranding-input'
                            {...register("CompanyRefPrefix")}
                            onChange={handleCompanyPrefixChange}
                            value={watch("CompanyRefPrefix") || ""}
                            placeholder={t("coBranding.enterCompanyName")}
                          />
                        </div>

                        {/* File Sources Grid */}
                        <div className='cobranding-field-group'>
                          <span className='cobranding-label'>{t("coBranding.FileSources")}</span>
                          <span className='cobranding-sublabel'>{t("coBranding.Selectoptions")}</span>

                          <div className='cobranding-options-grid'>
                            {/* System Source Tile */}
                            <div className='cobranding-option-tile active' tabIndex={0} role='button' aria-pressed='true'>
                              <div className='d-flex align-items-center gap-2'>
                                <Icons.Local width={20} height={20} />
                                <span>{t("coBranding.System")}</span>
                              </div>
                              <Icons.Check className='cobranding-check-icon' size={18} />
                            </div>

                            {/* Google Drive */}
                            {userAccess.googDrive === true && (
                              <div
                                className={`cobranding-option-tile ${IsGoogleDrive ? "active" : ""}`}
                                onClick={() => handleCheckboxChange("googleDrive", !IsGoogleDrive)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    handleCheckboxChange("googleDrive", !IsGoogleDrive);
                                  }
                                }}
                                tabIndex={0}
                                role='button'
                                aria-pressed={IsGoogleDrive}
                              >
                                <div className='d-flex align-items-center gap-2'>
                                  <Icons.GoogleDrive width={20} height={20} />
                                  <span>{t("coBranding.GoogleDrive")}</span>
                                </div>
                                {IsGoogleDrive && <Icons.Check className='cobranding-check-icon' size={18} />}
                              </div>
                            )}

                            {/* Dropbox */}
                            {userAccess.dropbox === true && (
                              <div
                                className={`cobranding-option-tile ${IsDropbox ? "active" : ""}`}
                                onClick={() => handleCheckboxChange("dropbox", !IsDropbox)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    handleCheckboxChange("dropbox", !IsDropbox);
                                  }
                                }}
                                tabIndex={0}
                                role='button'
                                aria-pressed={IsDropbox}
                              >
                                <div className='d-flex align-items-center gap-2'>
                                  <Icons.Dropbox width={20} height={20} />
                                  <span>{t("coBranding.Dropbox")}</span>
                                </div>
                                {IsDropbox && <Icons.Check className='cobranding-check-icon' size={18} />}
                              </div>
                            )}

                            {/* OneDrive */}
                            {userAccess.oneDrive === true && (
                              <div
                                className={`cobranding-option-tile ${IsOneDrive ? "active" : ""}`}
                                onClick={() => handleCheckboxChange("oneDrive", !IsOneDrive)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    handleCheckboxChange("oneDrive", !IsOneDrive);
                                  }
                                }}
                                tabIndex={0}
                                role='button'
                                aria-pressed={IsOneDrive}
                              >
                                <div className='d-flex align-items-center gap-2'>
                                  <Icons.OneDrive width={20} height={20} />
                                  <span>{t("coBranding.OneDrive")}</span>
                                </div>
                                {IsOneDrive && <Icons.Check className='cobranding-check-icon' size={18} />}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>

                      {/* Objectives / Description Textarea */}
                      <Col lg={6}>
                        <div className='cobranding-field-group'>
                          <label className='cobranding-label' htmlFor='objectives'>
                            {t("coBranding.description")}
                          </label>
                          <Form.Control
                            as='textarea'
                            id='objectives'
                            className='cobranding-textarea'
                            {...register("Objectives")}
                            onChange={handleObjectivesChange}
                            value={watch("Objectives") || ""}
                            placeholder={t("coBranding.enterDescription")}
                          />
                        </div>

                        {/* Session Timeout Options */}
                        <div className='cobranding-field-group'>
                          <span className='cobranding-label'>{t("coBranding.Session")}</span>

                          <div className='cobranding-options-grid'>
                            {sessionOptions.map(({ label, value }) => {
                              const isSelected = selectedSessionDuration === value;
                              return (
                                <div
                                  key={value}
                                  className={`cobranding-option-tile ${isSelected ? "active" : ""}`}
                                  onClick={() => {
                                    setSelectedSessionDuration(value);
                                    setIsFormChanged(true);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      setSelectedSessionDuration(value);
                                      setIsFormChanged(true);
                                    }
                                  }}
                                  tabIndex={0}
                                  role='button'
                                  aria-pressed={isSelected}
                                >
                                  <span>{label}</span>
                                  {isSelected && <Icons.Check className='cobranding-check-icon' size={18} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Bottom Action Bar */}
                    {isFormChanged && (
                      <div className='cobranding-actions'>
                        <Button
                          variant='none'
                          className='ImageDoneBtn d-inline-flex align-items-center justify-content-center gap-2'
                          onClick={handleSubmit(onSubmit)}
                          disabled={isLoading}
                        >
                          {isLoading && (
                            <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />
                          )}
                          <span>{t("userProfile.update")}</span>
                        </Button>

                        <Button
                          variant='none'
                          className='ImageCancelBtn'
                          onClick={handleCancelChanges}
                          disabled={isLoading}
                        >
                          {t("coBranding.cancel")}
                        </Button>
                      </div>
                    )}
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}

          {/* Subscribed Plan Details Component */}
          <DaysToExpire />
        </>
      ) : (
        <DaysToExpire />
      )}
    </div>
  );
}

export default CoBrandingDetails;
