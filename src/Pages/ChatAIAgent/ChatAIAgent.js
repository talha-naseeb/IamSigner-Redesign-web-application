import { v4 as uuidv4 } from "uuid";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useIAmSignerChat } from "@/Context/useIAmSignerChat";
import { useTranslation } from "react-i18next";
import { IoSend } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaRobot, FaUser } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "./ChatAIAgent.css";
import ChatParser from "@/Helpers/chatParser";



const ChatAIAgent = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) return storedSessionId;
    const newSessionId = uuidv4();
    localStorage.setItem("chatSessionId", newSessionId);
    return newSessionId;
  });

  const welcomeMessage = useMemo(
    () => ({
      role: "bot",
      text: `
${t("chatPage.welcomeMessage")}

${t("chatPage.helpWith")}
• ${t("chatPage.verifyLinks")}
• ${t("chatPage.signDocuments")}
• ${t("chatPage.answerQuestions")}

${t("chatPage.howCanHelp")}
`,
      timestamp: new Date(),
    }),
    [t]
  );

  const [messages, setMessages] = useState([welcomeMessage]);
  const { sendMessage, loading, error, clearError } = useIAmSignerChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      {
        label: t("chatPage.quickPromptVerify"),
        value: t("chatPage.quickPromptVerifyText"),
      },
      {
        label: t("chatPage.quickPromptSign"),
        value: t("chatPage.quickPromptSignText"),
      },
      {
        label: t("chatPage.quickPromptHelp"),
        value: t("chatPage.quickPromptHelpText"),
      },
    ],
    [t]
  );

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].role === "bot") {
        const updated = { ...welcomeMessage, timestamp: prev[0].timestamp };
        const arr = [...prev];
        arr[0] = updated;
        return arr;
      }
      return prev;
    });
  }, [welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const botResponse = await sendMessage(input, sessionId);
      const botMessage = {
        role: "bot",
        text: typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (error) clearError();
  };

  const handleClearChat = () => {
    setMessages([welcomeMessage]);
    setInput("");
    clearError();
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem("chatSessionId", newSessionId);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt.value);
    if (error) clearError();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className='container mt-3'>
      <div className='chat-page-container'>
        <div className='chat-header-card'>
          <div className='chat-header-main'>
            <div className='chat-header-content'>
              <div className='chat-bot-circle' aria-hidden='true'>
                <FaRobot className='chat-bot-icon' />
              </div>
              <div>
                <p className='chat-kicker'>{t("chatPage.assistantKicker")}</p>
                <h2 className='chat-title'>{t("chatPage.aiAssistant")}</h2>
                <p className='chat-subtitle'>{t("chatPage.poweredBy")}</p>
              </div>
            </div>

            <div className='chat-header-meta'>
              <span className='chat-status-pill'>
                <span className='chat-status-dot' aria-hidden='true'></span>
                {t("chatPage.onlineStatus")}
              </span>
              <span className='chat-session-pill'>
                {t("chatPage.messageCount", { count: Math.max(messages.length - 1, 0) })}
              </span>
            </div>
          </div>

          {messages.length > 1 && (
            <button onClick={handleClearChat} className='clear-chat-btn' title={t("chatPage.clearChat")} aria-label={t("chatPage.clearChat")}>
              <MdDelete size={20} />
              <span>{t("chatPage.clearChat")}</span>
            </button>
          )}
        </div>

        <div className='chat-messages-card'>
          <div className='chat-messages-area'>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message-wrapper ${msg.role}`}>
                <div className='chat-message-avatar' aria-hidden='true'>
                  {msg.role === "bot" ? <FaRobot /> : <FaUser />}
                </div>
                <div className='chat-message-stack'>
                  <div className='chat-message-author'>{msg.role === "bot" ? t("chatPage.aiAssistant") : t("chatPage.userLabel")}</div>
                  <div className={`chat-message-bubble ${msg.isError ? "error" : ""}`}>
                    <ChatParser text={msg.text} />
                    <div className='message-time'>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className='chat-message-wrapper bot'>
                <div className='chat-message-avatar' aria-hidden='true'>
                  <FaRobot />
                </div>
                <div className='chat-message-stack'>
                  <div className='chat-message-author'>{t("chatPage.aiAssistant")}</div>
                  <div className='chat-message-bubble typing-bubble'>
                    <div className='typing-indicator' aria-label={t("chatPage.typingLabel")}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <div className='chat-error-message'>{error.includes("HTTP") ? t("chatPage.serviceUnavailable") : error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className='chat-input-container'>
            <div className='chat-quick-prompts' aria-label={t("chatPage.quickPromptLabel")}>
              {quickPrompts.map((prompt) => (
                <button key={prompt.label} type='button' className='chat-prompt-chip' onClick={() => handleQuickPrompt(prompt)} disabled={loading}>
                  {prompt.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className='chat-input-form'>
              <input ref={inputRef} type='text' value={input} onChange={handleInputChange} placeholder={t("chatPage.inputPlaceholder")} disabled={loading} className='chat-input-field' aria-label={t("chatPage.inputLabel")} />
              <button type='submit' disabled={loading || !input.trim()} className='chat-send-btn' aria-label={t("chatPage.sendMessage")}>
                {loading ? <AiOutlineLoading3Quarters className='spinner' size={18} /> : <IoSend size={18} />}
              </button>
            </form>
            <p className='chat-hint'>{t("chatPage.hint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAIAgent;
