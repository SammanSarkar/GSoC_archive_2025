'use client';

import { useState, useEffect } from 'react';

interface NativePDFViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function NativePDFViewer({ fileUrl, fileName }: NativePDFViewerProps) {
  const [iframeSupported, setIframeSupported] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check device type and iframe PDF viewing support on mount
  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      const userAgent = navigator?.userAgent || '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent);
    };

    // Detect if we're on a mobile device
    const mobile = checkMobile();
    setIsMobile(mobile);
    
    // Set a timeout to detect loading issues on all devices
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('PDF loading timeout - switching to download fallback');
        setIframeSupported(false);
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    console.error('Error loading PDF in iframe');
    setError(true);
    setLoading(false);
    setIframeSupported(false);
  };

  // For PDFs from GitHub, we might need to modify the URL to make it viewable in an iframe
  // GitHub serves raw content with Content-Disposition: attachment which forces download
  const getOptimizedFileUrl = () => {
    // If it's a GitHub raw URL, we can try to use a proxy or alternative method
    if (fileUrl.includes('github.com') || fileUrl.includes('raw.githubusercontent.com')) {
      // For GitHub PDFs, we can use an alternative service that doesn't force downloads
      // Note: In production, you should use your own proxy or a more reliable service
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    return fileUrl;
  };

  // Get Google Docs Viewer URL that works for direct viewing (not embedded)
  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(fileUrl)}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full bg-gray-100 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
            {fileName}
          </h2>
          <a 
            href={fileUrl} 
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
          >
            <span>Download</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-4 h-4 ml-1"
            >
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
          </a>
        </div>
      </div>

      {loading && !error && (
        <div className="flex items-center justify-center h-96 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {iframeSupported && !error ? (
        <div className={`w-full ${isMobile ? "h-[80vh]" : "h-screen"} min-h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-md`}>
          <iframe
            src={getOptimizedFileUrl()}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`PDF: ${fileName}`}
            sandbox="allow-scripts allow-same-origin"
            allow="fullscreen"
          />
        </div>
      ) : (!iframeSupported && (
        <div className="flex flex-col items-center justify-center h-96 w-full bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center p-6">
            <p className="text-gray-700 font-medium">The PDF viewer couldn't be loaded</p>
            <p className="text-gray-600 mt-2">You can try these options:</p>
            
            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer" 
                download={fileName}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center justify-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5 mr-2"
                >
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Download PDF
              </a>
              
              <a 
                href={getGoogleViewerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                </svg>
                Open in Google Viewer
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 