import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './UploadAnswer.css';
import { useNotifications } from '../../contexts/NotificationContext';

const UploadAnswer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionPaper, questionPaperType, userEmail, userId, showResult, jsonData: initialJsonData, answerId } = location.state || {};
  
  // Debug logging
  console.log('UploadAnswer component mounted');
  console.log('Location state:', location.state);
  console.log('Question paper:', questionPaper);
  console.log('Question paper type:', questionPaperType);
  console.log('User email:', userEmail);
  console.log('User ID:', userId);
  console.log('Answer ID:', answerId);

  // Set answerUploadId if coming from notification
  useEffect(() => {
    if (showResult && answerId) {
      setAnswerUploadId(answerId);
    }
  }, [showResult, answerId]);

  // Check if required data is missing
  useEffect(() => {
    if (!showResult && (!questionPaper || !questionPaperType || !userId)) {
      console.error('Missing required data:', {
        hasQuestionPaper: !!questionPaper,
        hasQuestionPaperType: !!questionPaperType,
        hasUserId: !!userId
      });
      navigate('/grade-master/student');
    }
  }, [questionPaper, questionPaperType, userId, navigate, showResult]);

  // State variables
  const [files, setFiles] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showJson, setShowJson] = useState(true);
  const [editedContent, setEditedContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Upload result states
  const [uploadResult, setUploadResult] = useState(null);
  const [answerUploadId, setAnswerUploadId] = useState(null);

  // Grading states
  const [gradingResult, setGradingResult] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingError, setGradingError] = useState('');
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [backgroundTasks, setBackgroundTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize jsonData with initialJsonData if available
  useEffect(() => {
    if (initialJsonData) {
      setJsonData(initialJsonData);
      setEditedContent(initialJsonData);
    }
  }, [initialJsonData]);

  // API endpoints - Updated for Django backend
  const API_BASE_URL = 'http://localhost:8000/api/grade';
  const uploadEndpoint = `${API_BASE_URL}/upload-answer/`;
  const getOcrDataEndpoint = `${API_BASE_URL}/answer-ocr-data/`;
  const updateOcrDataEndpoint = `${API_BASE_URL}/answer-ocr-data/`;
  const gradeAnswerEndpoint = `${API_BASE_URL}/grade-answer/`;
  const getGradingResultEndpoint = `${API_BASE_URL}/grading-result/`;

  // Get question paper URL
  const getQuestionPaperUrl = () => {
    if (!questionPaper?.file) return '';
    
    const fileName = questionPaper.file.split('/').pop();
    let folder = '';
    
    switch(questionPaperType) {
      case 'previous_year':
        folder = 'previous_year/';
        break;
      case 'generated':
        folder = 'generated/';
        break;
      case 'sample':
      default:
        folder = 'sample/';
        break;
    }
    
    return `http://127.0.0.1:8000/media/question_papers/${folder}${fileName}`;
  };

  const questionPaperUrl = getQuestionPaperUrl();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      [...previewUrls, ...photoPreviewUrls].forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls, photoPreviewUrls]);

  // Load OCR data after successful upload
  const loadOcrData = async (answerId) => {
    try {
      const response = await axios.get(`${getOcrDataEndpoint}${answerId}/`);
      const data = response.data;
      
      if (data.ocr_processed) {
        setJsonData(data.json_data);
        setEditedContent(data.json_data); // Initialize edited content
        
        // If there are images in the OCR data, construct the image URL
        if (data.images_dir && data.json_data) {
          // Look for diagram references in the JSON data
          const jsonStr = JSON.stringify(data.json_data);
          const diagramMatch = jsonStr.match(/"diagram":\s*{[^}]*"([^"]+)"/);
          if (diagramMatch && diagramMatch[1]) {
            const imagePath = diagramMatch[1];
            setImageUrl(`http://localhost:8000/media/${imagePath}`);
          }
        }
        
        setMessage('Answer processed successfully!');
        setMessageType('success');
      } else if (data.error) {
        setMessage(`OCR processing failed: ${data.error}`);
        setMessageType('error');
      } else {
        setMessage('Answer uploaded but OCR processing is still in progress...');
        setMessageType('info');
        // Retry after a delay if not processed yet
        setTimeout(() => loadOcrData(answerId), 5000);
      }
    } catch (error) {
      console.error('Error loading OCR data:', error);
      setMessage('Error loading processed answer data');
      setMessageType('error');
    }
  };

  // Handle grading
  const handleGrading = async () => {
    setIsGrading(true);
    setGradingError('');
    setMessage('Starting grading process...');
    setMessageType('info');

    try {
      const response = await axios.post(`${gradeAnswerEndpoint}${answerUploadId}/`);
      const result = response.data;
      
      if (result.graded) {
        // Debug: Log the result before navigation
        console.log('Navigating to grading result with:', {
          resultData: result.result_data,
          gradingId: result.grading_id,
          answerId: answerUploadId,
          questionPaper,
          questionPaperType
        });
        
        // Navigate to the grading result page after successful grading
        navigate('/grade-master/grading-result', {
          state: {
            resultData: result.result_data,
            gradingId: result.grading_id,
            answerId: answerUploadId,
            questionPaper: questionPaper,
            questionPaperType: questionPaperType
          }
        });
      } else {
        // If grading is not complete yet, show a message and check status
        setMessage('Grading process started. Please wait...');
        setMessageType('info');
        setShowGradingForm(false);
        
        // Poll for grading result
        const checkGradingStatus = async () => {
          try {
            const statusResponse = await axios.get(`${getGradingResultEndpoint}${answerUploadId}/`);
            const statusData = statusResponse.data;
            
            if (statusData.graded) {
              // Debug: Log the result before navigation
              console.log('Navigating to grading result with:', {
                resultData: statusData.result_data,
                gradingId: statusData.grading_id,
                answerId: answerUploadId,
                questionPaper,
                questionPaperType
              });
              
              // Navigate to the grading result page
              navigate('/grade-master/grading-result', {
                state: {
                  resultData: statusData.result_data,
                  gradingId: statusData.grading_id,
                  answerId: answerUploadId,
                  questionPaper: questionPaper,
                  questionPaperType: questionPaperType
                }
              });
            } else if (statusData.error) {
              setMessage(`Grading error: ${statusData.error}`);
              setMessageType('error');
            } else {
              // If still processing, check again after a delay
              setTimeout(checkGradingStatus, 5000);
            }
          } catch (error) {
            console.error('Error checking grading status:', error);
            setMessage('Error checking grading status');
            setMessageType('error');
          }
        };
        
        // Start checking grading status
        checkGradingStatus();
      }
    } catch (error) {
      console.error('Grading error:', error);
      const errorMsg = error.response?.data?.error || 'Error during grading process';
      setGradingError(errorMsg);
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setIsGrading(false);
    }
  };

  // File handling functions
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      handleFileSelection(Array.from(event.target.files));
    }
  };

  const handlePhotoChange = (event) => {
    if (event.target.files.length > 0) {
      const photoFiles = Array.from(event.target.files);
      handlePhotoSelection(photoFiles);
    }
  };

  const handleFileSelection = (selectedFiles) => {
    setMessage('');
    
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type;
      const isValidType = fileType === 'application/pdf';
      const maxSize = 10 * 1024 * 1024; // 10MB
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        setMessage('Only PDF files are allowed');
        setMessageType('error');
        return false;
      }
      
      if (!isValidSize) {
        setMessage('File size should be less than 10MB');
        setMessageType('error');
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      setMessage(`${validFiles.length} PDF file(s) selected successfully`);
      setMessageType('success');
    }
  };

  const handlePhotoSelection = (selectedPhotos) => {
    setMessage('');
    
    const validPhotos = selectedPhotos.filter(photo => {
      const fileType = photo.type;
      const isValidType = fileType.startsWith('image/');
      const maxSize = 5 * 1024 * 1024; // 5MB
      const isValidSize = photo.size <= maxSize;
      
      if (!isValidType) {
        setMessage('Only image files are allowed for photos');
        setMessageType('error');
        return false;
      }
      
      if (!isValidSize) {
        setMessage('Photo size should be less than 5MB');
        setMessageType('error');
        return false;
      }
      
      return true;
    });

    if (validPhotos.length > 0) {
      setPhotos(prevPhotos => [...prevPhotos, ...validPhotos]);
      const newPhotoPreviewUrls = validPhotos.map(photo => URL.createObjectURL(photo));
      setPhotoPreviewUrls(prev => [...prev, ...newPhotoPreviewUrls]);
      setMessage(`${validPhotos.length} photo(s) selected successfully`);
      setMessageType('success');
    }
  };

  const removeFile = (index) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const removePhoto = (index) => {
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      newPhotos.splice(index, 1);
      return newPhotos;
    });
    
    setPhotoPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  // Submit handler
  const { addNotification } = useNotifications();
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0 && photos.length === 0) {
      setMessage('Please select at least one file or photo to upload');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    const fileToUpload = files.length > 0 ? files[0] : photos[0];
    formData.append('file', fileToUpload);
    formData.append('user_id', userId);
    formData.append('question_paper_type', questionPaperType);
    formData.append('question_paper_id', questionPaper.id);

    // Add organization ID if this is an organization test
    if (questionPaperType === 'organization' && location.state?.organizationId) {
      formData.append('organization_id', location.state.organizationId);
    }

    try {
      const response = await axios.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const result = response.data;
      setUploadResult(result);
      setAnswerUploadId(result.id);

      if (result.processing_started) {
        // Add initial notification
        addNotification({
          type: 'info',
          message: 'Answer uploaded successfully! Text extraction is processing in the background.',
          answerId: result.id
        });
        
        // Add to background tasks
        const newTask = {
          id: result.id,
          taskId: result.task_id,
          fileName: fileToUpload.name,
          status: 'processing',
          startTime: new Date()
        };
        
        setBackgroundTasks(prev => [...prev, newTask]);
        
        // Start monitoring this task
        monitorTask(result.id);
        
        // Allow user to continue - don't block UI
        setFiles([]);
        setPhotos([]);
        setPreviewUrls([]);
        setPhotoPreviewUrls([]);
        
        setMessage('Answer uploaded successfully! You can continue working while we process your answer.');
        setMessageType('success');
      }

    } catch (error) {
      console.error('Error uploading answer:', error);
      setMessage(error.response?.data?.message || 'Error uploading answer');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Monitor task progress
  const monitorTask = async (answerId) => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/check-status/${answerId}/`);
        const status = response.data;
        
        if (status.processing_complete) {
          // Update background tasks
          setBackgroundTasks(prev => 
            prev.map(task => 
              task.id === answerId 
                ? { ...task, status: status.ocr_processed ? 'completed' : 'failed', error: status.error }
                : task
            )
          );
          
          // Show notification
          addNotification({
            type: status.ocr_processed ? 'success' : 'error',
            message: status.ocr_processed 
              ? 'Text extraction completed successfully!' 
              : `Text extraction failed: ${status.error}`,
            answerId: answerId
          });
          
          // If this is the current answer, load the data
          if (answerId === answerUploadId) {
            loadOcrData(answerId);
          }
          
          return; // Stop polling
        }
        
        // Continue polling if not complete
        setTimeout(checkStatus, 3000);
        
      } catch (error) {
        console.error('Error checking status:', error);
        // Stop polling on error
      }
    };
    
    checkStatus();
  };

  // Format JSON data for display
  const formatJsonToComponents = (jsonData) => {
    if (!jsonData) return null;

    try {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      const handleTextChange = (questionKey, field, value, index = null) => {
        setEditedContent(prev => {
          const newContent = { ...prev };
          if (index !== null) {
            if (field === 'tables') {
              newContent[questionKey].tables[index] = value;
            } else if (field === 'equations') {
              newContent[questionKey].equations[index] = value;
            }
          } else {
            newContent[questionKey] = {
              ...newContent[questionKey],
              [field]: value
            };
          }
          return newContent;
        });
      };

      const handleTableChange = (questionKey, tableIndex, rowIndex, colIndex, value) => {
        setEditedContent(prev => {
          const newContent = { ...prev };
          const table = newContent[questionKey].tables[tableIndex];
          table.rows[rowIndex][table.heading[colIndex]] = value;
          return newContent;
        });
      };

      const handleEquationChange = (questionKey, equationIndex, field, value) => {
        setEditedContent(prev => {
          const newContent = { ...prev };
          newContent[questionKey].equations[equationIndex][field] = value;
          return newContent;
        });
      };

      const contentToDisplay = isEditing ? editedContent : parsedData;

      return (
        <div className="json-content">
          {Object.entries(contentToDisplay).map(([questionKey, content]) => (
            <div key={questionKey} className="question-section">
              <h4 className="question-title">{questionKey}</h4>
              <div className="question-content">
                {content.text && (
                  <div className="text-content">
                    {isEditing ? (
                      <textarea
                        value={content.text}
                        onChange={(e) => handleTextChange(questionKey, 'text', e.target.value)}
                        className="editable-text"
                        rows={Math.max(3, content.text.split('\n').length)}
                      />
                    ) : (
                      content.text.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))
                    )}
                  </div>
                )}
                {content.tables && content.tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="table-container">
                    {isEditing ? (
                      <div className="editable-table">
                        <div className="table-header">
                          {table.heading.map((header, headerIndex) => (
                            <input
                              key={headerIndex}
                              type="text"
                              value={header}
                              onChange={(e) => {
                                const newTable = { ...table };
                                newTable.heading[headerIndex] = e.target.value;
                                handleTextChange(questionKey, 'tables', newTable, tableIndex);
                              }}
                              className="editable-cell header-cell"
                            />
                          ))}
                        </div>
                        <div className="table-body">
                          {table.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="table-row">
                              {table.heading.map((header, colIndex) => (
                                <input
                                  key={colIndex}
                                  type="text"
                                  value={row[header]}
                                  onChange={(e) => handleTableChange(questionKey, tableIndex, rowIndex, colIndex, e.target.value)}
                                  className="editable-cell"
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <table className="content-table">
                        <thead>
                          <tr>
                            {table.heading.map((header, i) => (
                              <th key={i}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {table.heading.map((header, colIndex) => (
                                <td key={colIndex}>{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
                {content.equations && (
                  <div className="equations-container">
                    {content.equations.map((eq, eqIndex) => (
                      <div key={eqIndex} className="equation-step">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              value={eq.step}
                              onChange={(e) => handleEquationChange(questionKey, eqIndex, 'step', parseInt(e.target.value))}
                              className="editable-equation-step"
                            />
                            <input
                              type="text"
                              value={eq.equation}
                              onChange={(e) => handleEquationChange(questionKey, eqIndex, 'equation', e.target.value)}
                              className="editable-equation"
                            />
                          </>
                        ) : (
                          <>
                            <span className="step-number">Step {eq.step}:</span>
                            <span className="equation">{eq.equation}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {content.diagram && (
                  <div className="diagram-container">
                    {Object.entries(content.diagram).map(([key, imagePath]) => {
                      let cleanImagePath = imagePath;
                      if (typeof imagePath === 'string') {
                        // Clean up the image path
                        const mediaPathMatch = imagePath.match(/media\/output\/[^\\]+\/images\/[^\\]+$/);
                        if (mediaPathMatch) {
                          cleanImagePath = `http://localhost:8000/${mediaPathMatch[0]}`;
                        } else if (!imagePath.startsWith('http')) {
                          cleanImagePath = `http://localhost:8000/media/${imagePath}`;
                        }
                      }
                      
                      return (
                        <div key={key} className="diagram-wrapper">
                          <img 
                            src={cleanImagePath}
                            alt="Diagram"
                            className="content-diagram"
                            onError={(e) => {
                              console.error('Image failed to load:', cleanImagePath);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return <p>Error displaying content</p>;
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isEditing && jsonData) {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      setEditedContent(parsedData);
    }
    setIsEditing(!isEditing);
  };

  // Handle cancel edit
  const handleCancel = () => {
    if (jsonData) {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      setEditedContent(parsedData);
    }
    setIsEditing(false);
  };

  // Handle save changes
  const handleSave = async () => {
    if (editedContent && answerUploadId) {
      setIsSaving(true);
      try {
        const response = await axios.put(`${updateOcrDataEndpoint}${answerUploadId}/update/`, {
          json_data: editedContent
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.status === 200) {
          setJsonData(editedContent);
          setIsEditing(false);
          setMessage('Content updated and saved successfully!');
          setMessageType('success');
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        const errorMsg = error.response?.data?.error || 'Error saving changes';
        setMessage(errorMsg);
        setMessageType('error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Add notification component
  const NotificationCenter = () => (
    <div className={`notification-center ${showNotifications ? 'show' : ''}`}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={() => setShowNotifications(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${notification.type}`}>
              <div className="notification-content">
                <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                <span>{notification.message}</span>
              </div>
              <div className="notification-time">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </div>
              {notification.answerId && (
                <button 
                  className="view-result-button"
                  onClick={() => {
                    loadOcrData(notification.answerId);
                    setAnswerUploadId(notification.answerId);
                    setShowNotifications(false);
                  }}
                >
                  View Result
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Add notification bell component
  const NotificationBell = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
      <div className="notification-bell" onClick={() => setShowNotifications(true)}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
    );
  };

  return (
    <div className="upload-answer-page">
      <div className="upload-header">
        <h2>Upload Answer</h2>
        <NotificationBell />
      </div>

      <div className="content-container">
        <div className="leftpanel">
          <div className="left-panel-container">
            <div className="question-paper-info">
              <h3>Question Paper Details</h3>
              {questionPaper ? (
                <>
                  <div className="info-card">
                    <div className="info-header">
                      <h4>{questionPaper.title}</h4>
                      <span className="subject-badge">{questionPaper.subject}</span>
                    </div>
                    <div className="info-details">
                      <div className="info-item">
                        <span className="label">Total Marks:</span>
                        <span className="value">{questionPaper.total_marks}</span>
                      </div>
                      {questionPaperType === 'previous_year' && questionPaper.year && (
                        <div className="info-item">
                          <span className="label">Year:</span>
                          <span className="value">{questionPaper.year}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Upload Date:</span>
                        <span className="value">{questionPaper.upload_date}</span>
                      </div>
                    </div>
                    <button 
                      className="view-button" 
                      onClick={() => window.open(questionPaperUrl, '_blank')}
                    >
                      <i className="fas fa-eye"></i> View Question Paper
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">Question paper information not available</p>
              )}
            </div>
          </div>
        </div>

        <div className="rightpanel">
          <div className="upload-area">
            <div className="upload-header">
              <h3>Your Answer</h3>
              <p className="upload-subtitle">Upload your answer files and photos</p>
            </div>

            {/* Upload Buttons */}
            <div className="upload-buttons-container">
              <div className="upload-buttons">
                <label className="upload-button primary">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    multiple
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  <i className="fas fa-file-pdf"></i> Upload PDF
                </label>
                <label className="upload-button secondary">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    multiple
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  <i className="fas fa-image"></i> Upload Photos
                </label>
              </div>
              <p className="upload-note">
                PDF files (max 10MB each) and images (max 5MB each)
              </p>
            </div>

            {/* Selected Files Section */}
            {(files.length > 0 || photos.length > 0) && (
              <div className="selected-files">
                {files.length > 0 && (
                  <div className="files-section">
                    <h4>PDF Files ({files.length})</h4>
                    <div className="files-grid">
                      {files.map((file, index) => (
                        <div key={index} className="file-card">
                          <div className="file-icon">
                            <i className="fas fa-file-pdf"></i>
                          </div>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                          <button 
                            className="remove-button"
                            onClick={() => removeFile(index)}
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="photos-section">
                    <h4>Photos ({photos.length})</h4>
                    <div className="photos-grid">
                      {photos.map((photo, index) => (
                        <div key={index} className="photo-card">
                          <img src={photoPreviewUrls[index]} alt={`Photo ${index + 1}`} />
                          <button 
                            className="remove-button"
                            onClick={() => removePhoto(index)}
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Section */}
            <div className="submit-section">
              <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={(files.length === 0 && photos.length === 0) || loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Text extraction...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Submit Answer
                  </>
                )}
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

      {/* Output Display Section */}
      {(jsonData || imageUrl) && (
        <div className="bottom-container">
          <div className="output-display-section">
            <div className="output-header">
              <h3>Processed Answer Results</h3>
              <div className="toggle-container">
                {/* <button 
                  className={`toggle-button ${showJson ? 'active' : ''}`}
                  onClick={() => setShowJson(true)}
                >
                  Content
                </button> */}
                {/* <button 
                  className={`toggle-button ${!showJson ? 'active' : ''}`}
                  onClick={() => setShowJson(false)}
                  disabled={!imageUrl}
                >
                  Image
                </button> */}
                {showJson && (
                  <>
                    {!isEditing ? (
                      <button 
                        className="edit-button"
                        onClick={handleEditToggle}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                    ) : (
                      <>
                        <button 
                          className="save-button"
                          onClick={() => {
                            if (editedContent && answerUploadId) {
                              setIsSaving(true);
                              axios.put(`${updateOcrDataEndpoint}${answerUploadId}/update/`, {
                                json_data: editedContent
                              }, {
                                headers: {
                                  'Content-Type': 'application/json',
                                }
                              })
                              .then(response => {
                                if (response.status === 200) {
                                  setJsonData(editedContent);
                                  setIsEditing(false);
                                  setMessage('Content updated and saved successfully!');
                                  setMessageType('success');
                                }
                              })
                              .catch(error => {
                                console.error('Error saving changes:', error);
                                const errorMsg = error.response?.data?.error || 'Error saving changes';
                                setMessage(errorMsg);
                                setMessageType('error');
                              })
                              .finally(() => setIsSaving(false));
                            }
                          }}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i> Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save"></i> Save
                            </>
                          )}
                        </button>
                        <button 
                          className="cancel-button"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="output-content">
              {showJson ? (
                <div className="content-display">
                  {jsonData ? formatJsonToComponents(jsonData) : <p>Loading content...</p>}
                </div>
              ) : (
                <>
                  <div className="image-question-number" style={{
                    backgroundColor: '#e8f0fe',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    display: 'inline-block',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    Question 4
                  </div>
                  <div className="image-display">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt="Processed Diagram" 
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    ) : (
                      <p>No diagram available</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Grading Section */}
            {answerUploadId && jsonData && !isEditing && (
              <div className="grading-section">
                <div className="grading-header">
                  {gradingResult ? (
                    <div className="grading-result-summary">
                      <div className="score-display">
                        <span className="score-value">
                          {gradingResult.total_score}/{gradingResult.max_possible_score}
                        </span>
                        <span className="score-percentage">
                          ({gradingResult.percentage}%)
                        </span>
                      </div>
                      <div className="grading-details">
                        <span>Questions: {gradingResult.questions_count}</span>
                        {gradingResult.diagrams_count > 0 && (
                          <span>Diagrams: {gradingResult.diagrams_count}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      className="grade-button"
                      onClick={handleGrading}
                      disabled={isGrading}
                    >
                      {isGrading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Grading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle"></i> Grade Answer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add NotificationCenter component */}
      <NotificationCenter />
    </div>
  );
};

export default UploadAnswer;


