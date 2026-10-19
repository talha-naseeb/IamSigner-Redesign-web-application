import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Accordion, Container, Row, Col, Modal, Form, Dropdown } from "react-bootstrap";
import { Icons } from "@/assets/Icons";
import CreateIntegration from "./CreateIntegration";
import UpdateIntegrationModal from "./UpdateIntegrationModal";
import { useTranslation } from "react-i18next";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import Loader from "@/Components/CommonModals/Loader/Loader";
import integrationService from "@/services/integrationService";

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
      console.log("Not updating", error);
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
        setDeleteAuthID(AuthData.integrationAuthID);
        setGetAuthData(AuthData);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const GetIntegrationConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await integrationService.getIntegrationConfig();
      if (response.data.statusCode === "1") {
        setConfigData(response.data.response);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(t("AuthIntegration.errAuth"));
      setIsLoading(false);
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating integration:", error);
      toast.error(t("AuthIntegration.FailedKey"));
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating integration:", error);
      toast.error(t("AuthIntegration.errKey"));
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
      console.log("error from deleting ", error);
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
      setShowKeyModal(false);
      setModalKeyData({ type: "", value: "", title: "" });
    }, 1500);
  };

  const columns = [
    { label: t("tablesLabel.appName"), key: "appName" },
    { label: t("tablesLabel.expirySeconds"), key: "expiryinSecond" },
    { label: t("tablesLabel.secretKey"), key: "secretKey" },
    { label: t("tablesLabel.apiKey"), key: "apiKey" },
    { label: "", key: "actions" },
  ];

  return (
    <Container className='p-0 mb-3'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={deleteModalVisible} dialogClassName='custom-modal-width' onHide={() => setDeleteModalVisible(false)} backdrop='static' keyboard={false}>
        <Modal.Header>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.DeleteAction size={25} />
            </div>

            <div className='header-text'>
              <Modal.Title>{t("AuthIntegration.Confirmation")}</Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <p> {t("AuthIntegration.sureDelete")}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='none' className='modalCancelButton' onClick={handleCancel}>
            {t("AuthIntegration.Cancel")}
          </Button>
          <Button variant='none' className='applyBtn' onClick={deleteAuthIntegration}>
            {t("AuthIntegration.Delete")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Key Display Modal */}
      <Modal show={showKeyModal} onHide={handleCloseKeyModal} dialogClassName='custom-modal-width' centered>
        <Modal.Body style={{ padding: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#6c757d",
                marginBottom: "8px",
              }}
            >
              {modalKeyData.title}
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: "#f8f9fa",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type='text'
                value={modalKeyData.value}
                readOnly
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                  fontFamily: "monospace",
                  color: "#495057",
                  fontWeight: "500",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCopytoClipboard}
                disabled={isCopied}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: isCopied ? "#28a745" : "#0C9AD7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isCopied ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isCopied ? "0 2px 4px rgba(40, 167, 69, 0.2)" : "0 2px 4px rgba(12, 154, 215, 0.2)",
                  opacity: isCopied ? 0.9 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isCopied) {
                    e.target.style.backgroundColor = "#0a85c2";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(12, 154, 215, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCopied) {
                    e.target.style.backgroundColor = "#0C9AD7";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(12, 154, 215, 0.2)";
                  }
                }}
              >
                {isCopied ? (
                  <>
                    <Icons.Check style={{ fontSize: "14px" }} />
                    {t("templateUploadFlow.copied")}
                  </>
                ) : (
                  <>
                    <Icons.Copy style={{ fontSize: "14px" }} />
                    {t("templateUploadFlow.copy")}
                  </>
                )}
              </button>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#dc3545",
                marginTop: "8px",
                marginBottom: "0",
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icons.InfoOutline size={16} />
              {t("AuthIntegration.keepKeySecure")}
            </p>
          </div>
        </Modal.Body>
      </Modal>

      <div className='mt-3'>
        <Accordion defaultActiveKey='0' className='accordion'>
          <Accordion.Item eventKey='2'>
            <Accordion.Header>
              <div className='d-flex align-items-center gap-3'>
                <Icons.Api size={24} />
                <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("AuthIntegration.Api&key")}</label>
              </div>
            </Accordion.Header>

            <Accordion.Body>
              {data.length === 0 ? (
                <>
                  <Button variant='none' className='ImageCancelBtn' onClick={() => setCreateAuthcanvas(true)}>
                    {t("AuthIntegration.createKeys")}
                  </Button>
                </>
              ) : (
                <></>
              )}

              <Grid className='mt-3'>
                <Grid>
                  <div className='pendingtable'>
                    <TableContainer
                      component={Paper}
                      className='custom-table-scrollbar'
                      style={{
                        maxWidth: "100%",
                        overflowX: "auto",
                      }}
                    >
                      <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                        <TableHead>
                          <TableRow>
                            {columns.map((column) => (
                              <TableCell key={column.label} style={{ backgroundColor: "#f0f3f4" }} className='TableHeaderCell'>
                                {column.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {data.length === 0 && (
                            <TableRow>
                              <td colSpan='6' className='p-4 text-center'>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <Icons.Api size={50} />
                                  {t("AuthIntegration.noKeyFound")}
                                </div>
                              </td>
                            </TableRow>
                          )}

                          {data.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className='TableCell'>{row.appName}</TableCell>
                              <TableCell className='TableCell'>{row.expiryinSecond}</TableCell>
                              <TableCell className='TableCell'>
                                <button className='apiButton' onClick={() => handleShowKey("secretKey", row.secretKey)}>
                                  {t("AuthIntegration.show")}
                                </button>
                              </TableCell>
                              <TableCell className='TableCell'>
                                <button className='apiButton' onClick={() => handleShowKey("apiKey", row.apiKey)}>
                                  {t("AuthIntegration.show")}
                                </button>
                              </TableCell>
                              <TableCell className='TableCell p-0 dropdown-table'>
                                <Dropdown>
                                  <Dropdown.Toggle as={CustomToggle} />
                                  <Dropdown.Menu>
                                    <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={handleRegenrate}>
                                      <Icons.Refresh size={20} />
                                      {t("AuthIntegration.RegenerateKey")}
                                    </Dropdown.Item>
                                    <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={handleUpdate}>
                                      <Icons.EditSquare size={20} />
                                      {t("AuthIntegration.UpdateKey")}
                                    </Dropdown.Item>

                                    <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={handleDeleteClick}>
                                      <Icons.DeleteAction size={20} />
                                      {t("AuthIntegration.Delete")}
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
                </Grid>
              </Grid>
              {configData && (
                <div className='my-3'>
                  <label style={{ fontSize: "20px", fontWeight: "500", margin: "20px 0px" }}>{t("AuthIntegration.IntegrationConfiguration")}</label>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className='mb-3' controlId='apiDocumentationLink'>
                          <Form.Label>{t("AuthIntegration.apiDocLink")} :</Form.Label>
                          <br />
                          <a className='api-doc-link' href={configData.apiDocumentationLink} target='_blank' rel='noopener noreferrer'>
                            {configData.apiDocumentationLink}
                          </a>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className='mb-3' controlId='webhookReqParamGuideline'>
                          <Form.Label>{t("AuthIntegration.ApiDocGuideline")}</Form.Label>
                          <Form.Control as='textarea' rows={5} value={configData.apiDocumentationRemarks} readOnly />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

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
    </Container>
  );
}

export default IntegrationAuth;
