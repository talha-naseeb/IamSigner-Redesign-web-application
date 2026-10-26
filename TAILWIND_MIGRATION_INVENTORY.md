# Tailwind migration inventory

**Audit date:** 2026-10-23
**Purpose:** Source checklist for migrating every visual module and feature to Tailwind while preserving the shared theme system and existing behavior.

The route and feature status (Old / Mixed / New) remains tracked in [UI_MODULE_INVENTORY.md](UI_MODULE_INVENTORY.md). This file adds the exhaustive JSX and CSS source lists. JSX files are identified by parsing the current source with Babel, so .js files containing JSX are included.

## Scope snapshot

- React source files scanned: **285** across .js/.jsx/.ts/.tsx.
- Files containing JSX: **224** (9 .jsx files and 215 .js files).
- JSX test files included in the total: **1**.
- Custom source CSS files: **75**; direct import scan found **75 referenced** and **0 with no direct JS import**.
- JSX files with inline `style={{...}}` props: **120**; review these for static styles that can move to Tailwind and dynamic values that must remain data-driven.
- Parse errors during JSX inventory scan: **0**.

## Theme and shared style sources

These files define or apply the global theme, token palette, Tailwind configuration, and shared Tailwind/shadcn component styles. Migrate static presentation here first and keep token roles consistent across light/dark and palette modes.

- [ ] `tailwind.config.js` — Tailwind content scanning, dark-mode class strategy, token color aliases, radius tokens, animation plugin.
- [ ] `src/index.css` — global CSS variables, light/dark and palette overrides, legacy utility compatibility bridge, global component/third-party overrides, Tailwind layers.
- [ ] `src/Context/themeUtils.js` — theme/palette names, storage, document attributes, initial state helpers.
- [ ] `src/Context/ThemeContext.js` — shared theme/palette state provider.
- [ ] `src/Components/Navbar/Header.js` — theme toggle and palette selection UI.
- [x] `src/Components/Auth/AuthThemeToggle.js` — theme toggle UI migrated to shared tokens and Tailwind utilities.
- [ ] `src/styles/themeAwareForm.css` — shared theme-aware form styling.
- [ ] `src/index.js` — global and vendor stylesheet entry imports.

Supported modes found in source: **light / dark** themes and **concept-2 / management** palettes. Shared token roles required by AGENTS.md: `--modern-bg`, `--modern-raised`, `--modern-card`, `--modern-border`, `--modern-border-strong`, `--modern-text`, `--modern-muted`.

### Theme and palette consumers

Review these files because they read or update the theme/palette state or render theme-sensitive controls:

- [x] `src/Components/Auth/AuthThemeToggle.js`
- [ ] `src/Components/BulkSend/Stepper/BulkStepper.js`
- [ ] `src/Components/Navbar/Header.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/ActiveAccounts.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/AdminHome.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/UserDocuments.js`
- [ ] `src/Components/SelfSignature/Stepper/SelfSignStepper.js`
- [ ] `src/Components/Upload Flow/Stepper/Stepper.js`
- [ ] `src/Context/ThemeContext.js`
- [ ] `src/Context/UserContext.js`
- [ ] `src/Context/themeUtils.js`
- [ ] `src/Pages/AuditTrail/AuditTrail.js`
- [x] `src/Pages/Auth/Carousels/AuthFeatureCarousel.js`
- [x] `src/Pages/Auth/ForgotPassword/ForgotPassword.js`
- [x] `src/Pages/Auth/ForgotPassword/Resetpassword.js`
- [x] `src/Pages/Auth/Login/Login.js`
- [x] `src/Pages/Auth/Signup/SignUp.js`

### Shared component layer

The following local React components provide shadcn-style or shared primitives; keep their classes and tokens as the baseline for route migrations.

- [ ] `src/Components/Common/AppDrawer/AppDrawer.jsx`
- [ ] `src/Components/Common/AppModal/AppConfirmModal.jsx`
- [ ] `src/Components/Common/AppModal/AppModal.jsx`
- [ ] `src/Components/Common/AppSwitch/AppSwitch.js`
- [ ] `src/Components/UI/Badge/Badge.js`
- [ ] `src/Components/UI/Button/Button.js`
- [ ] `src/Components/UI/Card/Card.js`
- [ ] `src/Components/UI/EmailChips.jsx`
- [ ] `src/Components/UI/Input/Input.js`
- [ ] `src/Components/UI/Modal/Modal.js`
- [ ] `src/Components/UI/dataPrimitives.jsx`
- [ ] `src/Components/UI/dialog.jsx`
- [ ] `src/Components/UI/iconCompat.jsx`
- [ ] `src/Components/UI/shadcnCompat.jsx`
- [ ] `src/Components/UI/sheet.jsx`

## Feature map

The module and feature inventory below is derived from the existing UI status tracker; current Old/Mixed/New status and completion state stay in [UI_MODULE_INVENTORY.md](UI_MODULE_INVENTORY.md).

