import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, Accordion } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import IntegrationAuth from "@/Integrations/IntegationAuth/IntegrationAuth";
import AppSwitch from "@/Components/Common/AppSwitch/AppSwitch";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";
import {
  Webhook,
  Globe,
  Lock,
  Eye,
  EyeOff,
  BellRing,
  Info,
  Loader2,
} from "lucide-react";

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
    if (showWebhookData) {
      setFormValues({
        AccountID: user.AccountID,
        AppName: showWebhookData.appName || "",
        Description: showWebhookData.description || "",
        URL: showWebhookData.url || "",
        ActionMethod: showWebhookData.actionMethod || "",
        IsBasicAuthentication: Boolean(showWebhookData.isBasicAuthentication),
        Username: showWebhookData.username || "",
        Password: showWebhookData.password || "",
        IsPendingDocsRequired: Boolean(showWebhookData.isPendingDocsRequired),
        IsSupportingDocsRequired: Boolean(showWebhookData.isSupportingDocsRequired),
        IsCompletedDocsRequired: Boolean(showWebhookData.isCompletedDocsRequired),
        IsAuditTrailDocument: Boolean(showWebhookData.isAuditTrailDocument),
        IsCompletedStatus: Boolean(showWebhookData.isCompletedStatus),
        IsDeclinedStatus: Boolean(showWebhookData.isDeclinedStatus),
        IsViewedStatus: Boolean(showWebhookData.isViewedStatus),
        IsSignedStatus: Boolean(showWebhookData.isSignedStatus),
      });
    }
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

  const isFormValid =
    Boolean(formValues.AppName?.trim()) ||
    Boolean(formValues.URL?.trim()) ||
    Boolean(formValues.ActionMethod);

  // create webhook api
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setIsLoading(true);
      const response = await integrationService.createWebhookIntegration(formValues);

      if (response.data.response === "Webhook created successfully.") {
        toast.success(t("webhookIntegration.webhookCreate"));
        GetWebhookIntegration();
      } else if (response.data.response === "Webhook with the same Account already exists.") {
        toast.info(t("webhookIntegration.webhookExits"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("webhookIntegration.webhookErr"));
    } finally {
      setIsLoading(false);
    }
  };

  // get webhook api
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
          AccountID: user.AccountID,
          AppName: webhookData.appName || "",
          Description: webhookData.description || "",
          URL: webhookData.url || "",
          ActionMethod: webhookData.actionMethod || "",
          IsBasicAuthentication: Boolean(webhookData.isBasicAuthentication),
          Username: webhookData.username || "",
          Password: webhookData.password || "",
          IsPendingDocsRequired: Boolean(webhookData.isPendingDocsRequired),
          IsSupportingDocsRequired: Boolean(webhookData.isSupportingDocsRequired),
          IsCompletedDocsRequired: Boolean(webhookData.isCompletedDocsRequired),
          IsAuditTrailDocument: Boolean(webhookData.isAuditTrailDocument),
          IsCompletedStatus: Boolean(webhookData.isCompletedStatus),
          IsDeclinedStatus: Boolean(webhookData.isDeclinedStatus),
          IsViewedStatus: Boolean(webhookData.isViewedStatus),
          IsSignedStatus: Boolean(webhookData.isSignedStatus),
        });
        setActiveWebhook(Boolean(webhookData.isActive));
      }
    } catch (error) {
      console.error("Error fetching webhook data:", error);
    }
  };

  // get integration configuration api
  const GetIntegrationConfiguration = async () => {
    try {
      const response = await integrationService.getIntegrationConfig();
      if (response.data.statusCode === "1") {
        setConfigData(response.data.response);
      }
    } catch (error) {
      toast.error(t("webhookIntegration.errFetchingWebhook"));
    }
  };

  useEffect(() => {
    GetWebhookIntegration();
    GetIntegrationConfiguration();
  }, [user, userAccess]);

  // update webhook api
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.updateWebhookIntegration({
        ...formValues,
        AccountID: user.AccountID,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("webhookIntegration.webhookUpdate", "Webhook Updated Successfully!"));
        setFormSubmitted(true);
      }
      GetWebhookIntegration();
    } catch (error) {
      console.error("Error updating webhook:", error);
      toast.error(t("webhookIntegration.errWebhookUpdate"));
    } finally {
      setIsLoading(false);
    }
  };

  // Active & Deactive api
  const handleActivateWebhook = async (isChecked) => {
    try {
      setIsLoading(true);
      const response = await integrationService.updateWebhookIntegrationStatus({
        AccountID: user.AccountID,
        IsActive: isChecked,
      });
      if (response.data.message === "Webhook integration activated successfully.") {
        toast.success(t("webhookIntegration.activatWebhook"));
      } else if (response.data.message === "Webhook integration deactivated successfully.") {
        toast.success(t("webhookIntegration.deactiveWebhook"));
      }
      GetWebhookIntegration();
    } catch (error) {
      console.error("Error updating webhook status:", error);
      toast.error(t("webhookIntegration.errWebhookUpdate"));
    } finally {
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
        <div className='auth-integration-page w-full px-4 sm:px-6 pt-3 pb-8'>
          {userAccess.integrations === true && (
            <div className='mb-4'>
              <IntegrationAuth />
            </div>
          )}

          {userAccess.webhookIntegration === true && (
            <div className='mb-4'>
              <Accordion defaultActiveKey='0' className='integration-accordion'>
                <Accordion.Item eventKey='0'>
                  <Accordion.Header>
                    <div className='d-flex align-items-center gap-3 w-100 me-3'>
                      <div className='integration-icon-pill'>
                        <Webhook size={20} />
                      </div>
                      <div className='d-flex align-items-center justify-content-between flex-grow-1 flex-wrap gap-2'>
                        <div className='flex flex-col text-left rtl:text-right'>
                          <span className='font-semibold text-base text-[var(--modern-text)]'>
                            {t("webhookIntegration.createWebhookApi")}
                          </span>
                          <span className='text-xs text-[var(--modern-muted)] font-normal'>
                            {t(
                              "webhookIntegration.webhookSubtitle",
                              "Configure webhook endpoints and event triggers to receive real-time notifications"
                            )}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            activeWebhook
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : "bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-muted)]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              activeWebhook ? "bg-emerald-500" : "bg-[var(--modern-muted)]"
                            }`}
                          />
                          {activeWebhook ? t("webhookIntegration.active") : t("webhookIntegration.deactivate")}
                        </span>
                      </div>
                    </div>
                  </Accordion.Header>

                  <Accordion.Body>
                    <div className='space-y-6'>
                      {/* Section 1: Endpoint & Configuration */}
                      <div className='p-4 sm:p-5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
                        <div className='flex items-center justify-between flex-wrap gap-3 pb-3 mb-4 border-b border-[var(--modern-border)]'>
                          <div className='flex items-center gap-2.5'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                              <Globe size={16} />
                            </div>
                            <div>
                              <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                                {t("webhookIntegration.endpointConfig", "Endpoint Configuration")}
                              </h5>
                              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                                {t(
                                  "webhookIntegration.endpointSubtitle",
                                  "Specify the application name, target URL, and HTTP dispatch method"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Enable/Disable Toggle Pill */}
                          <div className='inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
                            <AppSwitch
                              id='webhook-active-toggle'
                              checked={activeWebhook}
                              onChange={handleToggleChange}
                              onColor={themeColor}
                              onHandleColor='#ffffff'
                              handleDiameter={16}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={22}
                              width={44}
                            />
                            <label
                              htmlFor='webhook-active-toggle'
                              className='text-xs font-semibold text-[var(--modern-text)] cursor-pointer m-0 select-none'
                            >
                              {activeWebhook ? t("webhookIntegration.active") : t("webhookIntegration.deactivate")}
                            </label>
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {/* App Name */}
                          <div>
                            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                              {t("webhookIntegration.appName")} <span className='text-rose-500'>*</span>
                            </label>
                            <Form.Control
                              type='text'
                              name='AppName'
                              value={formValues.AppName}
                              onChange={handleChange}
                              placeholder={t("AuthIntegration.EnterAppName", "e.g. My Webhook Application")}
                              required
                              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                            />
                          </div>

                          {/* Target URL */}
                          <div>
                            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                              {t("webhookIntegration.url")} <span className='text-rose-500'>*</span>
                            </label>
                            <Form.Control
                              type='url'
                              name='URL'
                              value={formValues.URL}
                              onChange={handleChange}
                              placeholder='https://api.yourdomain.com/webhook-endpoint'
                              required
                              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                            />
                          </div>

                          {/* HTTP Action Method */}
                          <div>
                            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                              {t("webhookIntegration.ActionMethod")} <span className='text-rose-500'>*</span>
                            </label>
                            <Form.Select
                              name='ActionMethod'
                              value={formValues.ActionMethod}
                              onChange={handleChange}
                              required
                              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                            >
                              <option value='' disabled>
                                {t("webhookIntegration.selectActionMethod")}
                              </option>
                              <option value='POST'>{t("webhookIntegration.post")}</option>
                              <option value='PUT'>{t("webhookIntegration.put")}</option>
                            </Form.Select>
                          </div>

                          {/* Description */}
                          <div className='md:col-span-2'>
                            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                              {t("webhookIntegration.Description")} <span className='text-rose-500'>*</span>
                            </label>
                            <Form.Control
                              as='textarea'
                              rows={2}
                              name='Description'
                              value={formValues.Description}
                              onChange={handleChange}
                              placeholder={t(
                                "coBranding.enterDescription",
                                "Provide a brief description of this webhook integration"
                              )}
                              required
                              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors resize-none'
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Basic Authentication Security */}
                      <div className='p-4 sm:p-5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
                        <div className='flex items-center justify-between flex-wrap gap-3 pb-3 mb-4 border-b border-[var(--modern-border)]'>
                          <div className='flex items-center gap-2.5'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                              <Lock size={16} />
                            </div>
                            <div>
                              <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                                {t("webhookIntegration.authSection", "Authentication Security")}
                              </h5>
                              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                                {t(
                                  "webhookIntegration.authSectionDesc",
                                  "Optionally configure HTTP Basic Authentication credentials for webhook requests"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Checkbox trigger card */}
                          <label
                            htmlFor='IsBasicAuthentication'
                            className='inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] cursor-pointer select-none hover:border-[var(--theme-color)] transition-colors'
                          >
                            <input
                              type='checkbox'
                              id='IsBasicAuthentication'
                              name='IsBasicAuthentication'
                              checked={formValues.IsBasicAuthentication}
                              onChange={handleChange}
                              className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                            />
                            <span className='text-xs font-semibold text-[var(--modern-text)]'>
                              {t("webhookIntegration.basicAuth")}
                            </span>
                          </label>
                        </div>

                        {formValues.IsBasicAuthentication ? (
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'>
                            {/* Username */}
                            <div>
                              <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                                {t("webhookIntegration.userName")}
                              </label>
                              <Form.Control
                                type='text'
                                name='Username'
                                value={formValues.Username}
                                onChange={handleChange}
                                placeholder={t("webhookIntegration.enterUserName", "Username")}
                                className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                              />
                            </div>

                            {/* Password with inline toggle eye icon */}
                            <div>
                              <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                                {t("webhookIntegration.Password")}
                              </label>
                              <div className='relative flex items-center'>
                                <Form.Control
                                  type={showNewPassword ? "text" : "password"}
                                  name='Password'
                                  value={formValues.Password}
                                  onChange={handleChange}
                                  placeholder='••••••••••••'
                                  className='w-full px-3.5 py-2 pe-10 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                                />
                                <button
                                  type='button'
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className='absolute end-3 top-1/2 -translate-y-1/2 text-[var(--modern-muted)] hover:text-[var(--modern-text)] transition-colors p-1'
                                  tabIndex={-1}
                                  aria-label='Toggle password visibility'
                                >
                                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              {newPasswordError && (
                                <p className='text-xs text-rose-500 mt-1 m-0'>{newPasswordError}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className='text-xs text-[var(--modern-muted)] m-0 py-1'>
                            {t(
                              "webhookIntegration.noAuthNotice",
                              "Basic authentication is disabled. Webhook payloads will be sent without an Authorization header."
                            )}
                          </p>
                        )}
                      </div>

                      {/* Section 3: Event Subscriptions & Trigger Updates ("Required Updates") */}
                      <div className='p-4 sm:p-5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
                        <div className='flex items-center gap-2.5 pb-3 mb-4 border-b border-[var(--modern-border)]'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                            <BellRing size={16} />
                          </div>
                          <div>
                            <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                              {t("webhookIntegration.RequiredUpdates")}
                            </h5>
                            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                              {t(
                                "webhookIntegration.eventTriggersDesc",
                                "Select which document events should trigger a webhook dispatch"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Document Event Checkboxes Grid */}
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2.5'>
                              {t("webhookIntegration.documentArtifacts", "Document Artifact Events")}
                            </label>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                              {/* Supporting Docs */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsSupportingDocsRequired
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsSupportingDocsRequired'
                                  checked={formValues.IsSupportingDocsRequired}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.supportedDocs")}
                                </span>
                              </label>

                              {/* Completed Docs */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsCompletedDocsRequired
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsCompletedDocsRequired'
                                  checked={formValues.IsCompletedDocsRequired}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.CompletedDocs")}
                                </span>
                              </label>

                              {/* Audit Trail */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsAuditTrailDocument
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsAuditTrailDocument'
                                  checked={formValues.IsAuditTrailDocument}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.auditTrail")}
                                </span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2.5'>
                              {t("webhookIntegration.statusEvents", "Document Status Changes")}
                            </label>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3'>
                              {/* Completed */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsCompletedStatus
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsCompletedStatus'
                                  checked={formValues.IsCompletedStatus}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.completedStatus")}
                                </span>
                              </label>

                              {/* Declined */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsDeclinedStatus
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsDeclinedStatus'
                                  checked={formValues.IsDeclinedStatus}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.declinedStatus")}
                                </span>
                              </label>

                              {/* Viewed */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsViewedStatus
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsViewedStatus'
                                  checked={formValues.IsViewedStatus}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.viewedStatus")}
                                </span>
                              </label>

                              {/* Signed */}
                              <label
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                  formValues.IsSignedStatus
                                    ? "bg-[var(--modern-raised)] border-[var(--theme-color)] text-[var(--modern-text)]"
                                    : "bg-[var(--modern-bg)] border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                                }`}
                              >
                                <input
                                  type='checkbox'
                                  name='IsSignedStatus'
                                  checked={formValues.IsSignedStatus}
                                  onChange={handleChange}
                                  className='h-4 w-4 rounded text-[var(--theme-color)] accent-[var(--theme-color)] cursor-pointer'
                                />
                                <span className='text-xs font-medium'>
                                  {t("webhookIntegration.signedStatus")}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Webhook Payload & Guideline Reference */}
                      {configData && (
                        <div className='p-4 sm:p-5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
                          <div className='flex items-center gap-2.5 pb-3 mb-4 border-b border-[var(--modern-border)]'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                              <Info size={16} />
                            </div>
                            <div>
                              <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                                {t("webhookIntegration.webhookInfo")}
                              </h5>
                              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                                {t(
                                  "webhookIntegration.infoNotice",
                                  "Payload schema parameters and dispatch guidelines"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
                              <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
                                {t("webhookIntegration.webhookReq")}
                              </label>
                              <div className='p-2.5 rounded-lg bg-[var(--modern-bg)] border border-[var(--modern-border)] font-mono text-xs text-[var(--modern-text)] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed'>
                                {configData.webhookReqParams || "No parameter payload schema specified"}
                              </div>
                            </div>

                            <div className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
                              <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
                                {t("webhookIntegration.webhookGuidline")}
                              </label>
                              <p className='text-xs text-[var(--modern-text)] leading-relaxed m-0 whitespace-pre-wrap font-sans'>
                                {configData.webhookReqParamGuideline ||
                                  "Refer to the parameters reference for payload structure."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 5: Bottom Form Actions */}
                      <div className='flex items-center justify-end gap-3 pt-2'>
                        <Button
                          variant='none'
                          type='button'
                          onClick={showWebhookData === null ? resetValue : handleCancel}
                          disabled={isLoading}
                          className='px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
                        >
                          {t("webhookIntegration.cancel")}
                        </Button>

                        <Button
                          variant='none'
                          type='button'
                          onClick={showWebhookData === null ? handleSubmit : handleUpdate}
                          disabled={isLoading || !isFormValid}
                          className='inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
                        >
                          {isLoading && <Loader2 size={16} className='animate-spin' />}
                          <span>
                            {showWebhookData === null
                              ? t("webhookIntegration.create")
                              : t("userProfile.update")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

export default CreateWebhook;
