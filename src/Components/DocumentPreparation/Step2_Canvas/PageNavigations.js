import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PageNavigations = ({ imagesData, selectedImage, setSelectedImage, onImageSelect }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const selectedIndex = imagesData.findIndex((image) => image.pagesPath === selectedImage);
    if (selectedIndex !== -1) {
      setPageNumber(imagesData[selectedIndex].pagesOrder);
    }
  }, [selectedImage, imagesData]);

  const selectedImageIndex = () => {
    return imagesData.findIndex((image) => image.pagesPath === selectedImage);
  };

  const handleNextImage = () => {
    const nextIndex = selectedImageIndex() + 1;
    if (nextIndex < imagesData.length) {
      const nextPage = imagesData[nextIndex];
      setPageNumber(nextPage.pagesOrder);
      onImageSelect(nextPage.pagesPath, nextPage.masterDocPagesID);
    }
  };

  const handlePreviousImage = () => {
    const prevIndex = selectedImageIndex() - 1;
    if (prevIndex >= 0) {
      const previousPage = imagesData[prevIndex];
      setPageNumber(previousPage.pagesOrder);
      onImageSelect(previousPage.pagesPath, previousPage.masterDocPagesID);
    }
  };

  const handleFirstImage = () => {
    const firstPage = imagesData[0];
    setPageNumber(firstPage.pagesOrder);
    onImageSelect(firstPage.pagesPath, firstPage.masterDocPagesID);
  };

  const handleLastImage = () => {
    const lastIndex = imagesData.length - 1;
    const lastPage = imagesData[lastIndex];
    setPageNumber(lastPage.pagesOrder);
    onImageSelect(lastPage.pagesPath, lastPage.masterDocPagesID);
  };

  return (
    <div className='d-flex justify-content-center align-items-center'>
      <Button onClick={handleFirstImage} className='buttonStyle'>
        &#171;
      </Button>
      <Button onClick={handlePreviousImage} className='buttonStyle'>
        &#8249;
      </Button>
      <div className='PaginationNumbers'>
        {pageNumber} {t("uploadDocFlow.of")} {imagesData.length}
      </div>
      <Button onClick={handleNextImage} className='buttonStyle'>
        &#8250;
      </Button>
      <Button onClick={handleLastImage} className='buttonStyle'>
        &#187;
      </Button>
    </div>
  );
};

export default PageNavigations;
