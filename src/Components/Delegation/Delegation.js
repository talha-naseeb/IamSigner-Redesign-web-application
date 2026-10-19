import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form, Accordion, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useUser } from "@/Context/UserContext";
import { useTranslation } from "react-i18next";
import ReactSwitch from "react-switch";
import Loader from "@/Components/CommonModals/Loader/Loader";
import PhoneInput from "react-phone-input-2";
import { Icons } from "@/assets/Icons";
import "react-phone-input-2/lib/style.css";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import userService from "@/services/userService";
import "./style.css";

function Delegation() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const { user, userAccess } = useUser();
  const [delegateData, setDelegateData] = useState(null);
  const [activeDelegate, setActiveDelegate] = useState(false);
  const [buttonHide, setButtonHide] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [themeColor, setThemeColor] = useState("#7357dc");
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    // Get the computed CSS variable value
    const root = getComputedStyle(document.documentElement);
    const color = root.getPropertyValue("--theme-color").trim();
    if (color) setThemeColor(color);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
  } = useForm({
    defaultValues: {
      DelegatedFromEmails: user.email,
      DelegatedToEmail: "",
      DelegatedToPhone: "",
      StartDate: "",
      EndDate: "",
    },
  });

  const handleToggleChange = (isChecked) => {
    setActiveDelegate(isChecked);
    ActivateDelegation(isChecked);
  };

  const CreateDelegation = async (data) => {
    try {
      // Extract country code and phone number from the combined phone input
      const countryCode = phoneNumber.substring(0, phoneNumber.length - 10); // Assuming 10 digits for mobile
      const mobileNumber = phoneNumber.substring(phoneNumber.length - 10);

      const delegationData = {
        ...data,
        DelegatedToCountryCode: countryCode,
        DelegatedToPhone: mobileNumber,
      };

      const response = await userService.createDelegation(delegationData);
      if (response.data.statusCode === "1") {
        toast.success(t("delegation.delegationCreated"));
        reset({
          DelegatedFromEmails: user.email,
          DelegatedToEmail: "",
          DelegatedToPhone: "",
          StartDate: "",
          EndDate: "",
        });
        setPhoneNumber("");
        setButtonHide(false);
        getDelegation();
      } else {
        toast.error(t("delegation.failedcreated"));
      }
    } catch (error) {
      console.error("Error creating delegation.");
    }
  };

  const ActivateDelegation = async (isChecked) => {
    try {
      const response = await userService.activateDelegation({ SignDelegateID: delegateData.signDelegateID, IsActive: isChecked });

      if (response.data.response === true) {
        toast.success(t("delegation.delegationActivated"));
        getDelegation();
      } else if (response.data.response === false) {
        toast.success(t("delegation.SuccessFullyDeactivate"));
        getDelegation();
      } else {
        toast.error(t("delegation.errorActivate"));
      }
    } catch (error) {
      console.error(t("delegation.errorActivate"));
      setIsLoading(false);
    }
  };

  const getDelegation = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getDelegation();
      if (response.data.statusCode === "1") {
        const userInfo = response.data.response;
        setDelegateData(userInfo);
        setValue("DelegatedFromEmails", userInfo.delegatedFromEmails);
        setValue("DelegatedToEmail", userInfo.delegatedToEmail);
        setValue("DelegatedToPhone", userInfo.delegatedToPhone);
        setActiveDelegate(userInfo.isActive);

        // Set phone number with country code
        if (userInfo.delegatedToCountryCode && userInfo.delegatedToPhone) {
          setPhoneNumber(userInfo.delegatedToCountryCode + userInfo.delegatedToPhone);
        } else if (userInfo.delegatedToPhone) {
          setPhoneNumber(userInfo.delegatedToPhone);
        } else {
          setPhoneNumber("");
        }

        // Set date range for picker
        if (userInfo.startDate && userInfo.endDate) {
          setDateRange([new DateObject(userInfo.startDate), new DateObject(userInfo.endDate)]);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setIsLoading(true);

      // Extract country code and phone number from the combined phone input
      const countryCode = phoneNumber.substring(0, phoneNumber.length - 10); // Assuming 10 digits for mobile
      const mobileNumber = phoneNumber.substring(phoneNumber.length - 10);

      const updateData = {
        ...data,
        SignDelegateID: delegateData.signDelegateID,
        DelegatedToCountryCode: countryCode,
        DelegatedToPhone: mobileNumber,
      };

      const response = await userService.updateDelegation(updateData);
      if (response.data.statusCode === "1") {
        toast.success(t("delegation.successUpdate"));
      }
      setButtonHide(false);
      getDelegation();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setValue("DelegatedFromEmails", user.email);
  }, [user.email, setValue]);

  useEffect(() => {
    getDelegation();
  }, []);

  const handlePhoneChange = (phone) => {
    setPhoneNumber(phone);
    setButtonHide(true);

    // Clear phone validation errors when user starts typing
    if (phone.length >= 10) {
      clearErrors("DelegatedToPhone");
    }
  };

  const handleCancel = () => {
    reset({
      DelegatedFromEmails: delegateData?.delegatedFromEmails || user.email,
      DelegatedToEmail: delegateData?.delegatedToEmail || "",
      DelegatedToPhone: delegateData?.delegatedToPhone || "",
      StartDate: delegateData?.startDate.slice(0, 10) || "",
      EndDate: delegateData?.endDate.slice(0, 10) || "",
    });

    // Reset date range
    if (delegateData?.startDate && delegateData?.endDate) {
      setDateRange([new DateObject(delegateData.startDate), new DateObject(delegateData.endDate)]);
    } else {
      setDateRange([]);
    }

    // Reset phone number
    if (delegateData?.delegatedToCountryCode && delegateData?.delegatedToPhone) {
      setPhoneNumber(delegateData.delegatedToCountryCode + delegateData.delegatedToPhone);
    } else if (delegateData?.delegatedToPhone) {
      setPhoneNumber(delegateData.delegatedToPhone);
    } else {
      setPhoneNumber("");
    }

    setButtonHide(false);
  };

  const handleClearAndCancel = () => {
    reset({
      DelegatedFromEmails: user.email,
      DelegatedToEmail: "",
      DelegatedToPhone: "",
      StartDate: "",
      EndDate: "",
    });
    setPhoneNumber("");
    setDateRange([]);
    setButtonHide(false);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setButtonHide(true);
    if (dates && dates.length === 2) {
      setValue("StartDate", dates[0].format("YYYY-MM-DD"), { shouldValidate: true });
      setValue("EndDate", dates[1].format("YYYY-MM-DD"), { shouldValidate: true });
      clearErrors(["StartDate", "EndDate"]);
    } else {
      setValue("StartDate", "", { shouldValidate: true });
      setValue("EndDate", "", { shouldValidate: true });
    }
  };

  const currentDateExpiry = new Date().toISOString().split("T")[0];

  return (
    <div className='delegation-section my-3 p-0'>
      {userAccess.remainingDays <= 0 ? (
        <></>
      ) : (
        <>
          <Accordion className='delegation-accordion' defaultActiveKey='0'>
            <Accordion.Item eventKey='2'>
              <Accordion.Header>
                <div className='profile-section-title d-flex align-items-center gap-3'>
                  <span className='profile-section-icon' aria-hidden='true'>
                    <Icons.Mail size={20} />
                  </span>
                  <span className='profile-section-label'>{t("userProfile.Delegation")}</span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {isLoading && (
                  <div className='loader-overlay'>
                    <Loader />
                  </div>
                )}

                <Form className='my-3' onSubmit={handleSubmit(delegateData ? handleUpdate : CreateDelegation)}>
                  <Row className='g-3 mb-3'>
                    <Col xs={12} md={6} xl={4}>
                      <Form.Group controlId='DelegationRange'>
                        <Form.Label>
                          {t("userProfile.DelegationPeriod")}
                          <span className='text-danger mx-1'>*</span>
                        </Form.Label>
                        <DateRangePicker
                          value={dateRange}
                          onChange={handleDateChange}
                          minDate={delegateData?.startDate ? Math.min(new Date(delegateData.startDate).getTime(), new Date().setHours(0, 0, 0, 0)) : new Date().setHours(0, 0, 0, 0)}
                          isInvalid={!!errors.StartDate || !!errors.EndDate}
                          errorMessage={errors.StartDate?.message || errors.EndDate?.message}
                          containerClassName='delegation-date-picker'
                        />
                      </Form.Group>
                      {/* Hidden fields for react-hook-form registration */}
                      <input type='hidden' {...register("StartDate", { required: t("userProfile.startDateRequired") })} />
                      <input type='hidden' {...register("EndDate", { required: t("userProfile.endDateRequired") })} />
                    </Col>
                  </Row>

                  <Row className='g-3 align-items-end'>
                    <Col xs={12} md={6} xl={4}>
                      <Form.Group controlId='DelegatedToEmail'>
                        <Form.Label>
                          {t("userProfile.DelegatedEmail")}
                          <span className='text-danger mx-1'>*</span>
                        </Form.Label>
                        <Form.Control
                          type='email'
                          placeholder={t("userProfile.DelegatedEmail")}
                          {...register("DelegatedToEmail", {
                            required: t("userProfile.emailRequired"),
                            pattern: {
                              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                              message: t("userProfile.invalidEmail"),
                            },
                          })}
                          onChange={() => setButtonHide(true)}
                        />
                        {errors.DelegatedToEmail && <div className='text-danger'>{errors.DelegatedToEmail.message}</div>}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6} xl={4}>
                      <Form.Group controlId='DelegatedToPhone'>
                        <Form.Label>
                          {t("logScreens.mobileNumber")}
                          <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
                        </Form.Label>
                        <PhoneInput
                          excludeCountries={["il"]}
                          country={"sa"}
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                        />
                        {phoneNumber && phoneNumber.length < 10 && <div className='text-danger'>{t("userProfile.invalidPhone")}</div>}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6} xl={4}>
                      <div className='d-flex align-items-center gap-2 mt-4'>
                        <span className='password-protected'>{t("userProfile.ActivateDelegation")}</span>
                        <ReactSwitch
                          checked={activeDelegate}
                          onChange={handleToggleChange}
                          onColor={themeColor}
                          onHandleColor='#ffffff'
                          handleDiameter={15}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          height={20}
                          width={50}
                        />
                      </div>
                    </Col>
                  </Row>

                  {delegateData === null
                    ? buttonHide && (
                        <div className='d-flex gap-2 justify-content-start my-2'>
                          <Button variant='none' className='ImageDoneBtn' type='submit'>
                            {t("userProfile.save")}
                          </Button>
                          <Button variant='none' className='ImageCancelBtn' onClick={handleClearAndCancel}>
                            {t("userProfile.cancel")}
                          </Button>
                        </div>
                      )
                    : buttonHide && (
                        <div className='d-flex gap-2 justify-content-start my-2'>
                          <Button variant='none' className='ImageDoneBtn' type='submit'>
                            {t("userProfile.update")}
                          </Button>
                          <Button variant='none' className='ImageCancelBtn' onClick={handleCancel}>
                            {t("userProfile.cancel")}
                          </Button>
                        </div>
                      )}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </>
      )}
    </div>
  );
}

export default Delegation;
