import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import userService from "@/services/userService";
import {
  DMS_SCOPE_OWN,
  DMS_SCOPE_SHARED,
  DMS_SCOPE_SHARED_OTHERS,
  dedupeSharedListItems,
  getFolderDocsMapKey,
  getFolderTreeKey,
  parseDmsMyStorageResponse,
} from "../utils/dmsHelpers";
import {
  getDmsResponsePayload,
  createDmsNormalizers,
} from "../utils/dmsNormalize";
import {
  isAxiosForbiddenError,
  shouldTreatAsEmptyFolderCache,
} from "../utils/dmsApiErrors";
import { formatDate } from "../utils/dmsHelpers";

/**
 * Folder tree, documents cache, shared-with-me list, and all related fetchers.
 */
export const useDmsFolderData = ({
  t,
  locale,
  runWithAbort,
  isDmsAbortError,
  rootFolderParams = {},
}) => {
  const {
    normalizeFolder,
    normalizeDoc,
    normalizeSharedFolder,
    normalizeSharedWithOthersFolder,
    normalizeSharedDocument,
    normalizeSharedWithOthersDocument,
  } = useMemo(() => createDmsNormalizers({ t, locale }), [t, locale]);

  const [rootFolders, setRootFolders] = useState([]);
  const [sharedRootFolders, setSharedRootFolders] = useState([]);
  const [sharedWithOthersFolders, setSharedWithOthersFolders] = useState([]);
  const [sharedDocumentsWithMe, setSharedDocumentsWithMe] = useState([]);
  const [sharedDocumentsWithOthers, setSharedDocumentsWithOthers] = useState(
    []
  );
  const [allSubFolders, setAllSubFolders] = useState([]);
  const [folderDocsMap, setFolderDocsMap] = useState({});
  const [allDocumentsList, setAllDocumentsList] = useState([]);
  const [allDocumentsLoading, setAllDocumentsLoading] = useState(false);
  const [myStorage, setMyStorage] = useState({
    usedBytes: null,
    totalBytes: null,
    usedFormatted: null,
    totalFormatted: null,
    totalDocuments: null,
    totalFolders: null,
  });
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [sharedWithOthersLoaded, setSharedWithOthersLoaded] = useState(false);
  const [sharedDocumentsLoaded, setSharedDocumentsLoaded] = useState(false);
  const [sharedDocumentsWithOthersLoaded, setSharedDocumentsWithOthersLoaded] =
    useState(false);
  const [adhocFolders, setAdhocFolders] = useState({});
  const [resolvingFolderId, setResolvingFolderId] = useState(null);
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [loadedChildrenFor, setLoadedChildrenFor] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [folderContentLoading, setFolderContentLoading] = useState(false);
  const [sharedListLoading, setSharedListLoading] = useState(false);
  const [forbiddenFolderKeys, setForbiddenFolderKeys] = useState(
    () => new Set()
  );

  const sharedFoldersFetchRef = useRef(null);
  const sharedWithOthersFetchRef = useRef(null);
  const sharedDocumentsFetchRef = useRef(null);
  const sharedDocumentsWithOthersFetchRef = useRef(null);
  const folderLoadCountRef = useRef(0);
  const foldersRef = useRef({
    rootFolders: [],
    sharedRootFolders: [],
    sharedWithOthersFolders: [],
    allSubFolders: [],
  });
  const childrenInFlightRef = useRef(new Set());
  const storageInFlightRef = useRef(false);
  const loadedChildrenForRef = useRef(loadedChildrenFor);

  useEffect(() => {
    loadedChildrenForRef.current = loadedChildrenFor;
  }, [loadedChildrenFor]);

  useEffect(() => {
    foldersRef.current = {
      rootFolders,
      sharedRootFolders,
      sharedWithOthersFolders,
      allSubFolders,
    };
  }, [rootFolders, sharedRootFolders, sharedWithOthersFolders, allSubFolders]);

  const beginFolderContentLoad = useCallback(() => {
    folderLoadCountRef.current += 1;
    setFolderContentLoading(true);
  }, []);

  const endFolderContentLoad = useCallback(() => {
    folderLoadCountRef.current = Math.max(0, folderLoadCountRef.current - 1);
    if (folderLoadCountRef.current === 0) setFolderContentLoading(false);
  }, []);

  const fetchRoots = useCallback(
    async (paramsOverride) => {
      const params = paramsOverride ?? rootFolderParams;
      try {
        const result = await runWithAbort("root-folders", (signal) =>
          userService.getDmsRootFolders(params, { signal })
        );
        if (result?.aborted) return;
        const payload = getDmsResponsePayload(result);
        const roots = payload
          .filter(
            (folder) =>
              !folder?.isShared &&
              !folder?.shareId &&
              !folder?.shareID &&
              (folder?.treeScope == null || folder.treeScope === DMS_SCOPE_OWN)
          )
          .map((folder) =>
            normalizeFolder(folder, { treeScope: DMS_SCOPE_OWN })
          );
        setRootFolders(roots);
      } catch (error) {
        if (!isDmsAbortError(error)) {
          // interceptor handles the toast
        }
      } finally {
        setTreeLoaded(true);
      }
    },
    [runWithAbort, isDmsAbortError, normalizeFolder, rootFolderParams]
  );

  const fetchStorage = useCallback(
    async ({ force = false } = {}) => {
      if (storageInFlightRef.current && !force) return;
      storageInFlightRef.current = true;
      try {
        const result = await runWithAbort("my-storage", (signal) =>
          userService.getDmsMyStorage({ signal })
        );
        if (result?.aborted) return;
        setMyStorage(parseDmsMyStorageResponse(result));
      } catch (error) {
        if (!isDmsAbortError(error)) {
          setMyStorage({
            usedBytes: null,
            totalBytes: null,
            usedFormatted: null,
            totalFormatted: null,
            totalDocuments: null,
            totalFolders: null,
          });
        }
      } finally {
        storageInFlightRef.current = false;
      }
    },
    [runWithAbort, isDmsAbortError]
  );

  const fetchAllDocuments = useCallback(async () => {
    setAllDocumentsLoading(true);
    try {
      const result = await runWithAbort("all-documents", (signal) =>
        userService.getDmsAllDocuments({ signal })
      );
      if (result?.aborted) return;
      const payload = getDmsResponsePayload(result);
      setAllDocumentsList(
        payload
          .filter(
            (doc) =>
              !doc?.isShared &&
              !doc?.shareId &&
              !doc?.shareID &&
              !(doc?.sharedDirectly === true)
          )
          .map((doc) => normalizeDoc(doc))
      );
    } catch (error) {
      if (!isDmsAbortError(error)) setAllDocumentsList([]);
    } finally {
      setAllDocumentsLoading(false);
    }
  }, [runWithAbort, isDmsAbortError, normalizeDoc]);

  const fetchFolderChildren = useCallback(
    async (
      parentId,
      { treeScope = DMS_SCOPE_OWN, force = false, showLoader = true } = {}
    ) => {
      if (!parentId) return;
      const cacheKey = getFolderTreeKey(treeScope, parentId);
      if (!force && loadedChildrenForRef.current.has(cacheKey)) return;
      if (!force && childrenInFlightRef.current.has(cacheKey)) return;

      childrenInFlightRef.current.add(cacheKey);
      if (showLoader) beginFolderContentLoad();
      try {
        const result = await runWithAbort(`children-${cacheKey}`, (signal) =>
          userService.getDmsFolderChildren(parentId, { signal })
        );
        if (result?.aborted) return;

        const payload = getDmsResponsePayload(result);
        const {
          rootFolders: roots,
          sharedRootFolders: shared,
          sharedWithOthersFolders: sharedOthers,
          allSubFolders: subs,
        } = foldersRef.current;
        const parent = [...roots, ...shared, ...sharedOthers, ...subs].find(
          (f) => String(f.id) === String(parentId) && f.treeScope === treeScope
        );
        const inheritSharedByFrom =
          treeScope === DMS_SCOPE_SHARED && parent
            ? { sharedBy: parent.sharedBy, canReshare: parent.canReshare }
            : null;
        const children = payload.map((child) =>
          normalizeFolder(child, {
            treeScope,
            parentFolderId: parentId,
            inheritSharedByFrom,
          })
        );
        setAllSubFolders((prev) => {
          const withoutOld = prev.filter(
            (f) =>
              !(
                String(f.parentFolderID) === String(parentId) &&
                f.treeScope === treeScope
              )
          );
          return [...withoutOld, ...children];
        });
        setLoadedChildrenFor((prev) => {
          const next = new Set(prev);
          next.add(cacheKey);
          return next;
        });
      } catch (error) {
        if (!isDmsAbortError(error) && !isAxiosForbiddenError(error)) {
          // interceptor handles the toast
        }
      } finally {
        childrenInFlightRef.current.delete(cacheKey);
        if (showLoader) endFolderContentLoad();
      }
    },
    [
      runWithAbort,
      isDmsAbortError,
      normalizeFolder,
      beginFolderContentLoad,
      endFolderContentLoad,
    ]
  );

  const fetchFolderById = useCallback(
    async (targetId, treeScope = DMS_SCOPE_OWN) => {
      const adhocKey = getFolderDocsMapKey(treeScope, targetId);
      if (!targetId || adhocFolders[adhocKey] || resolvingFolderId === targetId)
        return;

      setResolvingFolderId(targetId);
      try {
        const result = await runWithAbort(`folder-${adhocKey}`, (signal) =>
          userService.getDmsFolderById(targetId, { signal })
        );
        if (result?.aborted) return;

        const payload =
          result?.data?.data ?? result?.data?.response ?? result?.data;
        if (payload) {
          const isShared =
            treeScope === DMS_SCOPE_SHARED ||
            Boolean(payload?.isShared || payload?.sharedBy);
          const normalized = normalizeFolder(payload, {
            treeScope: isShared ? DMS_SCOPE_SHARED : DMS_SCOPE_OWN,
            parentFolderId:
              payload.parentFolderId != null || payload.parentFolderID != null
                ? String(payload.parentFolderId ?? payload.parentFolderID)
                : null,
            inheritSharedByFrom: isShared
              ? {
                  sharedBy: payload.sharedBy ?? payload.sharedByUser,
                  canReshare: payload.canReshare,
                }
              : null,
          });
          setAdhocFolders((prev) => ({ ...prev, [adhocKey]: normalized }));
        }
      } catch (error) {
        if (!isDmsAbortError(error)) {
          // interceptor handles the toast
        }
      } finally {
        setResolvingFolderId(null);
      }
    },
    [
      adhocFolders,
      resolvingFolderId,
      runWithAbort,
      isDmsAbortError,
      normalizeFolder,
    ]
  );

  const refreshFolderById = useCallback(
    async (id, setSelectedFolder) => {
      if (!id) return;
      try {
        const result = await runWithAbort(`refresh-folder-${id}`, (signal) =>
          userService.getDmsFolderById(id, { signal })
        );
        if (result?.aborted) return;

        const payload =
          result?.data?.data ?? result?.data?.response ?? result?.data;
        if (!payload) return;

        const patchOne = (f) => {
          if (String(f.id) !== String(id)) return f;
          const count =
            payload.childFolderCount ??
            payload.childFoldersCount ??
            payload.folderCount ??
            payload.numberOfFolders ??
            payload.documentCount ??
            payload.numberOfFiles ??
            payload.noOfFiles ??
            payload.fileCount;
          const documentCount =
            payload.documentCount ??
            payload.numberOfFiles ??
            payload.noOfFiles ??
            payload.fileCount;
          const childFolderCount =
            payload.childFolderCount ??
            payload.childFoldersCount ??
            payload.folderCount ??
            payload.numberOfFolders;
          const size = payload.folderSize || payload.size;
          const owner =
            payload.createdBy ?? payload.createdByName ?? payload.owner;
          const sharedBy = payload.sharedBy ?? payload.sharedByUser;
          const color = String(
            payload.color ??
              payload.Color ??
              payload.folderColor ??
              f.color ??
              ""
          ).trim();
          return {
            ...f,
            ...(count != null ? { count } : {}),
            ...(documentCount != null ? { documentCount } : {}),
            ...(childFolderCount != null ? { childFolderCount } : {}),
            ...(size ? { size } : {}),
            ...(owner != null ? { owner } : {}),
            ...(sharedBy != null ? { sharedBy } : {}),
            color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : "",
            created: formatDate(
              payload.createdAt ||
                payload.createdOnFormatted ||
                payload.createdOn,
              locale
            ),
            modified: formatDate(
              payload.updatedAt ||
                payload.createdAt ||
                payload.createdOnFormatted ||
                payload.sharedOnFormatted ||
                payload.createdOn,
              locale
            ),
            description:
              payload.description != null
                ? payload.description || ""
                : f.description,
            name: payload.name || payload.folderName || f.name,
          };
        };

        setRootFolders((prev) => prev.map(patchOne));
        setAllSubFolders((prev) => prev.map(patchOne));
        setSharedRootFolders((prev) => prev.map(patchOne));
        setAdhocFolders((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            if (key.endsWith(`:${id}`)) next[key] = patchOne(next[key]);
          });
          return next;
        });
        if (setSelectedFolder) {
          setSelectedFolder((prev) =>
            prev && String(prev.id) === String(id) ? patchOne(prev) : prev
          );
        }
      } catch {
        // best-effort
      }
    },
    [runWithAbort, locale]
  );

  const fetchFolderDocs = useCallback(
    async (folderId, { force = false, treeScope = DMS_SCOPE_OWN } = {}) => {
      const cacheKey = getFolderDocsMapKey(treeScope, folderId);
      if (!folderId) return;

      if (!force && folderDocsMap[cacheKey]) return;

      beginFolderContentLoad();
      try {
        const result = await runWithAbort(`docs-${cacheKey}`, (signal) =>
          userService.getDmsDocumentsByFolder(folderId, { signal })
        );
        if (result?.aborted) return;

        const docs = getDmsResponsePayload(result);
        const normalized = docs.map((doc) => normalizeDoc(doc, folderId));
        setForbiddenFolderKeys((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
        setFolderDocsMap((prev) => ({ ...prev, [cacheKey]: normalized }));
      } catch (error) {
        if (isAxiosForbiddenError(error)) {
          setForbiddenFolderKeys((prev) => new Set(prev).add(cacheKey));
        } else if (shouldTreatAsEmptyFolderCache(error)) {
          setFolderDocsMap((prev) => ({ ...prev, [cacheKey]: [] }));
        }
      } finally {
        endFolderContentLoad();
      }
    },
    [
      folderDocsMap,
      runWithAbort,
      normalizeDoc,
      beginFolderContentLoad,
      endFolderContentLoad,
    ]
  );

  const fetchSharedFolders = useCallback(
    async ({ force = false, showLoader = true } = {}) => {
      if (sharedLoaded && !force) return;
      if (sharedFoldersFetchRef.current) return sharedFoldersFetchRef.current;

      const request = (async () => {
        if (showLoader) setSharedListLoading(true);
        try {
          const result = await runWithAbort("shared-folders", (signal) =>
            userService.getDmsSharedWithUsers({ signal })
          );
          if (result?.aborted) return;

          const payload = getDmsResponsePayload(result);
          const shared = dedupeSharedListItems(
            payload
              .filter(
                (share) =>
                  share?.folderId ?? share?.folderID ?? share?.folder?.id
              )
              .map((share) => normalizeSharedFolder(share))
              .filter((folder) => folder?.id)
          );
          setSharedRootFolders(shared);
          setSharedLoaded(true);
        } catch (error) {
          if (!isDmsAbortError(error)) {
            // interceptor handles the toast
          }
        } finally {
          if (showLoader) setSharedListLoading(false);
          sharedFoldersFetchRef.current = null;
        }
      })();

      sharedFoldersFetchRef.current = request;
      return request;
    },
    [sharedLoaded, runWithAbort, isDmsAbortError, normalizeSharedFolder]
  );

  const refreshSharedFoldersList = useCallback(
    () => fetchSharedFolders({ force: true }),
    [fetchSharedFolders]
  );

  const fetchSharedWithOthersFolders = useCallback(
    async ({ force = false, showLoader = true } = {}) => {
      if (sharedWithOthersLoaded && !force) return;
      if (sharedWithOthersFetchRef.current)
        return sharedWithOthersFetchRef.current;

      const request = (async () => {
        if (showLoader) setSharedListLoading(true);
        try {
          const result = await runWithAbort(
            "shared-with-others-folders",
            (signal) => userService.getDmsSharedWithOthers({ signal })
          );
          if (result?.aborted) return;

          const payload = getDmsResponsePayload(result);
          const shared = dedupeSharedListItems(
            payload
              .filter(
                (share) =>
                  share?.folderId ?? share?.folderID ?? share?.folder?.id
              )
              .map((share) => normalizeSharedWithOthersFolder(share))
              .filter((folder) => folder?.id)
          );
          setSharedWithOthersFolders(shared);
          setSharedWithOthersLoaded(true);
        } catch (error) {
          if (!isDmsAbortError(error)) {
            // interceptor handles the toast
          }
        } finally {
          if (showLoader) setSharedListLoading(false);
          sharedWithOthersFetchRef.current = null;
        }
      })();

      sharedWithOthersFetchRef.current = request;
      return request;
    },
    [
      sharedWithOthersLoaded,
      runWithAbort,
      isDmsAbortError,
      normalizeSharedWithOthersFolder,
    ]
  );

  const refreshSharedWithOthersFoldersList = useCallback(
    () => fetchSharedWithOthersFolders({ force: true }),
    [fetchSharedWithOthersFolders]
  );

  const fetchSharedDocumentsWithMe = useCallback(
    async ({ force = false, showLoader = true } = {}) => {
      if (sharedDocumentsLoaded && !force) return;
      if (sharedDocumentsFetchRef.current)
        return sharedDocumentsFetchRef.current;

      const request = (async () => {
        if (showLoader) setSharedListLoading(true);
        try {
          const result = await runWithAbort(
            "shared-documents-with-me",
            (signal) => userService.getDmsDocumentsSharedWithMe({ signal })
          );
          if (result?.aborted) return;

          const payload = getDmsResponsePayload(result);
          const docs = dedupeSharedListItems(
            payload
              .filter(
                (share) =>
                  share?.documentId ?? share?.documentID ?? share?.document?.id
              )
              .map((share) => normalizeSharedDocument(share))
              .filter((doc) => doc?.id)
          );
          setSharedDocumentsWithMe(docs);
          setSharedDocumentsLoaded(true);
        } catch (error) {
          if (!isDmsAbortError(error)) {
            // interceptor handles the toast
          }
        } finally {
          if (showLoader) setSharedListLoading(false);
          sharedDocumentsFetchRef.current = null;
        }
      })();

      sharedDocumentsFetchRef.current = request;
      return request;
    },
    [
      sharedDocumentsLoaded,
      runWithAbort,
      isDmsAbortError,
      normalizeSharedDocument,
    ]
  );

  const refreshSharedDocumentsWithMeList = useCallback(
    () => fetchSharedDocumentsWithMe({ force: true }),
    [fetchSharedDocumentsWithMe]
  );

  const fetchSharedDocumentsWithOthers = useCallback(
    async ({ force = false, showLoader = true } = {}) => {
      if (sharedDocumentsWithOthersLoaded && !force) return;
      if (sharedDocumentsWithOthersFetchRef.current)
        return sharedDocumentsWithOthersFetchRef.current;

      const request = (async () => {
        if (showLoader) setSharedListLoading(true);
        try {
          const result = await runWithAbort(
            "shared-documents-with-others",
            (signal) => userService.getDmsDocumentsSharedWithOthers({ signal })
          );
          if (result?.aborted) return;

          const payload = getDmsResponsePayload(result);
          const docs = dedupeSharedListItems(
            payload
              .filter(
                (share) =>
                  share?.documentId ?? share?.documentID ?? share?.document?.id
              )
              .map((share) => normalizeSharedWithOthersDocument(share))
              .filter((doc) => doc?.id)
          );
          setSharedDocumentsWithOthers(docs);
          setSharedDocumentsWithOthersLoaded(true);
        } catch (error) {
          if (!isDmsAbortError(error)) {
            // interceptor handles the toast
          }
        } finally {
          if (showLoader) setSharedListLoading(false);
          sharedDocumentsWithOthersFetchRef.current = null;
        }
      })();

      sharedDocumentsWithOthersFetchRef.current = request;
      return request;
    },
    [
      sharedDocumentsWithOthersLoaded,
      runWithAbort,
      isDmsAbortError,
      normalizeSharedWithOthersDocument,
    ]
  );

  const refreshSharedDocumentsWithOthersList = useCallback(
    () => fetchSharedDocumentsWithOthers({ force: true }),
    [fetchSharedDocumentsWithOthers]
  );

  const buildRecursiveTree = useCallback(
    (folders, parentId, treeScope) =>
      folders
        .filter(
          (f) =>
            String(f.parentFolderID) === String(parentId) &&
            f.treeScope === treeScope
        )
        .map((f) => ({
          treeKey: getFolderTreeKey(treeScope, f.id),
          id: f.id,
          treeScope,
          name: f.name,
          color: f.color,
          count: f.count,
          documentCount: f.documentCount,
          childFolderCount: f.childFolderCount,
          size: f.size,
          owner: f.owner,
          sharedBy: f.sharedBy,
          sharedWith: f.sharedWith,
          folderID: f.folderID,
          subFolderID: f.subFolderID,
          parentFolderID: f.parentFolderID,
          shared: f.shared,
          permission: f.permission,
          canReshare: f.canReshare,
          children: buildRecursiveTree(allSubFolders, f.id, treeScope),
        })),
    [allSubFolders]
  );

  const treeRoot = useMemo(() => {
    const ownNodes = rootFolders.map((folder) => ({
      treeKey: getFolderTreeKey(DMS_SCOPE_OWN, folder.id),
      id: folder.id,
      treeScope: DMS_SCOPE_OWN,
      name: folder.name,
      color: folder.color,
      count: folder.count,
      documentCount: folder.documentCount,
      childFolderCount: folder.childFolderCount,
      size: folder.size,
      owner: folder.owner,
      sharedBy: folder.sharedBy,
      sharedWith: folder.sharedWith,
      folderID: folder.folderID,
      subFolderID: folder.subFolderID,
      parentFolderID: folder.parentFolderID,
      shared: folder.shared,
      permission: folder.permission,
      canReshare: folder.canReshare,
      children: buildRecursiveTree(allSubFolders, folder.id, DMS_SCOPE_OWN),
    }));

    const sharedNodes = sharedRootFolders.map((folder) => {
      const realFolderId = folder.folderID || folder.id;
      return {
        treeKey: getFolderTreeKey(
          DMS_SCOPE_SHARED,
          folder.shareId || folder.id
        ),
        id: folder.id,
        treeScope: DMS_SCOPE_SHARED,
        name: folder.name,
        color: folder.color,
        count: folder.count,
        documentCount: folder.documentCount,
        childFolderCount: folder.childFolderCount,
        size: folder.size,
        owner: folder.owner,
        sharedBy: folder.sharedBy,
        folderID: realFolderId,
        shareId: folder.shareId,
        subFolderID: folder.subFolderID,
        parentFolderID: folder.parentFolderID,
        shared: folder.shared,
        permission: folder.permission,
        canReshare: folder.canReshare,
        children: buildRecursiveTree(
          allSubFolders,
          realFolderId,
          DMS_SCOPE_SHARED
        ),
      };
    });

    const sharedWithOthersNodes = sharedWithOthersFolders.map((folder) => {
      const realFolderId = folder.folderID || folder.id;
      return {
        treeKey: getFolderTreeKey(
          DMS_SCOPE_SHARED_OTHERS,
          folder.shareId || folder.id
        ),
        id: folder.id,
        treeScope: DMS_SCOPE_SHARED_OTHERS,
        name: folder.name,
        color: folder.color,
        count: folder.count,
        documentCount: folder.documentCount,
        childFolderCount: folder.childFolderCount,
        size: folder.size,
        owner: folder.owner,
        sharedBy: folder.sharedBy,
        sharedWith: folder.sharedWith,
        folderID: realFolderId,
        shareId: folder.shareId,
        subFolderID: folder.subFolderID,
        parentFolderID: folder.parentFolderID,
        shared: folder.shared,
        permission: folder.permission,
        canReshare: folder.canReshare,
        children: buildRecursiveTree(
          allSubFolders,
          realFolderId,
          DMS_SCOPE_SHARED_OTHERS
        ),
      };
    });

    return [
      {
        id: "dms-my-folders",
        treeKey: "dms-my-folders",
        treeScope: DMS_SCOPE_OWN,
        name: t("DMS.myFolders"),
        icon: "root",
        children: ownNodes,
      },
      {
        id: "dms-shared-me",
        treeKey: "dms-shared-me",
        treeScope: DMS_SCOPE_SHARED,
        name: t("DMS.sharedWithMe"),
        icon: "shared",
        children: sharedNodes,
      },
      {
        id: "dms-shared-others",
        treeKey: "dms-shared-others",
        treeScope: DMS_SCOPE_SHARED_OTHERS,
        name: t("DMS.sharedWithOthers"),
        icon: "shared",
        children: sharedWithOthersNodes,
      },
    ];
  }, [
    rootFolders,
    allSubFolders,
    sharedRootFolders,
    sharedWithOthersFolders,
    t,
    buildRecursiveTree,
  ]);

  const refreshDmsAfterMutation = useCallback(
    async (
      {
        kind,
        folderId,
        parentFolderId,
        newParentFolderId,
        treeScope = DMS_SCOPE_OWN,
      },
      setSelectedFolder
    ) => {
      void fetchStorage({ force: true });
      const refreshFolderLocation = async (targetParentId) => {
        if (targetParentId) {
          await fetchFolderChildren(targetParentId, { treeScope, force: true });
        } else if (treeScope === DMS_SCOPE_SHARED) {
          await refreshSharedFoldersList();
        } else if (treeScope === DMS_SCOPE_SHARED_OTHERS) {
          await refreshSharedWithOthersFoldersList();
        } else {
          await fetchRoots();
        }
      };

      if (kind === "upload" && folderId) {
        await fetchFolderDocs(folderId, { force: true, treeScope });
        await refreshFolderById(folderId, setSelectedFolder);
      } else if (kind === "createFolder") {
        if (parentFolderId) {
          await fetchFolderChildren(parentFolderId, { treeScope, force: true });
          await refreshFolderById(parentFolderId, setSelectedFolder);
        } else {
          await fetchRoots();
        }
      } else if (kind === "deleteDocument" && folderId) {
        await refreshFolderById(folderId, setSelectedFolder);
      } else if (kind === "moveFolder") {
        await refreshFolderLocation(parentFolderId || null);
        if (String(parentFolderId || "") !== String(newParentFolderId || "")) {
          await refreshFolderLocation(newParentFolderId || null);
        }
        if (folderId) await refreshFolderById(folderId, setSelectedFolder);
      } else if (kind === "moveDocument") {
        await fetchAllDocuments();
        if (parentFolderId) {
          await fetchFolderDocs(parentFolderId, { force: true, treeScope });
          await refreshFolderById(parentFolderId, setSelectedFolder);
        }
        if (
          newParentFolderId &&
          String(parentFolderId || "") !== String(newParentFolderId)
        ) {
          await fetchFolderDocs(newParentFolderId, {
            force: true,
            treeScope: DMS_SCOPE_OWN,
          });
          await refreshFolderById(newParentFolderId, setSelectedFolder);
        }
      } else if (kind === "deleteFolder") {
        await fetchAllDocuments();
        if (treeScope === DMS_SCOPE_SHARED) {
          await refreshSharedFoldersList();
        } else if (treeScope === DMS_SCOPE_SHARED_OTHERS) {
          await refreshSharedWithOthersFoldersList();
        } else if (parentFolderId) {
          await fetchFolderChildren(parentFolderId, { treeScope, force: true });
        } else {
          await fetchRoots();
        }
      }
    },
    [
      fetchStorage,
      fetchFolderDocs,
      refreshFolderById,
      fetchFolderChildren,
      fetchRoots,
      fetchAllDocuments,
      refreshSharedFoldersList,
      refreshSharedWithOthersFoldersList,
    ]
  );

  const initDms = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchRoots(), fetchStorage()]);
    setIsLoading(false);
  }, [fetchRoots, fetchStorage]);

  return {
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
    resolvingFolderId,
    treeLoaded,
    loadedChildrenFor,
    setLoadedChildrenFor,
    isLoading,
    folderContentLoading,
    sharedListLoading,
    forbiddenFolderKeys,
    treeRoot,
    fetchRoots,
    fetchStorage,
    fetchAllDocuments,
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
    refreshFolderById,
    refreshDmsAfterMutation,
    initDms,
    normalizeDoc,
  };
};