| Module / feature | Feature coverage |
|---|---|
| Shared app shell | Header, navigation sidebar, collapsed/mobile navigation, page canvas |
| Localization and shared UI states | Theme/palette toggle, language selection, RTL layout, guided tours, loading, error and empty states, unified shadcn AppModal/AppDrawer system |
| Home dashboard | Welcome/date area, Upload & Send / Sign Myself / Templates / Bulk Send actions, status summary cards, recent documents, quick status filters, search and advanced filters |
| Recent documents report | Document table, status/date/name/reference filters, search, export, pagination |
| Pending documents | Pending list, pending with me, pending with others, resend, recall, signing-order and ownership actions, supporting documents |
| Draft documents | Draft summary, draft list and document actions |
| Completed documents | Completed summary, completed document list, signed document actions |
| Inactive documents | Inactive summary and inactive document list |
| Declined and recalled documents | Declined summary/list; recalled summary/list and actions |
| Shared documents | Shared with me / others views, document lists and actions |
| Upload & Send | Document selection/upload, cloud-source selection, recipient setup, signing order, field placement and send review |
| Sign Myself | Self-sign upload, document review, signature placement and completion |
| Bulk Send | Bulk upload, CSV/recipient setup, signatory placement, bulk documents and signatory lists |
| Templates | Template list/search, create/edit, name changes, document preview, fields and confirmation dialogs |
| Profile | Personal details, phone, profile photo, saved signature/stamp, image previews and save/cancel states |
| Password settings | Password change steps, visibility toggles, requirements, verification and errors |
| Delegation | Delegate settings, date range, phone and enable/disable controls |
| Document Manager and folders | DMS list/grid, folder tree, breadcrumbs, document preview/details, upload, rename, share, access, activity, move and storage dialogs |
| Team and user administration | User list, create/edit, team details, role and user actions |
| Department administration | Department list, search, create/edit, activate/deactivate |
| Company profile and reports | Company profile, user report, user document report, filters and exports |
| Account branding & Subscribed Plan | Co-branding, company logo, company stamp, file sources, session duration, and subscribed plan detail cards |
| Email templates | Browse, create/edit, custom email content and template actions |
| Integrations | Webhook/API credentials, SMS integration, cloud-drive connections and integration dialogs |
| Document comments and supporting files | Comment thread, add/view supporting documents and related signing context |
| Mac AI and generated documents | AI document generation, manual document creation, generated document lists and PDF preview |
| Public signing experience | Signature page, self-sign page, mobile signing, template signing, password prompt, field editors, consent/confirmation and signing errors |
| Signing outcomes and downloads | Signed/viewed/declined results, already-completed states, expired/recalled links, signed document and PDF downloads |
| Audit trail | Sign activity, verification trail and download trail |
| Authentication & Access Control | Login, signup, forgot/reset password, OTP verification, declarative RBAC guards, and token architecture |
| Subscription and licensing surfaces | Expiration notices, remaining days, user licensing and pricing-plan view |
| AI Assistant | Assistant menu entry and chat screen |

## All JSX source files

Every entry is a migration review item. JSX in routes, providers, and helper renderers is included for completeness; keep those files presentation-only and do not change route, authorization, data, or workflow behavior.

### App entry

- [ ] `src/App.js`
- [ ] `src/App.test.js`
- [ ] `src/index.js`

### assets/Icons

- [ ] `src/assets/Icons/index.js` — inline style prop present; inspect static vs data-driven style

### Components/Auth

- [x] `src/Components/Auth/AuthThemeToggle.js` — migrated to shared tokens and Tailwind utilities.

### Components/BulkSend/PlaceBulkSignatories

- [ ] `src/Components/BulkSend/PlaceBulkSignatories/PlaceBulkSignatories.js` — inline style prop present; inspect static vs data-driven style

### Components/BulkSend/Step1

- [ ] `src/Components/BulkSend/Step1/FirstStep.js` — inline style prop present; inspect static vs data-driven style

### Components/BulkSend/Step2

- [ ] `src/Components/BulkSend/Step2/DisplayCenterImage.js`
- [ ] `src/Components/BulkSend/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Components/BulkSend/Step3

- [ ] `src/Components/BulkSend/Step3/Thirdstep.js` — inline style prop present; inspect static vs data-driven style

### Components/BulkSend/Stepper

- [ ] `src/Components/BulkSend/Stepper/BulkStepper.js`

### Components/BulkSend/UploadBulk

- [ ] `src/Components/BulkSend/UploadBulk/UploadBulk.js`

### Components/Cobranding

- [ ] `src/Components/Cobranding/Cobranding.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Cobranding/DaysToExpire.js` — inline style prop present; inspect static vs data-driven style

### Components/Comments

- [ ] `src/Components/Comments/Comments.js` — inline style prop present; inspect static vs data-driven style

### Components/Comments/AddSupportingDoc

- [ ] `src/Components/Comments/AddSupportingDoc/AddSupportingDocSignNow.js` — inline style prop present; inspect static vs data-driven style

### Components/Common

- [ ] `src/Components/Common/Can.js`

### Components/Common/AppDrawer

- [ ] `src/Components/Common/AppDrawer/AppDrawer.jsx`

### Components/Common/AppModal

- [ ] `src/Components/Common/AppModal/AppConfirmModal.jsx`
- [ ] `src/Components/Common/AppModal/AppModal.jsx`

### Components/Common/AppSwitch

- [ ] `src/Components/Common/AppSwitch/AppSwitch.js` — inline style prop present; inspect static vs data-driven style

### Components/Common/CloudPickers

- [ ] `src/Components/Common/CloudPickers/DropboxPicker.js`
- [ ] `src/Components/Common/CloudPickers/GoogleDrivePicker.js` — inline style prop present; inspect static vs data-driven style

### Components/Common/DateRangePicker

- [ ] `src/Components/Common/DateRangePicker/DateRangePicker.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/AIAssitant

- [ ] `src/Components/CommonModals/AIAssitant/AIAssistant.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/CustomDots

- [ ] `src/Components/CommonModals/CustomDots/CustomToggle.js`

### Components/CommonModals/CustomToast

- [ ] `src/Components/CommonModals/CustomToast/CustomToast.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/DeleteConfirmationModal

- [ ] `src/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal.js`

### Components/CommonModals/DocumentsComments

- [ ] `src/Components/CommonModals/DocumentsComments/DashboardComments.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/DownloadModal

- [ ] `src/Components/CommonModals/DownloadModal/DownloadModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/CommonModals/DownloadModal/InactiveDocsDownloadModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/CommonModals/DownloadModal/shareDownloadModal.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/InactiveConfirmationModal

- [ ] `src/Components/CommonModals/InactiveConfirmationModal/InactiveConfirmationModal.js`

### Components/CommonModals/Loader

- [x] `src/Components/CommonModals/Loader/Loader.js` — retired full-screen Lottie loader overlay across all pages and components.

