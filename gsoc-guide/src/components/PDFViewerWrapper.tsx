'use client';

import dynamic from 'next/dynamic';

// Import the NativePDFViewer component dynamically to ensure it only runs on the client side
const NativePDFViewer = dynamic(() => import('@/components/NativePDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  ),
});

interface PDFViewerWrapperProps {
  fileUrl: string;
  fileName: string;
}

export default function PDFViewerWrapper({ fileUrl, fileName }: PDFViewerWrapperProps) {
  return <NativePDFViewer fileUrl={fileUrl} fileName={fileName} />;
} 