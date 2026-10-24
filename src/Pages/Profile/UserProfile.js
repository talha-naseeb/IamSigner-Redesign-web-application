import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import userService from "@/services/userService";
import { resizeImage, convertToBase64, checkImageLoad } from "@/utils/image";
import { Button, Col, Row, Accordion, Form, Modal, Spinner } from "@/Components/UI/shadcnCompat";
import "./style.css";
import { useTranslation } from "react-i18next";
import PasswordChange from "../Auth/PasswordChange/PasswordChange";
import Delegation from "@/Components/Delegation/Delegation";
import { useUser } from "@/Context/UserContext";
import PhoneInput from "react-phone-input-2";
import { Icons } from "@/assets/Icons";

function UserProfile() {
  const { t } = useTranslation();
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { userAccess, fetchUserProfile: refreshHeaderProfile } = useUser("");
  const { handleSubmit } = useForm();
  const [userRoleID, setUserRoleID] = useState("");
  const [isSavingAssets, setIsSavingAssets] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(Icons.Profile);
  const [displaySignatureImg, setdisplaySignatureImg] = useState(Icons.SelfSign);
  const [imgError, setImgError] = useState(false);
  const [sigError, setSigError] = useState(false);
  const [imageBlobUrl, setImageBlobUrl] = useState(null);
  const [signatureBlobUrl, setSignatureBlobUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [base64Signature, setBase64Signature] = useState(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isSignatureSelected, setIsSignatureSelected] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // State for error messages
  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const [userData, setUserData] = useState({
    fullName: "",
    emailID: "",
    userPhotoPath: "",
    mySignaturePath: "",
    mobileNumber: "",
  });

  // Validate inputs
  const validateInputs = () => {
    let newErrors = { fullName: "", phoneNumber: "" };
    let isValid = true;

    // Full Name validation - mandatory
    if (!fullNameInput.trim()) {
      newErrors.fullName = t("userProfile.fullNameRequired");
      isValid = false;
    } else if (fullNameInput.trim().length > 25) {
      newErrors.fullName = t("userProfile.fullNameMaxChars");
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullNameInput)) {
      newErrors.fullName = t("userProfile.fullNameInvalid");
      isValid = false;
    }

    // Phone Number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t("userProfile.mobileNumberRequired");
      isValid = false;
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = t("userProfile.mobileNumberInvalid");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check if form has valid changes to show save button
  const hasValidChanges = () => {
    const hasNameChanged = fullNameInput.trim() !== userData.fullName;
    const hasPhoneChanged = phoneNumber !== userData.countryCode + userData.mobileNumber;
    const hasValidName = fullNameInput.trim() && /^[a-zA-Z\s]+$/.test(fullNameInput);

    return (hasNameChanged || hasPhoneChanged) && hasValidName;
  };

  //Update Account API
  const onSubmit = async () => {
    const data = {
      UserPhoto: base64Image,
      UserPhotoExtention: ".png",
      MySignatureFile: base64Signature,
      MySignatureExtention: ".png",
    };

    setIsSavingAssets(true);
    try {
      const response = await userService.updateProfile(data);

      if (response.data.statusCode === "1") {
        toast.success(t("userProfile.profileUpdate"));

        if (imageBlobUrl) {
          URL.revokeObjectURL(imageBlobUrl);
          setImageBlobUrl(null);
        }
        if (signatureBlobUrl) {
          URL.revokeObjectURL(signatureBlobUrl);
          setSignatureBlobUrl(null);
        }
        await fetchUserProfile();

        if (refreshHeaderProfile) {
          await refreshHeaderProfile();
        }
        handleCancel();
      }
    } catch (error) {
      toast.error(t("userProfile.errProfileUpdate"));
    } finally {
      setIsSavingAssets(false);
    }
  };

  //UserProfile API for Fetching Profile Path
  const fetchUserProfile = async () => {
    try {
      const response = await userService.getUserProfile();

      if (response.data.statusCode === "1") {
        const { fullName, emailID, userPhotoPath, mySignaturePath, roleID, userPhoto, mySignatureFile, mobileNumber, countryCode } = response.data.response;
        setUserData({
          fullName,
          emailID,
          userPhotoPath,
          mySignaturePath,
          mobileNumber,
          countryCode,
        });
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        setDisplayedImage(userPhoto ? `${userPhotoPath}?t=${timestamp}` : Icons.Profile);
        setdisplaySignatureImg(mySignatureFile ? `${mySignaturePath}?t=${timestamp}` : Icons.SelfSign);
        setUserRoleID(roleID);
        setFullNameInput(fullName);

        // Set phone number with country code
        if (countryCode && mobileNumber) {
          setPhoneNumber(countryCode + mobileNumber);
        } else if (mobileNumber) {
          setPhoneNumber(mobileNumber);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleNameSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSavingDetails(true);
    try {
      const roleIdString = String(userRoleID);

      const countryCode = phoneNumber.substring(0, phoneNumber.length - 10);
      const mobileNumber = phoneNumber.substring(phoneNumber.length - 10);

      const response = await userService.updateAppUser({
        FullName: fullNameInput,
        EmailID: userData.emailID,
        RoleID: roleIdString,
        UserName: userData.emailID,
        MobileNumber: mobileNumber,
        CountryCode: countryCode,
      });

      if (response.data.statusCode === "1") {
        toast.success(t("userProfile.nameUpdate"));
        fetchUserProfile();
        setUserData({ ...userData, fullName: fullNameInput, mobileNumber: mobileNumber, CountryCode: countryCode });
        setShowSaveButton(false);
        setErrors({ fullName: "", phoneNumber: "" }); // Clear errors
      } else {
        toast.error(t("userProfile.errUpateName"));
      }
    } catch (error) {
      toast.error(t("userProfile.errUpateName"));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
        const resizedFile = await resizeImage(file, 800);
        const imageUrl = URL.createObjectURL(resizedFile);
        setImageBlobUrl(imageUrl);
        setDisplayedImage(imageUrl);
        const base64 = await convertToBase64(resizedFile);
        setBase64Image(base64);
        setIsImageSelected(true);
        setImgError(false);
      } catch (error) {
        console.error("Error converting image:", error);
        toast.error(t("userProfile.failedtoChange"));
      }
    }
  };

  const handleStampImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        if (signatureBlobUrl) URL.revokeObjectURL(signatureBlobUrl);
        const resizedFile = await resizeImage(file, 800, 500);
        const stampUrl = URL.createObjectURL(resizedFile);
        setSignatureBlobUrl(stampUrl);
        setdisplaySignatureImg(stampUrl);
        const base64 = await convertToBase64(resizedFile);
        setBase64Signature(base64);
        setIsSignatureSelected(true);
        setSigError(false);
      } catch (error) {
        console.error("Error converting stamp:", error);
        toast.error(t("userProfile.failedtoChange"));
      }
    }
  };

  const handleDoneClick = async () => {
    await onSubmit();
  };

  const handleCancel = () => {
    if (imageBlobUrl) {
      URL.revokeObjectURL(imageBlobUrl);
      setImageBlobUrl(null);
    }
    if (signatureBlobUrl) {
      URL.revokeObjectURL(signatureBlobUrl);
      setSignatureBlobUrl(null);
    }

    const timestamp = new Date().getTime();
    setDisplayedImage(userData.userPhotoPath ? `${userData.userPhotoPath}?t=${timestamp}` : Icons.Profile);
    setdisplaySignatureImg(userData.mySignaturePath ? `${userData.mySignaturePath}?t=${timestamp}` : Icons.SelfSign);
    setIsImageSelected(false);
    setIsSignatureSelected(false);
    setBase64Image(null);
    setBase64Signature(null);
    setImgError(false);
    setSigError(false);
    setFullNameInput(userData.fullName);

    if (userData.countryCode && userData.mobileNumber) {
      setPhoneNumber(userData.countryCode + userData.mobileNumber);
    } else if (userData.mobileNumber) {
      setPhoneNumber(userData.mobileNumber);
    } else {
      setPhoneNumber("");
    }

    setErrors({ fullName: "", phoneNumber: "" });
  };

  const handleNameCancel = () => {
    setFullNameInput(userData.fullName);

    // Reset phone number
    if (userData.countryCode && userData.mobileNumber) {
      setPhoneNumber(userData.countryCode + userData.mobileNumber);
    } else if (userData.mobileNumber) {
      setPhoneNumber(userData.mobileNumber);
    } else {
      setPhoneNumber("");
    }

    setShowSaveButton(false);
    setErrors({ fullName: "", phoneNumber: "" });
  };

  const closeImageModal = () => setShowImageModal(false);
  const openImageModal = async () => {
    if (userData.userPhotoPath && displayedImage !== Icons.Profile) {
      const isImageValid = await checkImageLoad(displayedImage);
      if (isImageValid) {
        setShowImageModal(true);
      }
    }
  };

  const closeSignatureModal = () => setShowSignatureModal(false);
  const openSignatureModal = async () => {
    if (userData.mySignaturePath && displaySignatureImg !== Icons.SelfSign) {
      const isImageValid = await checkImageLoad(displaySignatureImg);
      if (isImageValid) {
        setShowSignatureModal(true);
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "fullName") {
      setFullNameInput(value);
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, fullName: t("userProfile.fullNameRequired") }));
      } else if (value.trim().length > 25) {
        setErrors((prev) => ({ ...prev, fullName: t("userProfile.fullNameMaxChars") }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, fullName: t("userProfile.fullNameInvalid") }));
      } else {
        setErrors((prev) => ({ ...prev, fullName: "" }));
      }
    } else if (field === "phoneNumber") {
      setPhoneNumber(value);
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, phoneNumber: t("userProfile.mobileNumberRequired") }));
      } else if (value.length < 10) {
        setErrors((prev) => ({ ...prev, phoneNumber: t("userProfile.mobileNumberInvalid") }));
      } else {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }

    setShowSaveButton(hasValidChanges());
  };

  return (
    <div className='profile-page container-fluid my-3'>
      <div className='userProfile-form mb-2'>
          <div className='profile-page-heading profile-section-title d-flex align-items-center gap-3 mb-3'>
            <span className='profile-section-icon' aria-hidden='true'>
              <Icons.EditProfile size={21} />
            </span>
            <h1 className='profile-section-label'>{t("userProfile.desprofile")}</h1>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className='g-3 mb-3'>
            <Col xs={12} lg={6}>
              <div className='profile-Form h-100'>
                <div className='d-flex flex-column gap-2'>
                  {displayedImage && (
                    <div onClick={openImageModal} style={{ cursor: "pointer" }}>
                      {!imgError && typeof displayedImage === "string" ? (
                        <img src={displayedImage} alt='displayedImage' className='Imageshown' onError={() => setImgError(true)} />
                      ) : (
                        <div
                          className='Imageshown d-flex align-items-center justify-content-center'
                          
                        >
                          <Icons.Profile size={18} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className='d-flex flex-column'>
                    <Form.Label className='fs-5 fw-semibold'>{userData.fullName || "Full Name"}</Form.Label>
                    <Form.Label>{t("userProfile.uploadProfileImage")}</Form.Label>
                  </div>
                </div>
                <Form.Label className='uploadProfilebtn' htmlFor='accountLogoImg'>
                  <Form.Control id='accountLogoImg' style={{ display: "none" }} name='accountLogoImg' accept='.jpg, .jpeg, .png' type='file' onChange={handleImageChange} />
                  {t("userProfile.uploadProfile")}
                </Form.Label>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <div className='profile-Form h-100'>
                <div className='d-flex flex-column gap-2'>
                  {displaySignatureImg && (
                    <div onClick={openSignatureModal} style={{ cursor: "pointer" }}>
                      {!sigError && typeof displaySignatureImg === "string" ? (
                        <img src={displaySignatureImg} alt='displaySignatureImg' className='Imageshown' onError={() => setSigError(true)} />
                      ) : (
                        <div
                          className='Imageshown d-flex align-items-center justify-content-center'
                        >
                          <Icons.SelfSign size={18} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className='d-flex flex-column'>
                    <Form.Label className='fs-5 fw-semibold'>{t("userProfile.MySignature")}</Form.Label>
                    <Form.Label>{t("userProfile.uploadSignatureImage")}</Form.Label>
                  </div>
                </div>
                <Form.Label className='uploadProfilebtn' htmlFor='CompanyStampFile'>
                  {t("userProfile.uploadSignature")}
                  <Form.Control id='CompanyStampFile' style={{ display: "none" }} name='CompanyStampFile' accept='.jpg, .jpeg, .png' type='file' onChange={handleStampImageChange} />
                </Form.Label>
              </div>
            </Col>
          </Row>

          <div className='d-flex gap-2 justify-content-start my-2'>
            {isImageSelected || isSignatureSelected ? (
              <>
                <Button variant='none' onClick={handleDoneClick} className='ImageDoneBtn' disabled={isSavingAssets}>
                  {isSavingAssets && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
                  {t("userProfile.save")}
                </Button>
                <Button variant='none' onClick={handleCancel} className='ImageCancelBtn' disabled={isSavingAssets}>
                  {t("userProfile.cancel")}
                </Button>
              </>
            ) : null}
          </div>

          <Row className='g-3'>
            <Col xs={12} sm={6} lg={4}>
              <Form.Group controlId='fullName'>
                <Form.Label>
                  {t("logScreens.name")}
                  <span className='text-danger mx-1'>*</span>
                </Form.Label>
                <Form.Control
                  type='text'
                  value={fullNameInput}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={t("userProfile.enterFullName")}
                />
                {errors.fullName && <div className='text-danger'>{errors.fullName}</div>}
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Form.Group controlId='phoneNumber'>
                <Form.Label>
                  {t("logScreens.mobileNumber")}
                  <span className='text-danger mx-1'>*</span>
                </Form.Label>
                <PhoneInput
                  country={"sa"}
                  excludeCountries={["il"]}
                  value={phoneNumber}
                  onChange={(phone) => handleInputChange("phoneNumber", phone)}
                  containerClass='phone-input-container profile-phone-input'
                />
                {errors.phoneNumber && <div className='text-danger'>{errors.phoneNumber}</div>}
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Form.Group controlId='emailID'>
                <Form.Label>{t("userProfile.emailAdd")}</Form.Label>
                <Form.Control type='text' value={userData.emailID} disabled />
              </Form.Group>
            </Col>
          </Row>
        </Form>

        {showSaveButton && (
          <div className='d-flex gap-3 mt-3'>
            <Button variant='none' onClick={handleNameSave} className='ImageDoneBtn' disabled={isSavingDetails || !fullNameInput.trim() || !/^[a-zA-Z\s]+$/.test(fullNameInput)}>
              {isSavingDetails && <Spinner animation='border' size='sm' className='inline-button-spinner' aria-hidden='true' />}
              {t("userProfile.update")}
            </Button>
            <Button variant='none' onClick={handleNameCancel} className='ImageCancelBtn' disabled={isSavingDetails}>
              {t("userProfile.cancel")}
            </Button>
          </div>
        )}
      </div>
      {userAccess.delegation === true ? (
        <>
          <Delegation />
        </>
      ) : (
        <></>
      )}

      <div className='mt-3'>
        <Accordion className='profile-accordion password-accordion' defaultActiveKey='0'>
          <Accordion.Item eventKey='2'>
            <Accordion.Header>
              <div className='profile-section-title d-flex align-items-center gap-3'>
                <span className='profile-section-icon' aria-hidden='true'>
                  <Icons.Lock size={20} />
                </span>
                <span className='profile-section-label'>{t("userProfile.changePassword")}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <PasswordChange />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      <Modal show={showImageModal} onHide={closeImageModal} centered dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <Modal.Title>{t("userProfile.desprofile")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='d-flex justify-content-center'>
          {!imgError && typeof displayedImage === "string" ? (
            <img
              src={displayedImage}
              alt='Profile'
              className='profile-image-preview'
              onError={() => setImgError(true)}
            />
          ) : (
            <div className='profile-image-placeholder'>
              <Icons.Profile size={200} />
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showSignatureModal} onHide={closeSignatureModal} centered dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <Modal.Title>{t("userProfile.MySignature")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='d-flex justify-content-center'>
          {!sigError && typeof displaySignatureImg === "string" ? (
            <img
              src={displaySignatureImg}
              alt='Signature'
              className='profile-image-preview'
              onError={() => setSigError(true)}
            />
          ) : (
            <div className='profile-image-placeholder'>
              <Icons.SelfSign size={200} />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default UserProfile;
