import React, { useState } from "react";
import { Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { Sparkles } from "lucide-react";

const AIAssistant = ({ className = "", style = {} }) => {
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

  const isStatic = className.includes("static") || className.includes("relative");
  const positionClass = isStatic ? "" : "fixed";
  const defaultPlacement = isStatic ? "" : "bottom-6 right-6 rtl:right-auto rtl:left-6";

  return (
    <>
      <button
        type='button'
        aria-label={t("AIAssistant.AIAssistant", "AI Assistant")}
        className={`group z-40 inline-flex h-11 items-center rounded-full bg-gradient-to-br from-[var(--modern-primary,#4d8dff)] to-[#5b5bf0] text-white shadow-lg shadow-[var(--modern-primary,#4d8dff)]/25 border border-white/20 transition-all duration-300 ease-out cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 p-0 overflow-hidden ${positionClass} ${className || defaultPlacement}`}
        style={style}
        onClick={handleShow}
      >
        <span className='flex h-11 w-11 shrink-0 items-center justify-center'>
          <Sparkles size={19} className='text-white transition-transform duration-300 group-hover:rotate-12' />
        </span>
        <span className='max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-300 ease-out group-hover:max-w-[140px] group-hover:opacity-100 group-hover:pe-3.5'>
          {t("AIAssistant.AIAssistant", "AI Assistant")}
        </span>
      </button>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement={document.documentElement.dir === "rtl" ? "start" : "end"}
      >
        <Offcanvas.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--modern-raised)] text-[var(--modern-primary,#4d8dff)] border border-[var(--modern-border)] shrink-0'>
              <Sparkles size={18} />
            </div>
            <Offcanvas.Title className='text-base font-bold text-[var(--modern-text)] m-0'>
              {t("AIAssistant.MacAIAssistant")}
            </Offcanvas.Title>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-5 space-y-5 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <div className='flex flex-col items-center justify-center text-center py-3'>
            <div className='w-20 h-20 rounded-full border-2 border-[var(--modern-primary,#4d8dff)] bg-[var(--modern-raised)] flex items-center justify-center shrink-0 mb-3 text-[var(--modern-primary,#4d8dff)]'>
              <Icons.Robot width={48} height={48} alt='AI assistant' />
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
                className='w-full text-left rtl:text-right p-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-xs font-medium hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[var(--modern-card)] transition-colors cursor-pointer !outline-none'
              >
                <p className='m-0'>{item.label}</p>
              </button>
            ))}
          </div>

          <div className='relative rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-3 focus-within:border-[var(--modern-primary,#4d8dff)] transition-colors'>
            <textarea
              placeholder={t("AIAssistant.keyPoinys")}
              className='w-full pr-14 rtl:pr-0 rtl:pl-14 min-h-[120px] resize-none border-0 bg-transparent text-sm text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none custom-table-scrollbar'
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (textareaValue.trim()) {
                    handleAIQuestions();
                  }
                }
              }}
            />
            <button
              type='button'
              disabled={!textareaValue.trim()}
              aria-label='Send message'
              className='absolute bottom-3 right-3 rtl:right-auto rtl:left-3 h-10 w-10 rounded-xl bg-[var(--modern-primary,#4d8dff)] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer !border-0'
              onClick={handleAIQuestions}
            >
              <Icons.Send size={20} className='rtl:-scale-x-100' />
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AIAssistant;