### Components/CommonModals/SearchFilters

- [ ] `src/Components/CommonModals/SearchFilters/DocSearchFilter.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/CommonModals/SearchFilters/DraftSearchFilter.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/ShareModal

- [ ] `src/Components/CommonModals/ShareModal/ShareModal.js`

### Components/CommonModals/SignOrder

- [ ] `src/Components/CommonModals/SignOrder/SignOrder.js` — inline style prop present; inspect static vs data-driven style

### Components/CommonModals/ViewModal

- [ ] `src/Components/CommonModals/ViewModal/ViewModal.js` — inline style prop present; inspect static vs data-driven style

### Components/CreateTeam

- [ ] `src/Components/CreateTeam/CreateTeam.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/CreateTeam/CreateTeamForm.js`
- [ ] `src/Components/CreateTeam/UserSearchFilter.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/CreateTeam/ViewTeamDetails.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses

- [ ] `src/Components/DashboardStatuses/DashboardTempalte.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/BulkStatus

- [ ] `src/Components/DashboardStatuses/BulkStatus/BulkDocuments.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/BulkStatus/BulkSignatoriesList.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/CompleteStatus

- [ ] `src/Components/DashboardStatuses/CompleteStatus/CompleteDocs.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/Dashboard

- [ ] `src/Components/DashboardStatuses/Dashboard/RecentDocsFilter.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/Dashboard/RecentDocsHome.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/Dashboard/RecentDocuments.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/DashboardCards

- [ ] `src/Components/DashboardStatuses/DashboardCards/DashboardCard.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/Decline

- [ ] `src/Components/DashboardStatuses/Decline/DeclinedDocs.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/Draftstatus

- [ ] `src/Components/DashboardStatuses/Draftstatus/DraftDocs.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/InactiveStatues

- [ ] `src/Components/DashboardStatuses/InactiveStatues/InActive.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/PendingStatus

- [ ] `src/Components/DashboardStatuses/PendingStatus/PendingDocs.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/PendingStatus/PendingWithothers.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/PendingStatus/PendingwithMe.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DashboardStatuses/PendingStatus/ResendNotificationModal.js`
- [ ] `src/Components/DashboardStatuses/PendingStatus/UploadSupportingDocs.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/PendingStatus/ChangeSignOrder

- [ ] `src/Components/DashboardStatuses/PendingStatus/ChangeSignOrder/ChangeSignOrderModal.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/PendingStatus/RecallConfirmationModal

- [ ] `src/Components/DashboardStatuses/PendingStatus/RecallConfirmationModal/RecallConfirmationModal.js`

### Components/DashboardStatuses/PendingStatus/TransferOwner

- [ ] `src/Components/DashboardStatuses/PendingStatus/TransferOwner/TransferOwnershipModal.js`

### Components/DashboardStatuses/RecallDocuments

- [ ] `src/Components/DashboardStatuses/RecallDocuments/RecallDocuments.js` — inline style prop present; inspect static vs data-driven style

### Components/DashboardStatuses/SharedStatus

- [ ] `src/Components/DashboardStatuses/SharedStatus/ShareDocs.js` — inline style prop present; inspect static vs data-driven style

### Components/Delegation

- [ ] `src/Components/Delegation/Delegation.js`

### Components/Department

- [ ] `src/Components/Department/CreateDepartment.js`
- [ ] `src/Components/Department/DepartmentList.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Department/DepartmentSearchFilters.js`
- [ ] `src/Components/Department/UpdateDepartment.js`

### Components/DMS

- [ ] `src/Components/DMS/DMS.js`
- [ ] `src/Components/DMS/DmsDocumentPickerModal.js`
- [ ] `src/Components/DMS/DmsUploadIntegration.js`

### Components/DMS/components

- [ ] `src/Components/DMS/components/DMSBreadcrumb.js`
- [ ] `src/Components/DMS/components/DMSDetailPanel.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/components/DMSGridView.js`
- [ ] `src/Components/DMS/components/DMSListView.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/components/DMSToolbar.js`
- [ ] `src/Components/DMS/components/DocumentCard.js`
- [ ] `src/Components/DMS/components/FileTypeIcon.js`
- [ ] `src/Components/DMS/components/FolderCard.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/components/FolderTree.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/components/TagsInput.js`

### Components/DMS/modals

- [ ] `src/Components/DMS/modals/DmsShareModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/modals/FolderAccessModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/modals/FolderActivityModal.js`
- [ ] `src/Components/DMS/modals/MoveFolderModal.js`
- [ ] `src/Components/DMS/modals/NewFolderOffcanvas.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/modals/RenameOffcanvas.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DMS/modals/UploadModal.js`

### Components/DocumentPreparation/Step1_Source

- [ ] `src/Components/DocumentPreparation/Step1_Source/Description.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DocumentPreparation/Step1_Source/ReferenceNumber.js`
- [ ] `src/Components/DocumentPreparation/Step1_Source/SignatoryOrientation.js`

### Components/DocumentPreparation/Step2_Canvas

- [ ] `src/Components/DocumentPreparation/Step2_Canvas/ControlsFotmatting.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DocumentPreparation/Step2_Canvas/DraggableButtons.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DocumentPreparation/Step2_Canvas/ImageWithControls.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DocumentPreparation/Step2_Canvas/PageNavigations.js`
- [ ] `src/Components/DocumentPreparation/Step2_Canvas/ResizableButtons.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/DocumentPreparation/Step2_Canvas/SearchControls.js` — inline style prop present; inspect static vs data-driven style

### Components/DocumentPreparation/Step3_Recipients

- [ ] `src/Components/DocumentPreparation/Step3_Recipients/CCEmail.js` — inline style prop present; inspect static vs data-driven style

### Components/EmailTemplates

- [ ] `src/Components/EmailTemplates/CreateEmailTemplate.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/EmailTemplates/EmailTemplates.js` — inline style prop present; inspect static vs data-driven style

