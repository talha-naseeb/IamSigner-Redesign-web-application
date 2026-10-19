import { useState } from "react";

// cloud host production
const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_AUTOMATION_WEBHOOK_URL;

export const useIAmSignerChat = () => {
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const sendMessage = async (message, sessionId = null) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        chatInput: message,
      };

      // Add sessionId if provided
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      console.log("Raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Response is not JSON:", e);
        if (text && text.trim().length > 0) {
          data = { output: text };
        } else {
          throw new Error("Received empty response from server");
        }
      }

      const botResponse = data.output || (typeof data === "string" ? data : JSON.stringify(data));

      setResponse(botResponse);
      return botResponse;
    } catch (err) {
      const errorMessage = err.message || "Failed to connect to agent";
      setError(errorMessage);
      console.error("IAmSigner Agent Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    sendMessage,
    response,
    loading,
    error,
    clearError,
  };
};
