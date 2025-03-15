// import React, { useState,useContext } from 'react';
// // import axios from "../config/axios";
// import axios from "axios";
// import { RiFileCopy2Line } from "react-icons/ri";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import FeedbackPopup from "./FeedbackPopup";
// import {
//   faComment
// } from "@fortawesome/free-solid-svg-icons";
// import { AppContext } from './AppContext';
// import './TranslationPage.css';

// const transliterationText = (text, sourceLanguage, destinationLanguage) => {
//   // Placeholder, actual translation logic will be implemented here
//   return text;
// };

// const TransliterationPage = () => {
//   const [transliteratedText, setTransliteratedText] = useState('');
//   const [inputText, setInputText] = useState('');
//   const [sourceLanguage, setSourceLanguage] = useState('English');
//   const [destinationLanguage, setDestinationLanguage] = useState('Tamil');
//   const [showFeed, setShowFeed] = useState(false);
//   const { model, temperature, maxOutput, TopK } = useContext(AppContext);

//   const handleFeedback = () => {
//     setShowFeed(true);
//   };

//   const handleClosePopup = () => {
//     setShowFeed(false);
//   };

//   const handleTransliterate = async () => {
//     try {
//       const params = {
//         inputText,
//         sourceLanguage,
//         destinationLanguage,
//         model,
//         temperature,maxOutput,
//         TopK
//       };

//       const url = `http://localhost:8000/api/transliterate/?${Object.entries(params)
//         .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//         .join('&')}`;
//       console.log('Transliteration API URL:', url);

//       const response = await axios.get(url);
//       console.log('Translation API Response:', response.data);

//      const result = transliterationText(
//         inputText,
//         sourceLanguage,
//         destinationLanguage,

//       );

//       if (response.data.message){
//         const output = `${response.data.message}`;
//         setTransliteratedText(output);
//       }

//       const output = `${response.data.transliteration}`;
//       setTransliteratedText(output);

//     } catch (error) {
//       console.error('Error in transliteration:', error);
//       if (error.response && error.response.status === 401) {
//         console.error('Authentication required. Redirecting to /authenticate');
//         window.location.href = "/authenticate";
//       }
//       if (error.response && error.response.status === 402) {
//         console.error('Authentication required. Redirecting to /authenticate');
//         window.location.href = "/upgrade";
//       }
//     }
//   };

//   const handleCopyToClipboard = () => {
//     const outputTextarea = document.getElementById('output');
//     outputTextarea.select();
//     document.execCommand('copy');
//   };

//   return (
//     <div>
//       <h1 style={{ fontSize: "22px", marginTop: '-15px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '10px', height: '30px' }}>Transliteration!</h1>

//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div className="form-group" style={{ width: '300px', paddingTop: '30px' }}>
//           <label style={{ marginTop: '50px', marginLeft: '20px' }}>
//             Source Language
//           </label>
//           <select
//             id="source"
//             data-testid="source"
//             value={sourceLanguage}
//             onChange={(e) => setSourceLanguage(e.target.value)}
//             style={{
//               height: '40px',
//               width: '85%',
//               backgroundColor: '#FAFAFA',
//               marginTop: '10px',
//               border: '1px solid #ccc',
//               marginLeft: '20px',
//             }}
//           >
//             <option value="English">English</option>
//           </select>
//         </div>

//         <div className="form-group" style={{ width: '300px', paddingTop: '30px' }}>
//           <label style={{ marginTop: '50px', marginLeft: '-20px' }}>
//             Destination Languages
//           </label>
//           <select
//             id="destination"
//             data-testid="destination"
//             value={destinationLanguage}
//             onChange={(e) => setDestinationLanguage(e.target.value)}
//             style={{
//               height: '40px',
//               width: '100%',
//               backgroundColor: '#FAFAFA',
//               marginTop: '11px',
//               border: '1px solid #ccc',
//               marginLeft: '-20px',
//             }}
//             multiple
//           >
//             <option value="Tamil">Tamil</option>
//             <option value="Spanish">Spanish</option>
//             <option value="French">French</option>
//             <option value="German">German</option>
//             <option value="Italian">Italian</option>
//             <option value="Arabic">Arabic</option>
//             <option value="Japanese">Japanese</option>
//             <option value="Chinese">Chinese</option>
//             <option value="US English">US English</option>
//             <option value="UK English">UK English</option>
//           </select>
//         </div>
//       </div>

