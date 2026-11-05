import React, { useState, useEffect } from "react";
import { ListGroup, Offcanvas, Form, Button, InputGroup } from "@/Components/UI/shadcnCompat";
import userService from "@/services/userService";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const FolderSelection = ({ show, onClose, onSelectFolder }) => {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedFolderID, setSelectedFolderID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      fetchFolders();
    }
  }, [show]);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getFolders();
      if (response.data.statusCode === "1") {
        setFolders(response.data.response);
        setFilteredFolders(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = (folderID, folderName) => {
    setSelectedFolderID(folderID);
    onSelectFolder(folderID, folderName);
  };

  const handleSave = () => {
    if (selectedFolderID) {
      toast.success(t("uploadDocFlow.FolderSelectedSuccess"));
      onClose();
    }
  };

  const handleUnselect = () => {
    setSelectedFolderID(null);
    onSelectFolder(null, "");
    onClose();
  };

  // Handle search input change
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = folders.filter((folder) => folder.folderName.toLowerCase().includes(searchValue));
    setFilteredFolders(filtered);
  };

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement={document.documentElement.dir === "rtl" ? "start" : "end"}
      className="!w-full !max-w-md !border-[var(--modern-border)] !bg-[var(--modern-card)] text-[var(--modern-text)]"
    >
      <Offcanvas.Header closeButton className="border-b border-[var(--modern-border)] px-6 py-4">
        <Offcanvas.Title className="flex items-center gap-2.5 text-base font-semibold text-[var(--modern-text)]">
          <Icons.Folders size={20} className="text-[var(--modern-primary)]" />
          {t("uploadDocFlow.Folders")}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-6">
        <div className="relative mb-4">
          <Icons.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--modern-muted)]" size={16} />
          <input
            type="text"
            placeholder={t("uploadDocFlow.SearchFolders")}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] py-2.5 pl-10 pr-4 text-sm text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none"
          />
        </div>

        {filteredFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--modern-raised)] text-[var(--modern-muted)]">
              <Icons.Folders size={28} />
            </div>
            <p className="text-sm font-medium text-[var(--modern-muted)] m-0">{t("Folder.nofolder")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFolders.map((folder) => {
              const isSelected = folder.folderID === selectedFolderID;
              return (
                <div
                  key={folder.folderID}
                  onClick={() => handleFolderSelect(folder.folderID, folder.folderName)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                    isSelected
                      ? "border-[var(--modern-primary)] bg-[var(--modern-primary)]/5"
                      : "border-[var(--modern-border)] bg-[var(--modern-card)] hover:border-[var(--modern-border-strong,var(--modern-primary))] hover:bg-[var(--modern-raised)]"
                  }`}
                >
                  <div className="mt-0.5">
                    <Form.Check
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFolderSelect(folder.folderID, folder.folderName)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--modern-text)]">{folder.folderName}</div>
                    {folder.description && (
                      <p className="mt-0.5 text-xs text-[var(--modern-muted)] line-clamp-2 m-0">{folder.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Offcanvas.Body>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)] p-4 px-6">
        <Button
          variant="outline"
          onClick={handleUnselect}
          className="rounded-xl border-[var(--modern-border)] text-sm font-medium hover:bg-[var(--modern-raised)]"
        >
          {t("uploadDocFlow.UnSelect")}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!selectedFolderID}
          className="rounded-xl px-5 text-sm font-medium"
        >
          {t("uploadDocFlow.SelectFolder")}
        </Button>
      </div>
    </Offcanvas>
  );
};

export default FolderSelection;
