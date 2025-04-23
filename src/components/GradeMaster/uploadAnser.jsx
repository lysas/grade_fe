import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import SimpleDocViewer from './SimpleDocViewer'; // Import the new component
import './UploadAnswer.css';

const UploadAnswer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionPaper, userEmail } = location.state || {};
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correction, setCorrection] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the question paper URL and file extension
  const questionPaperUrl = questionPaper?.file 
    ? `http://127.0.0.1:8000/media/question_papers/${questionPaper.file.split('/').pop()}`
    : '';
  const fileExtension = questionPaperUrl.split('.').pop().toLowerCase();

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0]);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      handleFileSelection(event.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    // Reset message
    setMessage('');
    
    // Check file type
    const fileType = selectedFile.type;
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(fileType)) {
      setMessage('Please upload a PDF or DOCX file only');
      setMessageType('error');
      return;
    }
    
    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setMessage('File size should be less than 10MB');
      setMessageType('error');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview URL for the file
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    
    setMessage(`File "${selectedFile.name}" selected successfully`);
    setMessageType('success');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('qid', questionPaper.id);
    formData.append('file', file);
    formData.append('feedback', feedback);
    formData.append('correction', correction);
    formData.append('email', userEmail);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/grade/upload-answer/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      console.log('Upload successful:', response.data);
      setMessage('Answer uploaded successfully!');
      setMessageType('success');
      alert('Answer uploaded successfully!');
      
      // Reset form
      setFile(null);
      setFeedback('');
      setCorrection('');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/grade-master/student');
      }, 1000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error uploading answer. Please try again.';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Error uploading answer:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/grade-master/student');
  };

  // Get uploaded file extension
  const uploadedFileExtension = file ? file.name.split('.').pop().toLowerCase() : '';

  return (
    <div className="upload-answer-page">
      <h2>Upload Answer for {questionPaper?.title || 'Question Paper'}</h2>
      <div className="back-button-container">
        <button className="back-button-cor" onClick={handleBack}>
          Back to Student
        </button>
      </div>

      <div className="content-container">
        <div className="left-panel">
          <h3>Question Paper Details</h3>
          <div className="question-paper upload-container-up">
            {questionPaper ? (
              <>
                <p>
                  <strong>Title:</strong> {questionPaper.title}
                </p>
                <p>
                  <strong>Total Marks:</strong> {questionPaper.total_marks}
                </p>
                <p>
                  <strong>Upload Date:</strong> {questionPaper.upload_date}
                </p>

                <button 
                  className="view-button" 
                  onClick={() => window.open(questionPaperUrl, '_blank')}
                >
                  View Full Question Paper
                </button>

                <div className="doc-viewer-container">
                  {questionPaperUrl ? (
                    <SimpleDocViewer 
                      fileUrl={questionPaperUrl} 
                      fileType={fileExtension}
                    />
                  ) : (
                    <p>No question paper available for preview</p>
                  )}
                </div>
              </>
            ) : (
              <p className="no-data">Question paper information not available</p>
            )}
          </div>
        </div>

        <div className="right-panel">
          <h3>Upload Your Answer</h3>
          <div
            className={`upload-container-up ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone">
              {file ? (
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button 
                    className="remove-file" 
                    onClick={() => {
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl('');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p>Drag & drop your PDF or DOCX answer file here</p>
                  <p>or</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="file-input-label">
                    Choose File
                  </label>
                  <p className="file-note">Supported formats: PDF, DOCX (Max 10MB)</p>
                </>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="uploaded-file-preview">
              <h4>Your Answer Preview:</h4>
              <div className="preview-container">
                <SimpleDocViewer 
                  fileUrl={previewUrl}
                  fileType={uploadedFileExtension}
                />
              </div>
            </div>
          )}

          <div className="feedback-section">
            <div className="form-group">
              <label htmlFor="feedback">Feedback (Optional):</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any additional feedback for the evaluator..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="correction">Correction Notes (Optional):</label>
              <textarea
                id="correction"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="Any correction notes you'd like to include..."
              />
            </div>
          </div>

          <div className="submit-section">
            <button 
              className="answer-upload-btn" 
              onClick={handleSubmit} 
              disabled={!file || loading} 
            >
              {loading ? 'Uploading...' : 'Submit Answer'}
            </button>
            {message && (
              <p className={`upload-message ${messageType}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAnswer;