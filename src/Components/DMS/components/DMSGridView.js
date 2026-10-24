import { Button } from "@/Components/UI/shadcnCompat";
import { InsertDriveFileOutlinedIcon as InsertDriveFileOutlinedIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import FolderCard from "./FolderCard";
import DocumentCard from "./DocumentCard";

const DMSGridView = ({
  isRoot,
  foldersOnly = false,
  showFolders = true,
  showDocuments = true,
  rootFolders,
  subfolders,
  pagedDocs,
  documentsSectionLabel,
  showDocumentShare = true,
  onFolderOpen,
  onFolderAction,
  onDocSelect,
  onDocAction,
  onNewFolder,
  onUpload,
  canUploadDocuments = false,
  documentAccess,
  canMoveDocuments = false,
  canUseSignFlow = false,
  signFlowOptions = [],
  signDocumentLoading = false,
  selectionEnabled = false,
  selectedDocIds,
  onToggleDocSelect,
  hasRootFolderFilters = false,
}) => {
  const { t } = useTranslation();
  const docsHeading = documentsSectionLabel || (isRoot ? t("DMS.recentDocuments") : t("DMS.documents"));
  const folderItems = foldersOnly ? subfolders : isRoot ? rootFolders : subfolders;
  const canShowNewFolder = showFolders && (isRoot || foldersOnly);

  return (
    <>
    {/* Root view: top-level folders */}
    {isRoot && showFolders && (
      <div className="dms-section">
        <div className="dms-section-label">{t("DMS.folders")}</div>
        {rootFolders.length === 0 && hasRootFolderFilters ? (
          <div className="dms-empty-state">
            <Icons.Folders size={52} color="var(--border-color)" />
            <p>{t("DMS.noFoldersFound")}</p>
          </div>
        ) : (
          <div className="dms-grid">
            {rootFolders.map((folder) => (
              <FolderCard
                key={folder.shareId || folder.id}
                folder={folder}
                onOpen={onFolderOpen}
                onFolderAction={onFolderAction}
              />
            ))}
            {canShowNewFolder ? (
              <div className="dms-add-folder-card" onClick={onNewFolder}>
                <Icons.FolderPlus size={28} color="var(--border-color)" />
                <span>{t("DMS.newFolder")}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    )}

    {/* My Folders root: folders only, no documents */}
    {foldersOnly && showFolders && (
      <div className="dms-section">
        <div className="dms-section-label">{t("DMS.folders")}</div>
        <div className="dms-grid">
          {folderItems.map((folder) => (
            <FolderCard
              key={folder.shareId || folder.id}
              folder={folder}
              onOpen={onFolderOpen}
              onFolderAction={onFolderAction}
            />
          ))}
          <div className="dms-add-folder-card" onClick={onNewFolder}>
            <Icons.FolderPlus size={28} color="var(--border-color)" />
            <span>{t("DMS.newFolder")}</span>
          </div>
        </div>
      </div>
    )}

    {/* Sub-folder view */}
    {!isRoot && !foldersOnly && showFolders && subfolders.length > 0 && (
      <div className="dms-section">
        <div className="dms-section-label">{t("DMS.subFolders")}</div>
        <div className="dms-grid">
          {subfolders.map((sf) => (
            <FolderCard
              key={sf.shareId || sf.id}
              folder={sf}
              onOpen={onFolderOpen}
              onFolderAction={onFolderAction}
            />
          ))}
        </div>
      </div>
    )}

    {/* Documents section — hidden on My Folders root or Folders filter */}
    {showDocuments && (
      <div className="dms-section">
        {(!isRoot || pagedDocs.length > 0) && (
          <div className="dms-section-label">
            {docsHeading}
          </div>
        )}
        {pagedDocs.length === 0 && !isRoot ? (
          <div className="dms-empty-state">
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 52, color: "var(--border-color)" }} />
            <p>{t("DMS.noDocsInFolder")}</p>
            {canUploadDocuments && (
              <Button size="sm" className="dms-upload-btn" onClick={onUpload}>
                <Icons.UploadCloud size={14} /> {t("DMS.uploadDocument")}
              </Button>
            )}
          </div>
        ) : (
          <div className="dms-grid">
            {pagedDocs.map((doc) => (
              <DocumentCard
                key={doc.shareId || doc.id}
                doc={doc}
                onSelect={onDocSelect}
                onDocAction={onDocAction}
                showShare={showDocumentShare}
                documentAccess={documentAccess}
                canMove={canMoveDocuments && !doc.sharedDirectly}
                canUseSignFlow={canUseSignFlow}
                signFlowOptions={signFlowOptions}
                signDocumentLoading={signDocumentLoading}
                selectionEnabled={selectionEnabled}
                selected={selectedDocIds?.has?.(doc.id)}
                onToggleSelect={onToggleDocSelect}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </>
  );
};

export default DMSGridView;
