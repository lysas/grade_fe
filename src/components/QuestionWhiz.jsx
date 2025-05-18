import React, { useState } from "react";
import axios from "axios";
import { useRef } from "react";


import jsPDF from "jspdf";
import "./QuestionGen.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faDownload,
  faLink,
  faUpload,
  faTimes,

  faComment,
} from "@fortawesome/free-solid-svg-icons";



import pdf from "../assets/pdf.png";
import docx from "../assets/docx.png";
import image from "../assets/image.png";
import link from "../assets/link.png";
import Footer from "./Footer";

import FeedbackPopup from "./FeedbackPopup";
import { authService } from './Authentication/authService'; 
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";

const QuestionWhiz = () => {
  const [questionType, setQuestionType] = useState("MCQ");
  const [outputText, setOutputText] = useState("");
  const [additionalValues, setAdditionalValues] = useState("");
  const [topicValue, setTopicValue] = useState("");
  const [subtopicValue, setSubtopicValue] = useState("");
  const [exampleValue, setExampleValue] = useState("");
  const [provideAnswerValue, setProvideAnswerValue] = useState("Yes");
  const [formatValue, setFormatValue] = useState("Plain text");
  const [explanationValue, setExplanationValue] = useState("Not required");
  const [numberOfOptionsValue, setNumberOfOptionsValue] = useState("4");
  const [optionTypeValue, setOptionTypeValue] = useState("A, B,");
  const [numberOfMissingWordsValue, setNumberOfMissingWordsValue] =
    useState("1");
  const [representingWordsValue, setRepresentingWordsValue] =
    useState("underscore");
  const [numberOfItemsValue, setNumberOfItemsValue] = useState("4");
  const [numQuestionsValue, setNumQuestionsValue] = useState("1");
  const [bloomValue, setBloomValue] = useState("Not Specified");
  const [levelValue, setLevelValue] = useState("Easy");
  const [learningObj, setlearningObj] = useState("");
  //above......
  const [showContent, setShowContent] = useState(true); // Initially set to true to show the content
  const [showTopic, setShowTopic] = useState(false);
  const [activeButton, setActiveButton] = useState(1);
  const [showPdf, setShowpdf] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [showYouTubePopup, setShowYouTubePopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [comment, setComment] = useState("");
  const [showFeed, setShowFeed] = useState(false);
  //Options
  const [enterTheText, setEnterTheText] = useState("");
  const [similarQuestion, setSimilarQuestion] = useState("");
  const [conceptValue, setConceptValue] = useState(""); // Added state for Concept emphasis
  const [constraintsValue, setConstraintsValue] = useState(""); // Added state for Constraints
  const [keywordsValue, setKeywordsValue] = useState(""); // Added state for Keywords
  const [isLoading, setIsLoading] = useState(false);
  // const handleFileSelect = (e) => {
  //   const uploadedFiles = Array.from(e.target.files);
  //   setFiles([...files, ...uploadedFiles]);
  // };
  const handleFileSelect = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    
    // Filter only PDF files
    const pdfFiles = uploadedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      alert("Please upload only PDF files");
      return;
    }
    
    // Only keep the first PDF file (replace any existing)
    setFiles(pdfFiles.slice(0, 1));
  };
  // const handleUseUploadedPDF = async (filename) => {
  //   try {
  //     setIsLoading(true);
  //     const formData = new FormData();
      
  //     // Basic parameters
  //     formData.append("subject", topicValue || "General");
  //     formData.append("qp_pat", questionType);
  //     formData.append("topics", subtopicValue || topicValue || "General");
  //     formData.append("filename", filename);
      
  //     // Question Format parameters
  //     formData.append("num_questions", numQuestionsValue);
  //     formData.append("bloom_level", bloomValue);
  //     formData.append("difficulty", levelValue);
  //     formData.append("learning_obj", learningObj);
      
  //     // Conditional question parameters
  //     if (questionType === "MCQ") {
  //       formData.append("num_options", numberOfOptionsValue);
  //       formData.append("option_type", optionTypeValue);
  //     } else if (questionType === "Fill in the blanks") {
  //       formData.append("num_missing_words", numberOfMissingWordsValue);
  //       formData.append("missing_word_style", representingWordsValue);
  //     } else if (questionType === "Match the following") {
  //       formData.append("num_items", numberOfItemsValue);
  //     }
      
  //     // Answer Format parameters
  //     formData.append("provide_answer", provideAnswerValue);
  //     formData.append("explanation", explanationValue);
  //     formData.append("output_format", formatValue);
      
  //     const response = await axios.post("http://localhost:8001/query", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
      
  //     if (response.data.questions) {
  //       setOutputText(response.data.questions);
        
  //       // Handle different output formats
  //       if (response.data.format === "JSON") {
  //         // Parse and display JSON nicely
  //         setOutputText(JSON.stringify(JSON.parse(response.data.questions), null, 2));
  //       }
        
  //       // Download PDF if available
  //       // if (response.data.pdf_filename) {
  //       //   window.open(`http://localhost:8000/${response.data.pdf_filename}`, "_blank");
  //       // }
  //     }
  //   } catch (error) {
  //     console.error("Error using PDF for question generation:", error);
  //     alert(`Failed to generate questions: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleQuestionMarkClick = () => {
    alert("Open concept in model form!");
  };
  const handleFeedback = () => {
    setShowFeed(true);
  };

  const handleClosePopup = () => {
    setShowFeed(false);
  };

  // Handler for changing the question type
  const handleQuestionTypeChange = (event) => {
    setQuestionType(event.target.value);
  };
  const user = authService.getCurrentUser();
  const userEmail = user?.email ;

  

  // Handler for copying the generated prompt to the clipboard

  const outputRef = useRef(null);

  const handleCopyToClipboard = () => {
    if (outputRef.current) {
      outputRef.current.select();
      document.execCommand("copy");
      alert("Copied to clipboard!");
    }
  };

  const handleDownloadPDF = () => {
    const outputTextArea = document.getElementById("output");
    const text = outputTextArea.value;
    
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4"
    });
  
    // Set margins (left, top, right, bottom)
    const margins = {
      top: 20,
      bottom: 20,
      left: 15,
      right: 15
    };
  
    // Set font
    pdf.setFont("helvetica");
    pdf.setFontSize(12);
  
    // Split the text into lines that fit within the page width
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margins.left - margins.right;
    
    const lines = pdf.splitTextToSize(text, maxWidth);
  
    let y = margins.top;
    const lineHeight = 7; // Adjust line height as needed
  
    // Add each line to the PDF
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (y > pdf.internal.pageSize.getHeight() - margins.bottom) {
        pdf.addPage();
        y = margins.top;
      }
      
      pdf.text(lines[i], margins.left, y);
      y += lineHeight;
    }
  
    // Save the PDF
    pdf.save("generated_prompt.pdf");
    setShowPopup(false);
  };
  // Add this function to your component to handle file upload to the backend
  const handleUploadToBackend = async (file) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post("http://localhost:8001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("Upload response:", response.data);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload ${file.name}: ${error.message}`);
      setIsLoading(false);
      return null;
    }
  };
  const handleDownloadDOCX = () => {
    const outputText = document.getElementById("output").value;
  
    // Split text by lines and create paragraphs for each line
    const lines = outputText.split('\n').filter(line => line.trim() !== '');
  
    const doc = new Document({
      sections: [{
        properties: {},
        children: lines.map(line => 
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24, // 12pt font size
                font: "Arial"
              })
            ],
            spacing: { line: 276 } // Single line spacing
          })
        )
      }]
    });
  
    // Generate and download the DOCX file
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "generated_prompt.docx");
      setShowPopup(false);
    });
  };
  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log("Selected Emoji:", selectedEmoji);
    console.log("Comment:", comment);
    // Reset state
    setSelectedEmoji(null);
    setComment("");
  };

  const handleButtonClick = (buttonNumber) => {
    setActiveButton(buttonNumber);
    if (buttonNumber === 1) {
      setShowContent(true);
      setShowTopic(false);
      setShowpdf(false);
      setShowSimilar(false);
    } else if (buttonNumber === 3) {
      setShowpdf(true);
      setShowContent(false);
      setShowTopic(false);
      setShowSimilar(false);
    } else if (buttonNumber === 2) {
      setShowContent(false);
      setShowTopic(true);
      setShowpdf(false);
      setShowSimilar(false);
    } else {
      setShowSimilar(true);
      setShowContent(false);
      setShowTopic(false);
      setShowpdf(false);
    }
  };
  // const handleGenerate = async () => {
  //   setIsLoading(true);
  //   try {
      
  //     const params = {
  //       // question format
  //       questionType,
  //       numQuestionsValue,
  //       bloomValue,
  //       levelValue,
  //       numberOfOptionsValue,
  //       optionTypeValue,
  //       numberOfMissingWordsValue,
  //       representingWordsValue,
  //       numberOfItemsValue,
  //       learningObj,

  //       // output format
  //       provideAnswerValue,
  //       explanationValue,
  //       formatValue,

  //       //fields
  //       similarQuestion,
  //       enterTheText,
  //       topicValue,
  //       subtopicValue,
  //       exampleValue,
  //       conceptValue,
  //       constraintsValue,
  //       keywordsValue,
  //       //separator
  //       showContent,
  //       showSimilar,
  //       showTopic,
  //       email: userEmail,
  //     };
  //     // Construct the URL with the parameters
  //     const url = `http://localhost:8000/api/generateQuestion/?${Object.entries(
  //       params
  //     )
  //       .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  //       .join("&")}`;

  //     // Log the constructed URL for debugging
  //     console.log("Question generation API URL:", url);

  //     const response = await axios.get(url);

  //     // Log the response data for debugging
  //     console.log("Question generation API Response:", response.data);
  //     if (response.data.message) {
  //       const output = `${response.data.message}`;
  //       setOutputText(output);
  //     }

  //     const output = `${response.data.question}`;
  //     setOutputText(output);
  //   } catch (error) {
  //     // Handle errors appropriately
  //     console.error("Error in Question Generation:", error);

  //     if (error.response && error.response.status === 401) {
  //       console.error("Authentication required. Redirecting to /authenticate");
  //       window.location.href = "/authenticate";
  //     }
  //     else if (error.response.status === 402) {
  //       // Show alert dialog for payment required
  //       const goToProfile = confirm("You need to add your credits. Go to profile page?");
  //       if (goToProfile) {
  //         window.location.href = "/profile";
  //       }
  //       // If user clicks Cancel, they stay on the current page
  //     } 

  //     // You can add additional logic here, such as displaying an error message to the user
  //   }
  //   finally{
  //     setIsLoading(false);
  //   }
  // };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Check if we're in upload mode and have a PDF
      if (activeButton === 3 && files.length === 0) {
        alert("Please upload a PDF file first");
        return;
      }
  
      if (activeButton === 3) {
        // Upload mode logic
        const formData = new FormData();
        formData.append("file", files[0]);
  
        // Basic parameters
        formData.append("subject", topicValue || "General");
        formData.append("qp_pat", questionType);
        formData.append("topics", subtopicValue || topicValue || "General");
  
        // Question Format parameters
        formData.append("num_questions", numQuestionsValue);
        formData.append("bloom_level", bloomValue);
        formData.append("difficulty", levelValue);
        formData.append("learning_obj", learningObj);
  
        // Conditional question parameters
        if (questionType === "MCQ") {
          formData.append("num_options", numberOfOptionsValue);
          formData.append("option_type", optionTypeValue);
        } else if (questionType === "Fill in the blanks") {
          formData.append("num_missing_words", numberOfMissingWordsValue);
          formData.append("missing_word_style", representingWordsValue);
        } else if (questionType === "Match the following") {
          formData.append("num_items", numberOfItemsValue);
        }
  
        // Answer Format parameters
        formData.append("provide_answer", provideAnswerValue);
        formData.append("explanation", explanationValue);
        formData.append("output_format", formatValue);
  
        const response = await axios.post(
          "http://localhost:8001/query-with-pdf",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        if (response.data.questions) {
          setOutputText(response.data.questions);
        }
      } else {
        // Text-based generation
        const params = {
          questionType,
          numQuestionsValue,
          bloomValue,
          levelValue,
          numberOfOptionsValue,
          optionTypeValue,
          numberOfMissingWordsValue,
          representingWordsValue,
          numberOfItemsValue,
          learningObj,
          provideAnswerValue,
          explanationValue,
          formatValue,
          similarQuestion,
          enterTheText,
          topicValue,
          subtopicValue,
          exampleValue,
          conceptValue,
          constraintsValue,
          keywordsValue,
          showContent,
          showSimilar,
          showTopic,
          email: userEmail,
        };
  
        const url = `http://localhost:8000/api/generateQuestion/?${Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&")}`;
  
        console.log("Question generation API URL:", url);
  
        const response = await axios.get(url);
        console.log("Question generation API Response:", response.data);
  
        if (response.data.message) {
          setOutputText(response.data.message);
        } else if (response.data.question) {
          setOutputText(response.data.question);
        }
      }
    } catch (error) {
      console.error("Error in Question Generation:", error);
  
      if (error.response) {
        if (error.response.status === 401) {
          console.error("Authentication required. Redirecting to /authenticate");
          window.location.href = "/authenticate";
        } else if (error.response.status === 402) {
          const goToProfile = confirm("You need to add your credits. Go to profile page?");
          if (goToProfile) {
            window.location.href = "/profile";
          }
        }
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDownloadFile = (file) => {
    const blob = new Blob([file], { type: file.type });
    saveAs(blob, file.name);
  };
  const handleIconClick = (iconType) => {
    if (iconType === "upload") {
      fileInputRef.current.click();
    } else if (iconType === "link") {
      setShowUrlForm(true);
    }
  };

  const handleUrlFormSubmit = (e) => {
    e.preventDefault();
    if (urlValue.trim() !== "") {
      setFiles([...files, { name: urlValue, type: "url" }]);
      setUrlValue("");
      setShowUrlForm(false);
    }
  };
  const handleYouTubeIconClick = () => {
    window.open("https://www.youtube.com", "_blank");
  };

  const handleFileRemove = (indexToRemove) => {
    const updatedFiles = files.filter((file, index) => index !== indexToRemove);
    setFiles(updatedFiles);
  };
  const getFileIconClass = (file) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf")) {
      return <img src={pdf} className="photos" alt="" />;
    } else if (fileName.endsWith(".docx")) {
      return <img src={docx} className="photos" alt="" />;
    } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
      return <img src={image} className="photos" alt="" />;
    } else {
      return <img src={link} className="photos" alt="" />;
    }
  };
  const handleImageClick = (iconType) => {
    if (iconType === "copy") {
      handleCopyToClipboard();
    } else if (iconType === "download") {
      // Display options for PDF or DOCX download
      const downloadOption = window.confirm(
        "Choose the download format:\nPDF: Click OK\nDOCX: Click Cancel"
      );
      if (downloadOption) {
        // User selected PDF
        handleDownloadPDF();
      } else {
        // User selected DOCX
        handleDownloadDOCX();
      }
    }
  };

  return (
    <div className="first">
      <div className="con">
        <div className="head">
          <div className="header1">
            <button
              className={`but ${activeButton === 1 ? "active" : ""}`}
              onClick={() => handleButtonClick(1)}
              data-test-id="text-button"
            >
              Text
            </button>
            <button
              className={`but ${activeButton === 2 ? "active" : ""}`}
              onClick={() => handleButtonClick(2)}
              data-test-id="topic-button"
            >
              Topic
            </button>
            <button
              className={`but ${activeButton === 3 ? "active" : ""}`}
              onClick={() => handleButtonClick(3)}
              data-test-id="upload-button"
            >
              Upload
            </button>
            <button
              className={`but ${activeButton === 4 ? "active" : ""}`}
              onClick={() => handleButtonClick(4)}
              data-test-id="similar-button"
            >
              Similar
            </button>
          </div>
  
          <div className="con1">
            <div className="con11">
              {/* Upload Section */}
              <div style={{ display: showPdf ? "block" : "none" }}>
                <div className="upload-container">
                  <h3>Upload files</h3>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                      multiple
                      accept=".pdf, .docx"
                    />
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="upload-icon"
                      onClick={() => handleIconClick("upload")}
                    />
                    {/* <FontAwesomeIcon
                      icon={faLink}
                      className="upload-icon"
                      onClick={() => handleIconClick("link")}
                    /> */}
                  </div>
                  <p>
                    Currently the model supports only text. Creating questions
                    from images/video will be released soon
                  </p>
<div className="uploaded-files">
  <h2>Uploaded Files:</h2>
  <ul>
  {files.map((file, index) => (
  <li key={index}>
    <div className="file-container">
      {getFileIconClass(file)}
      {file.type === "url" ? (
        <a
          href={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className="file-name"
          data-test-id={`uploaded-url-${index}`}
        >
          {file.name}
        </a>
      ) : (
        <a
          href={URL.createObjectURL(file)}
          target="_blank"
          rel="noopener noreferrer"
          className="file-name"
          data-test-id={`uploaded-file-${index}`}
        >
          {file.name}
        </a>
      )}
      <FontAwesomeIcon
        icon={faTimes}
        className="remove-icon"
        onClick={() => handleFileRemove(index)}
        data-test-id={`remove-icon-${index}`}
      />
      {/* Add this button for PDF files
      {file.type === "application/pdf" && (
        <button 
          className="use-pdf-button"
          onClick={() => handleUseUploadedPDF(file.name)}
          style={{
            marginLeft: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
          data-test-id={`use-pdf-${index}`}
        >
          Use PDF
        </button>
      )} */}
    </div>
  </li>
))}
        
  </ul>
</div>
  
                  {showUrlForm && (
                    <div className="url-form-popup">
                      <form onSubmit={handleUrlFormSubmit}>
                        <input
                          type="text"
                          value={urlValue}
                          onChange={(e) => setUrlValue(e.target.value)}
                          placeholder="Enter URL"
                        />
                        <button type="submit">Submit</button>
                        <button
                          type="button"
                          onClick={() => setShowUrlForm(false)}
                          style={{
                            marginTop: "10px",
                            backgroundColor: "#ccc",
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Text Section */}
              <div style={{ display: showContent ? "block" : "none" }}>
              <div className="forrm-group-quiz">

                <label>Enter the Text</label>
                  <textarea
                    id="which-questions"
                    data-testid="which-questions"
                    placeholder="The questions generated will be based on the text you provide here"
                    value={enterTheText}
                    onChange={(e) => setEnterTheText(e.target.value)}
                    className="spec"
                  ></textarea>
                </div>
              </div>
  
              {/* Similar Questions Section */}
              <div style={{ display: showSimilar ? "block" : "none" }}>
              <div className="forrm-group-quiz">

              <label>Similar Questions</label>
                  <textarea
                    id="which-questions"
                    data-testid="which-questions"
                    placeholder={`A similar derivation of the question will be created. Eg:\n\nInput: find 2+3\n\nGenerated Question: find 8+6`}
                    value={similarQuestion}
                    onChange={(e) => setSimilarQuestion(e.target.value)}
                    className="spec"
                  ></textarea>
                </div>
              </div>
  
              {/* Topic Section */}
              <div style={{ display: showTopic ? "block" : "none" }}>
                <div className="question-type topicCon">
                  <div className="forrm-group-quiz">
                    <label>Topic</label>
                    <input
                      id="topic"
                      data-testid="topic"
                      placeholder="Enter the topic"
                      value={topicValue}
                      type="text"
                      onChange={(e) => setTopicValue(e.target.value)}
                    />
                  </div>
  
                  <div className="forrm-group-quiz">
                    <label>Sub topic</label>
                    <input
                      id="sub-topic"
                      data-testid="sub-topic"
                      placeholder="Enter the Sub topic"
                      value={subtopicValue}
                      type="text"
                      onChange={(e) => setSubtopicValue(e.target.value)}
                    />
                  </div>
  
                  <div className="forrm-group-quiz">
                    <label>Example</label>
                    <input
                      id="example-input"
                      data-testid="example-input"
                      placeholder="Enter the example"
                      type="text"
                      value={exampleValue}
                      onChange={(e) => setExampleValue(e.target.value)}
                    />
                  </div>
  
                  <div className="forrm-group-quiz">
                    <label>Concept emphasis</label>
                    <input
                      id="Concept-input"
                      data-testid="Concept-input"
                      type="text"
                      placeholder="Eg. Classes and objects"
                      value={conceptValue}
                      onChange={(e) => setConceptValue(e.target.value)}
                    />
                  </div>
  
                  <div className="forrm-group-quiz">
                    <label>Constraints</label>
                    <input
                      id="Constraints-input"
                      data-testid="Constraints-input"
                      type="text"
                      placeholder="Eg. Avoid questions related to variables"
                      value={constraintsValue}
                      onChange={(e) => setConstraintsValue(e.target.value)}
                    />
                  </div>
  
                  <div className="forrm-group-quiz">
                    <label>Keywords</label>
                    <input
                      id="Keywords-input"
                      data-testid="Keywords-input"
                      type="text"
                      placeholder="Eg. inheritance, polymorphism"
                      value={keywordsValue}
                      onChange={(e) => setKeywordsValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="con2">
          <div className="forrm-group-quiz">
            <label>Generated Question</label>
            <textarea
              ref={outputRef}
              id="output"
              data-testid="output"
              value={outputText}
              readOnly
            />
            <div className="copy-dow" data-testid="copy-download-section">
              <button
                className="icon-button"
                onClick={handleFeedback}
                data-testid="feedback-button"
              >
                <FontAwesomeIcon icon={faComment} />
              </button>
              {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
              <button
                className="icon-button"
                onClick={handleCopyToClipboard}
                data-testid="copy-button"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
              <button
                className="icon-button"
                onClick={() => setShowPopup(true)}
                data-testid="download-button"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
  
              {showPopup && (
                <div className="popup">
                  <button
                    onClick={handleDownloadPDF}
                    data-testid="download-pdf-button"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    data-testid="download-docx-button"
                  >
                    Download as DOCX
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    style={{ backgroundColor: "#ccc" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  
      <div className="con-qa">
        <h2>Question Format</h2>
        <div className="question-type1">
          <div className="forrm-group-quiz" id="question-type-container">
            <label>Type of question</label>
            <select
              id="question-type"
              onChange={handleQuestionTypeChange}
              value={questionType}
              data-testid="question-type"
            >
              <option value="MCQ">MCQ</option>
              <option value="Fill in the blanks">Fill in the blanks</option>
              <option value="Match the following">Match the following</option>
              <option value="True/False">True/False</option>
              <option>-----</option>
              <option value="Short-answer Questions">Short-answer Questions</option>
              <option value="Essay Questions">Essay Questions</option>
              <option value="Case Studies">Case Studies</option>
              <option value="Statement Problems">Statement Problems</option>
              <option value="Numerical Problems">Numerical Problems</option>
              <option value="Derivations">Derivations</option>
              <option value="Programming Exercise">Programming Exercise</option>
              <option value="Data Analysis and Interpretation">
                Data Analysis and Interpretation
              </option>
              <option>-----</option>
              <option value="Puzzles">Puzzles</option>
              <option value="Riddles">Riddles</option>
            </select>
          </div>
  
          <div className="forrm-group-quiz" id="num-questions-container">
            <label>Number of questions</label>
            <select
              id="num-questions"
              data-testid="num-questions"
              value={numQuestionsValue}
              onChange={(e) => setNumQuestionsValue(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
  
          <div className="forrm-group-quiz" id="bloom-container">
            <label>Bloom's Taxonomy Levels</label>
            <select
              id="bloom"
              data-testid="bloom"
              value={bloomValue}
              onChange={(e) => setBloomValue(e.target.value)}
            >
              <option>Not Specified</option>
              <option>Remember (lower order)</option>
              <option>Understand (lower order)</option>
              <option>Apply (higher order)</option>
              <option>Analyze (higher order)</option>
              <option>Evaluate (higher order)</option>
              <option>Create (higher order)</option>
            </select>
          </div>
  
          <div className="forrm-group-quiz" id="level-container">
            <label>Level of Difficulty</label>
            <select
              id="level"
              data-testid="level"
              value={levelValue}
              onChange={(e) => setLevelValue(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
  
          {questionType === "MCQ" && (
            <>
              <div className="forrm-group-quiz">
                <label>Number of options</label>
                <select
                  id="number-option"
                  data-testid="number-option"
                  value={numberOfOptionsValue}
                  onChange={(e) => setNumberOfOptionsValue(e.target.value)}
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
  
              <div className="forrm-group-quiz">
                <label>Option type</label>
                <select
                  id="option-type"
                  data-testid="option-type"
                  value={optionTypeValue}
                  onChange={(e) => setOptionTypeValue(e.target.value)}
                >
                  <option>A, B,</option>
                  <option>a, b, </option>
                  <option>1, 2</option>
                  <option>I, ii,</option>
                </select>
              </div>
            </>
          )}
  
          {questionType === "Fill in the blanks" && (
            <>
              <div className="forrm-group-quiz">
                <label>Number of missing words</label>
                <select
                  id="missing-words"
                  data-testid="missing-words"
                  value={numberOfMissingWordsValue}
                  onChange={(e) => setNumberOfMissingWordsValue(e.target.value)}
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
  
              <div className="forrm-group-quiz">
                <label>Representing missing words</label>
                <select
                  id="representing-words"
                  data-testid="representing-words"
                  value={representingWordsValue}
                  onChange={(e) => setRepresentingWordsValue(e.target.value)}
                >
                  <option>underscore</option>
                  <option>brackets</option>
                </select>
              </div>
            </>
          )}
  
          {questionType === "Match the following" && (
            <div className="forrm-group-quiz">
              <label>Number of items</label>
              <select
                id="number-items"
                data-testid="number-items"
                value={numberOfItemsValue}
                onChange={(e) => setNumberOfItemsValue(e.target.value)}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          )}
  
          <div className="forrm-group-quiz">
            <label>Learning Objective</label>
            <input
              type="text"
              placeholder="objective"
              value={learningObj}
              onChange={(e) => setlearningObj(e.target.value)}
            />
          </div>
        </div>
  
        <h2>Answer Format</h2>
        <div className="question-type1">
          <div className="forrm-group-quiz" id="answer-container">
            <label>Provide Answer</label>
            <select
              id="answer"
              data-testid="answer"
              value={provideAnswerValue}
              onChange={(e) => setProvideAnswerValue(e.target.value)}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
  
          <div className="forrm-group-quiz" id="explanation-container">
            <label>Explanation</label>
            <select
              id="explanation"
              data-testid="explanation"
              value={explanationValue}
              onChange={(e) => setExplanationValue(e.target.value)}
            >
              <option>Not required</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={`${num} sentences`}>
                  {num} {num === 1 ? 'sentence' : 'sentences'}
                </option>
              ))}
            </select>
          </div>
  
          <div className="forrm-group-quiz" id="format-container">
            <label>Result Format</label>
            <select
              id="format"
              data-testid="format"
              value={formatValue}
              onChange={(e) => setFormatValue(e.target.value)}
            >
              <option>Plain text</option>
              <option>JSON</option>
              <option>Markdown</option>
              <option>HTML</option>
              <option>CSV</option>
              <option>List</option>
              <option>Dictionary</option>
              <option>XML</option>
            </select>
          </div>
        </div>
  
        <div className="generate-button-container">
          <button className="btn-final" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionWhiz;
