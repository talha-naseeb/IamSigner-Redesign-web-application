import { Icons } from "@/assets/Icons/index";

export const usePermissions = (user, userAccess) => {
  const isRestrictedUser = (user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0;
  const canUpload = !isRestrictedUser;
  const canAccessAdmin = user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays > 0;
  const isLimitedRole = user.AccountType === "B" && user.RoleID === 3;

  return { isRestrictedUser, canUpload, canAccessAdmin, isLimitedRole };
};

// Menu Configuration Hook
export const useMenuConfig = (user, userAccess, t, accountId) => {
  const permissions = usePermissions(user, userAccess);
  const { isRestrictedUser, canUpload, isLimitedRole } = permissions;
  const isDmsEnabled = process.env.REACT_APP_ENABLE_DOCUMENT_MANAGER === "true";

  // Basic menu items
  const basicMenuItems = [
    {
      type: "upload",
      icon: Icons.Upload,
      label: t("Sidebar.uploadDoc"),
      path: canUpload ? "/upload-doc" : null,
      show: true,
    },
    {
      icon: Icons.Home,
      label: t("Sidebar.Dashboard"),
      path: "/home",
      show: true,
    },
  ].filter((item) => item.show);

  // Admin dropdown items
  const adminMenuItems = [
    {
      icon: Icons.AccountSettings,
      label: t("header.accountSettings"),
      path: "/account-settings",
      show: userAccess.coBrand === true,
    },
    {
      icon: Icons.EmailTemplates,
      label: t("header.emailTemplates"),
      path: "/create-email-template",
      show: true,
    },
    {
      icon: Icons.TeamMembers,
      label: t("Sidebar.teamMembers"),
      path: "/app-users",
      show: userAccess.teams,
    },
    {
      icon: Icons.Department,
      label: t("Sidebar.department"),
      path: `/department-details/${accountId}`,
      show: userAccess.teams,
    },
    {
      icon: Icons.Integrations,
      label: t("Sidebar.Integrations"),
      path: "/auth-integration",
      show: true,
    },
  ].filter((item) => item.show);

  // User report for admin
  const userReportItems = [
    {
      icon: Icons.BusinessDetails,
      label: t("Sidebar.buisnessDetails"),
      path: `/company-profile/${accountId}`,
      show: true,
    },
    {
      icon: Icons.UserDocumentReport,
      label: t("Sidebar.userDocumentReport"),
      path: "/users-documents-report",
      show: userAccess.teams,
    },
    {
      icon: Icons.UserReport,
      label: t("Sidebar.userReport"),
      path: "/users-report",
      show: userAccess.teams,
    },
    {
      icon: Icons.DocumentReport,
      iconHeight: 20,
      label: t("Sidebar.docReport"),
      path: "/documents-report",
      show: true,
    },
  ].filter((item) => item.show);

  // Document Status items for different user types
  const getDocumentStatusItems = () => {
    const commonItems = [
      {
        icon: Icons.Pending,
        label: t("Sidebar.Pending"),
        path: "/pending-docs",
        show: true,
      },
      {
        icon: Icons.Completed,
        label: t("Sidebar.Completed"),
        path: "/completed-docs",
        show: true,
      },
      {
        icon: Icons.Recall,
        iconSize: 21,
        label: t("Sidebar.Recall"),
        path: "/recall-documents",
        show: userAccess.recalled === true,
      },
      {
        icon: Icons.Inactive,
        label: t("Sidebar.Inactive"),
        path: "/inactive",
        show: true,
      },
      {
        icon: Icons.Declined,
        label: t("Sidebar.Declined"),
        path: "/declined-docs",
        show: true,
      },
    ];

    if (!isLimitedRole) {
      commonItems.splice(2, 0, {
        icon: Icons.Draft,
        label: t("Sidebar.Draft"),
        path: "/draft-docs",
        show: true,
      });

      if (userAccess.docShare === true) {
        commonItems.splice(-2, 0, {
          icon: Icons.Share,
          iconSize: 21,
          label: t("Sidebar.Share"),
          path: "/share-docs",
          show: true,
        });
      }
    }

    return commonItems.filter((item) => item.show);
  };

  // Feature menu items
  const featureMenuItems = [
    // {
    //   icon: Icons.Automation,
    //   label: t("Sidebar.AIAssistant"),
    //   path: "/ai-assistant",
    //   className: "template-section",
    //   show: !isRestrictedUser && userAccess.templates === true,
    //
    //  },
    {
      icon: Icons.MacDrive,
      label: t("Sidebar.DMS"),
      path: "/dms",
      className: "dms-section",
      show: isDmsEnabled,
    },
    {
      icon: Icons.Templates,
      label: t("Sidebar.Templates"),
      path: "/templates-page",
      className: "template-section",
      show: !isRestrictedUser && userAccess.templates === true,
    },
    {
      icon: Icons.SelfSign,
      iconSize: 27,
      label: t("Sidebar.SelfSign"),
      path: "/self-sign",
      className: "recentdocuments",
      show: !isRestrictedUser && userAccess.isbulkCSVflow === true,
    },
    {
      icon: Icons.BulkSend,
      label: t("Sidebar.BulkSend"),
      path: "/upload-bulk",
      className: "bulk-section",
      show: !isRestrictedUser && userAccess.bulkDocUpload === true,
    },
    {
      icon: Icons.BulkDocuments,
      label: t("Sidebar.BulkDocuments"),
      path: "/bulk-documents",
      className: "bulk-doc-section",
      show: !isRestrictedUser && userAccess.isbulkCSVflow === true,
    },
    {
      icon: Icons.Folders,
      label: t("Sidebar.Folders"),
      path: "/folders",
      className: "folder-section",
      show: !isRestrictedUser && userAccess.folders === true,
    },
  ].filter((item) => item.show);

  // AI menu items
  const aiMenuItems = [
    {
      icon: Icons.MacAI,
      label: t("Sidebar.MacAI"),
      path: "/mac-ai",
      show: !isRestrictedUser && userAccess.macAI === true,
    },
    {
      icon: Icons.CraftDocument,
      iconSize: 22,
      label: t("Sidebar.CraftDocument"),
      path: "/create-craft-documents",
      show: !isRestrictedUser && userAccess.macAI === true,
    },
    {
      icon: Icons.Automation,
      label: t("Sidebar.AIAssistant"),
      path: "/ai-assistant",
      className: "template-section",
      show: !isRestrictedUser && userAccess.templates === true,
      isSubscriptionOnly: true,
    },
  ].filter((item) => item.show);

  return {
    basicMenuItems,
    adminMenuItems,
    userReportItems,
    documentStatusItems: getDocumentStatusItems(),
    featureMenuItems,
    aiMenuItems,
    permissions,
  };
};