### Components/Folder

- [ ] `src/Components/Folder/AddCompletedDocuments.js`
- [ ] `src/Components/Folder/AddCompletedToSubFolder.js`
- [ ] `src/Components/Folder/AddDocuments.js`
- [ ] `src/Components/Folder/Folder.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Folder/FolderFilter.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Folder/ShareDetailsModal.js`
- [ ] `src/Components/Folder/ShareFolderModal.js`
- [ ] `src/Components/Folder/ViewDocuments.js` — inline style prop present; inspect static vs data-driven style

### Components/Folder/SubFolder

- [ ] `src/Components/Folder/SubFolder/AddDocToSubFolder.js`
- [ ] `src/Components/Folder/SubFolder/Subfolder.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Folder/SubFolder/ViewSubFolderDocuments.js` — inline style prop present; inspect static vs data-driven style

### Components/GoogleLogin

- [ ] `src/Components/GoogleLogin/GoogleLogin.js`

### Components/HomeCalendar

- [ ] `src/Components/HomeCalendar/HomeCalendar.js`

### Components/ImageThumbnails

- [ ] `src/Components/ImageThumbnails/ImageThumbnails.js` — inline style prop present; inspect static vs data-driven style

### Components/Language

- [ ] `src/Components/Language/LangSelector.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Language/LanguageSelector.js` — inline style prop present; inspect static vs data-driven style

### Components/Layout

- [ ] `src/Components/Layout/Layout.js` — inline style prop present; inspect static vs data-driven style

### Components/Navbar

- [ ] `src/Components/Navbar/Header.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Navbar/Sidebar.js` — inline style prop present; inspect static vs data-driven style

### Components/Navbar/components

- [ ] `src/Components/Navbar/components/DropdownMenu.js`
- [ ] `src/Components/Navbar/components/MenuItem.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Navbar/components/SidebarAccountStorage.js` — inline style prop present; inspect static vs data-driven style

### Components/OneDrive

- [ ] `src/Components/OneDrive/oneDriveIntegration.js`

### Components/ReportDashboard/AppUserReport

- [ ] `src/Components/ReportDashboard/AppUserReport/AppUserReport.js` — inline style prop present; inspect static vs data-driven style

### Components/ReportDashboard/CompanyAdminPanel

- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/ActiveAccounts.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/AdminHome.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/CompanyProfile.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/MostActiveUsers.js`
- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/UserDocuments.js` — inline style prop present; inspect static vs data-driven style

### Components/ReportDashboard/UserDocReport

- [ ] `src/Components/ReportDashboard/UserDocReport/DocStatusFilter.js`
- [ ] `src/Components/ReportDashboard/UserDocReport/UserDocReport.js` — inline style prop present; inspect static vs data-driven style

### Components/SelfSignature/SelfUpload

- [ ] `src/Components/SelfSignature/SelfUpload/SelfSignatureFlow.js`

### Components/SelfSignature/SignaturePage

- [ ] `src/Components/SelfSignature/SignaturePage/SignaturePageSelf.js` — inline style prop present; inspect static vs data-driven style

### Components/SelfSignature/Step1

- [ ] `src/Components/SelfSignature/Step1/FirstStep.js` — inline style prop present; inspect static vs data-driven style

### Components/SelfSignature/Step2

- [ ] `src/Components/SelfSignature/Step2/DisplayCenterImage.js`
- [ ] `src/Components/SelfSignature/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Components/SelfSignature/Stepper

- [ ] `src/Components/SelfSignature/Stepper/SelfSignStepper.js`

### Components/SignaturePlacement

- [ ] `src/Components/SignaturePlacement/SmartGuides.js` — inline style prop present; inspect static vs data-driven style

### Components/SignCompletedScreen

- [x] `src/Components/SignCompletedScreen/SignCompletedScreen.js` — migrated to Tailwind and shared tokens; legacy CSS import retired.

### Components/SigningMessage

- [x] `src/Components/SigningMessage/SigningMessage.js` — migrated to Tailwind and shared tokens; legacy CSS import retired.

### Components/UI

- [ ] `src/Components/UI/EmailChips.jsx`
- [ ] `src/Components/UI/dataPrimitives.jsx` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/UI/dialog.jsx`
- [ ] `src/Components/UI/iconCompat.jsx` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/UI/shadcnCompat.jsx` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/UI/sheet.jsx`

### Components/UI/Badge

- [ ] `src/Components/UI/Badge/Badge.js`

### Components/UI/Button

- [ ] `src/Components/UI/Button/Button.js`

### Components/UI/Card

- [ ] `src/Components/UI/Card/Card.js`

### Components/UI/Input

- [ ] `src/Components/UI/Input/Input.js`

### Components/UI/Modal

- [ ] `src/Components/UI/Modal/Modal.js`

### Components/Upload Flow/Signatories

- [ ] `src/Components/Upload Flow/Signatories/Signatories.js` — inline style prop present; inspect static vs data-driven style

### Components/Upload Flow/Step1

- [ ] `src/Components/Upload Flow/Step1/FirstStep.js` — inline style prop present; inspect static vs data-driven style

### Components/Upload Flow/Step2

