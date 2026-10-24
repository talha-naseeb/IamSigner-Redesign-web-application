import React, { useEffect, useState } from "react";
import { Button } from "@/Components/UI/shadcnCompat";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import "./Imagethumbnails.css";
import AIAssistant from "@/Components/CommonModals/AIAssitant/AIAssistant";
import PageIcon from "@/assets/images/file-02.svg";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Icons } from "@/assets/Icons";

const ImageThumbnails = ({ t, controls, selectedImage, setSelectedImage, setMasterDocPagesId, imagesData, setImagesData, buttons, onImageError }) => {
  const [deletingMasterPageID, setDeletingMasterPageID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  const handleImageClick = (pagesPath, masterDocPagesID) => {
    setSelectedImage(pagesPath);
    setMasterDocPagesId(masterDocPagesID);
  };

  const handleShowConfirmModal = (masterDocPagesID, pageIndex) => {
    setDeletingMasterPageID(masterDocPagesID);
    setDeletingIndex(pageIndex);
    setShowConfirmModal(true);
  };

  const handleImageDelete = async (masterDocPagesID, pageIndex) => {
    try {
      const response = await uploadFlowService.deleteMasterDocPages({
        MasterDocPagesID: masterDocPagesID,
      });

      if (response.status === 200) {
        const updatedImagesData = [...imagesData];
        updatedImagesData.splice(pageIndex, 1);
        setImagesData(updatedImagesData);

        if (updatedImagesData.length === 0) {
          setSelectedImage(null);
        }
      }
      toast.success(t("uploadDocFlow.pageDeleted"));
    } catch (error) {
      toast.error(t("uploadDocFlow.errDelete"));
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = [...imagesData];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrder = {
      MasterDocPagesID: reorderedItem.masterDocPagesID,
      PagesOrder: result.destination.index + 1,
    };

    setImagesData(items);
    updateImagesOrder(newOrder);
  };

  const updateImagesOrder = async (newOrder) => {
    try {
      await uploadFlowService.updateMasterDocPagesOrdering(newOrder);
    } catch (error) {
      toast.error(t("uploadDocFlow.errPages"));
    }
  };

  return (
    <>
      <div className='scrollable-content-bookmark'>
        {/* <ScrollToTopButton /> */}
        <AIAssistant />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='image-list' direction='vertical'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {imagesData.slice(0, seeMore ? imagesData.length : 5).map((imageData, index) => {
                  const hasControls = controls && controls.some((control) => control.masterDocPagesID === imageData.masterDocPagesID);

                  return (
                    <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`image-div my-2 mx-1 my-lg-4 mx-lg-3 ${selectedImage === imageData.pagesPath ? "selected" : ""} ${hasControls ? "has-buttons" : ""}`}
                          onClick={() => handleImageClick(imageData.pagesPath, imageData.masterDocPagesID)}
                        >
                          <img
                            src={imageData.pagesPath}
                            alt={`Img ${index}`}
                            onError={() => {
                              // In the public signing flow the caller decides what a broken
                              // page image means (shows the shared error screen); the upload
                              // flow keeps the original navigate-home behavior.
                              if (onImageError) {
                                onImageError(imageData);
                                return;
                              }
                              navigate("/home");
                              toast.info(t("uploadDocFlow.pleaseUploadDoc"), { toastId: "broken-thumb" });
                            }}
                          />
                          {buttons ? (
                            <div className={`actions-tab d-flex justify-content-center align-items-center ${selectedImage === imageData.pagesPath ? "selected" : ""}`}>
                              <Button className='deleteImgBtn mx-2' variant='none' onClick={() => handleShowConfirmModal(imageData.masterDocPagesID, index)}>
                                <Icons.DeleteAction color="black" />
                              </Button>
                              <div className='drag-handle' {...provided.dragHandleProps}>
                                <Icons.DragHandle color="black" />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {!seeMore && imagesData.length > 5 && (
          <div className='seemorebutton' onClick={() => setSeeMore(true)}>
            <Button style={{ border: "none", color: "var(--text-primary)", padding: "0px" }} variant='none'>
              {t("uploadDocFlow.seemore")}
            </Button>
            <Icons.ArrowDown />
          </div>
        )}
        {seeMore && (
          <div className='seemorebutton' onClick={() => setSeeMore(false)}>
            <Button style={{ border: "none", color: "var(--text-primary)", padding: "0px" }} variant='none'>
              {t("uploadDocFlow.seeLess")}
            </Button>
            <Icons.ArrowUp />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        title={t("uploadDocFlow.confirmDelete")}
        subtitle={t("uploadDocFlow.deletePage")}
        warningText={t("uploadDocFlow.deletePage")}
        itemTitle={t("uploadDocFlow.deleteTemplates")}
        itemName={imagesData[deletingIndex]?.pagesName || "No Name"}
        onConfirm={() => handleImageDelete(deletingMasterPageID, deletingIndex)}
        confirmText={t("createTeam.confirm")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={22} />}
        itemIconSrc={PageIcon}
      />
    </>
  );
};

export default ImageThumbnails;
