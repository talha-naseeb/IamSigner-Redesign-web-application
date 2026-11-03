import React from "react";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2 } from "lucide-react";

const CreateIntegration = ({
  show,
  onHide,
  isLoading,
  appName,
  expiryInSecond,
  handleAppNameChange,
  handleExpiryChange,
  handleSubmit,
  handleCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      dialogClassName='max-w-md'
      backdrop='static'
    >
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
            <KeyRound size={20} />
          </div>
          <div>
            <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
              {t("AuthIntegration.createKeys", "Generate API Key")}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("AuthIntegration.keySubTitle", "Configure application name and token expiration")}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
        <Form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
              {t("AuthIntegration.AppName")} <span className='text-rose-500'>*</span>
            </label>
            <Form.Control
              type='text'
              placeholder={t("AuthIntegration.EnterAppName")}
              value={appName}
              onChange={handleAppNameChange}
              autoFocus
              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
              {t("AuthIntegration.ExpiryTime")} <span className='text-rose-500'>*</span>
            </label>
            <Form.Control
              type='number'
              placeholder={t("AuthIntegration.EnterExpiryTime")}
              value={expiryInSecond}
              onChange={handleExpiryChange}
              className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
            />
            <p className='text-[11px] text-[var(--modern-muted)] mt-1.5 m-0'>
              {t("AuthIntegration.expirySecondsHelp", "Token expiration time in seconds (e.g. 3600 for 1 hour)")}
            </p>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-4 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <Button
          variant='none'
          type='button'
          onClick={handleCancel}
          disabled={isLoading}
          className='px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
        >
          {t("AuthIntegration.Cancel")}
        </Button>
        <Button
          variant='none'
          type='button'
          onClick={handleSubmit}
          disabled={!appName || !appName.trim() || isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
        >
          {isLoading && <Loader2 size={16} className='animate-spin' />}
          <span>{t("AuthIntegration.Create")}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateIntegration;
