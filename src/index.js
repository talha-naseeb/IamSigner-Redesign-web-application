import React from "react";
import ReactDOM from "react-dom/client";
import "react-phone-input-2/lib/style.css";
import "./index.css";
import "./styles/themeAwareForm.css";
import "react-quill-new/dist/quill.snow.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HelmetProvider } from "react-helmet-async";

import { DndProvider } from "react-dnd";
import { MultiBackend, TouchTransition, MouseTransition } from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./Components/OneDrive/authConfig";
import { applyThemeToDocument, getInitialTheme } from "./Context/themeUtils";

const msalInstance = new PublicClientApplication(msalConfig);
const GOOGLE_LOGIN_CLIENTID = process.env.REACT_APP_GOOGLE_LOGIN_CLIENTID;

applyThemeToDocument(getInitialTheme());

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HelmetProvider>
    <MsalProvider instance={msalInstance}>
      <GoogleOAuthProvider clientId={GOOGLE_LOGIN_CLIENTID}>
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          <App />
        </DndProvider>
      </GoogleOAuthProvider>
    </MsalProvider>
  </HelmetProvider>
);

reportWebVitals();
