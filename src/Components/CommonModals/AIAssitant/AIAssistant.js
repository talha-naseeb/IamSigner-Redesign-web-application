import React, { useState } from "react";
import { Button, Offcanvas } from "@/Components/UI/shadcnCompat";
import "./AIAssistant.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";

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

  return (
    <>
      <Button
        style={{
          borderRadius: "25px",
          background: "linear-gradient(41deg, var(--theme-color) 0%, color-mix(in srgb, var(--theme-color) 70%, white) 50%, var(--theme-active) 100%)",
          position: "fixed",
          bottom: "110px",
          zIndex: "1050",
          border: "none",
          outline: "none",
          color: "white",
          cursor: "pointer",
          padding: "9px 12px",
          fontSize: "15px",
        }}
        onClick={handleShow}
      >
        {t("AIAssistant.AIAssistant")}
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton className='border-bottom'>
          <Offcanvas.Title>{t("AIAssistant.MacAIAssistant")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='AI-Assistance'>
          <div className='chatbot-Image'>
            <div className='imageDiv'>
              <Icons.Robot width={70} height={70} alt='AI assistant' />
            </div>
            <h4 className='my-2'>{t("AIAssistant.Welcome")}</h4>
          </div>

          <div>
            <div className='questions' onClick={() => handleQuestionClick("Can you provide a summary of the document?")}>
              <p>{t("AIAssistant.provideSummary")}</p>
            </div>

            <div className='questions' onClick={() => handleQuestionClick("What is the main idea of the document?")}>
              <p>{t("AIAssistant.mainIdea")}</p>
            </div>

            <div className='questions' onClick={() => handleQuestionClick("What conclusions are drawn in this document?")}>
              <p>{t("AIAssistant.conclusions")}</p>
            </div>
          </div>

          <div
            className='AI-textbox'
            style={{ display: "flex", alignItems: "center", marginTop: "15px", border: "1px solid var(--border-color)", borderRadius: "5px", position: "relative", backgroundColor: "var(--input-bg)" }}
          >
            <textarea
              placeholder={t("AIAssistant.keyPoinys")}
              style={{
                width: "calc(100% - 45px)",
                padding: "10px",
                resize: "none",
                border: "none",
                minHeight: "150px",
                outline: "none",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
              }}
              className='custom-scrollbar'
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
            <Button
              variant='secondary'
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                padding: "10px",
                position: "absolute",
                bottom: "20px",
                right: "20px",
              }}
              onClick={handleAIQuestions}
            >
              <Icons.Send size={20} />
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AIAssistant;