- [ ] `src/Components/Upload Flow/Step2/DisplayCenterImage.js`
- [ ] `src/Components/Upload Flow/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Components/Upload Flow/Step3

- [ ] `src/Components/Upload Flow/Step3/FolderSelection.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Components/Upload Flow/Step3/Thirdstep.js` — inline style prop present; inspect static vs data-driven style

### Components/Upload Flow/Stepper

- [ ] `src/Components/Upload Flow/Stepper/Stepper.js`

### Components/Upload Flow/UploadDoc

- [ ] `src/Components/Upload Flow/UploadDoc/UploadDoc.js`

### Components/UserLisence

- [ ] `src/Components/UserLisence/UserLisence.js`

### Context

- [ ] `src/Context/AppTourProvider.js`
- [ ] `src/Context/ThemeContext.js`
- [ ] `src/Context/UserContext.js`

### Helpers

- [ ] `src/Helpers/chatParser.js`

### Integrations/IntegationAuth

- [ ] `src/Integrations/IntegationAuth/CreateIntegration.js`
- [ ] `src/Integrations/IntegationAuth/IntegrationAuth.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Integrations/IntegationAuth/UpdateIntegrationModal.js`

### Integrations/MacAiGeneratedDocs

- [ ] `src/Integrations/MacAiGeneratedDocs/AIGeneratedPDF.js`
- [ ] `src/Integrations/MacAiGeneratedDocs/ListOfDocuments.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Integrations/MacAiGeneratedDocs/OpenAIComponent.js` — inline style prop present; inspect static vs data-driven style

### Integrations/ManuallyGeneratedDocs

- [ ] `src/Integrations/ManuallyGeneratedDocs/ManualDosList.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Integrations/ManuallyGeneratedDocs/ManuallyGenerateComponent.js` — inline style prop present; inspect static vs data-driven style

### Integrations/SmsIntegration

- [ ] `src/Integrations/SmsIntegration/CreateSMSIntegration.js` — inline style prop present; inspect static vs data-driven style

### Integrations/webhookIntegration

- [ ] `src/Integrations/webhookIntegration/CreateWebhook.js` — inline style prop present; inspect static vs data-driven style

### Pages

- [x] `src/Pages/DocumentRecalled.js` — uses shared SigningMessage component.
- [x] `src/Pages/DownloadPdfPage.js` — migrated to clean flex layout and Tailwind utilities.
- [x] `src/Pages/DownloadSignedPage.js` — migrated to Tailwind utilities; dead markup removed.

### Pages/AuditTrail

- [ ] `src/Pages/AuditTrail/AuditTrail.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/AuditTrail/AuditTrailModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/AuditTrail/AuditTrailSignaturePage.js` — inline style prop present; inspect static vs data-driven style

### Pages/Auth/Carousels

- [x] `src/Pages/Auth/Carousels/AuthFeatureCarousel.js` — migrated to shared tokens and Tailwind utilities; `AuthFeatureCarousel.css` retired.

### Pages/Auth/Carousels/Forgot

- [x] `src/Pages/Auth/Carousels/Forgot/ForgotCarousel.js` — delegates to `AuthFeatureCarousel`.

### Pages/Auth/Carousels/Login

- [x] `src/Pages/Auth/Carousels/Login/LoginCarousel.js` — delegates to `AuthFeatureCarousel`.

### Pages/Auth/Carousels/SignUp

- [x] `src/Pages/Auth/Carousels/SignUp/SignUpCarousel.js` — delegates to `AuthFeatureCarousel`.

### Pages/Auth/ForgotPassword

- [x] `src/Pages/Auth/ForgotPassword/ForgotPassword.js` — migrated to shared tokens and Tailwind utilities; custom stylesheets (`style.css`, `AuthPages.css`) retired.
- [x] `src/Pages/Auth/ForgotPassword/Resetpassword.js` — migrated to shared tokens and Tailwind utilities; custom stylesheets (`style.css`, `AuthPages.css`) retired.

### Pages/Auth/Login

- [x] `src/Pages/Auth/Login/Login.js` — migrated to shared tokens and Tailwind utilities; custom stylesheets (`Login.css`, `AuthPages.css`) retired.

### Pages/Auth/PasswordChange

- [x] `src/Pages/Auth/PasswordChange/PasswordChange.js` — migrated to shared tokens and Tailwind utilities; custom stylesheet (`style.css`) retired.

### Pages/Auth/Signup

- [x] `src/Pages/Auth/Signup/SignUp.js` — migrated to shared tokens and Tailwind utilities; custom stylesheets (`style.css`, `AuthPages.css`) retired.

### Pages/Auth/VerifyOtp

- [x] `src/Pages/Auth/VerifyOtp/VerifyOtpPage.js` — migrated to shared tokens and Tailwind utilities; custom stylesheet (`style.css`) retired.

### Pages/DeclinedMessage

- [x] `src/Pages/DeclinedMessage/DeclinedMessage.js` — uses shared SigningMessage component.

### Pages/Errors

- [x] `src/Pages/Errors/Forbidden403.js` — migrated to shared tokens and pure Tailwind utilities.

### Pages/Home

- [ ] `src/Pages/Home/Home.js`

### Pages/LinkExpire

- [x] `src/Pages/LinkExpire/LinkExpire.js` — uses shared SigningMessage component.

### Pages/MobileTemplates/Step2

- [ ] `src/Pages/MobileTemplates/Step2/DisplayCenterImage.js`
- [ ] `src/Pages/MobileTemplates/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Pages/MobileUpload/Step2