//       <div className="form-group" style={{ width: '450px', paddingTop: '20px', marginLeft: '0px', marginTop: '10px' }}>
//         <label style={{ marginBottom: '10px', marginLeft: '20px' }}>
//           Text to transliterate
//         </label>
//         <input
//           type="text"
//           id="text"
//           data-testid="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           style={{
//             height: '120px',
//             width: '662px',
//             backgroundColor: '#FAFAFA',
//             marginTop: '8px',
//             border: '1px solid #ccc',
//             marginLeft: '20px',
//           }}
//           placeholder="Enter the text"
//         />
//       </div>

//       <div className="form-group" style={{ textAlign: 'center', paddingTop: '30px', paddingBottom: '20px' }}>
//         <button
//           className="compose-button"
//           style={{ fontSize: '14px', fontWeight: '400', width: '200px', height: '30px' }}
//           onClick={handleTransliterate}
//         >
//           <strong style={{ fontWeight: 'bold' }}>Transliterate</strong>
//         </button>
//       </div>

//       <div className="form-group" style={{ position: 'relative', width: '450px', paddingTop: '20px', marginLeft: '0px' }}>
//         <label style={{ marginBottom: '10px', marginLeft: '20px' }}>
//           Transliterated Text
//         </label>
//         <div style={{ position: 'relative' }}>
//           <textarea
//             id="output"
//             data-testid="output"
//             value={transliteratedText} // Ensure this is bound to the state correctly
//             readOnly
//             style={{
//               height: '160px',
//               width: '662px',
//               backgroundColor: '#FAFAFA',
//               marginTop: '8px',
//               border: '1px solid #ccc',
//               marginLeft: '20px',
//             }}
//           />
//           <RiFileCopy2Line
//             className="copy-icon"
//             onClick={handleCopyToClipboard}
//             style={{
//               position: 'absolute',
//               top: '0px',
//               right: '-237px',
//               cursor: 'pointer',
//               fontSize: '20px',
//               color: '#0C0B6D',
//               backgroundColor: 'white',
//               padding: '5px',
//               borderRadius: '5px',
//               border: '1px solid black',
//               width: '50px',
//               height: '30px'
//             }}
//           />
//           <button
//             className="icon-button"
//             onClick={handleFeedback}
//             data-testid="feedback-button"
//             style={{
//               position: 'absolute',
//               top: '0px',
//               right: '-180px',
//               cursor: 'pointer',
//               fontSize: '20px',
//               color: '#0C0B6D',
//               backgroundColor: 'white',
//               padding: '0px 5px',
//               borderRadius: '5px',
//               border: '1px solid black',
//               width: '50px',
//               height: '30px'
//             }}
//           >
//             <FontAwesomeIcon icon={faComment} />
//           </button>
//           {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransliterationPage;

import React, { useState, useContext } from "react";
import axios from "axios";
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import FeedbackPopup from "./FeedbackPopup";
import { AppContext } from "./AppContext";
import "./TranslationPage.css"; // Reusing the same CSS file

