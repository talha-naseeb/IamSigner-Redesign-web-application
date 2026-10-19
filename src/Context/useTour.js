import { useState, useEffect } from "react";
import { useUser } from "./UserContext";

export const useTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const { recordsCount } = useUser("");

  useEffect(() => {
    const steps = [
      {
        selector: ".dashboard-section",
        content: "Welcome to your dashboard! Here, you can get an overview of your activities and access various tools.",
      },
      {
        selector: ".upload-doc-flow",
        content: "Click here to start uploading your documents to the platform.",
      },
      {
        selector: ".recent-docs-section",
        content: "In this section, you can view the most recent documents you’ve worked on.",
      },
      {
        selector: ".recent-template-section",
        content: "This is where you can find the templates you've recently used or created.",
      },
      {
        selector: ".recent-folder-section",
        content: "Here, you can access the most recently worked-on folders for quick navigation.",
      },
      {
        selector: ".dashboard-statuses",
        content: "This section provides an overview of your document statuses, including pending, completed, or in-progress documents.",
      },
      {
        selector: ".mac-ai-section",
        content: "Use our Mac AI integration to automatically generate documents or assist with document-related tasks.",
      },
      {
        selector: ".homePageTable",
        content: "This table provides a detailed view of the statuses of recent documents you’ve worked on.",
      },
      {
        selector: ".homePageTemplate",
        content: "This section provides a detailed view of the recent templates you’ve used or worked on, along with their statuses.",
      },
      {
        selector: ".UploadDocMenu",
        content: "Click here to upload new documents to your account.",
      },
      {
        selector: ".recentdocuments",
        content: "View all your recent documents and their current statuses in this section.",
      },
      {
        selector: ".bulk-section",
        content: "In this section, you can manage bulk document operations, including adding multiple signatories by uploading a CSV file.",
      },
      {
        selector: ".bulk-doc-section",
        content: "Here, you can view and manage all your bulk documents.",
      },
      {
        selector: ".template-section",
        content: "In this section, you can access templates that help streamline document creation.",
      },
      {
        selector: ".folder-section",
        content: "Manage and view all your folders that contain important documents here.",
      },
      {
        selector: ".doc-status-section",
        content: "This section provides detailed statuses of each document, such as in-progress, signed, or pending.",
      },
      {
        selector: ".auth-section",
        content: "Access authentication settings and manage your security configurations in this section.",
      },
      {
        selector: ".MacAI-section",
        content: "Get help from Mac AI to generate or process documents more efficiently.",
      },
      {
        selector: ".manually-section",
        content: "In this section, you can manually generate or manage documents.",
      },
    ];

    setTourSteps(steps);

    if (recordsCount.masterDocCount === 0 ) {
      const hasSeenTourThisSession = sessionStorage.getItem("hasSeenTourThisSession");

      if (!hasSeenTourThisSession) {
        setIsTourOpen(true);
        sessionStorage.setItem("hasSeenTourThisSession", "true"); // Mark the tour as seen for this session
      }
    }
  }, [recordsCount]);

  const closeTour = () => setIsTourOpen(false);

  return { isTourOpen, tourSteps, closeTour };
};
