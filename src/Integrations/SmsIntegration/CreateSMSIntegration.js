import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Offcanvas, Form, Accordion, Dropdown } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Grid } from "@/Components/UI/dataPrimitives";
import { MessageSquare, Plus, Loader2 } from "lucide-react";

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
    { label: t("SMSIntegration.actions"), key: "actions", align: "right" },
  ];

  return (
    <>
      <Accordion defaultActiveKey='0' className='accordion'>
        <Accordion.Item eventKey='0' className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] overflow-hidden'>
          <Accordion.Header className='px-5 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0'>
                <MessageSquare size={20} />
              </div>
              <span className='text-base font-bold text-[var(--modern-text)]'>
                {t("SMSIntegration.title")}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body className='p-5 pt-2 bg-[var(--modern-card)]'>
            <Grid>
              <div className='flex items-center justify-between mb-4'>
                <Button
                  variant='none'
                  className='inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity'
                  onClick={() => setShowOffcanvas(true)}
                >
                  <Plus size={15} />
                  <span>{t("SMSIntegration.createButton")}</span>
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
                    <TableHead className='customTableHead'>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.key} align={column.align || "left"} className='TableHeaderCell'>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {smsIntegrations.length > 0 ? (
                        smsIntegrations.map((row, index) => (
                          <TableRow key={index} hover>
                            <TableCell className='TableCell font-medium text-[var(--modern-text)]'>{row.provider}</TableCell>
                            <TableCell className='TableCell font-mono text-xs text-[var(--modern-muted)]'>{row.apiKey}</TableCell>
                            <TableCell className='TableCell text-[var(--modern-muted)]'>{row.apiURL}</TableCell>
                            <TableCell className='TableCell p-0 text-right'>
                              <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} />
                                <Dropdown.Menu align='end'>
                                  <Dropdown.Item>{t("SMSIntegration.edit")}</Dropdown.Item>
                                  <Dropdown.Item>{t("SMSIntegration.delete")}</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className='table-empty-state-cell p-0'>
                            <TableEmptyState
                              icon={<MessageSquare size={40} />}
                              title={t("SMSIntegration.noData")}
                            />
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

      <Offcanvas show={showOffcanvas} onHide={handleCancel} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0'>
              <MessageSquare size={18} />
            </div>
            <Offcanvas.Title className='text-base font-bold text-[var(--modern-text)] m-0'>
              {t("SMSIntegration.title")}
            </Offcanvas.Title>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0 flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <Form onSubmit={handleSubmit(onSubmit)} className='flex flex-col flex-1 h-full'>
            <div className='p-5 space-y-4 flex-1 overflow-y-auto'>
              <Form.Group>
                <Form.Label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("SMSIntegration.provider")}
                </Form.Label>
                <Form.Select
                  className='w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] focus:outline-none focus:border-[var(--theme-color)]'
                  {...register("Provider", { required: t("SMSIntegration.required") })}
                >
                  <option value=''>{t("SMSIntegration.selectProvider")}</option>
                  {providers.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </Form.Select>
                {errors.Provider && (
                  <div className='text-xs text-rose-500 mt-1'>{errors.Provider.message}</div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("SMSIntegration.apiKey")}
                </Form.Label>
                <Form.Control
                  type='text'
                  className='w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] focus:outline-none focus:border-[var(--theme-color)]'
                  {...register("ApiKey", { required: t("SMSIntegration.required") })}
                />
                {errors.ApiKey && (
                  <div className='text-xs text-rose-500 mt-1'>{errors.ApiKey.message}</div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("SMSIntegration.apiSecret")}
                </Form.Label>
                <Form.Control
                  type='password'
                  className='w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] focus:outline-none focus:border-[var(--theme-color)]'
                  {...register("ApiSecret", { required: t("SMSIntegration.required") })}
                />
                {errors.ApiSecret && (
                  <div className='text-xs text-rose-500 mt-1'>{errors.ApiSecret.message}</div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("SMSIntegration.apiUrl")}
                </Form.Label>
                <Form.Control
                  type='url'
                  className='w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] focus:outline-none focus:border-[var(--theme-color)]'
                  {...register("ApiURL", {
                    required: t("SMSIntegration.required"),
                    pattern: {
                      value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/,
                      message: t("SMSIntegration.invalidUrl"),
                    },
                  })}
                />
                {errors.ApiURL && (
                  <div className='text-xs text-rose-500 mt-1'>{errors.ApiURL.message}</div>
                )}
              </Form.Group>
            </div>

            <div className='sticky bottom-0 mt-auto border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
              <Button
                variant='none'
                type='button'
                disabled={isLoading}
                className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
                onClick={handleCancel}
              >
                {t("SMSIntegration.cancel")}
              </Button>
              <Button
                variant='none'
                type='submit'
                disabled={isLoading}
                className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
              >
                {isLoading && <Loader2 size={14} className='animate-spin' />}
                <span>{t("SMSIntegration.submit")}</span>
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CreateSMSIntegration;
