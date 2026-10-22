import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import mobileService from "@/services/mobileService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Icons } from "@/assets/Icons";

const ImageThumbnails = ({ t, controls, selectedImage, setSelectedImage, setMasterDocPagesId, imagesData, setImagesData, buttons, auth }) => {
  const [deletingMasterPageID, setDeletingMasterPageID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleImageDelete = async (masterDocPagesID, pageIndex) => {
    try {
      const response = await mobileService.deleteMasterDocPages(
        {
          MasterDocPagesID: masterDocPagesID,
        },
        auth
      );

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
      await mobileService.updateMasterDocPagesOrdering(newOrder, auth);
    } catch (error) {
      toast.error(t("uploadDocFlow.errPages"));
    }
  };

  return (
    <>
      <div className='scrollable-content '>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='image-list' direction='vertical'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {imagesData.length === 0 ? (
                  <div className='no-pages-message'>{t("uploadDocFlow.pageNotFound")}</div>
                ) : (
                  imagesData.map((imageData, index) => {
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
                              alt={`Image ${index}`}
                              onError={() => {
                                navigate("/home");
                                toast.info(t("uploadDocFlow.pleaseUploadDoc"), { toastId: "broken-thumb" });
                              }}
                            />

                            {buttons ? (
                              <div className={`actions-tab d-flex justify-content-center align-items-center ${selectedImage === imageData.pagesPath ? "selected" : ""}`}>
                                <Button className='deleteImgBtn mx-2' variant='none' onClick={() => handleShowConfirmModal(imageData.masterDocPagesID, index)}>
                                  <Icons.DeleteAction color='black' />
                                </Button>
                                <div className='drag-handle' {...provided.dragHandleProps}>
                                  <Icons.DragHandle color='black' />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </Draggable>
                    );
                  })
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* page delete modal */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='d-flex align-items-center gap-2'>
            <Icons.DeleteAction size={25} />
            <Modal.Title>{t("uploadDocFlow.confirmDelete")}</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>{t("uploadDocFlow.deletePage")}</Modal.Body>
        <Modal.Footer>
          <Button variant='none' onClick={handleCloseConfirmModal} className='modalCancelButton'>
            {t("uploadDocFlow.cancel")}
          </Button>
          <Button variant='none' className='applyBtn' onClick={() => handleImageDelete(deletingMasterPageID, deletingIndex)}>
            {t("uploadDocFlow.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageThumbnails;
