import React, { useState, useEffect } from "react";
import userService from "@/services/userService";
import { Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { FileText, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const AddCompletedToSubFolder = ({ show, handleClose, subFolderID }) => {
  const [completedDocuments, setCompletedDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  useEffect(() => {
    if (show) {
      fetchCompletedDocuments();
    }
  }, [show]);

  const fetchCompletedDocuments = async () => {
    try {
      const response = await userService.getCompletedMasterDocList();
      if (response.data.statusCode === "1") {
        setCompletedDocuments(response.data.response || []);
      }
    } catch (error) {
      console.error("Error fetching completed docs:", error);
    }
  };

  const handleDocumentSelection = (masterDocId) => {
    setSelectedDocuments((prevSelected) => {
      if (prevSelected.includes(masterDocId)) {
        return prevSelected.filter((id) => id !== masterDocId);
      } else {
        return [...prevSelected, masterDocId];
      }
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (selectedDocuments.length === 0) return;
    setIsLoading(true);
    try {
      const response = await assignDocumentsToFolder(selectedDocuments);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.assigned") || "Document added to folder");
        handleCancel();
      } else {
        toast.error(t("Folder.notassigned") || "Failed to assign document");
      }
    } catch (error) {
      console.error("Error assigning docs:", error);
      toast.error(t("Folder.notassigned") || "Failed to assign document");
    } finally {
      setIsLoading(false);
    }
  };

  const assignDocumentsToFolder = async (selectedDocs) => {
    return await userService.assignDocToFolder({
      FolderID: subFolderID,
      Documents: selectedDocs.map((docId) => ({ MasterDocID: docId })),
    });
  };

  const handleCancel = () => {
    setSelectedDocuments([]);
    setFilter("");
    handleClose();
  };

  const filteredDocuments = completedDocuments.filter((doc) =>
    (doc.docName || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Offcanvas
      show={show}
      onHide={handleCancel}
      placement={isRtl ? "start" : "end"}
      className='flex flex-col h-full bg-[var(--modern-card)]'
    >
      <Offcanvas.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
            <FileText size={20} />
          </div>
          <div>
            <Offcanvas.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("Folder.addCompletedDocs")}
            </Offcanvas.Title>
          </div>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className='flex-1 overflow-y-auto px-5 py-4 space-y-4'>
        {/* Search input */}
        <div className='relative'>
          <div className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-[var(--modern-muted)] pointer-events-none`}>
            <Search size={16} />
          </div>
          <input
            type='text'
            placeholder={t("Folder.searchDocs")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`w-full ${
              isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
            } py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--theme-color)] transition-colors`}
          />
        </div>

        {/* Documents List */}
        <div className='space-y-2'>
          {filteredDocuments.length === 0 ? (
            <div className='text-center py-10 space-y-2'>
              <div className='w-12 h-12 mx-auto rounded-full bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)]'>
                <FileText size={24} />
              </div>
              <p className='text-xs text-[var(--modern-muted)] m-0'>{t("dashboardCardStatuses.notDocsFound")}</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isSelected = selectedDocuments.includes(doc.masterDocID);
              return (
                <div
                  key={doc.masterDocID}
                  onClick={() => handleDocumentSelection(doc.masterDocID)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[var(--theme-color)] bg-[var(--modern-raised)] text-[var(--modern-text)]"
                      : "border-[var(--modern-border)] bg-[var(--modern-card)] hover:bg-[var(--modern-raised)] text-[var(--modern-text)]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[var(--theme-color)] border-[var(--theme-color)] text-white"
                        : "border-[var(--modern-border-strong)] bg-[var(--modern-bg)]"
                    }`}
                  >
                    {isSelected && <span className='text-xs font-bold'>✓</span>}
                  </div>
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <FileText size={18} className={`shrink-0 ${isSelected ? "text-[var(--theme-color)]" : "text-[var(--modern-muted)]"}`} />
                    <span className='text-sm font-medium truncate'>{doc.docName}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Offcanvas.Body>

      {/* Permanently Static Bottom Footer */}
      <div className='border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5 flex items-center justify-end gap-3 mt-auto sticky bottom-0 z-10'>
        <button
          type='button'
          onClick={handleCancel}
          disabled={isLoading}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none'
        >
          {t("Folder.Cancel")}
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={selectedDocuments.length === 0 || isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all shadow-none'
        >
          {isLoading && <Loader2 size={14} className='animate-spin' />}
          <span>{t("Folder.add")}</span>
        </button>
      </div>
    </Offcanvas>
  );
};

export default AddCompletedToSubFolder;
