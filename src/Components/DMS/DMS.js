import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination, Stack } from "@/Components/UI/dataPrimitives";
import { Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import userService from "@/services/userService";
import { Icons } from "@/assets/Icons/index";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { DMS_MAX_UPLOAD_BYTES, ROWS_PER_PAGE } from "./constants/dmsConfig";
import {
  buildBreadcrumb,
  collectDescendantFolderIds,
  DMS_SCOPE_OWN,
  DMS_SCOPE_SHARED,
  DMS_SCOPE_SHARED_OTHERS,
  filterDocuments,
  getFolderDocsMapKey,
  getFolderTreeKey,
  parseDmsScope,
  resolveDmsFolderAccess,
  resolveDmsDocumentAccess,
  getDmsAccessRank,
  sortDocuments,
} from "./utils/dmsHelpers";
import {
  parsePermissionName,
  getDmsPermissionRank,
  getShareResponsePayload,
  normalizeDocumentShare,
} from "./utils/dmsShareUtils";
import { useDmsRequestAbort } from "./hooks/useDmsRequestAbort";
import { useDmsDocumentPreview } from "./hooks/useDmsDocumentPreview";
import { useDmsFolderData } from "./hooks/useDmsFolderData";
import { useDmsDownloads } from "./hooks/useDmsDownloads";
import {
  buildRootFolderParams,
  DEFAULT_ROOT_FOLDER_FILTERS,
} from "./utils/dmsRootFilters";
import {
  canUserStartDmsSign,
  DMS_SIGN_FLOW_MODES,
  isDmsSignableDocument,
  registerDmsDocumentForSigning,
} from "./utils/dmsSignBridge";

// Layout components
import FolderTree from "./components/FolderTree";
import DMSBreadcrumb from "./components/DMSBreadcrumb";
import DMSToolbar from "./components/DMSToolbar";
import DMSGridView from "./components/DMSGridView";
import DMSListView from "./components/DMSListView";
import DMSDetailPanel from "./components/DMSDetailPanel";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";

// Modals / Offcanvases
import NewFolderOffcanvas from "./modals/NewFolderOffcanvas";
import RenameOffcanvas from "./modals/RenameOffcanvas";
import MoveFolderModal from "./modals/MoveFolderModal";
import FolderActivityModal from "./modals/FolderActivityModal";
import UploadModal from "./modals/UploadModal";
import DmsShareModal from "./modals/DmsShareModal";
import FolderAccessModal from "./modals/FolderAccessModal";
import UserLisence from "@/Components/UserLisence/UserLisence";

import "./dms.css";

const DMS = () => {
  const { t, i18n } = useTranslation();
  const { user, userAccess } = useUser();
  const { folderId } = useParams();
  const [searchParams] = useSearchParams();
  const urlScope = parseDmsScope(searchParams);
  const navigate = useNavigate();
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  const [rootFolderFilters, setRootFolderFilters] = useState({
    ...DEFAULT_ROOT_FOLDER_FILTERS,
  });
  const [appliedRootFolderFilters, setAppliedRootFolderFilters] = useState({
    ...DEFAULT_ROOT_FOLDER_FILTERS,
  });
  const rootFolderParams = useMemo(
    () => buildRootFolderParams(appliedRootFolderFilters),
    [appliedRootFolderFilters]
  );
  const hasRootFolderFilters = Object.keys(rootFolderParams).length > 0;
  const hasRootFolderFilterDraft = useMemo(
    () => Object.keys(buildRootFolderParams(rootFolderFilters)).length > 0,
    [rootFolderFilters]
  );
  const canClearRootFolderFilters =
    hasRootFolderFilters || hasRootFolderFilterDraft;

  // ── Navigation state ─────────────────────────────────────────
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(["dms-my-folders"]);
  const [breadcrumb, setBreadcrumb] = useState([]);

  // ── View state ───────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("both");
  const [selectedDocIds, setSelectedDocIds] = useState(() => new Set());
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(() => {
    try {
      return localStorage.getItem("iamsigner_dms_tree_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleTreeCollapsed = useCallback(() => {
    setIsTreeCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iamsigner_dms_tree_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // ── Panel / modal visibility ─────────────────────────────────
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderPanel, setShowNewFolderPanel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFolderAccessModal, setShowFolderAccessModal] = useState(false);
  const [accessTarget, setAccessTarget] = useState(null);
  const [showRenamePanel, setShowRenamePanel] = useState(false);
  const [showMobileTree, setShowMobileTree] = useState(false);
  const [rootFolderFilterLoading, setRootFolderFilterLoading] = useState(false);
  const [signDocumentLoading, setSignDocumentLoading] = useState(false);
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState(false);
  const [deleteFolderLoading, setDeleteFolderLoading] = useState(false);
  const [createFolderLoading, setCreateFolderLoading] = useState(false);

  // ── Selected item state ──────────────────────────────────────
  const [selectedDoc, setSelectedDoc] = useState(null);
  const {
    showDocViewModal,
    previewUrl: dmsViewPreviewUrl,
    mimeType: dmsViewMimeType,
    loading: dmsViewLoading,
    openPreview: handleOpenDocumentViewer,
    closePreview: handleCloseDocViewModal,
  } = useDmsDocumentPreview();
  const { runWithAbort, isAxiosAbortError: isDmsAbortError } =
    useDmsRequestAbort();
  const { downloadDocument, downloadFolder } = useDmsDownloads();

  const {
    rootFolders,
    setRootFolders,
    sharedRootFolders,
    setSharedRootFolders,
    sharedWithOthersFolders,
    setSharedWithOthersFolders,
    sharedDocumentsWithMe,
    setSharedDocumentsWithMe,
    sharedDocumentsWithOthers,
    setSharedDocumentsWithOthers,
    allSubFolders,
    setAllSubFolders,
    folderDocsMap,
    setFolderDocsMap,
    allDocumentsList,
    setAllDocumentsList,
    allDocumentsLoading,
    myStorage,
    sharedLoaded,
    sharedWithOthersLoaded,
    sharedDocumentsLoaded,
    sharedDocumentsWithOthersLoaded,
    adhocFolders,
    setAdhocFolders,
    treeLoaded,
    loadedChildrenFor,
    setLoadedChildrenFor,
    isLoading,
    folderContentLoading,
    sharedListLoading,
    forbiddenFolderKeys,
    treeRoot,
    fetchFolderChildren,
    fetchFolderById,
    fetchFolderDocs,
    fetchSharedFolders,
    refreshSharedFoldersList,
    fetchSharedWithOthersFolders,
    refreshSharedWithOthersFoldersList,
    fetchSharedDocumentsWithMe,
    refreshSharedDocumentsWithMeList,
    fetchSharedDocumentsWithOthers,
    refreshSharedDocumentsWithOthersList,
    refreshDmsAfterMutation,
    initDms,
    fetchRoots,
    fetchAllDocuments,
  } = useDmsFolderData({
    t,
    locale,
    runWithAbort,
    isDmsAbortError,
    rootFolderParams,
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const [activityTarget, setActivityTarget] = useState(null);
  const [folderActivities, setFolderActivities] = useState([]);
  const [folderActivityLoading, setFolderActivityLoading] = useState(false);
  const [documentActivities, setDocumentActivities] = useState([]);
  const [documentActivityLoading, setDocumentActivityLoading] = useState(false);
  const didInitDmsRef = useRef(false);
  const [subpanelPortalNode, setSubpanelPortalNode] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const el = document.getElementById("dms-subpanel-portal");
      if (el) setSubpanelPortalNode(el);
    }
  }, []);

  useEffect(() => {
    if (subpanelPortalNode) {
      if (isTreeCollapsed) {
        subpanelPortalNode.classList.add("sidebar-subpanel--collapsed");
      } else {
        subpanelPortalNode.classList.remove("sidebar-subpanel--collapsed");
      }
    }
  }, [subpanelPortalNode, isTreeCollapsed]);

  const refreshAfterMutation = (args) =>
    refreshDmsAfterMutation(args, setSelectedFolder);

  const handleRootFolderFilterChange = (field, value) => {
    setRootFolderFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyRootFolderFilters = async () => {
    const nextFilters = { ...rootFolderFilters };
    const nextParams = buildRootFolderParams(nextFilters);
    if (Object.keys(nextParams).length === 0) return;
    setAppliedRootFolderFilters(nextFilters);
    setPage(1);
    setRootFolderFilterLoading(true);
    try {
      await fetchRoots(nextParams);
    } finally {
      setRootFolderFilterLoading(false);
    }
  };

  const handleClearRootFolderFilters = async () => {
    if (!canClearRootFolderFilters) return;
    const emptyFilters = { ...DEFAULT_ROOT_FOLDER_FILTERS };
    setRootFolderFilters(emptyFilters);
    setAppliedRootFolderFilters(emptyFilters);
    setPage(1);
    setRootFolderFilterLoading(true);
    try {
      await fetchRoots({});
    } finally {
      setRootFolderFilterLoading(false);
    }
  };

  useEffect(() => {
    if (didInitDmsRef.current) return;
    didInitDmsRef.current = true;
    void initDms();
  }, [initDms]);

  // Sync state with URL folderId + ?scope=shared
  useEffect(() => {
    // Legacy path redirect: /dms/dms-shared → /dms/dms-shared-me
    if (folderId === "dms-shared") {
      navigate("/dms/dms-shared-me", { replace: true });
      return;
    }

    if (!folderId) {
      setSelectedFolder(null);
      setBreadcrumb([]);
      setPage(1);
      return;
    }

    const scope =
      folderId === "dms-my-folders"
        ? DMS_SCOPE_OWN
        : folderId === "dms-shared-me"
        ? DMS_SCOPE_SHARED
        : folderId === "dms-shared-others"
        ? DMS_SCOPE_SHARED_OTHERS
        : urlScope;

    const allAvailableFolders = [
      ...rootFolders,
      ...sharedRootFolders,
      ...sharedWithOthersFolders,
      ...allSubFolders,
      ...Object.values(adhocFolders),
    ];
    const folder = allAvailableFolders.find(
      (f) =>
        (String(f.folderID ?? f.id) === String(folderId) ||
          String(f.id) === String(folderId)) &&
        (f.treeScope ?? DMS_SCOPE_OWN) === scope
    );

    if (folder) {
      setSelectedFolder(folder);
      setBreadcrumb(
        buildBreadcrumb(treeRoot, folder.folderID || folder.id, scope) || [
          folder,
        ]
      );
      setPage(1);
      if (scope === DMS_SCOPE_SHARED && folderId !== "dms-shared-me") {
        setExpandedFolders((prev) =>
          prev.includes("dms-shared-me") ? prev : [...prev, "dms-shared-me"]
        );
      } else if (
        scope === DMS_SCOPE_SHARED_OTHERS &&
        folderId !== "dms-shared-others"
      ) {
        setExpandedFolders((prev) =>
          prev.includes("dms-shared-others")
            ? prev
            : [...prev, "dms-shared-others"]
        );
      }
    } else if (folderId === "dms-my-folders") {
      setSelectedFolder({
        id: "dms-my-folders",
        treeScope: DMS_SCOPE_OWN,
        name: t("DMS.myFolders"),
      });
      setBreadcrumb([
        {
          id: "dms-my-folders",
          treeKey: "dms-my-folders",
          treeScope: DMS_SCOPE_OWN,
          name: t("DMS.myFolders"),
        },
      ]);
      setPage(1);
    } else if (folderId === "dms-shared-me") {
      setSelectedFolder({
        id: "dms-shared-me",
        treeScope: DMS_SCOPE_SHARED,
        name: t("DMS.sharedWithMe"),
      });
      setBreadcrumb([
        {
          id: "dms-shared-me",
          treeKey: "dms-shared-me",
          treeScope: DMS_SCOPE_SHARED,
          name: t("DMS.sharedWithMe"),
        },
      ]);
      setPage(1);
      setExpandedFolders((prev) =>
        prev.includes("dms-shared-me") ? prev : [...prev, "dms-shared-me"]
      );
    } else if (folderId === "dms-shared-others") {
      setSelectedFolder({
        id: "dms-shared-others",
        treeScope: DMS_SCOPE_SHARED_OTHERS,
        name: t("DMS.sharedWithOthers"),
      });
      setBreadcrumb([
        {
          id: "dms-shared-others",
          treeKey: "dms-shared-others",
          treeScope: DMS_SCOPE_SHARED_OTHERS,
          name: t("DMS.sharedWithOthers"),
        },
      ]);
      setPage(1);
      setExpandedFolders((prev) =>
        prev.includes("dms-shared-others")
          ? prev
          : [...prev, "dms-shared-others"]
      );
    } else if (treeLoaded) {
      if (scope === DMS_SCOPE_SHARED && !sharedLoaded) {
        void fetchSharedFolders();
      } else if (scope === DMS_SCOPE_SHARED_OTHERS && !sharedWithOthersLoaded) {
        void fetchSharedWithOthersFolders();
      }
      fetchFolderById(folderId, scope);
    }
  }, [
    folderId,
    urlScope,
    rootFolders,
    sharedRootFolders,
    sharedWithOthersFolders,
    allSubFolders,
    adhocFolders,
    treeRoot,
    t,
    treeLoaded,
    sharedLoaded,
    sharedWithOthersLoaded,
  ]);

  // Load shared-with-me list whenever user enters the shared section (tree or deep link)
  useEffect(() => {
    const atSharedRoot = folderId === "dms-shared-me";
    const inSharedSection =
      atSharedRoot ||
      (urlScope === DMS_SCOPE_SHARED &&
        folderId &&
        folderId !== "dms-my-folders");
    if (!inSharedSection) return;
    // Force only when landing on the section root so Me/Others never keep a stale cached list
    void fetchSharedFolders({ force: atSharedRoot });
    void fetchSharedDocumentsWithMe({ force: atSharedRoot });
    // Intentionally omit fetchers from deps — identity changes after load and would re-fetch forever
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, urlScope]);

  useEffect(() => {
    const atOthersRoot = folderId === "dms-shared-others";
    const inSharedWithOthersSection =
      atOthersRoot ||
      (urlScope === DMS_SCOPE_SHARED_OTHERS &&
        folderId &&
        folderId !== "dms-my-folders");
    if (!inSharedWithOthersSection) return;
    void fetchSharedWithOthersFolders({ force: atOthersRoot });
    void fetchSharedDocumentsWithOthers({ force: atOthersRoot });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, urlScope]);

  useEffect(() => {
    if (!folderId) {
      void fetchAllDocuments();
    } else {
      setAllDocumentsList([]);
    }
  }, [folderId]);

  // ── Derived data ─────────────────────────────────────────────
  const isRoot = !selectedFolder;
  const isMyFoldersBrowse = selectedFolder?.id === "dms-my-folders";
  const subfolders = !selectedFolder
    ? []
    : selectedFolder.id === "dms-my-folders"
    ? rootFolders
    : selectedFolder.id === "dms-shared-me"
    ? sharedRootFolders
    : selectedFolder.id === "dms-shared-others"
    ? sharedWithOthersFolders
    : allSubFolders.filter(
        (folder) =>
          folder.parentFolderID ===
            (selectedFolder.folderID || selectedFolder.id) &&
          folder.treeScope === (selectedFolder.treeScope ?? DMS_SCOPE_OWN)
      );

  // All Documents: only owned docs — never Shared with Me / Shared with Others rows
  const ownAllDocuments = useMemo(() => {
    return allDocumentsList.filter((doc) => {
      if (doc.sharedDirectly) return false;
      if (doc.shareId) return false;
      if (doc.treeScope === DMS_SCOPE_SHARED || doc.treeScope === DMS_SCOPE_SHARED_OTHERS) {
        return false;
      }
      return true;
    });
  }, [allDocumentsList]);

  const sourceDocs = !selectedFolder
    ? ownAllDocuments
    : selectedFolder.id === "dms-shared-me"
      ? sharedDocumentsWithMe
      : selectedFolder.id === "dms-shared-others"
        ? sharedDocumentsWithOthers
        : folderDocsMap[
            getFolderDocsMapKey(
              selectedFolder.treeScope ?? DMS_SCOPE_OWN,
              selectedFolder.folderID || selectedFolder.id
            )
          ] || [];

  const selectedTreeKey = useMemo(() => {
    if (!selectedFolder) return null;
    return getFolderTreeKey(
      selectedFolder.treeScope ?? DMS_SCOPE_OWN,
      selectedFolder.shareId || selectedFolder.id
    );
  }, [selectedFolder]);

  const folderAccess = useMemo(
    () => resolveDmsFolderAccess(selectedFolder),
    [selectedFolder]
  );

  const documentAccess = useMemo(
    () =>
      isRoot
        ? {
            canView: true,
            canUpload: true,
            canEdit: true,
            canDelete: true,
            canShare: true,
            canManageAccess: true,
            fullControl: true,
          }
        : folderAccess,
    [isRoot, folderAccess]
  );

  const canCreateFolder = useMemo(() => {
    if (!selectedFolder) return true;
    if (selectedFolder.id === "dms-shared-me") return false;
    if (selectedFolder.id === "dms-shared-others") return false;
    if (selectedFolder.id === "dms-my-folders") return true;
    return folderAccess.canEdit;
  }, [selectedFolder, folderAccess.canEdit]);

  const moveDestinationFolders = useMemo(() => {
    if (!moveTarget?.id) return [];
    const ownFolders = [...rootFolders, ...allSubFolders].filter(
      (folder) => (folder.treeScope ?? DMS_SCOPE_OWN) === DMS_SCOPE_OWN
    );
    const excludedIds =
      moveTarget.itemType === "document"
        ? new Set()
        : collectDescendantFolderIds(moveTarget.id, DMS_SCOPE_OWN, ownFolders);
    const childrenByParent = new Map();

    ownFolders.forEach((folder) => {
      if (excludedIds.has(String(folder.id))) return;
      const parentKey = String(folder.parentFolderID || "");
      const siblings = childrenByParent.get(parentKey) || [];
      siblings.push(folder);
      childrenByParent.set(parentKey, siblings);
    });

    const buildOptions = (parentId = "", depth = 0) => {
      const children = [...(childrenByParent.get(String(parentId)) || [])].sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      return children.flatMap((folder) => [
        { id: folder.id, name: folder.name, depth },
        ...buildOptions(folder.id, depth + 1),
      ]);
    };

    return buildOptions();
  }, [moveTarget, rootFolders, allSubFolders]);

  const activeFolderDocsKey = selectedFolder
    ? getFolderDocsMapKey(
        selectedFolder.treeScope ?? DMS_SCOPE_OWN,
        selectedFolder.folderID || selectedFolder.id
      )
    : null;
  const isActiveFolderForbidden =
    Boolean(activeFolderDocsKey) &&
    forbiddenFolderKeys.has(activeFolderDocsKey);

  const filteredDocs = useMemo(() => {
    if (contentFilter === "folders") return [];
    const sorted = sortDocuments(sourceDocs, "modified");
    return filterDocuments(sorted, searchQuery, "All");
  }, [sourceDocs, searchQuery, contentFilter]);

  const matchFolderSearch = useCallback(
    (folder) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return String(folder?.name || "")
        .toLowerCase()
        .includes(q);
    },
    [searchQuery]
  );

  const filteredRootFolders = useMemo(() => {
    if (contentFilter === "files") return [];
    // All Documents shows only owned root folders — never Shared with Me / Others
    return rootFolders.filter(matchFolderSearch);
  }, [rootFolders, contentFilter, matchFolderSearch]);

  const filteredSubfolders = useMemo(() => {
    if (contentFilter === "files") return [];
    return subfolders.filter(matchFolderSearch);
  }, [subfolders, contentFilter, matchFolderSearch]);

  const showFolders = contentFilter !== "files";
  const showDocuments = !isMyFoldersBrowse && contentFilter !== "folders";

  const sidebarDocCount = useMemo(() => {
    if (Number.isFinite(myStorage.totalDocuments))
      return myStorage.totalDocuments;
    if (allDocumentsList.length > 0) return allDocumentsList.length;
    const seen = new Set();
    let count = 0;
    Object.entries(folderDocsMap).forEach(([key, docs]) => {
      if (!key.startsWith(`${DMS_SCOPE_OWN}:`)) return;
      docs.forEach((doc) => {
        const id = String(doc.id ?? doc.documentId ?? "");
        if (id && !seen.has(id)) {
          seen.add(id);
          count += 1;
        }
      });
    });
    return count;
  }, [myStorage.totalDocuments, allDocumentsList, folderDocsMap]);

  const sidebarFolderCount = useMemo(() => {
    if (Number.isFinite(myStorage.totalFolders)) return myStorage.totalFolders;
    return (
      rootFolders.length +
      allSubFolders.filter(
        (f) => (f.treeScope ?? DMS_SCOPE_OWN) === DMS_SCOPE_OWN
      ).length
    );
  }, [myStorage.totalFolders, rootFolders, allSubFolders]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFolder?.id, contentFilter]);

  useEffect(() => {
    setSelectedDocIds(new Set());
  }, [folderId, urlScope]);

  const selectionEnabled = false;

  const toggleDocSelection = (doc, checked) => {
    if (!doc?.id) return;
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(doc.id);
      else next.delete(doc.id);
      return next;
    });
  };

  const clearDocSelection = () => setSelectedDocIds(new Set());

  const documentsSectionLabel = useMemo(() => {
    if (selectedFolder?.id === "dms-shared-me")
      return t("DMS.sharedDocumentsWithMe");
    if (selectedFolder?.id === "dms-shared-others")
      return t("DMS.sharedDocumentsWithOthers");
    if (isRoot) return t("DMS.allDocumentsBrowse");
    return t("DMS.documents");
  }, [selectedFolder?.id, isRoot, t]);

  const selectedDocAccess = useMemo(
    () =>
      selectedDoc
        ? resolveDmsDocumentAccess(selectedDoc, documentAccess)
        : documentAccess,
    [selectedDoc, documentAccess]
  );

  const totalPages = Math.ceil(filteredDocs.length / ROWS_PER_PAGE);
  const pagedDocs = filteredDocs.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const canUploadDocuments =
    Boolean(selectedFolder?.folderID || selectedFolder?.subFolderID) &&
    folderAccess.canUpload;
  const canMoveDocuments =
    documentAccess.canEdit &&
    (selectedFolder?.treeScope ?? DMS_SCOPE_OWN) !== DMS_SCOPE_SHARED;

  const canUseSignFlow = canUserStartDmsSign(user, userAccess);

  const dmsSignFlowOptions = useMemo(
    () => [
      {
        mode: DMS_SIGN_FLOW_MODES.NORMAL,
        title: t("DMS.normalSignature"),
        description: t("DMS.normalSignatureDescription"),
      },
      {
        mode: DMS_SIGN_FLOW_MODES.BULK,
        title: t("DMS.bulkSignature"),
        description: t("DMS.bulkSignatureDescription"),
      },
      {
        mode: DMS_SIGN_FLOW_MODES.SELF,
        title: t("DMS.selfSignature"),
        description: t("DMS.selfSignatureDescription"),
      },
    ],
    [t]
  );

  const resetDmsSignWizardState = () => {
    localStorage.removeItem("registerSignID");
    localStorage.removeItem("activeStepBulk");
    localStorage.removeItem("completedStepsBulk");
    localStorage.removeItem("signatoriesID");
    sessionStorage.removeItem("base64CSV");
  };

  const handleSignDocument = async (doc, mode = DMS_SIGN_FLOW_MODES.NORMAL) => {
    if (!canUseSignFlow) {
      toast.info(t("DMS.signLicenseRequired"));
      return;
    }
    if (!documentAccess.canView) {
      toast.info(t("DMS.actionNotPermitted"));
      return;
    }
    if (!isDmsSignableDocument(doc)) {
      toast.info(t("DMS.signUnsupportedType"));
      return;
    }
    setSignDocumentLoading(true);
    try {
      resetDmsSignWizardState();
      const result = await registerDmsDocumentForSigning({ doc, user, mode });
      const registerSignID = result?.registerSignID;
      if (!registerSignID) throw new Error("missing-register-sign-id");
      localStorage.setItem("registerSignID", registerSignID);
      if (
        mode === DMS_SIGN_FLOW_MODES.BULK ||
        mode === DMS_SIGN_FLOW_MODES.SELF
      ) {
        localStorage.setItem("activeStepBulk", "1");
        localStorage.setItem("completedStepsBulk", JSON.stringify([]));
      }
      toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
      setShowDetailPanel(false);
      navigate(result.route || "/upload-doc");
    } catch (error) {
      console.error("DMS sign bridge failed:", error);
      toast.error(t("uploadDocFlow.errorUploadFile"));
    } finally {
      setSignDocumentLoading(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────

  const handleFolderSelect = (item) => {
    if (!item?.id) return;
    if (
      item.id === "dms-my-folders" ||
      item.id === "dms-shared-me" ||
      item.id === "dms-shared-others"
    ) {
      setExpandedFolders((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id]
      );
      navigate(`/dms/${item.id}`);
      return;
    }
    const scope =
      item.treeScope === DMS_SCOPE_SHARED
        ? "?scope=shared"
        : item.treeScope === DMS_SCOPE_SHARED_OTHERS
        ? "?scope=sharedOthers"
        : "";
    // Prefer real folder id for navigation; share row id is only for list identity
    const navId = item.folderID || item.id;
    navigate(`/dms/${navId}${scope}`);
  };

  const handleGoHome = () => {
    navigate("/dms");
  };

  const handleToggleExpand = (item) => {
    const treeKey = item?.treeKey ?? item?.id;
    if (!treeKey) return;
    const willExpand = !expandedFolders.includes(treeKey);
    setExpandedFolders((prev) =>
      willExpand ? [...prev, treeKey] : prev.filter((id) => id !== treeKey)
    );
    if (treeKey === "dms-shared-me" && willExpand) {
      void fetchSharedFolders({ showLoader: false, force: !sharedLoaded });
      return;
    }
    if (treeKey === "dms-shared-others" && willExpand) {
      void fetchSharedWithOthersFolders({
        showLoader: false,
        force: !sharedWithOthersLoaded,
      });
      return;
    }
    if (
      willExpand &&
      treeKey !== "dms-my-folders" &&
      treeKey !== "dms-shared-me" &&
      treeKey !== "dms-shared-others" &&
      item?.id
    ) {
      fetchFolderChildren(item.folderID || item.id, {
        treeScope: item.treeScope ?? DMS_SCOPE_OWN,
        showLoader: false,
      });
    }
  };

  const handleDocSelect = (doc) => {
    setSelectedDoc(doc);
    setShowDetailPanel(true);
  };

  const getActivityPayload = (response) => {
    const data = response?.data;
    const findArray = (value) => {
      if (Array.isArray(value)) return value;
      if (!value || typeof value !== "object") return null;
      const direct =
        value.response ??
        value.data ??
        value.items ??
        value.result ??
        value.results ??
        value.activities ??
        value.activityLogs ??
        value.logs ??
        value.records;
      const directArray = findArray(direct);
      if (directArray) return directArray;
      for (const child of Object.values(value)) {
        const nestedArray = findArray(child);
        if (nestedArray) return nestedArray;
      }
      return null;
    };
    const items = findArray(data);
    if (items) return items;
    if (data && typeof data === "object") return [data];
    return [];
  };

  const getDocumentActivityId = (doc) =>
    doc?.documentId ?? doc?.documentID ?? doc?.masterDocID ?? doc?.id ?? null;

  const fetchDocumentActivity = async (docOrId, isCancelled = () => false) => {
    const documentId =
      typeof docOrId === "object" ? getDocumentActivityId(docOrId) : docOrId;
    if (!documentId) return;
    setDocumentActivities([]);
    setDocumentActivityLoading(true);
    try {
      const response = await userService.getDmsDocumentActivity(documentId);
      if (!isCancelled()) setDocumentActivities(getActivityPayload(response));
    } catch {
      if (!isCancelled()) setDocumentActivities([]);
    } finally {
      if (!isCancelled()) setDocumentActivityLoading(false);
    }
  };

  const handleFolderActivity = async (folder) => {
    const targetFolderId = folder?.folderID ?? folder?.id;
    if (!targetFolderId) return;
    setActivityTarget(folder);
    setFolderActivities([]);
    setFolderActivityLoading(true);
    try {
      const response = await userService.getDmsFolderActivity(targetFolderId);
      setFolderActivities(getActivityPayload(response));
    } catch {
      setFolderActivities([]);
    } finally {
      setFolderActivityLoading(false);
    }
  };

  const handleCloseFolderActivity = () => {
    setActivityTarget(null);
    setFolderActivities([]);
    setFolderActivityLoading(false);
  };

  const refreshDocumentSharedWith = useCallback(
    async (docOrId) => {
      const documentId =
        typeof docOrId === "object"
          ? docOrId.documentId || docOrId.id
          : docOrId;
      if (!documentId) return;
      try {
        const res = await userService.getDocumentShares(documentId);
        const payload = getShareResponsePayload(res);
        const sharedWith = payload
          .map(normalizeDocumentShare)
          .map((row) => row.sharedWithUser)
          .filter(Boolean);

        const matchesDoc = (doc) =>
          doc &&
          (String(doc.documentId) === String(documentId) ||
            String(doc.id) === String(documentId));

        setSelectedDoc((prev) =>
          matchesDoc(prev) ? { ...prev, sharedWith } : prev
        );

        const treeScope =
          typeof docOrId === "object" ? docOrId.treeScope : null;
        if (treeScope === DMS_SCOPE_SHARED) {
          setSharedDocumentsWithMe((prev) =>
            prev.map((doc) => (matchesDoc(doc) ? { ...doc, sharedWith } : doc))
          );
        } else if (treeScope === DMS_SCOPE_SHARED_OTHERS) {
          setSharedDocumentsWithOthers((prev) =>
            prev.map((doc) => (matchesDoc(doc) ? { ...doc, sharedWith } : doc))
          );
        } else {
          // Id-only refresh: patch whichever list contains the document
          setSharedDocumentsWithMe((prev) =>
            prev.map((doc) => (matchesDoc(doc) ? { ...doc, sharedWith } : doc))
          );
          setSharedDocumentsWithOthers((prev) =>
            prev.map((doc) => (matchesDoc(doc) ? { ...doc, sharedWith } : doc))
          );
        }

        setFolderDocsMap((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            next[key] = next[key].map((doc) =>
              matchesDoc(doc) ? { ...doc, sharedWith } : doc
            );
          });
          return next;
        });
        setAllDocumentsList((prev) =>
          prev.map((doc) => (matchesDoc(doc) ? { ...doc, sharedWith } : doc))
        );
      } catch {
        // interceptor may toast
      }
    },
    [
      setFolderDocsMap,
      setAllDocumentsList,
      setSharedDocumentsWithMe,
      setSharedDocumentsWithOthers,
    ]
  );

  useEffect(() => {
    const targetDocumentId = getDocumentActivityId(selectedDoc);
    if (!showDetailPanel || !targetDocumentId) {
      setDocumentActivities([]);
      setDocumentActivityLoading(false);
      return;
    }

    let cancelled = false;
    void fetchDocumentActivity(targetDocumentId, () => cancelled);
    void refreshDocumentSharedWith(selectedDoc);

    return () => {
      cancelled = true;
    };
  }, [selectedDoc?.id, showDetailPanel, refreshDocumentSharedWith]);

  const handleViewDocument = (doc) => {
    if (!doc) return;
    void fetchDocumentActivity(doc);
    void handleOpenDocumentViewer(doc);
  };

  const handleDocAction = (action, doc, mode) => {
    const docAccess = resolveDmsDocumentAccess(doc, documentAccess);
    switch (action) {
      case "view":
        if (!docAccess.canView) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        handleViewDocument(doc);
        break;
      case "detail":
        setSelectedDoc(doc);
        setShowDetailPanel(true);
        break;
      case "share":
        if (!docAccess.canShare) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setShareTarget({ ...doc, itemType: "document" });
        setShowShareModal(true);
        break;
      case "manageAccess":
        if (!docAccess.canManageAccess) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setAccessTarget({ ...doc, itemType: "document" });
        setShowFolderAccessModal(true);
        break;
      case "rename":
        if (!docAccess.canEdit) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setRenameTarget({ ...doc, itemType: "document" });
        setShowRenamePanel(true);
        break;
      case "move":
        if (!canMoveDocuments || doc?.sharedDirectly) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setMoveTarget({
          ...doc,
          itemType: "document",
          parentFolderID: doc.folderId || selectedFolder?.id || "",
        });
        break;
      case "delete":
        if (!docAccess.canDelete) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setDeleteTarget({ name: doc.name, type: "document", payload: doc });
        setShowDeleteModal(true);
        break;
      case "download":
        if (!docAccess.canView) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        void downloadDocument(doc);
        break;
      case "sign":
        void handleSignDocument(doc, mode);
        break;
      default:
        break;
    }
  };

  const handleFolderAction = (action, folder) => {
    const access = resolveDmsFolderAccess(folder);
    switch (action) {
      case "share":
        if (!access.canShare) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setShareTarget({ ...folder, itemType: "folder" });
        setShowShareModal(true);
        break;
      case "manageAccess":
        if (!access.canManageAccess) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setAccessTarget({ ...folder, itemType: "folder" });
        setShowFolderAccessModal(true);
        break;
      case "rename":
        if (!access.canEdit) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setRenameTarget({ ...folder, itemType: "folder" });
        setShowRenamePanel(true);
        break;
      case "move":
        if (
          !access.canEdit ||
          (folder.treeScope ?? DMS_SCOPE_OWN) === DMS_SCOPE_SHARED
        ) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setMoveTarget({ ...folder, itemType: "folder" });
        break;
      case "delete":
        if (!access.canDelete) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        setDeleteTarget({ name: folder.name, type: "folder", payload: folder });
        setShowDeleteModal(true);
        break;
      case "download":
        if (!access.canView) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        void downloadFolder(folder);
        break;
      case "activity":
        if (!access.canView) {
          toast.info(t("DMS.actionNotPermitted"));
          break;
        }
        void handleFolderActivity(folder);
        break;
      default:
        break;
    }
  };

  // Load folder contents (subfolders + documents) for the active folder
  useEffect(() => {
    if (!selectedFolder?.id) return;

    if (selectedFolder.id === "dms-shared-me") {
      if (!sharedLoaded) void fetchSharedFolders();
      if (!sharedDocumentsLoaded) void fetchSharedDocumentsWithMe();
      return;
    }
    if (selectedFolder.id === "dms-shared-others") {
      if (!sharedWithOthersLoaded) void fetchSharedWithOthersFolders();
      if (!sharedDocumentsWithOthersLoaded)
        void fetchSharedDocumentsWithOthers();
      return;
    }
    if (selectedFolder.id === "dms-my-folders") return;

    const treeScope = selectedFolder.treeScope ?? DMS_SCOPE_OWN;
    const targetFolderId = selectedFolder.folderID ?? selectedFolder.id;
    if (!targetFolderId) return;

    if (treeScope === DMS_SCOPE_SHARED && !sharedLoaded) {
      void fetchSharedFolders();
      return;
    }
    if (treeScope === DMS_SCOPE_SHARED_OTHERS && !sharedWithOthersLoaded) {
      void fetchSharedWithOthersFolders();
      return;
    }

    void fetchFolderDocs(targetFolderId, { treeScope });
    void fetchFolderChildren(targetFolderId, { treeScope });
  }, [
    selectedFolder?.id,
    selectedFolder?.treeScope,
    sharedLoaded,
    sharedWithOthersLoaded,
    sharedDocumentsLoaded,
    sharedDocumentsWithOthersLoaded,
    fetchFolderDocs,
    fetchFolderChildren,
    fetchSharedFolders,
    fetchSharedWithOthersFolders,
    fetchSharedDocumentsWithMe,
    fetchSharedDocumentsWithOthers,
  ]);

  // When shared-with-me list finishes loading, fetch the open shared folder (main effect bails until then)
  useEffect(() => {
    if (!sharedLoaded || !selectedFolder?.id) return;
    if (
      selectedFolder.id === "dms-shared-me" ||
      selectedFolder.id === "dms-my-folders"
    )
      return;
    if ((selectedFolder.treeScope ?? DMS_SCOPE_OWN) !== DMS_SCOPE_SHARED)
      return;

    const targetFolderId = selectedFolder.folderID ?? selectedFolder.id;
    if (!targetFolderId) return;

    void fetchFolderDocs(targetFolderId, { treeScope: DMS_SCOPE_SHARED });
    void fetchFolderChildren(targetFolderId, { treeScope: DMS_SCOPE_SHARED });
    // Only re-run when shared list becomes available, not on every folder change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedLoaded]);

  useEffect(() => {
    if (!sharedWithOthersLoaded || !selectedFolder?.id) return;
    if (
      selectedFolder.id === "dms-shared-me" ||
      selectedFolder.id === "dms-shared-others" ||
      selectedFolder.id === "dms-my-folders"
    )
      return;
    if ((selectedFolder.treeScope ?? DMS_SCOPE_OWN) !== DMS_SCOPE_SHARED_OTHERS)
      return;

    const targetFolderId = selectedFolder.folderID ?? selectedFolder.id;
    if (!targetFolderId) return;

    void fetchFolderDocs(targetFolderId, {
      treeScope: DMS_SCOPE_SHARED_OTHERS,
    });
    void fetchFolderChildren(targetFolderId, {
      treeScope: DMS_SCOPE_SHARED_OTHERS,
    });
    // Only re-run when shared-with-others list becomes available, not on every folder change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedWithOthersLoaded]);

  const handleCreateFolder = async ({
    folderName,
    description,
    parentId,
    color = "",
  }) => {
    if (!canCreateFolder) {
      toast.info(t("DMS.actionNotPermitted"));
      return;
    }
    setCreateFolderLoading(true);
    try {
      await userService.createDmsFolder({
        name: folderName,
        parentFolderId: parentId || null,
        description: description || "",
        color: color || "",
      });
      toast.success(t("DMS.folderCreated"));

      const treeScope = selectedFolder?.treeScope ?? DMS_SCOPE_OWN;
      await refreshAfterMutation({
        kind: "createFolder",
        parentFolderId: parentId || null,
        treeScope,
      });
    } catch (error) {
      // interceptor handles the toast
    } finally {
      setCreateFolderLoading(false);
    }
  };

  const handleRename = async (payload) => {
    if (!renameTarget) return;
    if (renameTarget.itemType === "folder") {
      if (!resolveDmsFolderAccess(renameTarget).canEdit) {
        toast.info(t("DMS.actionNotPermitted"));
        return;
      }
    } else if (!documentAccess.canEdit) {
      toast.info(t("DMS.actionNotPermitted"));
      return;
    }
    const folderUpdater = (f) =>
      f.id === renameTarget.id
        ? {
            ...f,
            name: payload.name,
            description: payload.description,
            color: payload.color || "",
          }
        : f;
    const docUpdater = (d) =>
      d.id === renameTarget.id
        ? {
            ...d,
            name: payload.title,
            description: payload.description,
            tags: payload.tags,
          }
        : d;

    const prevRootFolders = rootFolders;
    const prevSubFolders = allSubFolders;
    const prevSharedRoots = sharedRootFolders;
    const prevSharedWithOthers = sharedWithOthersFolders;
    const prevFolderDocsMap = folderDocsMap;
    const prevAllDocs = allDocumentsList;

    try {
      if (renameTarget.itemType === "folder") {
        setRootFolders((prev) => prev.map(folderUpdater));
        setAllSubFolders((prev) => prev.map(folderUpdater));
        setSharedRootFolders((prev) => prev.map(folderUpdater));
        setSharedWithOthersFolders((prev) => prev.map(folderUpdater));
        setSelectedFolder((prev) =>
          prev && prev.id === renameTarget.id
            ? {
                ...prev,
                name: payload.name,
                description: payload.description,
                color: payload.color || "",
              }
            : prev
        );

        await userService.updateDmsFolder(renameTarget.id, {
          id: renameTarget.id,
          name: payload.name,
          parentFolderId: renameTarget.parentFolderID || null,
          description: payload.description,
          color: payload.color || "",
        });
        toast.success(t("DMS.folderUpdated"));
      } else {
        const targetFolderId = renameTarget.folderId || selectedFolder?.id;
        const docsKey = getFolderDocsMapKey(
          selectedFolder?.treeScope ?? DMS_SCOPE_OWN,
          targetFolderId
        );
        setFolderDocsMap((prev) => ({
          ...prev,
          [docsKey]: (prev[docsKey] || []).map(docUpdater),
        }));
        setAllDocumentsList((prev) => prev.map(docUpdater));
        if (selectedDoc?.id === renameTarget.id) {
          setSelectedDoc((prev) =>
            prev
              ? {
                  ...prev,
                  name: payload.title,
                  description: payload.description,
                  tags: payload.tags,
                }
              : prev
          );
        }

        await userService.updateDmsDocument(renameTarget.id, {
          id: renameTarget.id,
          title: payload.title,
          description: payload.description,
          folderId: renameTarget.folderId || selectedFolder?.id || null,
          tags: payload.tags,
          version: renameTarget.version,
        });
        toast.success(t("DMS.documentUpdated"));
      }
    } catch (error) {
      if (renameTarget.itemType === "folder") {
        setRootFolders(prevRootFolders);
        setAllSubFolders(prevSubFolders);
        setSharedRootFolders(prevSharedRoots);
        setSharedWithOthersFolders(prevSharedWithOthers);
      } else {
        setFolderDocsMap(prevFolderDocsMap);
        setAllDocumentsList(prevAllDocs);
      }
      // interceptor handles the toast
    } finally {
      setShowRenamePanel(false);
      setRenameTarget(null);
    }
  };

  const handleMoveItem = async ({
    folderId,
    documentId,
    newParentFolderId,
  }) => {
    if (!moveTarget) return;
    if (moveTarget.itemType === "document") {
      if (!canMoveDocuments || !documentId) {
        toast.info(t("DMS.actionNotPermitted"));
        throw new Error("not-permitted");
      }

      const oldFolderId =
        moveTarget.folderId || moveTarget.parentFolderID || "";
      const nextFolderId = newParentFolderId || "";
      if (String(oldFolderId) === String(nextFolderId)) {
        toast.info(t("DMS.moveSameLocation"));
        throw new Error("same-location");
      }

      await userService.moveDmsDocument({
        documentId,
        TargetFolderId: nextFolderId,
      });
      toast.success(t("DMS.documentMoved"));
      clearDocSelection();
      await refreshAfterMutation({
        kind: "moveDocument",
        parentFolderId: oldFolderId || null,
        newParentFolderId: nextFolderId || null,
        treeScope: DMS_SCOPE_OWN,
      });
      return;
    }

    if (!folderId) return;
    if ((moveTarget.treeScope ?? DMS_SCOPE_OWN) === DMS_SCOPE_SHARED) {
      toast.info(t("DMS.actionNotPermitted"));
      throw new Error("not-permitted");
    }

    const oldParentFolderId = moveTarget.parentFolderID || "";
    const nextParentFolderId = newParentFolderId || "";
    if (String(oldParentFolderId) === String(nextParentFolderId)) {
      toast.info(t("DMS.moveSameLocation"));
      throw new Error("same-location");
    }

    await userService.moveDmsFolder({
      folderId,
      newparentfolderId: nextParentFolderId,
    });
    toast.success(t("DMS.folderMoved"));
    await refreshAfterMutation({
      kind: "moveFolder",
      folderId,
      parentFolderId: oldParentFolderId || null,
      newParentFolderId: nextParentFolderId || null,
      treeScope: DMS_SCOPE_OWN,
    });
  };

  const applyFolderDeleteOptimistic = (folderPayload) => {
    const deletedId = folderPayload.id;
    const deletedScope = folderPayload.treeScope ?? DMS_SCOPE_OWN;
    const parentFolderId = folderPayload.parentFolderID || null;
    const folderSnapshot = [
      ...rootFolders,
      ...sharedRootFolders,
      ...allSubFolders,
    ];
    const deletedIds = collectDescendantFolderIds(
      deletedId,
      deletedScope,
      folderSnapshot
    );
    const isInDeletedTree = (f) =>
      deletedIds.has(String(f.id)) &&
      (f.treeScope ?? DMS_SCOPE_OWN) === deletedScope;

    const snapshot = {
      rootFolders,
      sharedRootFolders,
      sharedWithOthersFolders,
      allSubFolders,
      folderDocsMap,
      loadedChildrenFor,
      allDocumentsList,
      adhocFolders,
    };

    setRootFolders((prev) => prev.filter((f) => !isInDeletedTree(f)));
    setSharedRootFolders((prev) => prev.filter((f) => !isInDeletedTree(f)));
    setSharedWithOthersFolders((prev) =>
      prev.filter((f) => !isInDeletedTree(f))
    );
    setAllSubFolders((prev) => prev.filter((f) => !isInDeletedTree(f)));
    setFolderDocsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const idPart = key.includes(":")
          ? key.split(":").slice(1).join(":")
          : key;
        if (deletedIds.has(idPart)) delete next[key];
      });
      return next;
    });
    setLoadedChildrenFor((prev) => {
      const next = new Set(prev);
      deletedIds.forEach((id) =>
        next.delete(getFolderTreeKey(deletedScope, id))
      );
      return next;
    });
    setAllDocumentsList((prev) =>
      prev.filter((doc) => !deletedIds.has(String(doc.folderId)))
    );
    setAdhocFolders((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const idPart = key.includes(":")
          ? key.split(":").slice(1).join(":")
          : key;
        if (deletedIds.has(idPart)) delete next[key];
      });
      return next;
    });

    return { deletedId, deletedScope, parentFolderId, deletedIds, snapshot };
  };

  const revertFolderDeleteOptimistic = (snapshot) => {
    setRootFolders(snapshot.rootFolders);
    setSharedRootFolders(snapshot.sharedRootFolders);
    setSharedWithOthersFolders(snapshot.sharedWithOthersFolders);
    setAllSubFolders(snapshot.allSubFolders);
    setFolderDocsMap(snapshot.folderDocsMap);
    setLoadedChildrenFor(snapshot.loadedChildrenFor);
    setAllDocumentsList(snapshot.allDocumentsList);
    setAdhocFolders(snapshot.adhocFolders);
  };

  const applyDocumentDeleteOptimistic = (docPayload) => {
    const deletedFolderId = docPayload.folderId;
    const deletedDocId = docPayload.id;
    const docsKey = getFolderDocsMapKey(
      selectedFolder?.treeScope ?? DMS_SCOPE_OWN,
      deletedFolderId
    );
    const snapshot = {
      folderDocsMap,
      allDocumentsList,
      selectedDoc,
      showDetailPanel,
    };

    setFolderDocsMap((prev) => {
      if (!deletedFolderId || !prev[docsKey]) return prev;
      return {
        ...prev,
        [docsKey]: prev[docsKey].filter((doc) => doc.id !== deletedDocId),
      };
    });
    setAllDocumentsList((prev) =>
      prev.filter((doc) => doc.id !== deletedDocId)
    );
    if (selectedDoc?.id === deletedDocId) {
      setShowDetailPanel(false);
      setSelectedDoc(null);
    }

    return { deletedFolderId, deletedDocId, docsKey, snapshot };
  };

  const revertDocumentDeleteOptimistic = (snapshot) => {
    setFolderDocsMap(snapshot.folderDocsMap);
    setAllDocumentsList(snapshot.allDocumentsList);
    setSelectedDoc(snapshot.selectedDoc);
    setShowDetailPanel(snapshot.showDetailPanel);
  };

  const applyBulkDocumentDeleteOptimistic = (docs) => {
    const docIds = new Set(docs.map((d) => d.id));
    const treeScope = selectedFolder?.treeScope ?? DMS_SCOPE_OWN;
    const docsKey = getFolderDocsMapKey(treeScope, selectedFolder?.id);
    const snapshot = {
      folderDocsMap,
      allDocumentsList,
      selectedDoc,
      showDetailPanel,
    };

    setFolderDocsMap((prev) => {
      if (!selectedFolder?.id || !prev[docsKey]) return prev;
      return {
        ...prev,
        [docsKey]: prev[docsKey].filter((doc) => !docIds.has(doc.id)),
      };
    });
    setAllDocumentsList((prev) => prev.filter((doc) => !docIds.has(doc.id)));
    if (selectedDoc && docIds.has(selectedDoc.id)) {
      setShowDetailPanel(false);
      setSelectedDoc(null);
    }

    return { docsKey, treeScope, snapshot };
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "folder" && deleteTarget.payload) {
        const {
          deletedId,
          deletedScope,
          parentFolderId,
          deletedIds,
          snapshot,
        } = applyFolderDeleteOptimistic(deleteTarget.payload);

        setDeleteFolderLoading(true);
        try {
          await userService.deleteDmsFolder(deletedId);
          toast.success(t("DMS.folderDeleted"));

          const isViewingDeletedFolder =
            folderId &&
            folderId !== "dms-my-folders" &&
            folderId !== "dms-shared-me" &&
            deletedIds.has(String(folderId));

          if (isViewingDeletedFolder) {
            if (parentFolderId && !deletedIds.has(String(parentFolderId))) {
              const scopeQuery =
                deletedScope === DMS_SCOPE_SHARED ? "?scope=shared" : "";
              navigate(`/dms/${parentFolderId}${scopeQuery}`);
            } else {
              navigate("/dms");
            }
          }

          await refreshAfterMutation({
            kind: "deleteFolder",
            folderId: deletedId,
            parentFolderId,
            treeScope: deletedScope,
          });
        } catch (error) {
          revertFolderDeleteOptimistic(snapshot);
        } finally {
          setDeleteFolderLoading(false);
        }
      } else if (deleteTarget.type === "document" && deleteTarget.payload?.id) {
        const { deletedFolderId, snapshot } = applyDocumentDeleteOptimistic(
          deleteTarget.payload
        );

        setDeleteDocumentLoading(true);
        try {
          await userService.deleteDmsDocument(deleteTarget.payload.id);
          toast.success(t("DMS.documentDeleted"));
          await refreshAfterMutation({
            kind: "deleteDocument",
            folderId: deletedFolderId,
            treeScope: selectedFolder?.treeScope ?? DMS_SCOPE_OWN,
          });
        } catch (error) {
          revertDocumentDeleteOptimistic(snapshot);
        } finally {
          setDeleteDocumentLoading(false);
        }
      } else if (
        deleteTarget.type === "documentBulk" &&
        Array.isArray(deleteTarget.payload)
      ) {
        const docs = deleteTarget.payload;
        const { treeScope, snapshot } = applyBulkDocumentDeleteOptimistic(docs);

        setDeleteDocumentLoading(true);
        try {
          await Promise.all(
            docs.map((doc) => userService.deleteDmsDocument(doc.id))
          );
          toast.success(t("DMS.documentsDeleted"));
          clearDocSelection();
          await refreshAfterMutation({
            kind: "deleteDocument",
            folderId: selectedFolder?.id,
            treeScope,
          });
        } catch (error) {
          revertDocumentDeleteOptimistic(snapshot);
        } finally {
          setDeleteDocumentLoading(false);
        }
      } else {
        toast.info(t("DMS.deleteUnavailable"));
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleShareSubmit = async (emails, opts = {}) => {
    if (!shareTarget || !emails?.length) return;
    if (shareTarget.itemType === "document") {
      const documentId = shareTarget.documentId || shareTarget.id;
      if (!documentId) {
        toast.info(t("DMS.shareUnavailable"));
        throw new Error("share-unavailable");
      }
      const shareAccess = resolveDmsDocumentAccess(shareTarget, documentAccess);
      if (!shareAccess.canShare) {
        toast.info(t("DMS.actionNotPermitted"));
        throw new Error("not-permitted");
      }
      if (
        getDmsPermissionRank(opts.permission) > getDmsAccessRank(shareAccess) ||
        (opts.canReshare === true && !shareAccess.fullControl)
      ) {
        toast.info(t("DMS.actionNotPermitted"));
        throw new Error("delegated-permission-exceeded");
      }
      await Promise.all(
        emails.map((email) =>
          userService.createDocumentShare({
            documentId,
            sharedWithUser: email,
            permission: parsePermissionName(opts.permission),
            canReshare: shareAccess.fullControl && opts.canReshare === true,
          })
        )
      );
      toast.success(t("DMS.shareSuccess"));
      await refreshDocumentSharedWith(documentId);
      void refreshSharedDocumentsWithOthersList();
      return;
    }
    if (shareTarget.itemType !== "folder" || !shareTarget.folderID) {
      toast.info(t("DMS.shareUnavailable"));
      throw new Error("share-unavailable");
    }
    const shareAccess = resolveDmsFolderAccess(shareTarget);
    if (!shareAccess.canShare) {
      toast.info(t("DMS.actionNotPermitted"));
      throw new Error("not-permitted");
    }
    if (
      getDmsPermissionRank(opts.permission) > getDmsAccessRank(shareAccess) ||
      (opts.canReshare === true && !shareAccess.fullControl)
    ) {
      toast.info(t("DMS.actionNotPermitted"));
      throw new Error("delegated-permission-exceeded");
    }
    await Promise.all(
      emails.map((email) =>
        userService.createFolderShare({
          folderId: shareTarget.folderID,
          sharedWithUser: email,
          permission: parsePermissionName(opts.permission),
          canReshare: shareAccess.fullControl && opts.canReshare === true,
        })
      )
    );
    toast.success(t("DMS.shareSuccess"));
    void refreshSharedFoldersList();
    void refreshSharedWithOthersFoldersList();
  };

  const handleOpenUpload = () => {
    if (!canUploadDocuments) {
      toast.info(
        selectedFolder?.folderID || selectedFolder?.subFolderID
          ? t("DMS.actionNotPermitted")
          : t("DMS.selectFolderFirst")
      );
      return;
    }
    setShowUploadModal(true);
  };

  const handleUploadDocuments = async ({
    files,
    folderId,
    tags = "",
    title = "",
    description = "",
    notificationDate = null,
    notificationBeforeDays = "",
    onProgress,
  }) => {
    if (!Array.isArray(files) || !files.length || !folderId) return;
    const oversized = files.find((file) => file.size > DMS_MAX_UPLOAD_BYTES);
    if (oversized) {
      toast.error(t("DMS.fileTooLarge"));
      return;
    }
    const useCustomTitle = files.length === 1 && title.trim().length > 0;
    const daysBeforeNotification = String(notificationBeforeDays ?? "").trim();
    try {
      if (files.length > 1) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folderId", folderId);
        if (title.trim()) formData.append("title", title.trim());
        formData.append("description", description);
        formData.append("tags", tags);
        if (notificationDate)
          formData.append("notificationDate", notificationDate);
        if (daysBeforeNotification)
          formData.append("notificationBeforeDays", daysBeforeNotification);
        await userService.uploadDmsDocumentsBulk(formData, {
          onUploadProgress: (event) => {
            if (!onProgress || !event.total) return;
            onProgress(Math.round((event.loaded / event.total) * 100));
          },
        });
        onProgress?.(100);
      } else {
        const [file] = files;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", folderId);
        formData.append("title", useCustomTitle ? title.trim() : file.name);
        formData.append("description", description);
        formData.append("tags", tags);
        if (notificationDate)
          formData.append("notificationDate", notificationDate);
        if (daysBeforeNotification)
          formData.append("notificationBeforeDays", daysBeforeNotification);
        await userService.uploadDmsDocument(formData, {
          onUploadProgress: (event) => {
            if (!onProgress || !event.total) return;
            onProgress(Math.round((event.loaded / event.total) * 100));
          },
        });
        onProgress?.(100);
      }
      toast.success(t("DMS.documentUploadedSuccess"));
      setShowUploadModal(false);
      const treeScope = selectedFolder?.treeScope ?? DMS_SCOPE_OWN;
      const docsKey = getFolderDocsMapKey(treeScope, folderId);
      setFolderDocsMap((prev) => {
        const next = { ...prev };
        delete next[docsKey];
        return next;
      });
      await refreshAfterMutation({ kind: "upload", folderId, treeScope });
    } catch (error) {
      // interceptor handles the toast
    }
  };

  // ─────────────────────────────────────────────────────────────

  const isSubscriptionBlocked =
    (user?.AccountType === "B" && user?.RoleID === 3) ||
    Number(userAccess?.remainingDays) <= 0;

  if (isSubscriptionBlocked) {
    return <UserLisence />;
  }

  const desktopFolderTree = (
    <FolderTree
      folderTree={treeRoot}
      selectedTreeKey={selectedTreeKey}
      expandedFolders={expandedFolders}
      isRoot={isRoot}
      docCount={sidebarDocCount}
      folderCount={sidebarFolderCount}
      storage={myStorage}
      loadedChildrenFor={loadedChildrenFor}
      onGoHome={handleGoHome}
      onSelect={handleFolderSelect}
      onToggle={handleToggleExpand}
      collapsed={isTreeCollapsed}
      onToggleCollapse={toggleTreeCollapsed}
    />
  );

  return (
    <div className="dms-root">
      {/* Portaled two-tier docked secondary sidebar when on desktop */}
      {subpanelPortalNode && createPortal(desktopFolderTree, subpanelPortalNode)}

      {/* Unified single-window workspace container */}
      <div className={`dms-workspace-container${isTreeCollapsed ? " dms-tree-collapsed" : ""}`}>
        {/* Inline fallback if not portaled */}
        {!subpanelPortalNode && desktopFolderTree}

        {/* Floating boundary collapse/expand button (fallback when not docked into sidebar rail) */}
        {!subpanelPortalNode && (
          <button
            type="button"
            className="dms-tree-boundary-toggle"
            onClick={toggleTreeCollapsed}
            aria-label={isTreeCollapsed ? t("DMS.expandSidebar", "Expand sidebar") : t("DMS.collapseSidebar", "Collapse sidebar")}
            title={isTreeCollapsed ? t("DMS.expandSidebar", "Expand sidebar") : t("DMS.collapseSidebar", "Collapse sidebar")}
          >
            {isTreeCollapsed ? (
              <FiChevronRight size={14} className="dms-boundary-toggle-icon" />
            ) : (
              <FiChevronLeft size={14} className="dms-boundary-toggle-icon" />
            )}
          </button>
        )}

        {/* Right panel: content */}
        <main className="dms-content-panel">
          <DMSBreadcrumb
            breadcrumb={breadcrumb}
            onGoHome={handleGoHome}
            onSelectFolder={handleFolderSelect}
          />

        <div className="dms-content-card">
          <DMSToolbar
            selectedFolder={selectedFolder}
            isRoot={isRoot}
            subfolderCount={filteredSubfolders.length}
            docCount={filteredDocs.length}
            rootFolderCount={filteredRootFolders.length}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            contentFilter={contentFilter}
            onContentFilterChange={setContentFilter}
            canCreateFolder={canCreateFolder}
            canUploadDocuments={canUploadDocuments}
            onViewChange={setViewMode}
            onNewFolder={() => setShowNewFolderPanel(true)}
            onUpload={handleOpenUpload}
            onOpenMobileTree={() => setShowMobileTree(true)}
            rootFolderFilters={rootFolderFilters}
            hasRootFolderFilters={hasRootFolderFilters}
            hasRootFolderFilterDraft={hasRootFolderFilterDraft}
            canClearRootFolderFilters={canClearRootFolderFilters}
            rootFolderFilterLoading={rootFolderFilterLoading}
            onRootFolderFilterChange={handleRootFolderFilterChange}
            onApplyRootFolderFilters={handleApplyRootFolderFilters}
            onClearRootFolderFilters={handleClearRootFolderFilters}
          />

          {isActiveFolderForbidden ? (
            <div className="alert alert-warning py-2 px-3 mb-3" role="alert">
              {t("DMS.accessForbidden")}
            </div>
          ) : null}

          <div className="dms-content-area">
            {viewMode === "grid" ? (
              <DMSGridView
                isRoot={isRoot}
                foldersOnly={isMyFoldersBrowse}
                showFolders={showFolders}
                showDocuments={showDocuments}
                rootFolders={filteredRootFolders}
                subfolders={filteredSubfolders}
                pagedDocs={pagedDocs}
                documentsSectionLabel={documentsSectionLabel}
                onFolderOpen={handleFolderSelect}
                onFolderAction={handleFolderAction}
                onDocSelect={handleDocSelect}
                onDocAction={handleDocAction}
                onNewFolder={() => setShowNewFolderPanel(true)}
                onUpload={handleOpenUpload}
                canUploadDocuments={canUploadDocuments}
                documentAccess={documentAccess}
                canMoveDocuments={canMoveDocuments}
                showDocumentShare
                canUseSignFlow={canUseSignFlow}
                signFlowOptions={dmsSignFlowOptions}
                signDocumentLoading={signDocumentLoading}
                selectionEnabled={selectionEnabled}
                selectedDocIds={selectedDocIds}
                onToggleDocSelect={toggleDocSelection}
                hasRootFolderFilters={hasRootFolderFilters}
              />
            ) : (
              <DMSListView
                isRoot={isRoot}
                foldersOnly={isMyFoldersBrowse}
                showFolders={showFolders}
                showDocuments={showDocuments}
                rootFolders={filteredRootFolders}
                subfolders={filteredSubfolders}
                pagedDocs={pagedDocs}
                showDocumentShare
                documentAccess={documentAccess}
                canMoveDocuments={canMoveDocuments}
                canUseSignFlow={canUseSignFlow}
                signFlowOptions={dmsSignFlowOptions}
                signDocumentLoading={signDocumentLoading}
                onFolderOpen={handleFolderSelect}
                onFolderAction={handleFolderAction}
                onDocSelect={handleDocSelect}
                onDocAction={handleDocAction}
                selectionEnabled={selectionEnabled}
                selectedDocIds={selectedDocIds}
                onToggleDocSelect={toggleDocSelection}
                hasRootFolderFilters={hasRootFolderFilters}
              />
            )}

            {showDocuments && filteredDocs.length > 0 && (
              <div className="dms-pagination-bar">
                <div className="showHideNoDocs dms-pagination-info">
                  {(page - 1) * ROWS_PER_PAGE + 1} -{" "}
                  {Math.min(page * ROWS_PER_PAGE, filteredDocs.length)}{" "}
                  {t("DMS.of")} {filteredDocs.length} {t("DMS.documents")}
                </div>
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    variant="outlined"
                    shape="rounded"
                    page={page}
                    onChange={(_, v) => setPage(v)}
                  />
                </Stack>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>

    {/* Mobile folder navigation */}
    <Offcanvas
      show={showMobileTree}
      onHide={() => setShowMobileTree(false)}
      placement="start"
      backdrop
      scroll
      className="dms-mobile-tree-offcanvas"
    >
      <Offcanvas.Header closeButton className="dms-mobile-tree-header">
        <Offcanvas.Title>{t("DMS.browseFolders")}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="dms-mobile-tree-body p-0">
        <FolderTree
          embedded
          folderTree={treeRoot}
          selectedTreeKey={selectedTreeKey}
          expandedFolders={expandedFolders}
          isRoot={isRoot}
          docCount={sidebarDocCount}
          folderCount={sidebarFolderCount}
          storage={myStorage}
          loadedChildrenFor={loadedChildrenFor}
          onGoHome={handleGoHome}
          onSelect={handleFolderSelect}
          onToggle={handleToggleExpand}
          onNavigate={() => setShowMobileTree(false)}
        />
      </Offcanvas.Body>
    </Offcanvas>

    {/* Document metadata / actions — offcanvas */}
      <DMSDetailPanel
        show={showDetailPanel}
        doc={selectedDoc}
        onHide={() => setShowDetailPanel(false)}
        onOpenDocumentView={handleViewDocument}
        onDownload={(doc) => void downloadDocument(doc)}
        showDocumentShare={selectedDocAccess.canShare}
        onShare={(doc) => handleDocAction("share", doc)}
        onSign={(doc, mode) => void handleSignDocument(doc, mode)}
        canUseSignFlow={canUseSignFlow}
        signFlowOptions={dmsSignFlowOptions}
        signDocumentLoading={signDocumentLoading}
        onDelete={(doc) => handleDocAction("delete", doc)}
        canDeleteDocument={selectedDocAccess.canDelete}
        onMove={(doc) => handleDocAction("move", doc)}
        canMoveDocument={canMoveDocuments && !selectedDoc?.sharedDirectly}
        activities={documentActivities}
        activityLoading={documentActivityLoading}
      />

      <ViewModal
        show={showDocViewModal}
        handleClose={handleCloseDocViewModal}
        previewUrl={dmsViewPreviewUrl}
        mimeType={dmsViewMimeType}
      />

      {/* New Folder offcanvas */}
      <NewFolderOffcanvas
        show={showNewFolderPanel}
        onHide={() => setShowNewFolderPanel(false)}
        onCreate={handleCreateFolder}
        parentFolders={rootFolders}
        defaultParentId={selectedFolder?.folderID ? selectedFolder.id : ""}
        creating={createFolderLoading}
      />

      {/* Rename offcanvas */}
      <RenameOffcanvas
        show={showRenamePanel}
        target={renameTarget}
        onHide={() => setShowRenamePanel(false)}
        onRename={handleRename}
      />

      <MoveFolderModal
        show={Boolean(moveTarget)}
        target={moveTarget}
        destinationFolders={moveDestinationFolders}
        onHide={() => setMoveTarget(null)}
        onMove={handleMoveItem}
      />

      <FolderActivityModal
        show={Boolean(activityTarget)}
        folder={activityTarget}
        activities={folderActivities}
        loading={folderActivityLoading}
        onHide={handleCloseFolderActivity}
      />

      {/* Upload modal */}
      <UploadModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        defaultFolderId={selectedFolder?.id || ""}
        onUpload={handleUploadDocuments}
      />

      {/* Invite to folder */}
      <DmsShareModal
        show={showShareModal}
        target={shareTarget}
        onHide={() => setShowShareModal(false)}
        onSubmit={handleShareSubmit}
        maxPermissionRank={getDmsAccessRank(
          shareTarget?.itemType === "document"
            ? resolveDmsDocumentAccess(shareTarget, documentAccess)
            : resolveDmsFolderAccess(shareTarget)
        )}
        canDelegateReshare={
          (shareTarget?.itemType === "document"
            ? resolveDmsDocumentAccess(shareTarget, documentAccess)
            : resolveDmsFolderAccess(shareTarget)
          ).fullControl
        }
        canManageAccess={
          shareTarget?.itemType === "document"
            ? resolveDmsDocumentAccess(shareTarget, documentAccess)
                .canManageAccess
            : resolveDmsFolderAccess(shareTarget).canManageAccess
        }
        canSuggestRecipients={
          shareTarget?.itemType === "document"
            ? resolveDmsDocumentAccess(shareTarget, documentAccess)
                .canManageAccess
            : resolveDmsFolderAccess(shareTarget).canManageAccess
        }
        onManageAccess={(item) => {
          setShowShareModal(false);
          setAccessTarget(item);
          setShowFolderAccessModal(true);
        }}
      />

      {/* People with access — separate panel */}
      <FolderAccessModal
        show={showFolderAccessModal}
        target={accessTarget}
        onHide={() => {
          setShowFolderAccessModal(false);
          setAccessTarget(null);
        }}
        onSharesChanged={() => {
          if (accessTarget?.itemType === "document") {
            void refreshDocumentSharedWith(
              accessTarget.documentId || accessTarget.id
            );
            if (
              accessTarget.sharedDirectly &&
              accessTarget.treeScope === DMS_SCOPE_SHARED
            ) {
              void refreshSharedDocumentsWithMeList();
            } else if (
              accessTarget.sharedDirectly &&
              accessTarget.treeScope === DMS_SCOPE_SHARED_OTHERS
            ) {
              void refreshSharedDocumentsWithOthersList();
            }
          } else {
            void refreshSharedFoldersList();
            void refreshSharedWithOthersFoldersList();
          }
        }}
        onInvitePeople={(item) => {
          setShareTarget({
            ...item,
            itemType: item?.itemType === "document" ? "document" : "folder",
          });
          setShowShareModal(true);
        }}
      />

      {/* Delete confirmation — reuses existing common component */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={
          deleteTarget?.type === "folder"
            ? t("DMS.deleteFolder")
            : deleteTarget?.type === "documentBulk"
            ? t("DMS.deleteDocuments")
            : t("DMS.deleteDocument")
        }
        warningText={
          <>
            {t("DMS.deleteConfirmPrefix")} <strong>{deleteTarget?.name}</strong>
            ? {t("DMS.deleteWarning")}
          </>
        }
        confirmText={t("DMS.delete")}
        cancelText={t("DMS.cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        onConfirm={handleDelete}
        className="dms-delete-modal"
      />
    </div>
  );
};

export default DMS;