- [ ] `src/Pages/MobileUpload/Step2/DisplayCenterImage.js`
- [ ] `src/Pages/MobileUpload/Step2/MobileImageThumbnails.js`
- [ ] `src/Pages/MobileUpload/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Pages/Profile

- [ ] `src/Pages/Profile/UserProfile.js` — inline style prop present; inspect static vs data-driven style

### Pages/SignaturePage

- [ ] `src/Pages/SignaturePage/ConfirmationModal.js`
- [x] `src/Pages/SignaturePage/DocumentLoadError.js` — uses shared SigningMessage component.
- [ ] `src/Pages/SignaturePage/InputEditors.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/SignaturePage/PasswordModal.js`
- [ ] `src/Pages/SignaturePage/SignatureColor.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/SignaturePage/SignatureModal.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/SignaturePage/SignaturePage.js` — inline style prop present; inspect static vs data-driven style

### Pages/SignedMessage

- [x] `src/Pages/SignedMessage/SignedMessage.js` — uses shared SigningMessage component.

### Pages/SignedPage

- [x] `src/Pages/SignedPage/SignedPage.js` — migrated to Tailwind and shared design tokens; data-driven control positioning preserved.

### Pages/Templates

- [ ] `src/Pages/Templates/EditTemplateNameModal.js`
- [ ] `src/Pages/Templates/Templates.js`
- [ ] `src/Pages/Templates/TemplatesConfirmationModal.js`
- [ ] `src/Pages/Templates/TemplatesPage.js` — inline style prop present; inspect static vs data-driven style
- [ ] `src/Pages/Templates/TemplatesSearchFilter.js`

### Pages/Templates/Step1

- [ ] `src/Pages/Templates/Step1/FirstStep.js` — inline style prop present; inspect static vs data-driven style

### Pages/Templates/Step1/AddRecipient

- [ ] `src/Pages/Templates/Step1/AddRecipient/AddRecipient.js` — inline style prop present; inspect static vs data-driven style

### Pages/Templates/Step2

- [ ] `src/Pages/Templates/Step2/DisplayCenterImage.js`
- [ ] `src/Pages/Templates/Step2/Secondstep.js` — inline style prop present; inspect static vs data-driven style

### Pages/Templates/UploadDoc

- [ ] `src/Pages/Templates/UploadDoc/UploadDoc.js`

### routes

- [ ] `src/routes/AppRouter.js`
- [ ] `src/routes/ProtectedRoute.js`

### routes/Guards

- [ ] `src/routes/Guards/AuthGuard.js`
- [ ] `src/routes/Guards/RoleGuard.js`

## All custom CSS files

Every source CSS file is listed below with its direct importers. Convert route-specific static styling to Tailwind utilities and shared reusable rules to shared Tailwind/shadcn components. Keep the global token definitions and narrowly scoped third-party or print/editor overrides where Tailwind cannot replace them cleanly.

### Global CSS

- [ ] `src/index.css` — imported by `src/App.js`, `src/index.js`

### assets/Icons

- [ ] `src/assets/Icons/brandLogo.css` — imported by `src/assets/Icons/index.js`

### Components/BulkSend/PlaceBulkSignatories

- [ ] `src/Components/BulkSend/PlaceBulkSignatories/style.css` — imported by `src/Components/BulkSend/PlaceBulkSignatories/PlaceBulkSignatories.js`

### Components/BulkSend/Step1

- [ ] `src/Components/BulkSend/Step1/FirstStep.css` — imported by `src/Components/BulkSend/Step1/FirstStep.js`

### Components/BulkSend/Step2

- [ ] `src/Components/BulkSend/Step2/Secondstep.css` — imported by `src/Components/BulkSend/Step2/Secondstep.js`

### Components/BulkSend/Step3

- [ ] `src/Components/BulkSend/Step3/Thirdstep.css` — imported by `src/Components/BulkSend/Step3/Thirdstep.js`

### Components/Cobranding

- [ ] `src/Components/Cobranding/style.css` — imported by `src/Components/Cobranding/Cobranding.js`, `src/Components/Cobranding/DaysToExpire.js`

### Components/Comments

- [x] `src/Components/Comments/Comments.css` — retired after migrating comments thread to shared tokens and Tailwind utilities.

### Components/CommonModals/AIAssitant

- [ ] `src/Components/CommonModals/AIAssitant/AIAssistant.css` — imported by `src/Components/CommonModals/AIAssitant/AIAssistant.js`

### Components/CommonModals/CustomToast

- [ ] `src/Components/CommonModals/CustomToast/CustomToast.css` — imported by `src/Components/CommonModals/CustomToast/CustomToast.js`

### Components/CommonModals/DocumentsComments

- [x] `src/Components/CommonModals/DocumentsComments/DashboardComments.css` — retired after migrating dashboard comments modal to shared tokens and Tailwind utilities.

### Components/CommonModals/Loader

- [x] `src/Components/CommonModals/Loader/Loader.css` — retired after removing full-screen Lottie loader overlay across all pages.

### Components/CommonModals/SearchFilters

- [ ] `src/Components/CommonModals/SearchFilters/style.css` — imported by `src/Components/CommonModals/SearchFilters/DraftSearchFilter.js`

### Components/CommonModals/ShareModal

- [ ] `src/Components/CommonModals/ShareModal/modal.css` — imported by `src/Components/CommonModals/ShareModal/ShareModal.js`

### Components/CreateTeam

- [ ] `src/Components/CreateTeam/style.css` — imported by `src/Components/CreateTeam/CreateTeam.js`, `src/Components/CreateTeam/UserSearchFilter.js`, `src/Components/Department/DepartmentList.js`

### Components/DashboardStatuses/CompleteStatus

- [x] `src/Components/DashboardStatuses/CompleteStatus/style.css` — retired after migrating complete documents list to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/Dashboard

- [x] `src/Components/DashboardStatuses/Dashboard/RecentDocuments.css` — retired after migrating recent documents surface to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/DashboardCards

- [x] `src/Components/DashboardStatuses/DashboardCards/DashboardCard.css` — retired after migrating dashboard cards to shared tokens and responsive Tailwind grid.

### Components/DashboardStatuses/Decline

- [x] `src/Components/DashboardStatuses/Decline/style.css` — retired after migrating declined documents list to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/Draftstatus

- [x] `src/Components/DashboardStatuses/Draftstatus/style.css` — retired after migrating draft documents list to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/PendingStatus

- [x] `src/Components/DashboardStatuses/PendingStatus/style.css` — retired after migrating pending documents lists to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/PendingStatus/ChangeSignOrder

- [x] `src/Components/DashboardStatuses/PendingStatus/ChangeSignOrder/ChangeOrderModal.css` — retired after migrating change signing order modal to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/PendingStatus/TransferOwner

- [x] `src/Components/DashboardStatuses/PendingStatus/TransferOwner/TransferOwnershipModal.css` — retired after migrating transfer ownership and resend notification modals to shared tokens and Tailwind utilities.

### Components/DashboardStatuses/SharedStatus

- [x] `src/Components/DashboardStatuses/SharedStatus/style.css` — retired after migrating shared documents list to shared tokens and Tailwind utilities.

### Components/Delegation

- [ ] `src/Components/Delegation/style.css` — imported by `src/Components/Delegation/Delegation.js`

### Components/DMS

- [ ] `src/Components/DMS/dms.css` — imported by `src/Components/DMS/DMS.js`, `src/Components/DMS/DmsDocumentPickerModal.js`

### Components/DocumentPreparation/Step3_Recipients

- [x] `src/Components/DocumentPreparation/Step3_Recipients/style.css` — retired after the CC email input and action layout moved to shared Tailwind tokens and primitives.

### Components/EmailTemplates

- [ ] `src/Components/EmailTemplates/style.css` — imported by `src/Components/EmailTemplates/CreateEmailTemplate.js`, `src/Components/EmailTemplates/EmailTemplates.js`

### Components/GoogleLogin

- [ ] `src/Components/GoogleLogin/style.css` — imported by `src/Components/GoogleLogin/GoogleLogin.js`

### Components/HomeCalendar

- [ ] `src/Components/HomeCalendar/HomeCalendar.css` — imported by `src/Components/HomeCalendar/HomeCalendar.js`

### Components/ImageThumbnails

- [ ] `src/Components/ImageThumbnails/Imagethumbnails.css` — imported by `src/Components/ImageThumbnails/ImageThumbnails.js`

### Components/Language

- [x] `src/Components/Language/LangSelector.css` — retired after migrating bilingual language toggle to pure Tailwind utilities.
- [x] `src/Components/Language/LanguageSelector.css` — retired after migrating language selector dropdown to shared tokens and Tailwind utilities.

### Components/Navbar

- [ ] `src/Components/Navbar/sidebarStyle.css` — imported by `src/Components/Navbar/Sidebar.js`
- [ ] `src/Components/Navbar/style.css` — imported by `src/Components/Navbar/Header.js`

### Components/ReportDashboard/CompanyAdminPanel

- [ ] `src/Components/ReportDashboard/CompanyAdminPanel/style.css` — imported by `src/Components/ReportDashboard/AppUserReport/AppUserReport.js`, `src/Components/ReportDashboard/CompanyAdminPanel/AdminHome.js`, `src/Components/ReportDashboard/CompanyAdminPanel/CompanyProfile.js`, `src/Components/ReportDashboard/CompanyAdminPanel/UserDocuments.js`, `src/Components/ReportDashboard/UserDocReport/UserDocReport.js`

### Components/SelfSignature/SignaturePage

- [ ] `src/Components/SelfSignature/SignaturePage/SignaturePage.css` — imported by `src/Components/SelfSignature/SignaturePage/SignaturePageSelf.js`

### Components/SelfSignature/Step1

- [ ] `src/Components/SelfSignature/Step1/FirstStep.css` — imported by `src/Components/SelfSignature/Step1/FirstStep.js`

### Components/SelfSignature/Step2

- [ ] `src/Components/SelfSignature/Step2/Secondstep.css` — imported by `src/Components/SelfSignature/Step2/Secondstep.js`

### Components/SignaturePlacement

- [ ] `src/Components/SignaturePlacement/SmartGuides.css` — imported by `src/Components/SignaturePlacement/SmartGuides.js`

### Components/SigningMessage

- [x] `src/Components/SigningMessage/SigningMessage.css` — retired after migrating SigningMessage to Tailwind and shared design tokens.

### Components/UI/Badge

- [ ] `src/Components/UI/Badge/Badge.css` — imported by `src/Components/UI/Badge/Badge.js`

### Components/UI/Button

- [ ] `src/Components/UI/Button/Button.css` — imported by `src/Components/UI/Button/Button.js`

### Components/UI/Card

- [ ] `src/Components/UI/Card/Card.css` — imported by `src/Components/UI/Card/Card.js`

### Components/UI/Input

- [ ] `src/Components/UI/Input/Input.css` — imported by `src/Components/UI/Input/Input.js`

### Components/UI/Modal

- [ ] `src/Components/UI/Modal/Modal.css` — imported by `src/Components/UI/Modal/Modal.js`

### Components/Upload Flow/Signatories

- [ ] `src/Components/Upload Flow/Signatories/Signatories.css` — imported by `src/Components/Upload Flow/Signatories/Signatories.js`

### Components/Upload Flow/Step1

- [ ] `src/Components/Upload Flow/Step1/FirstStep.css` — imported by `src/Components/Upload Flow/Step1/FirstStep.js`

### Components/Upload Flow/Step2

- [ ] `src/Components/Upload Flow/Step2/Secondstep.css` — imported by `src/Components/Upload Flow/Step2/Secondstep.js`

### Components/Upload Flow/Step3

- [ ] `src/Components/Upload Flow/Step3/Thirdstep.css` — imported by `src/Components/Upload Flow/Step3/Thirdstep.js`

### Components/UserLisence

- [ ] `src/Components/UserLisence/style.css` — imported by `src/Components/UserLisence/UserLisence.js`

### Integrations/MacAiGeneratedDocs

- [x] `src/Integrations/MacAiGeneratedDocs/style.css` — retired after migrating Mac AI generation flows to shared tokens and Tailwind utilities.

### Integrations/ManuallyGeneratedDocs

- [x] `src/Integrations/ManuallyGeneratedDocs/style.css` — retired after migrating manual document creation to shared tokens and Tailwind utilities.

### Pages/AuditTrail

- [ ] `src/Pages/AuditTrail/AuditTrail.css` — imported by `src/Pages/AuditTrail/AuditTrailModal.js`, `src/Pages/AuditTrail/AuditTrailSignaturePage.js`
- [ ] `src/Pages/AuditTrail/AuditTrailInternal.css` — imported by `src/Pages/AuditTrail/AuditTrail.js`

### Pages/Auth

- [x] `src/Pages/Auth/AuthPages.css` — retired after migrating `Login.js`, `SignUp.js`, `ForgotPassword.js`, and `Resetpassword.js` to shared tokens and Tailwind utilities (with third-party `react-phone-input-2` rules moved to `src/index.css`).

### Pages/Auth/Carousels

- [x] `src/Pages/Auth/Carousels/AuthFeatureCarousel.css` — retired after migrating `AuthFeatureCarousel.js` to shared tokens and Tailwind utilities.

### Pages/Auth/ForgotPassword

- [x] `src/Pages/Auth/ForgotPassword/style.css` — retired after migrating `ForgotPassword.js` and `Resetpassword.js` to shared tokens and Tailwind utilities.

### Pages/Auth/Login

- [x] `src/Pages/Auth/Login/Login.css` — retired after migrating `Login.js` to shared tokens and Tailwind utilities.

### Pages/Auth/PasswordChange

- [x] `src/Pages/Auth/PasswordChange/style.css` — retired after migrating `PasswordChange.js` to shared tokens and Tailwind utilities.

### Pages/Auth/Signup

- [x] `src/Pages/Auth/Signup/style.css` — retired after migrating `SignUp.js` to shared tokens and Tailwind utilities.

### Pages/Auth/VerifyOtp

- [x] `src/Pages/Auth/VerifyOtp/style.css` — retired after migrating `VerifyOtpPage.js` to shared tokens and Tailwind utilities.

### Pages/Errors

- [x] `src/Pages/Errors/Forbidden403.css` — retired after migrating Forbidden 403 screen to shared tokens and pure Tailwind utilities.

### Pages/Home

- [ ] `src/Pages/Home/Home.css` — imported by `src/Pages/Home/Home.js`

### Pages/MobileTemplates/Step2

- [x] `src/Pages/MobileTemplates/Step2/Secondstep.css` — retired after mobile template step 2 canvas moved to shared tokens and Tailwind utilities.

### Pages/MobileUpload/Step2

- [x] `src/Pages/MobileUpload/Step2/Secondstep.css` — retired after mobile upload step 2 canvas moved to shared tokens and Tailwind utilities.

### Pages/Profile

- [ ] `src/Pages/Profile/style.css` — imported by `src/Pages/Profile/UserProfile.js`

### Pages/SignaturePage

- [x] `src/Pages/SignaturePage/SignaturePage.css` — retired after migrating public signature page and modal typography to index.css and Tailwind utilities.

### Pages/SignedMessage

- [x] `src/Pages/SignedMessage/SignedMessage.css` — retired after migrating SignCompletedScreen and SignedMessage to shared tokens.

### Pages/SignedPage

- [x] `src/Pages/SignedPage/SignedPage.css` — retired after migrating `SignedPage.js` to Tailwind and shared design tokens.

### Pages/Templates

- [x] `src/Pages/Templates/TemplateFilter.css` — retired after migrating template search filter to shared tokens and Tailwind utilities.
- [x] `src/Pages/Templates/templates.css` — retired after migrating template pages and modals to shared tokens and Tailwind utilities.

### Pages/Templates/Step1

- [ ] `src/Pages/Templates/Step1/FirstStep.css` — imported by `src/Pages/Templates/Step1/FirstStep.js`

### Pages/Templates/Step1/AddRecipient

- [ ] `src/Pages/Templates/Step1/AddRecipient/AddRecipient.css` — imported by `src/Pages/Templates/Step1/AddRecipient/AddRecipient.js`

### Pages/Templates/Step2

- [ ] `src/Pages/Templates/Step2/Secondstep.css` — imported by `src/Pages/Templates/Step2/Secondstep.js`

### styles

- [ ] `src/styles/themeAwareForm.css` — imported by `src/index.js`

## Third-party stylesheet imports

These stylesheets come from dependencies rather than repository-owned feature CSS. Review them as part of the UI migration; retain only what their widgets need or replace the widget styling where practical.

- [ ] `react-phone-input-2/lib/style.css` — imported by `src/Components/Delegation/Delegation.js`, `src/Pages/Templates/Step1/AddRecipient/AddRecipient.js`, `src/index.js`
- [ ] `react-quill-new/dist/quill.snow.css` — imported by `src/Integrations/ManuallyGeneratedDocs/ManuallyGenerateComponent.js`, `src/index.js`
- [ ] `react-resizable/css/styles.css` — imported by `src/Components/DocumentPreparation/Step2_Canvas/ResizableButtons.js`
- [ ] `react-toastify/dist/ReactToastify.css` — imported by `src/Components/CommonModals/CustomToast/CustomToast.js`

## Migration sequence

1. Finish the shared theme/token rules and Tailwind/shadcn primitives. Keep global token definitions; gradually retire the legacy utility bridge after its consumers are converted.
2. Convert document lifecycle flows together: Upload & Send, Sign Myself, Bulk Send, Templates, then public signing and mobile signing.
3. Convert status views and their action dialogs, then folders and DMS, administration, reports, integrations, and settings.
4. Convert completion, audit, download, and authentication/outcome screens.
5. For each module, migrate every JSX file in its group, remove the corresponding custom CSS only after all consumers have moved, then update its status in UI_MODULE_INVENTORY.md.

## Audit notes

- React 19 and Tailwind are already configured in the current project. PrimeReact, MUI, Bootstrap CSS, and React-Bootstrap dependencies are absent from package.json; legacy Bootstrap-style class names and compatibility rules still appear in JSX and src/index.css and are part of the migration.
- styled-components is listed in package.json; no styled( usage was found in src during this scan.
- External widget styles and runtime-generated values (such as document field coordinates, image sizing, or progress width) need review separately; runtime data should not be hard-coded into Tailwind classes.
- The source scan found no Babel parse errors. This document lists source files; it does not claim visual completion or remove any CSS.
