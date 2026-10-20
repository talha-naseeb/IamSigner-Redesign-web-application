import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PATHS from "./paths";
import AuthGuard from "./Guards/AuthGuard";
import RoleGuard from "./Guards/RoleGuard";
import { tokenManager } from "@/services/tokenManager";

// Layout
import Layout from "../Components/Layout/Layout";

// Pages and components (public)
import Login from "@/Pages/Auth/Login/Login";
import Signup from "@/Pages/Auth/Signup/SignUp";
import ForgotPassword from "@/Pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "@/Pages/Auth/ForgotPassword/Resetpassword";
import SignaturePage from "@/Pages/SignaturePage/SignaturePage";
import SignaturePageSelf from "@/Components/SelfSignature/SignaturePage/SignaturePageSelf";
import Secondstep from "@/Pages/MobileUpload/Step2/Secondstep";
import MobileTemplatesSecondStep from "@/Pages/MobileTemplates/Step2/Secondstep";
import SignedMessage from "@/Pages/SignedMessage/SignedMessage";
import DeclinedMessage from "@/Pages/DeclinedMessage/DeclinedMessage";
import LinkExpire from "@/Pages/LinkExpire/LinkExpire";
import DocumentRecalled from "@/Pages/DocumentRecalled";
import SignedPage from "@/Pages/SignedPage/SignedPage";
import DownloadSignedPage from "@/Pages/DownloadSignedPage";
import DownloadPdfPage from "@/Pages/DownloadPdfPage";
import AuditTrailSignaturePage from "@/Pages/AuditTrail/AuditTrailSignaturePage";
import AuditTrail from "@/Pages/AuditTrail/AuditTrail";
import AIGeneratedPDF from "@/Integrations/MacAiGeneratedDocs/AIGeneratedPDF";

// Protected pages
import Home from "@/Pages/Home/Home";
import PendingDocs from "@/Components/DashboardStatuses/PendingStatus/PendingDocs";
import ShareDocs from "@/Components/DashboardStatuses/SharedStatus/ShareDocs";
import RecentDocuments from "@/Components/DashboardStatuses/Dashboard/RecentDocuments";
import PendingStatus from "@/Components/DashboardStatuses/PendingStatus/PendingwithMe";
import PendingWithOthers from "@/Components/DashboardStatuses/PendingStatus/PendingWithothers";
import DraftDocs from "@/Components/DashboardStatuses/Draftstatus/DraftDocs";
import CompleteDocs from "@/Components/DashboardStatuses/CompleteStatus/CompleteDocs";
import InActive from "@/Components/DashboardStatuses/InactiveStatues/InActive";
import CreateTeam from "@/Components/CreateTeam/CreateTeam";
import CoBrandingDetails from "@/Components/Cobranding/Cobranding";
import DeclinedDocs from "@/Components/DashboardStatuses/Decline/DeclinedDocs";
import RecallDocuments from "@/Components/DashboardStatuses/RecallDocuments/RecallDocuments";
import TemplatesPage from "@/Pages/Templates/TemplatesPage";
import Templates from "@/Pages/Templates/Templates";
import UserProfile from "@/Pages/Profile/UserProfile";
import CreateWebhook from "@/Integrations/webhookIntegration/CreateWebhook";
import OpenAIComponent from "@/Integrations/MacAiGeneratedDocs/OpenAIComponent";
import ManuallyGenerateComponent from "@/Integrations/ManuallyGeneratedDocs/ManuallyGenerateComponent";
import ManualDosList from "@/Integrations/ManuallyGeneratedDocs/ManualDosList";
import ListOfDocuments from "@/Integrations/MacAiGeneratedDocs/ListOfDocuments";
import DMS from "@/Components/DMS/DMS";
import Folder from "@/Components/Folder/Folder";
import ViewDocuments from "@/Components/Folder/ViewDocuments";
import ViewSubFolderDocuments from "@/Components/Folder/SubFolder/ViewSubFolderDocuments";
import BulkSignatoriesList from "@/Components/DashboardStatuses/BulkStatus/BulkSignatoriesList";
import BulkDocuments from "@/Components/DashboardStatuses/BulkStatus/BulkDocuments";
import EmailTemplates from "@/Components/EmailTemplates/EmailTemplates";
import CreateEmailTemplate from "@/Components/EmailTemplates/CreateEmailTemplate";
import CompanyProfile from "@/Components/ReportDashboard/CompanyAdminPanel/CompanyProfile";
import DepartmentList from "@/Components/Department/DepartmentList";
import SelfSignatureFlow from "@/Components/SelfSignature/SelfUpload/SelfSignatureFlow";
import UploadDoc from "@/Components/Upload Flow/UploadDoc/UploadDoc";
import UploadBulk from "@/Components/BulkSend/UploadBulk/UploadBulk";
import UserDocReport from "@/Components/ReportDashboard/UserDocReport/UserDocReport";
import AppUserReport from "@/Components/ReportDashboard/AppUserReport/AppUserReport";
// import ChatAIAgent from "@/Pages/ChatAIAgent/ChatAIAgent";

