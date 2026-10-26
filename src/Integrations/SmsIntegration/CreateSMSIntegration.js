import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Offcanvas, Form, Accordion, Dropdown } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@/Components/UI/dataPrimitives";
import SMSIcon from "@/assets/images/sms-edit.svg";

const providers = ["Twilio", "Nexmo", "Plivo"];

function CreateSMSIntegration() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { accountId } = useUser();
  const [smsIntegrations, setSmsIntegrations] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await integrationService.getAccountSMSConfig(accountId);
      if (response.data.statusCode === "1") {
        setSmsIntegrations(response.data.response || []);
      } else {
        toast.error(t("SMSIntegration.loadError"));
      }
    } catch (error) {
      toast.error(t("SMSIntegration.loadError"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      AccountID: accountId,
      Provider: data.Provider,
      ApiKey: data.ApiKey,
      ApiSecret: data.ApiSecret,
      ApiURL: data.ApiURL,
    };
    setIsLoading(true);
    try {
      const response = await integrationService.createAccountSMSConfig(payload);
      if (response.data.statusCode === "1") {
        toast.success(t("SMSIntegration.created"));
        reset();
        fetchIntegrations();
        setShowOffcanvas(false);
      } else {
        toast.error(t("SMSIntegration.failed"));
      }
    } catch (error) {
      toast.error(t("SMSIntegration.error"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setShowOffcanvas(false);
  };

  const columns = [
    { label: t("SMSIntegration.provider"), key: "provider" },
    { label: t("SMSIntegration.apiKey"), key: "apiKey" },
    { label: t("SMSIntegration.apiUrl"), key: "apiURL" },
    { label: t("SMSIntegration.actions"), key: "actions" },
  ];

  return (
    <>
      <Accordion defaultActiveKey='0' className='accordion'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>
            <div className='d-flex align-items-center gap-3'>
              <img src={SMSIcon} alt='sms icon' style={{ height: "30px" }} />
              <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("SMSIntegration.title")}</label>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Grid>
              <div className='d-flex justify-content-start mb-3'>
                <Button variant='none' className='ImageCancelBtn' onClick={() => setShowOffcanvas(true)}>
                  {t("SMSIntegration.createButton")}
                </Button>
              </div>
              <div className='pendingtable'>
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
                  style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    maxHeight: "360px",
                  }}
                >
                  <Table stickyHeader style={{ border: "none" }}>
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
                      {smsIntegrations.length > 0 ? (
                        smsIntegrations.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.provider}</TableCell>
                            <TableCell>{row.apiKey}</TableCell>
                            <TableCell>{row.apiURL}</TableCell>
                            <TableCell>
                              <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} />
                                <Dropdown.Menu>
                                  <Dropdown.Item>{t("SMSIntegration.edit")}</Dropdown.Item>
                                  <Dropdown.Item>{t("SMSIntegration.delete")}</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className='text-center'>
                            {t("SMSIntegration.noData")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Offcanvas show={showOffcanvas} onHide={handleCancel} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("SMSIntegration.title")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className='mb-3'>
              <Form.Label>{t("SMSIntegration.provider")}</Form.Label>
              <Form.Select {...register("Provider", { required: t("SMSIntegration.required") })}>
                <option value=''>{t("SMSIntegration.selectProvider")}</option>
                {providers.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </Form.Select>
              {errors.Provider && <div style={{ color: "red", marginTop: "4px" }}>{errors.Provider.message}</div>}
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>{t("SMSIntegration.apiKey")}</Form.Label>
              <Form.Control type='text' {...register("ApiKey", { required: t("SMSIntegration.required") })} />
              {errors.ApiKey && <div style={{ color: "red", marginTop: "4px" }}>{errors.ApiKey.message}</div>}
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>{t("SMSIntegration.apiSecret")}</Form.Label>
              <Form.Control type='password' {...register("ApiSecret", { required: t("SMSIntegration.required") })} />
              {errors.ApiSecret && <div style={{ color: "red", marginTop: "4px" }}>{errors.ApiSecret.message}</div>}
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>{t("SMSIntegration.apiUrl")}</Form.Label>
              <Form.Control
                type='url'
                {...register("ApiURL", {
                  required: t("SMSIntegration.required"),
                  pattern: {
                    value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/,
                    message: t("SMSIntegration.invalidUrl"),
                  },
                })}
              />
              {errors.ApiURL && <div style={{ color: "red", marginTop: "4px" }}>{errors.ApiURL.message}</div>}
            </Form.Group>

            <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
              <Button variant='secondary' className='resetBtn' onClick={handleCancel}>
                {t("SMSIntegration.cancel")}
              </Button>
              <Button variant='primary' className='applyBtn' type='submit'>
                {t("SMSIntegration.submit")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CreateSMSIntegration;
