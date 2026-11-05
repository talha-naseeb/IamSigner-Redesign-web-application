import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PageNavigations = ({ imagesData = [], selectedImage, setSelectedImage, onImageSelect }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const { t } = useTranslation();

  const totalPages = imagesData?.length || 0;

  useEffect(() => {
    const selectedIndex = imagesData.findIndex((image) => image.pagesPath === selectedImage);
    if (selectedIndex !== -1) {
      setPageNumber(imagesData[selectedIndex].pagesOrder || selectedIndex + 1);
    }
  }, [selectedImage, imagesData]);

  const selectedImageIndex = () => {
    return imagesData.findIndex((image) => image.pagesPath === selectedImage);
  };

  const handleNextImage = () => {
    const nextIndex = selectedImageIndex() + 1;
    if (nextIndex < imagesData.length) {
      const nextPage = imagesData[nextIndex];
      setPageNumber(nextPage.pagesOrder || nextIndex + 1);
      onImageSelect(nextPage.pagesPath, nextPage.masterDocPagesID);
    }
  };

  const handlePreviousImage = () => {
    const prevIndex = selectedImageIndex() - 1;
    if (prevIndex >= 0) {
      const previousPage = imagesData[prevIndex];
      setPageNumber(previousPage.pagesOrder || prevIndex + 1);
      onImageSelect(previousPage.pagesPath, previousPage.masterDocPagesID);
    }
  };

  const handleFirstImage = () => {
    if (imagesData.length === 0) return;
    const firstPage = imagesData[0];
    setPageNumber(firstPage.pagesOrder || 1);
    onImageSelect(firstPage.pagesPath, firstPage.masterDocPagesID);
  };

  const handleLastImage = () => {
    if (imagesData.length === 0) return;
    const lastIndex = imagesData.length - 1;
    const lastPage = imagesData[lastIndex];
    setPageNumber(lastPage.pagesOrder || imagesData.length);
    onImageSelect(lastPage.pagesPath, lastPage.masterDocPagesID);
  };

  const isFirst = selectedImageIndex() <= 0;
  const isLast = selectedImageIndex() >= totalPages - 1;

  return (
    <div className='inline-flex items-center gap-1.5 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2 py-1 text-xs text-[var(--modern-text)]'>
      <button
        type='button'
        onClick={handleFirstImage}
        disabled={isFirst}
        aria-label='First page'
        className='inline-flex h-7 w-7 items-center justify-center rounded-full border-0 bg-transparent text-[var(--modern-text)] hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none'
      >
        <ChevronsLeft size={15} className='rtl:rotate-180' />
      </button>
      <button
        type='button'
        onClick={handlePreviousImage}
        disabled={isFirst}
        aria-label='Previous page'
        className='inline-flex h-7 w-7 items-center justify-center rounded-full border-0 bg-transparent text-[var(--modern-text)] hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none'
      >
        <ChevronLeft size={15} className='rtl:rotate-180' />
      </button>
      <div className='px-2 font-mono text-xs font-semibold text-[var(--modern-text)] select-none whitespace-nowrap'>
        {pageNumber} <span className='text-[var(--modern-muted)] font-normal'>{t("uploadDocFlow.of")}</span> {totalPages}
      </div>
      <button
        type='button'
        onClick={handleNextImage}
        disabled={isLast}
        aria-label='Next page'
        className='inline-flex h-7 w-7 items-center justify-center rounded-full border-0 bg-transparent text-[var(--modern-text)] hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none'
      >
        <ChevronRight size={15} className='rtl:rotate-180' />
      </button>
      <button
        type='button'
        onClick={handleLastImage}
        disabled={isLast}
        aria-label='Last page'
        className='inline-flex h-7 w-7 items-center justify-center rounded-full border-0 bg-transparent text-[var(--modern-text)] hover:bg-[var(--modern-card)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none'
      >
        <ChevronsRight size={15} className='rtl:rotate-180' />
      </button>
    </div>
  );
};

export default PageNavigations;
