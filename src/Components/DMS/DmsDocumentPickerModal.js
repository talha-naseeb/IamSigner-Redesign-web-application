import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import { SearchIcon as SearchIcon } from "@/Components/UI/iconCompat";
import { InsertDriveFileOutlinedIcon as InsertDriveFileOutlinedIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import FolderTree from "./components/FolderTree";
import FileTypeIcon from "./components/FileTypeIcon";
import { useDmsRequestAbort } from "./hooks/useDmsRequestAbort";
import { useDmsFolderData } from "./hooks/useDmsFolderData";
import { DMS_SCOPE_OWN, DMS_SCOPE_SHARED, DMS_SCOPE_SHARED_OTHERS, filterDocuments, getFolderDocsMapKey, getFolderTreeKey, sortDocuments } from "./utils/dmsHelpers";
import { isDmsSignableDocument } from "./utils/dmsSignBridge";
import "./dms.css";

const DmsDocumentPickerModal = ({ show, onHide, onSelectDocument }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  const { runWithAbort, isAxiosAbortError: isDmsAbortError } = useDmsRequestAbort();
  const didInitRef = useRef(false);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(["dms-my-folders"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const {
    folderDocsMap,
    allDocumentsList,
    allDocumentsLoading,
    sharedLoaded,
    sharedWithOthersLoaded,
    treeRoot,
    loadedChildrenFor,
    isLoading,
    folderContentLoading,
    fetchFolderChildren,
    fetchFolderDocs,
    fetchSharedFolders,
    fetchSharedWithOthersFolders,
    fetchAllDocuments,
    initDms,
  } = useDmsFolderData({ t, locale, runWithAbort, isDmsAbortError });

  useEffect(() => {
    if (!show) {
      didInitRef.current = false;
      setSelectedFolder(null);
      setSearchQuery("");
      setSelectedDoc(null);
      setExpandedFolders(["dms-my-folders"]);
      return;
    }
    if (didInitRef.current) return;
    didInitRef.current = true;
    void initDms();
    void fetchAllDocuments();
  }, [show, initDms, fetchAllDocuments]);

  const isRoot = !selectedFolder;

  const filteredDocs = useMemo(() => {
    const sourceDocs = !selectedFolder ? allDocumentsList : folderDocsMap[getFolderDocsMapKey(selectedFolder.treeScope ?? DMS_SCOPE_OWN, selectedFolder.id)] || [];
    const signable = sourceDocs.filter(isDmsSignableDocument);
    const sorted = sortDocuments(signable, "modified");
    return filterDocuments(sorted, searchQuery, "All");
  }, [selectedFolder, allDocumentsList, folderDocsMap, searchQuery]);

  const selectedTreeKey = useMemo(() => {
    if (!selectedFolder) return null;
    return getFolderTreeKey(selectedFolder.treeScope ?? DMS_SCOPE_OWN, selectedFolder.id);
  }, [selectedFolder]);

  const handleGoHome = () => {
    setSelectedFolder(null);
    setSelectedDoc(null);
    void fetchAllDocuments();
  };

  const handleFolderSelect = (item) => {
    if (!item?.id) return;
    setSelectedDoc(null);
    setSearchQuery("");

    if (item.id === "dms-my-folders") {
      setSelectedFolder({
        id: "dms-my-folders",
        treeScope: DMS_SCOPE_OWN,
        name: t("DMS.myFolders"),
      });
      setExpandedFolders((prev) => (prev.includes("dms-my-folders") ? prev : [...prev, "dms-my-folders"]));
      return;
    }
    if (item.id === "dms-shared-me") {
      setSelectedFolder({
        id: "dms-shared-me",
        treeScope: DMS_SCOPE_SHARED,
        name: t("DMS.sharedWithMe"),
      });
      setExpandedFolders((prev) => (prev.includes("dms-shared-me") ? prev : [...prev, "dms-shared-me"]));
      return;
    }
    if (item.id === "dms-shared-others") {
      setSelectedFolder({
        id: "dms-shared-others",
        treeScope: DMS_SCOPE_SHARED_OTHERS,
        name: t("DMS.sharedWithOthers"),
      });
      setExpandedFolders((prev) => (prev.includes("dms-shared-others") ? prev : [...prev, "dms-shared-others"]));
      return;
    }

    setSelectedFolder(item);
  };

  const handleToggleExpand = (item) => {
    const treeKey = item?.treeKey ?? item?.id;
    if (!treeKey) return;
    setExpandedFolders((prev) => (prev.includes(treeKey) ? prev.filter((id) => id !== treeKey) : [...prev, treeKey]));
    if (item.id && !["dms-my-folders", "dms-shared-me", "dms-shared-others"].includes(item.id)) {
      void fetchFolderChildren(item.folderID ?? item.id, { treeScope: item.treeScope ?? DMS_SCOPE_OWN });
    }
  };

  useEffect(() => {
    if (!show || !selectedFolder?.id) return;

    if (selectedFolder.id === "dms-shared-me") {
      if (!sharedLoaded) void fetchSharedFolders();
      return;
    }
    if (selectedFolder.id === "dms-shared-others") {
      if (!sharedWithOthersLoaded) void fetchSharedWithOthersFolders();
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
  }, [show, selectedFolder, sharedLoaded, sharedWithOthersLoaded, fetchFolderDocs, fetchFolderChildren, fetchSharedFolders, fetchSharedWithOthersFolders]);

  const handleConfirm = () => {
    if (!selectedDoc) return;
    onSelectDocument?.(selectedDoc);
  };

  const docsLoading = isRoot ? allDocumentsLoading : folderContentLoading;
  const showLoader = isLoading || docsLoading;

  const stopDropzoneBubble = (e) => {
    e.stopPropagation();
  };

  return (
    <Modal show={show} onHide={onHide} centered onClick={stopDropzoneBubble} onMouseDown={stopDropzoneBubble} onPointerDown={stopDropzoneBubble} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>{t("DMS.selectDocument")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='px-4 py-3' onClick={stopDropzoneBubble} onMouseDown={stopDropzoneBubble}>
        <p className='dms-upload-picker-hint'>{t("DMS.selectDocumentHint")}</p>
        <div className='dms-upload-picker-layout' onClick={stopDropzoneBubble} onMouseDown={stopDropzoneBubble}>
          <div className='dms-upload-picker-tree'>
            <FolderTree
              folderTree={treeRoot}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              isRoot={isRoot}
              loadedChildrenFor={loadedChildrenFor}
              onGoHome={handleGoHome}
              onSelect={handleFolderSelect}
              onToggle={handleToggleExpand}
              embedded
              compact
            />
          </div>
          <div className='dms-upload-picker-docs'>
            <div className='dms-search-wrap mb-3'>
              <SearchIcon className='dms-search-icon' sx={{ fontSize: 18 }} />
              <input type='text' className='dms-search-input' placeholder={t("DMS.searchDocumentsPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className='dms-upload-picker-docs-body'>
              {showLoader ? null : filteredDocs.length === 0 ? (
                <div className='dms-upload-picker-empty'>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 52, color: "var(--border-color)" }} />
                  <p>{t("DMS.noSignableDocs")}</p>
                </div>
              ) : (
                <div className='dms-upload-picker-list'>
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type='button'
                      className={`dms-upload-picker-item${selectedDoc?.id === doc.id ? " active" : ""}`}
                      onClick={(e) => {
                        stopDropzoneBubble(e);
                        setSelectedDoc(doc);
                      }}
                    >
                      <FileTypeIcon ext={doc.ext} size={28} />
                      <span className='dms-upload-picker-item-name'>{doc.name}</span>
                      <span className='dms-upload-picker-item-meta'>{doc.modified}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className='mt-2 d-flex justify-content-end'>
        <Button
          variant='none'
          className='ModalPickerCancel'
          onClick={(e) => {
            stopDropzoneBubble(e);
            onHide();
          }}
        >
          {t("DMS.cancel")}
        </Button>
        <Button
          className='ModalPickerSelected'
          disabled={!selectedDoc}
          onClick={(e) => {
            stopDropzoneBubble(e);
            handleConfirm();
          }}
        >
          {t("DMS.selectDocument")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DmsDocumentPickerModal;
