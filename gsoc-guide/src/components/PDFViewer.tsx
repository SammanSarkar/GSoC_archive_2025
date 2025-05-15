'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function onDocumentLoadError() {
    setError(true);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    if (pageNumber > 1) {
      changePage(-1);
    }
  }

  function nextPage() {
    if (numPages && pageNumber < numPages) {
      changePage(1);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-gray-100 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
            {fileName}
          </h2>
          <a 
            href={fileUrl} 
            download={fileName}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-96 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-96 w-full bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center p-6">
            <p className="text-red-600 font-medium">Failed to load PDF</p>
            <p className="text-red-500 mt-2">Try downloading the file instead.</p>
          </div>
        </div>
      )}

      <div className="w-full overflow-auto">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={window.innerWidth > 800 ? 800 : window.innerWidth - 40}
          />
        </Document>
      </div>

      {numPages && (
        <div className="flex items-center justify-between w-full max-w-md mt-4 px-2">
          <button
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <p className="text-gray-700">
            Page {pageNumber} of {numPages}
          </p>
          
          <button
            disabled={!numPages || pageNumber >= numPages}
            onClick={nextPage}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 