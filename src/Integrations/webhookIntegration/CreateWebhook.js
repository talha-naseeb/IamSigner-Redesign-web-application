import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, Accordion, Container, Row, Col } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import IntegrationAuth from "@/Integrations/IntegationAuth/IntegrationAuth";
import AppSwitch from "@/Components/Common/AppSwitch/AppSwitch";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";

function CreateWebhook() {
  const { user, userAccess } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showWebhookData, setShowWebhookData] = useState(null);
  const [activeWebhook, setActiveWebhook] = useState(false);
  const [configData, setConfigData] = useState(null);
  const [themeColor, setThemeColor] = useState("#7357dc");
  const { t } = useTranslation();

  useEffect(() => {
    // Get the computed CSS variable value
    const root = getComputedStyle(document.documentElement);
    const color = root.getPropertyValue("--theme-color").trim();
    if (color) setThemeColor(color);
  }, []);

  const [formValues, setFormValues] = useState({
    AccountID: user.AccountID,
    AppName: "",
    Description: "",
    URL: "",
    ActionMethod: "",
    IsBasicAuthentication: false,
    Username: "",
    Password: "",
    IsPendingDocsRequired: false,
    IsSupportingDocsRequired: false,
    IsCompletedDocsRequired: false,
    IsAuditTrailDocument: false,
    IsCompletedStatus: false,
    IsDeclinedStatus: false,
    IsViewedStatus: false,
    IsSignedStatus: false,
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleCancel = () => {
    setFormValues({
      AppName: showWebhookData.appName,
      Description: showWebhookData.description,
      URL: showWebhookData.url,
      ActionMethod: showWebhookData.actionMethod,
      IsBasicAuthentication: showWebhookData.isBasicAuthentication,
      Username: showWebhookData.username,
      Password: showWebhookData.password,
      IsPendingDocsRequired: showWebhookData.isPendingDocsRequired,
      IsSupportingDocsRequired: showWebhookData.isSupportingDocsRequired,
      IsCompletedDocsRequired: showWebhookData.isCompletedDocsRequired,
      IsAuditTrailDocument: showWebhookData.isAuditTrailDocument,
      IsCompletedStatus: showWebhookData.isCompletedStatus,
      IsDeclinedStatus: showWebhookData.isDeclinedStatus,
      IsViewedStatus: showWebhookData.isViewedStatus,
      IsSignedStatus: showWebhookData.isSignedStatus,
    });
    setFormSubmitted(true);
  };

  const resetValue = () => {
    setFormValues({
      AccountID: user.AccountID,
      AppName: "",
      Description: "",
      URL: "",
      ActionMethod: "",
      IsBasicAuthentication: false,
      Username: "",
      Password: "",
      IsPendingDocsRequired: false,
      IsSupportingDocsRequired: false,
      IsCompletedDocsRequired: false,
      IsAuditTrailDocument: false,
      IsCompletedStatus: false,
      IsDeclinedStatus: false,
      IsViewedStatus: false,
      IsSignedStatus: false,
    });
    setFormSubmitted(true);
  };

  const [filledFields, setFilledFields] = useState({
    AppName: false,
    Description: false,
    URL: false,
    ActionMethod: false,
    Password: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFilledFields({ ...filledFields, [name]: !!value });
    setFormSubmitted(false);
  };

  const isFormValid = Object.values(filledFields).some((field) => field);

  //create webhook api
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await integrationService.createWebhookIntegration(formValues);

      if (response.data.response === "Webhook created successfully.") {
        toast.success(t("webhookIntegration.webhookCreate"));
      } else if (response.data.response === "Webhook with the same Account already exists.") {
        toast.info(t("webhookIntegration.webhookExits"));
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error(t("webhookIntegration.webhookErr"));
    }
  };

  //get webhook api
  const GetWebhookIntegration = async () => {
    try {
      if (!user.AccountID) {
        return;
      }
      const response = await integrationService.getWebhookIntegration(user.AccountID);
      if (response.data.statusCode === "7") {
        resetValue();
      } else if (response.data.statusCode === "1") {
        const webhookData = response.data.response;
        setShowWebhookData(webhookData);

        setFormValues({
          AppName: webhookData.appName,
          Description: webhookData.description,
          URL: webhookData.url,
          ActionMethod: webhookData.actionMethod,
          IsBasicAuthentication: webhookData.isBasicAuthentication,
          Username: webhookData.username,
          Password: webhookData.password,
          // IsPendingDocsRequired: webhookData.isPendingDocsRequired,
          IsSupportingDocsRequired: webhookData.isSupportingDocsRequired,
          IsCompletedDocsRequired: webhookData.isCompletedDocsRequired,
          IsAuditTrailDocument: webhookData.isAuditTrailDocument,
          IsCompletedStatus: webhookData.isCompletedStatus,
          IsDeclinedStatus: webhookData.isDeclinedStatus,
          IsViewedStatus: webhookData.isViewedStatus,
          IsSignedStatus: webhookData.isSignedStatus,
        });
        setActiveWebhook(webhookData.isActive);
      }
    } catch (error) {
      console.error("Error fetching webhook data:", error);
    }
  };

  //get integration configuration api
  const GetIntegrationConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await integrationService.getIntegrationConfig();
      if (response.data.statusCode === "1") {
        setConfigData(response.data.response);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(t("webhookIntegration.errFetchingWebhook"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetWebhookIntegration();
    GetIntegrationConfiguration();
  }, [user, userAccess]);

  //update webhook api
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.updateWebhookIntegration({
        ...formValues,
        AccountID: user.AccountID,
      });
      if (response.data.statusCode === "1") {
        toast.success("Webhook Updated Successfully!");
        setFormSubmitted(true);
      }
      setIsLoading(false);
      GetWebhookIntegration();
    } catch (error) {
      console.error("Error updating webhook:", error);
      setIsLoading(false);
      toast.error(t("webhookIntegration.errWebhookUpdate"));
    } finally {
      setIsLoading(false);
    }
  };

  //Active & Deactive api
  const handleActivateWebhook = async (isChecked) => {
    setIsLoading(true);
    try {
      const response = await integrationService.updateWebhookIntegrationStatus({
        AccountID: user.AccountID,
        IsActive: isChecked,
      });
      if (response.data.message === "Webhook integration activated successfully.") {
        toast.success(t("webhookIntegration.activatWebhook"));
      } else if (response.data.message === "Webhook integration deactivated successfully.") {
        toast.success(t("webhookIntegration.deactiveWebhook"));
      }
      setIsLoading(false);
      GetWebhookIntegration();
    } catch (error) {
      console.error("Error updating webhook status:", error);
      toast.error(t("webhookIntegration.errWebhookUpdate"));
      setIsLoading(false);
    }
  };

  const handleToggleChange = (isChecked) => {
    setActiveWebhook(isChecked);
    handleActivateWebhook(isChecked);
  };

  return (
    <>
      {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays > 0 ? (
        <Container>
          {userAccess.integrations === true ? (
            <>
              <div className='mt-3'>
                <IntegrationAuth />
              </div>
            </>
          ) : (
            <></>
          )}

          {userAccess.webhookIntegration === true ? (
            <>
              <div className='my-3'>
                <Accordion defaultActiveKey='0' className='accordion'>
                  <Accordion.Item eventKey='2'>
                    <Accordion.Header>
                      <div className='d-flex align-items-center gap-3'>
                        <Icons.Webhook size={24} />
                        <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("webhookIntegration.createWebhookApi")}</label>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <Form className='my-3' onSubmit={handleSubmit}>
                        <Row className='mb-2'>
                          <Col md={6}>
                            <Form.Group controlId='AppName'>
                              <Form.Label>{t("webhookIntegration.appName")}</Form.Label>
                              <Form.Control type='text' name='AppName' value={formValues.AppName} onChange={handleChange} required />
                            </Form.Group>
                          </Col>

                          <Col md={6} className='mb-2'>
                            <Form.Group controlId='URL'>
                              <Form.Label>{t("webhookIntegration.url")}</Form.Label>
                              <Form.Control type='text' name='URL' value={formValues.URL} onChange={handleChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6} className='mb-2'>
                            <Form.Group controlId='ActionMethod'>
                              <Form.Label>{t("webhookIntegration.ActionMethod")}</Form.Label>
                              <Form.Select name='ActionMethod' value={formValues.ActionMethod} onChange={handleChange} required>
                                <option value='' disabled>
                                  {t("webhookIntegration.selectActionMethod")}
                                </option>
                                <option value='POST'>{t("webhookIntegration.post")}</option>
                                <option value='PUT'>{t("webhookIntegration.put")}</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={6} className='mb-2'>
                            <Form.Group controlId='Description'>
                              <Form.Label>{t("webhookIntegration.Description")}</Form.Label>
                              <Form.Control as='textarea' rows={3} name='Description' value={formValues.Description} onChange={handleChange} required />
                            </Form.Group>
                          </Col>

                          <div className='d-flex mt-3 gap-5 '>
                            <Form.Group controlId='IsBasicAuthentication' className='mb-3'>
                              <Form.Check type='checkbox' label={t("webhookIntegration.basicAuth")} name='IsBasicAuthentication' checked={formValues.IsBasicAuthentication} onChange={handleChange} />
                            </Form.Group>

                            <div style={{ display: "flex", gap: "10px", marginTop: "3px" }}>
                              <AppSwitch
                                id='webhook-active-toggle'
                                checked={activeWebhook}
                                onChange={handleToggleChange}
                                onColor={themeColor}
                                onHandleColor='#ffffff'
                                handleDiameter={15}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={50}
                              />
                              <label className='password-protected' htmlFor='webhook-active-toggle'>{activeWebhook ? t("webhookIntegration.active") : t("webhookIntegration.deactivate")}</label>
                            </div>
                          </div>

                          {formValues.IsBasicAuthentication && (
                            <>
                              <Col md={6} className='mb-2'>
                                <Form.Group controlId='Username'>
                                  <Form.Label>{t("webhookIntegration.userName")} </Form.Label>
                                  <Form.Control type='text' name='Username' value={formValues.Username} onChange={handleChange} />
                                </Form.Group>
                              </Col>

                              <Col md={6} className='mb-2'>
                                <Form.Group controlId='Password'>
                                  <Form.Label>{t("webhookIntegration.Password")}</Form.Label>
                                  <div className='password-input'>
                                    <Form.Control type={showNewPassword ? "text" : "password"} name='Password' value={formValues.Password} onChange={handleChange} />
                                    <span className='toggle-password' onClick={() => setShowNewPassword(!showNewPassword)}>
                                      {showNewPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </span>
                                  </div>
                                  {newPasswordError && <Form.Text className='text-danger'>{newPasswordError}</Form.Text>}
                                </Form.Group>
                              </Col>
                            </>
                          )}

                          <hr className='mt-3' />

                          <Row>
                            <div className='d-flex align-items-center gap-3 mb-3'>
                              <Icons.BulkDocuments size={24} />
                              <label style={{ fontWeight: "500", fontSize: "20px" }}>{t("webhookIntegration.RequiredUpdates")}</label>
                            </div>

                            {/* <Col md={3}>
                              <Form.Group controlId='IsPendingDocsRequired' className='mb-3'>
                                <Form.Check
                                  type='checkbox'
                                  label={t("webhookIntegration.pendingDocs")}
                                  name='IsPendingDocsRequired'
                                  checked={formValues.IsPendingDocsRequired}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col> */}
                            <Col md={3}>
                              <Form.Group controlId='IsSupportingDocsRequired' className='mb-3'>
                                <Form.Check
                                  type='checkbox'
                                  label={t("webhookIntegration.supportedDocs")}
                                  name='IsSupportingDocsRequired'
                                  checked={formValues.IsSupportingDocsRequired}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsCompletedDocsRequired' className='mb-3'>
                                <Form.Check
                                  type='checkbox'
                                  label={t("webhookIntegration.CompletedDocs")}
                                  name='IsCompletedDocsRequired'
                                  checked={formValues.IsCompletedDocsRequired}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsAuditTrailDocument' className='mb-3'>
                                <Form.Check type='checkbox' label={t("webhookIntegration.auditTrail")} name='IsAuditTrailDocument' checked={formValues.IsAuditTrailDocument} onChange={handleChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsCompletedStatus' className='mb-3'>
                                <Form.Check type='checkbox' label={t("webhookIntegration.completedStatus")} name='IsCompletedStatus' checked={formValues.IsCompletedStatus} onChange={handleChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsDeclinedStatus' className='mb-3'>
                                <Form.Check type='checkbox' label={t("webhookIntegration.declinedStatus")} name='IsDeclinedStatus' checked={formValues.IsDeclinedStatus} onChange={handleChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsViewedStatus' className='mb-3'>
                                <Form.Check type='checkbox' label={t("webhookIntegration.viewedStatus")} name='IsViewedStatus' checked={formValues.IsViewedStatus} onChange={handleChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId='IsSignedStatus' className='mb-3'>
                                <Form.Check type='checkbox' label={t("webhookIntegration.signedStatus")} name='IsSignedStatus' checked={formValues.IsSignedStatus} onChange={handleChange} />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Row>

                        {configData && (
                          <div>
                            <div className='d-flex align-items-center gap-3 mb-3'>
                              <Icons.InfoOutline size={25} />
                              <label style={{ fontWeight: "500", fontSize: "20px" }}>{t("webhookIntegration.webhookInfo")}</label>
                            </div>

                            <Form>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className='mb-3' controlId='apiDocumentationLink'>
                                    <Form.Label style={{ fontSize: "16px" }}>{t("webhookIntegration.webhookReq")}</Form.Label>
                                    <Form.Control as='textarea' rows={3} value={configData.webhookReqParams} readOnly />
                                  </Form.Group>
                                </Col>

                                <Col md={6}>
                                  <Form.Group className='mb-3' controlId='webhookReqParamGuideline'>
                                    <Form.Label style={{ fontSize: "16px" }}>{t("webhookIntegration.webhookGuidline")}</Form.Label>
                                    <Form.Control as='textarea' rows={3} value={configData.webhookReqParamGuideline} readOnly />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Form>
                          </div>
                        )}

                        {showWebhookData === null ? (
                          <>
                            {isFormValid && !formSubmitted && (
                              <div className='d-flex gap-3'>
                                <Button className='ImageDoneBtn' type='submit'>
                                  {t("webhookIntegration.create")}
                                </Button>

                                <Button className='ImageCancelBtn' onClick={resetValue}>
                                  {t("webhookIntegration.cancel")}
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {isFormValid && !formSubmitted && (
                              <div className='d-flex gap-3'>
                                <Button className='ImageDoneBtn' onClick={handleUpdate}>
                                  {t("userProfile.update")}
                                </Button>

                                <Button className='ImageCancelBtn' onClick={handleCancel}>
                                  {t("webhookIntegration.cancel")}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </Form>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* <CreateSMSIntegration /> */}
        </Container>
      ) : (
        <>{null}</>
      )}
    </>
  );
}

export default CreateWebhook;