const TransliterationPage = () => {
  // State variables for managing component state
  const [transliteratedText, setTransliteratedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [destinationLanguage, setDestinationLanguage] = useState(["Tamil"]); // Changed to array for multiple selections
  const [showFeed, setShowFeed] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const { model, temperature, maxOutput, TopK } = useContext(AppContext);

  const handleFeedback = () => {
    setShowFeed(true);
  };

  const handleClosePopup = () => {
    setShowFeed(false);
  };

  const handleDestinationChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setDestinationLanguage(selected);
  };

  const handleTransliterate = async () => {
    if (!inputText.trim()) {
      alert("Please enter text to transliterate");
      return;
    }

    setIsTransliterating(true);

    try {
      const params = {
        inputText,
        sourceLanguage,
        destinationLanguage: destinationLanguage.join(","), // Convert array to comma-separated string
        model,
        temperature,
        maxOutput,
        TopK,
      };

      // Construct the URL with the parameters
      const url = `https://easy-with-ai-frontend.onrender/api/transliterate/?${Object.entries(
        params
      )
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")}`;

      // Log the constructed URL for debugging
      console.log("Transliteration API URL:", url);

      const response = await axios.get(url);

      // Log the response data for debugging
      console.log("Transliteration API Response:", response.data);

      if (response.data.message) {
        setTransliteratedText(response.data.message);
      } else if (response.data.transliteration) {
        setTransliteratedText(response.data.transliteration);
      } else {
        setTransliteratedText("Error: No transliteration received");
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in transliteration:", error);

      if (error.response) {
        if (error.response.status === 401) {
          console.error(
            "Authentication required. Redirecting to /authenticate"
          );
          window.location.href = "/authenticate";
        } else if (error.response.status === 402) {
          console.error("Upgrade required. Redirecting to /upgrade");
          window.location.href = "/upgrade";
        } else {
          setTransliteratedText(
            `Error: ${error.response.data.message || "Transliteration failed"}`
          );
        }
      } else {
        setTransliteratedText(
          "Error: Could not connect to transliteration service"
        );
      }
    } finally {
      setIsTransliterating(false);
    }
  };

  // Function to copy transliterated text to clipboard
  const handleCopyToClipboard = () => {
    if (!transliteratedText) return;

    navigator.clipboard
      .writeText(transliteratedText)
      .then(() => {
        alert("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);

        // Fallback method
        const outputTextarea = document.getElementById("output");
        outputTextarea.select();
        document.execCommand("copy");
      });
  };

  return (
    <div className="translation-container">
      <h1 className="translation-title">Transliteration!</h1>

      <div className="language-selection-row">
        {/* Source Language dropdown */}
        <div className="form-group">
          <label htmlFor="source-language">Source Language</label>
          <select
            id="source-language"
            className="form-select"
            data-testid="source"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            <option value="English">English</option>
          </select>
        </div>

        {/* Destination Language dropdown */}
        <div className="form-group">
          <label htmlFor="destination-language">Destination Languages</label>
          <select
            id="destination-language"
            className="form-select"
            data-testid="destination"
            multiple
            value={destinationLanguage}
            onChange={handleDestinationChange}
          >
            <option value="Tamil">Tamil</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Italian">Italian</option>
            <option value="Arabic">Arabic</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese</option>
            <option value="US English">US English</option>
            <option value="UK English">UK English</option>
          </select>
        </div>
      </div>

      {/* Text input field for transliteration */}
      <div className="form-group full-width">
        <label htmlFor="input-text">Text to transliterate</label>
        <textarea
          id="input-text"
          className="form-textarea"
          data-testid="text"
          placeholder="Enter the text to transliterate"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Transliterate button */}
      <div className="button-container">
        <button
          className="translate-button"
          onClick={handleTransliterate}
          disabled={isTransliterating}
        >
          {isTransliterating ? "Transliterating..." : "Transliterate"}
        </button>
      </div>

      {/* Display transliterated text */}
      <div className="form-group full-width">
        <label htmlFor="output">Transliterated Text</label>
        <div className="output-container">
          <textarea
            id="output"
            className="form-textarea"
            data-testid="output"
            value={transliteratedText}
            readOnly
          />
          <div className="output-actions">
            <RiFileCopy2Line
              className="copy-icon"
              onClick={handleCopyToClipboard}
              title="Copy to clipboard"
            />

            <button
              className="feedback-button"
              onClick={handleFeedback}
              data-testid="feedback-button"
            >
              <FontAwesomeIcon icon={faComment} />
            </button>
          </div>
        </div>
      </div>

      {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
    </div>
  );
};

export default TransliterationPage;
