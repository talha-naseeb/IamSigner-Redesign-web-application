import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Accordion,
  Row,
  Col,
  Modal,
  Form,
  Dropdown,
} from "@/Components/UI/shadcnCompat";
import CreateIntegration from "./CreateIntegration";
import UpdateIntegrationModal from "./UpdateIntegrationModal";
import { useTranslation } from "react-i18next";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/Components/UI/dataPrimitives";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import integrationService from "@/services/integrationService";
import {
  KeyRound,
  Eye,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Clock,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";

function IntegrationAuth() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [appName, setAppName] = useState("");
  const [expiryInSecond, setExpiryInSecond] = useState("");
  const [deleteAuthID, setDeleteAuthID] = useState("");
  const [getAuthData, setGetAuthData] = useState("");
  const [showUpdateOffCanvas, setShowUpdateOffCanvas] = useState(false);
  const [createAuthOffcanvas, setCreateAuthcanvas] = useState(false);
  const [configData, setConfigData] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalKeyData, setModalKeyData] = useState({ type: "", value: "", title: "" });
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const resetForm = () => {
    setAppName("");
    setExpiryInSecond("");
    setCreateAuthcanvas(false);
  };

  const updateIntegration = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await integrationService.updateIntegrationAuth({
        AppName: appName,
        ExpiryinSecond: expiryInSecond,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("AuthIntegration.update"));
        getAuthIntegration();
        setShowUpdateOffCanvas(false);
      }
    } catch (error) {
      console.error("Not updating", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthIntegration = async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.getIntegrationAuth();
      if (response.data.statusCode === "1") {
        setData(response.data.response || []);
        const AuthData = response.data.response[0];
        if (AuthData) {
          setDeleteAuthID(AuthData.integrationAuthID);
          setGetAuthData(AuthData);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetIntegrationConfiguration = async () => {
    try {
      const response = await integrationService.getIntegrationConfig();
      if (response.data.statusCode === "1") {
        setConfigData(response.data.response);
      }
    } catch (error) {
      toast.error(t("AuthIntegration.errAuth"));
    }
  };

  useEffect(() => {
    getAuthIntegration();
    GetIntegrationConfiguration();
  }, []);

  const handleAppNameChange = (e) => {
    setAppName(e.target.value);
  };

  const handleExpiryChange = (e) => {
    setExpiryInSecond(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await integrationService.createIntegrationAuth({
        AppName: appName,
        ExpiryinSecond: expiryInSecond,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("AuthIntegration.keyCreated"));
        setCreateAuthcanvas(false);
        getAuthIntegration();
        resetForm();
      } else {
        toast.error(t("AuthIntegration.FailedKey"));
      }
    } catch (error) {
      console.error("Error creating integration:", error);
      toast.error(t("AuthIntegration.FailedKey"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenrate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await integrationService.createIntegrationAuth({
        AppName: getAuthData.appName,
        ExpiryinSecond: getAuthData.expiryinSecond,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("AuthIntegration.reGenerateKey"));
        setCreateAuthcanvas(false);
        getAuthIntegration();
        resetForm();
      } else {
        toast.error(t("AuthIntegration.errKey"));
      }
    } catch (error) {
      console.error("Error creating integration:", error);
      toast.error(t("AuthIntegration.errKey"));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAuthIntegration = async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.deleteIntegrationAuth(deleteAuthID);
      if (response.data.statusCode === "1") {
        toast.success(t("AuthIntegration.deletekey"));
      }
      getAuthIntegration();
    } catch (error) {
      console.error("error from deleting ", error);
    } finally {
      setIsLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowUpdateOffCanvas(false);
    setDeleteModalVisible(false);
  };

  const handleUpdate = () => {
    setShowUpdateOffCanvas(true);
  };

  const handleDeleteClick = () => {
    setDeleteModalVisible(true);
  };

  const handleShowKey = (keyType, keyValue) => {
    setModalKeyData({
      type: keyType,
      value: keyValue,
      title: keyType === "secretKey" ? t("tablesLabel.secretKey") : t("tablesLabel.apiKey"),
    });
    setShowKeyModal(true);
  };

  const handleCloseKeyModal = () => {
    setShowKeyModal(false);
    setModalKeyData({ type: "", value: "", title: "" });
    setIsCopied(false);
  };

  const handleCopytoClipboard = () => {
    navigator.clipboard.writeText(modalKeyData.value);
    toast.success(t("AuthIntegration.keyCopied"));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const columns = [
    { label: t("tablesLabel.appName"), key: "appName" },
    { label: t("tablesLabel.expirySeconds"), key: "expiryinSecond" },
    { label: t("tablesLabel.secretKey"), key: "secretKey" },
    { label: t("tablesLabel.apiKey"), key: "apiKey" },
    { label: "", key: "actions" },
  ];

  return (
    <div className='w-full'>
      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModalVisible}
        onHide={() => setDeleteModalVisible(false)}
        centered
        dialogClassName='max-w-md'
        backdrop='static'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500'>
              <AlertTriangle size={20} />
            </div>
            <div>
              <Modal.Title className='text-base font-bold text-[var(--modern-text)] m-0'>
                {t("AuthIntegration.Confirmation")}
              </Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)] text-sm'>
          <p className='m-0 text-[var(--modern-muted)] leading-relaxed'>
            {t("AuthIntegration.sureDelete")}
          </p>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-4 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <Button
            variant='none'
            type='button'
            className='px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t("AuthIntegration.Cancel")}
          </Button>
          <Button
            variant='none'
            type='button'
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors'
            onClick={deleteAuthIntegration}
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={16} className='animate-spin' />}
            <span>{t("AuthIntegration.Delete")}</span>
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modern View / Copy Key Modal */}
      <Modal
        show={showKeyModal}
        onHide={handleCloseKeyModal}
        centered
        dialogClassName='max-w-lg'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
              <KeyRound size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {modalKeyData.title}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("AuthIntegration.copyKeyNotice", "Use this credential to authenticate external API requests")}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
                {modalKeyData.title}
              </label>
              <div className='flex items-center gap-2 p-2.5 rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)]'>
                <input
                  type='text'
                  value={modalKeyData.value}
                  readOnly
                  aria-label={modalKeyData.title}
                  className='w-full px-2 py-1 text-xs sm:text-sm font-mono text-[var(--modern-text)] bg-transparent border-0 outline-none select-all'
                />
                <Button
                  variant='none'
                  onClick={handleCopytoClipboard}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--theme-color)] text-white hover:opacity-90"
                  }`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? t("templateUploadFlow.copied") : t("templateUploadFlow.copy")}</span>
                </Button>
              </div>
            </div>

            <div className='flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs leading-relaxed'>
              <ShieldAlert size={16} className='shrink-0 mt-0.5' />
              <span>{t("AuthIntegration.keepKeySecure")}</span>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-4 flex items-center justify-end bg-[var(--modern-card)]'>
          <Button
            variant='none'
            onClick={handleCloseKeyModal}
            className='px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
          >
            {t("macAi.close", "Close")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Accordion for Api & Keys */}
      <Accordion defaultActiveKey='0' className='integration-accordion'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>
            <div className='d-flex align-items-center gap-3 w-100 me-3'>
              <div className='integration-icon-pill'>
                <KeyRound size={20} />
              </div>
              <div className='d-flex align-items-center justify-content-between flex-grow-1 flex-wrap gap-2'>
                <div className='flex flex-col text-left rtl:text-right'>
                  <span className='font-semibold text-base text-[var(--modern-text)]'>
                    {t("AuthIntegration.Api&key")}
                  </span>
                  <span className='text-xs text-[var(--modern-muted)] font-normal'>
                    {t("AuthIntegration.apiSubtitle", "Manage API tokens, credentials, and webhook endpoints")}
                  </span>
                </div>
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                  {data.length > 0 ? t("emailTemplates.active") : t("emailTemplates.inactive")}
                </span>
              </div>
            </div>
          </Accordion.Header>

          <Accordion.Body>
            {/* Top Action Header */}
            <div className='flex items-center justify-between flex-wrap gap-3 mb-4'>
              <div>
                <h4 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                  {t("AuthIntegration.activeCredentials", "API Credentials & Secrets")}
                </h4>
                <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                  {t("AuthIntegration.credentialsHelp", "Use these secure credentials to integrate with the IAMSigner REST API")}
                </p>
              </div>

              {data.length === 0 && (
                <Button
                  variant='none'
                  onClick={() => setCreateAuthcanvas(true)}
                  className='inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity'
                >
                  <Plus size={16} />
                  <span>{t("AuthIntegration.createKeys")}</span>
                </Button>
              )}
            </div>

            {/* Table or Empty State */}
            {data.length === 0 ? (
              <div className='p-8 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-center flex flex-col items-center justify-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-muted)] mb-3'>
                  <KeyRound size={22} />
                </div>
                <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                  {t("AuthIntegration.noKeyFound")}
                </h5>
                <p className='text-xs text-[var(--modern-muted)] max-w-sm mt-1 mb-4'>
                  {t("AuthIntegration.noKeyDesc", "No API credentials configured yet. Generate a key to start integrating programmatically.")}
                </p>
                <Button
                  variant='none'
                  onClick={() => setCreateAuthcanvas(true)}
                  className='inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity'
                >
                  <Plus size={16} />
                  <span>{t("AuthIntegration.createKeys")}</span>
                </Button>
              </div>
            ) : (
              <div className='rounded-xl border border-[var(--modern-border)] overflow-hidden bg-[var(--modern-card)]'>
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar'
                  style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <Table stickyHeader style={{ border: "none", minWidth: "750px" }}>
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.key} className='TableHeaderCell'>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell className='TableCell'>
                            <div className='flex items-center gap-2'>
                              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                                <FileText size={14} />
                              </div>
                              <span className='font-semibold text-[var(--modern-text)]'>
                                {row.appName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className='TableCell'>
                            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)]'>
                              <Clock size={12} className='text-[var(--modern-muted)]' />
                              <span>{row.expiryinSecond}s</span>
                            </span>
                          </TableCell>

                          <TableCell className='TableCell'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono text-xs text-[var(--modern-muted)] tracking-widest select-none'>
                                ••••••••••••
                              </span>
                              <button
                                type='button'
                                onClick={() => handleShowKey("secretKey", row.secretKey)}
                                className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
                                title={t("AuthIntegration.show")}
                              >
                                <Eye size={12} />
                                <span>{t("AuthIntegration.show")}</span>
                              </button>
                            </div>
                          </TableCell>

                          <TableCell className='TableCell'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono text-xs text-[var(--modern-muted)] tracking-widest select-none'>
                                ••••••••••••
                              </span>
                              <button
                                type='button'
                                onClick={() => handleShowKey("apiKey", row.apiKey)}
                                className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
                                title={t("AuthIntegration.show")}
                              >
                                <Eye size={12} />
                                <span>{t("AuthIntegration.show")}</span>
                              </button>
                            </div>
                          </TableCell>

                          <TableCell className='TableCell p-0 text-right'>
                            <Dropdown align='end'>
                              <Dropdown.Toggle as={CustomToggle} />
                              <Dropdown.Menu align='end'>
                                <Dropdown.Item
                                  className='d-flex gap-2 align-items-center'
                                  onClick={handleRegenrate}
                                >
                                  <RefreshCw size={14} />
                                  <span>{t("AuthIntegration.RegenerateKey")}</span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                  className='d-flex gap-2 align-items-center'
                                  onClick={handleUpdate}
                                >
                                  <Edit3 size={14} />
                                  <span>{t("AuthIntegration.UpdateKey")}</span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                  className='d-flex gap-2 align-items-center text-rose-500 hover:text-rose-600'
                                  onClick={handleDeleteClick}
                                >
                                  <Trash2 size={14} />
                                  <span>{t("AuthIntegration.Delete")}</span>
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {/* Integration Configuration Documentation Card */}
            {configData && (
              <div className='mt-5 p-4 sm:p-5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                <div className='flex items-center gap-2.5 mb-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h5 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                      {t("AuthIntegration.IntegrationConfiguration")}
                    </h5>
                    <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                      {t("AuthIntegration.configNotice", "Official endpoints, guidelines, and parameter specifications")}
                    </p>
                  </div>
                </div>

                <Row className='g-3 mt-1'>
                  <Col md={6}>
                    <div className='p-3.5 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)]'>
                      <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
                        {t("AuthIntegration.apiDocLink")}
                      </label>
                      <a
                        href={configData.apiDocumentationLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--theme-color)] hover:underline break-all no-underline'
                      >
                        <span>{configData.apiDocumentationLink}</span>
                        <ExternalLink size={14} className='shrink-0' />
                      </a>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className='p-3.5 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)]'>
                      <label className='block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
                        {t("AuthIntegration.ApiDocGuideline")}
                      </label>
                      <p className='text-xs text-[var(--modern-text)] leading-relaxed m-0 whitespace-pre-wrap font-sans'>
                        {configData.apiDocumentationRemarks || "Refer to the link above for interactive Swagger specs and request payload documentation."}
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Update and Create Integration Modals */}
      <UpdateIntegrationModal
        show={showUpdateOffCanvas}
        onHide={() => setShowUpdateOffCanvas(false)}
        appName={appName}
        expiryInSecond={expiryInSecond}
        handleAppNameChange={handleAppNameChange}
        handleExpiryChange={handleExpiryChange}
        handleUpdate={updateIntegration}
        handleCancel={handleCancel}
        AuthData={getAuthData}
        setAppName={setAppName}
        setExpiryInSecond={setExpiryInSecond}
        isLoading={isLoading}
      />

      <CreateIntegration
        isLoading={isLoading}
        onHide={() => setCreateAuthcanvas(false)}
        show={createAuthOffcanvas}
        appName={appName}
        expiryInSecond={expiryInSecond}
        handleAppNameChange={handleAppNameChange}
        handleExpiryChange={handleExpiryChange}
        handleSubmit={handleSubmit}
        handleCancel={resetForm}
      />
    </div>
  );
}

export default IntegrationAuth;
