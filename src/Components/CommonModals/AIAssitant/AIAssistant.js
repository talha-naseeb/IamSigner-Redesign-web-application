import React, { useState } from "react";
import { Button, Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { Sparkles } from "lucide-react";

const AIAssistant = () => {
  const [show, setShow] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const { t } = useTranslation("");

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleAIQuestions = () => {
    toast.info(t("AIAssistant.availableSoon"));
  };

  const handleQuestionClick = (question) => {
    setTextareaValue(question);
  };

  const prompts = [
    {
      value: "Can you provide a summary of the document?",
      label: t("AIAssistant.provideSummary"),
    },
    {
      value: "What is the main idea of the document?",
      label: t("AIAssistant.mainIdea"),
    },
    {
      value: "What conclusions are drawn in this document?",
      label: t("AIAssistant.conclusions"),
    },
  ];

  return (
    <>
      <Button
        variant='none'
        className='fixed bottom-[110px] z-[1050] inline-flex items-center gap-2 rounded-full bg-[var(--theme-color)] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity border border-[color-mix(in_srgb,var(--theme-color)_40%,white)] cursor-pointer'
        onClick={handleShow}
      >
        <Sparkles size={15} />
        <span>{t("AIAssistant.AIAssistant")}</span>
      </Button>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement={document.documentElement.dir === "rtl" ? "start" : "end"}
      >
        <Offcanvas.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0'>
              <Sparkles size={18} />
            </div>
            <Offcanvas.Title className='text-base font-bold text-[var(--modern-text)] m-0'>
              {t("AIAssistant.MacAIAssistant")}
            </Offcanvas.Title>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-5 space-y-5 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <div className='flex flex-col items-center justify-center text-center py-3'>
            <div className='w-24 h-24 rounded-full border-2 border-[var(--theme-color)] bg-[var(--modern-raised)] flex items-center justify-center shrink-0 mb-3 text-[var(--theme-color)]'>
              <Icons.Robot width={56} height={56} alt='AI assistant' />
            </div>
            <h4 className='text-base font-bold text-[var(--modern-text)] m-0'>
              {t("AIAssistant.Welcome")}
            </h4>
          </div>

          <div className='space-y-2'>
            {prompts.map((item, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => handleQuestionClick(item.value)}
                className='w-full text-left rtl:text-right p-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-xs font-medium hover:border-[var(--theme-color)] transition-colors cursor-pointer'
              >
                <p className='m-0'>{item.label}</p>
              </button>
            ))}
          </div>

          <div className='relative rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-3 focus-within:border-[var(--theme-color)] transition-colors'>
            <textarea
              placeholder={t("AIAssistant.keyPoinys")}
              className='w-full pr-12 rtl:pr-0 rtl:pl-12 min-h-[140px] resize-none border-0 bg-transparent text-sm text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none custom-table-scrollbar'
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
            <Button
              variant='none'
              type='button'
              className='absolute bottom-3 right-3 rtl:right-auto rtl:left-3 w-9 h-9 rounded-lg bg-[var(--theme-color)] text-white flex items-center justify-center hover:opacity-90 transition-opacity'
              onClick={handleAIQuestions}
            >
              <Icons.Send size={16} />
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AIAssistant;