// Custom 404 handler based on token presence
const Custom404Handler = () => {
  if (tokenManager.hasToken()) {
    return <Navigate to={PATHS.home} replace />;
  }
  return <Navigate to={PATHS.login} replace />;
};

const AppRouter = ({ onLogin }) => {
  const isDmsEnabled = process.env.REACT_APP_ENABLE_DOCUMENT_MANAGER === "true";

  return (
    <Routes>
      {/* Auth routes */}
      <Route path={PATHS.login} element={<Login onLogin={onLogin} />} />
      <Route path={PATHS.signup} element={<Signup />} />
      <Route path={PATHS.forgotPassword} element={<ForgotPassword />} />
      <Route path={PATHS.resetPassword} element={<ResetPassword />} />

      {/* Routes wrapped in Layout */}
      <Route element={<Layout />}>
        {/* Protected routes wrapped in AuthGuard */}
        <Route element={<AuthGuard />}>
          {/* Base Authenticated Pages - Accessible to all roles */}
          <Route path={PATHS.home} element={<Home />} />
          <Route path={PATHS.userProfile} element={<UserProfile />} />
          <Route path={PATHS.allFolders} element={<Folder />} />
          <Route path={PATHS.viewFolderDocs} element={<ViewDocuments />} />
          <Route path={PATHS.viewSubFolderDocs} element={<ViewSubFolderDocuments />} />
          <Route path={PATHS.completeDocs} element={<CompleteDocs />} />
          <Route path={PATHS.completeStatus} element={<Navigate to={PATHS.completeDocs} replace />} />
          <Route path={PATHS.inActive} element={<InActive />} />
          <Route path={PATHS.inactiveDocs} element={<Navigate to={PATHS.inActive} replace />} />
          <Route path={PATHS.declineDocs} element={<DeclinedDocs />} />
          <Route path={PATHS.declined} element={<Navigate to={PATHS.declineDocs} replace />} />
          <Route path={PATHS.pendingDocs} element={<PendingDocs />} />
          <Route path={PATHS.pendingWithMe} element={<PendingStatus />} />
          <Route path={PATHS.pendingWithOthers} element={<PendingWithOthers />} />
          <Route path={PATHS.recentDocuments} element={<RecentDocuments />} />
          <Route path={PATHS.emailTemplates} element={<EmailTemplates />} />
          <Route path={PATHS.createEmailTemplate} element={<CreateEmailTemplate />} />
          <Route path={PATHS.authIntegration} element={<CreateWebhook />} />
          <Route path={PATHS.manuallyGenerateDocs} element={<ManuallyGenerateComponent />} />
          <Route path={PATHS.macAiDocs} element={<ListOfDocuments />} />
          <Route path={PATHS.manualGeneratedDocuments} element={<ManualDosList />} />
          {isDmsEnabled && <Route path={PATHS.dms} element={<DMS />} />}

          {/* Write Actions - Require Active Subscription & Role != 3 */}
          <Route element={<RoleGuard allowedRoleIds={[1, 2, 4]} requireActiveSubscription={true} />}>
            <Route path={PATHS.uploadDoc} element={<UploadDoc />} />
            <Route path={PATHS.selfSign} element={<SelfSignatureFlow />} />
            <Route path={PATHS.macAi} element={<OpenAIComponent />} />
          </Route>

          {/* Draft Documents - Block Role 3 */}
          <Route element={<RoleGuard allowedRoleIds={[1, 2, 4]} />}>
            <Route path={PATHS.draftDocs} element={<DraftDocs />} />
            <Route path={PATHS.drafts} element={<Navigate to={PATHS.draftDocs} replace />} />
          </Route>

          {/* Recalled Documents - Requires recalled permission & Role != 3 */}
          <Route element={<RoleGuard allowedRoleIds={[1, 2, 4]} requiredPermission='recalled' />}>
            <Route path={PATHS.recallDocuments} element={<RecallDocuments />} />
            <Route path={PATHS.recallDocs} element={<Navigate to={PATHS.recallDocuments} replace />} />
          </Route>

          {/* Shared Documents - Requires docShare permission & Role != 3 */}
          <Route element={<RoleGuard allowedRoleIds={[1, 2, 4]} requiredPermission='docShare' />}>
            <Route path={PATHS.shareDocs} element={<ShareDocs />} />
          </Route>

          {/* Templates - Requires templates permission & Role != 3 */}
          <Route element={<RoleGuard allowedRoleIds={[1, 2, 4]} requiredPermission='templates' />}>
            <Route path={PATHS.templatesPage} element={<TemplatesPage />} />
            <Route element={<RoleGuard requireActiveSubscription={true} />}>
              <Route path={PATHS.createTemplates} element={<Templates />} />
              <Route path={PATHS.editTemplates} element={<Templates />} />
            </Route>
          </Route>

          {/* Bulk Operations - Requires Business Account & Bulk Entitlement */}
          <Route
            element={
              <RoleGuard
                allowedAccountTypes={["B"]}
                allowedRoleIds={[1, 2, 4]}
                requiredPermission='bulkDocUpload'
                requireActiveSubscription={true}
              />
            }
          >
            <Route path={PATHS.uploadBulk} element={<UploadBulk />} />
            <Route path={PATHS.bulkDocuments} element={<BulkDocuments />} />
            <Route path={PATHS.bulkSignatories} element={<BulkSignatoriesList />} />
          </Route>

          {/* Admin Only Pages - Business Super Admin (1) & Admin (4) with Teams permission */}
          <Route
            element={
              <RoleGuard
                allowedAccountTypes={["B"]}
                allowedRoleIds={[1, 4]}
                requiredPermission='teams'
              />
            }
          >
            <Route path={PATHS.teamMembers} element={<CreateTeam />} />
            <Route path={PATHS.departmentDetails} element={<DepartmentList />} />
            <Route path={PATHS.userReport} element={<AppUserReport />} />
            <Route path={PATHS.documentReport} element={<UserDocReport />} />
            <Route path={PATHS.companyProfile} element={<CompanyProfile />} />
          </Route>

          {/* Account Settings / Co-Branding - Business Admin with coBrand permission */}
          <Route
            element={
              <RoleGuard
                allowedAccountTypes={["B"]}
                allowedRoleIds={[1, 4]}
                requiredPermission='coBrand'
              />
            }
          >
            <Route path={PATHS.accountSettings} element={<CoBrandingDetails />} />
          </Route>
        </Route>
      </Route>
      {/* Public signature/download routes that need mainbody (from Layout) */}
      <Route path={PATHS.signNow} element={<SignaturePage />} />
      <Route path={PATHS.selfSignature} element={<SignaturePageSelf />} />
      <Route path={PATHS.mobileAppSign} element={<Secondstep />} />
      <Route path={PATHS.mobileAppTemplateSign} element={<MobileTemplatesSecondStep />} />
      <Route path={PATHS.signedMessage} element={<SignedMessage message='The document is signed successfully! ' />} />
      <Route path={PATHS.alreadySigned} element={<SignedMessage message='This document is already signed' />} />
      <Route path={PATHS.viewMessage} element={<SignedMessage message='This document is viewed successfully' />} />
      <Route path={PATHS.declinedMessage} element={<DeclinedMessage message='This document is declined successfully' />} />
      <Route path={PATHS.alreadyDeclined} element={<DeclinedMessage message='This document is already Declined' />} />
      <Route path={PATHS.linkExpired} element={<LinkExpire message='Document is not accessible because link is expired' />} />
      <Route path={PATHS.docRecalled} element={<DocumentRecalled message='This document has been recalled' />} />
      <Route path={PATHS.signedPage} element={<SignedPage />} />
      <Route path={PATHS.downloadSignedPage} element={<DownloadSignedPage />} />
      <Route path={PATHS.downloadPdfPage} element={<DownloadPdfPage />} />
      <Route path={PATHS.downloadAuditTrail} element={<AuditTrailSignaturePage url='/v1.0/api/GetSignActivityVerification' />} />
      <Route path={PATHS.auditTrail} element={<AuditTrail url='/v1.0/api/GetSignActivityCompleted' />} />
      <Route path={PATHS.aiGeneratedPdf} element={<AIGeneratedPDF />} />

      {/* 404 */}
      <Route path={PATHS.notFound} element={<Custom404Handler />} />
    </Routes>
  );
};

export default AppRouter;
