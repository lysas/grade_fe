import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const SimpleDocViewer = ({ fileUrl, fileType }) => {
  // Create the default layout plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (fileType === 'pdf') {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance]}
            onError={(error) => {
              console.error('Error viewing PDF:', error);
            }}
          />
        </Worker>
      </div>
    );
  } else if (fileType === 'docx') {
    // For DOCX, provide a download link since browser-based viewing is limited
    return (
      <div className="docx-container">
        <div className="docx-message">
          <p>Word documents cannot be previewed directly in the browser.</p>
          <a 
            href={fileUrl} 
            download 
            className="docx-download-button"
          >
            Download Document
          </a>
        </div>
      </div>
    );
  } else {
    return <div>Unsupported file format</div>;
  }
};

export default SimpleDocViewer;