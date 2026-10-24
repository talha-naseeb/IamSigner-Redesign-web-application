import React, { useState, useEffect } from "react";
import verificationService from "@/services/verificationService";
import DOMPurify from "dompurify";

function AIGeneratedPDF() {
  const [aiGeneratedTextResp, setAiGeneratedTextResp] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const GetAITextForPage = async () => {
      const currentUrl = window.location.href;
      const parts = currentUrl.split("/");
      const idIndex = parts.indexOf("id");

      if (idIndex !== -1 && idIndex < parts.length - 1) {
        const pathAfterId = parts.slice(idIndex + 1).join("/");
        try {
          const response = await verificationService.getAITextForPage(pathAfterId);

          const content = response.data.response.aiGeneratedText;
          const sanitizedText = DOMPurify.sanitize(content, {
            ADD_TAGS: ["table", "tr", "td", "th", "br", "hr"],
            ADD_ATTR: ["style", "border", "cellspacing", "cellpadding"],
          });
          setAiGeneratedTextResp(sanitizedText);
        } catch (error) {
          console.error("API Error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    GetAITextForPage();
  }, []);

  return <div className='bg-white text-black p-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2'>{!isLoading && aiGeneratedTextResp && <div dangerouslySetInnerHTML={{ __html: aiGeneratedTextResp }} />}</div>;
}

export default AIGeneratedPDF;
