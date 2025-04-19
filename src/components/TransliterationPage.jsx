// import React, { useState, useContext } from "react";
// import axios from "axios";
// import { RiFileCopy2Line } from "react-icons/ri";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
// import FeedbackPopup from "./FeedbackPopup";
// import { AppContext } from "./AppContext";
// import "./TranslationPage.css"; // Reusing the same CSS file
// import { authService } from './Authentication/authService'; 

// axios.defaults.withCredentials = true;
// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// axios.defaults.withXSRFToken = true; // For newer axios versions

// const TransliterationPage = () => {
//   // State variables for managing component state
//   const [transliteratedText, setTransliteratedText] = useState("");
//   const [inputText, setInputText] = useState("");
//   const [sourceLanguage, setSourceLanguage] = useState("English");
//   const [destinationLanguages, setDestinationLanguages] = useState(["Tamil"]); // Default selection
//   const [showFeed, setShowFeed] = useState(false);
//   const [isTransliterating, setIsTransliterating] = useState(false);
//   const { model, temperature, maxOutput, TopK } = useContext(AppContext);

//   // Available languages for transliteration
//   const availableLanguages = [
//     "Tamil",
//     "Spanish",
//     "French",
//     "German",
//     "Italian",
//     "Arabic",
//     "Japanese",
//     "Chinese",
//     "US English",
//     "UK English"
//   ];

//   const handleFeedback = () => {
//     setShowFeed(true);
//   };

//   const handleClosePopup = () => {
//     setShowFeed(false);
//   };

//   // Handle checkbox selection for destination languages
//   const handleDestinationLanguageChange = (language) => {
//     if (destinationLanguages.includes(language)) {
//       // Remove language if already selected (unless it's the last one)
//       if (destinationLanguages.length > 1) {
//         setDestinationLanguages(destinationLanguages.filter(lang => lang !== language));
//       }
//     } else {
//       // Add language if not already selected
//       setDestinationLanguages([...destinationLanguages, language]);
//     }
//   };

//   const handleTransliterate = async () => {
//     if (!inputText.trim()) {
//       alert("Please enter text to transliterate");
//       return;
//     }

//     setIsTransliterating(true);

//     try {
//         const user = authService.getCurrentUser();
//         const userEmail = user?.email ;
//       const params = {
//         inputText,
//         sourceLanguage,
//         destinationLanguage: destinationLanguages.join(","), // Convert array to comma-separated string
//         model,
//         temperature,
//         maxOutput,
//         TopK,
//         email: userEmail,
//       };

//       // Construct the URL with the parameters
//       const url = `http://localhost:8000/api/transliterate/?${Object.entries(
//         params
//       )
//         .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//         .join("&")}`;

//       // Log the constructed URL for debugging
//       console.log("Transliteration API URL:", url);

//       const response = await axios.get(url);

//       // Log the response data for debugging
//       console.log("Transliteration API Response:", response.data);

//       if (response.data.message) {
//         setTransliteratedText(response.data.message);
//       } else if (response.data.transliteration) {
//         setTransliteratedText(response.data.transliteration);
//       } else {
//         setTransliteratedText("Error: No transliteration received");
//       }
//     } catch (error) {
//       // Handle errors appropriately
//       console.error("Error in transliteration:", error);

//       if (error.response) {
//         if (error.response.status === 401) {
//           console.error(
//             "Authentication required. Redirecting to /authenticate"
//           );
//           window.location.href = "/authenticate";
//         } else if (error.response.status === 402) {
//           console.error("Upgrade required. Redirecting to /upgrade");
//           window.location.href = "/upgrade";
//         } else {
//           setTransliteratedText(
//             `Error: ${error.response.data.message || "Transliteration failed"}`
//           );
//         }
//       } else {
//         setTransliteratedText(
//           "Error: Could not connect to transliteration service"
//         );
//       }
//     } finally {
//       setIsTransliterating(false);
//     }
//   };

//   // Function to copy transliterated text to clipboard
//   const handleCopyToClipboard = () => {
//     if (!transliteratedText) return;

//     navigator.clipboard
//       .writeText(transliteratedText)
//       .then(() => {
//         alert("Text copied to clipboard");
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);

//         // Fallback method
//         const outputTextarea = document.getElementById("output");
//         outputTextarea.select();
//         document.execCommand("copy");
//       });
//   };

//   return (
//     <div className="translation-container">
//       <h1 className="translation-title">Transliteration!</h1>

//       <div className="language-selection-row">
//         {/* Source Language dropdown */}
//         <div className="form-group">
//           <label htmlFor="source-language">Source Language</label>
//           <select
//             id="source-language"
//             className="form-select"
//             style={{backgroundColor: "#FAFAFA"}}
//             multiple
//             value={sourceLanguage}
//             onChange={(e) => setSourceLanguage(
//               Array.from(e.target.selectedOptions, option => option.value)
//             )}
//           >
//             <option value="English">English</option>
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

//         {/* Destination Languages Checkboxes */}
//         <div className="form-group">
//           <label>Destination Languages</label>
//           <div className="checkbox-container" style={{
//             display: "flex",
//             flexWrap: "wrap",
//             maxHeight: "100px",
//             overflowY: "auto",
//             border: "1px solid #ccc",
//             borderRadius: "8px",
//             padding: "8px",
//             backgroundColor: "#FAFAFA",
//             color:"black"
//           }}>
//             {availableLanguages.map((language) => (
//               <div 
//                 key={language} 
//                 className="checkbox-item"
//                 style={{
//                   display: "flex", 
//                   alignItems: "center",
//                   width: "100%",
//                   padding: "4px 0"
//                 }}
//               >
//                 <div
//                   onClick={() => handleDestinationLanguageChange(language)}
//                   style={{
//                     width: "18px",
//                     height: "18px",
//                     border: "2px solid #007bff",
//                     borderRadius: "4px",
//                     marginRight: "8px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: destinationLanguages.includes(language)
//                       ? "#007bff"
//                       : "white",
//                     cursor: "pointer"
//                   }}
//                 >
//                   {destinationLanguages.includes(language) && (
//                     <FontAwesomeIcon
//                       icon={faCheck}
//                       color="white"
//                       style={{ fontSize: "10px" }}
//                     />
//                   )}
//                 </div>
//                 <span style={{ cursor: "pointer" }} onClick={() => handleDestinationLanguageChange(language)}>
//                   {language}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Text input field for transliteration */}
//       <div className="form-group full-width">
//         <label htmlFor="input-text">Text to transliterate</label>
//         <textarea
//           id="input-text"
//           className="form-textarea"
//           data-testid="text"
//           placeholder="Enter the text to transliterate"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//         />
//       </div>

//       {/* Transliterate button */}
//       <div className="button-container">
//         <button
//           className="btn-final"
//           onClick={handleTransliterate}
//           disabled={isTransliterating}
//         >
//           {isTransliterating ? "Transliterating..." : "Transliterate"}
//         </button>
//       </div>

//       {/* Display transliterated text */}
//       <div className="form-group full-width">
//         <label htmlFor="output">Transliterated Text</label>
//         <div className="output-container">
//           <textarea
//             id="output"
//             className="form-textarea"
//             data-testid="output"
//             value={transliteratedText}
//             readOnly
//           />
//           <div className="output-actions">
//             <RiFileCopy2Line
//               className="copy-icon"
//               onClick={handleCopyToClipboard}
//               title="Copy to clipboard"
//             />

//             <button
//               className="feedback-button"
//               onClick={handleFeedback}
//               data-testid="feedback-button"
//             >
//               <FontAwesomeIcon icon={faComment} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
//     </div>
//   );
// };

// export default TransliterationPage;

import React, { useState, useContext } from "react";
import axios from "axios";
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCheck, faGlobe } from "@fortawesome/free-solid-svg-icons";
import FeedbackPopup from "./FeedbackPopup";
import { AppContext } from "./AppContext";
import "./TranslationPage.css"; // Reusing the same CSS file
import { authService } from './Authentication/authService'; 

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withXSRFToken = true; // For newer axios versions

const TransliterationPage = () => {
  // State variables for managing component state
  const [transliteratedText, setTransliteratedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [destinationLanguages, setDestinationLanguages] = useState(["Tamil"]); // Default selection
  const [showFeed, setShowFeed] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const { model, temperature, maxOutput, TopK } = useContext(AppContext);

  // Language groups with country information
  const languageGroups = [
    {
      region: "Indian Languages below",
      languages: [
        { name: "Hindi", country: "India" },
        { name: "Tamil", country: "India" },
        { name: "Telugu", country: "India" },
        { name: "Malayalam", country: "India" },
        { name: "Kannada", country: "India" },
        { name: "Bengali", country: "India" },
        { name: "Marathi", country: "India" },
        { name: "Gujarati", country: "India" },
        { name: "Punjabi", country: "India" },
        { name: "Odia", country: "India" },
        { name: "Urdu", country: "India" },
      ]
    },
    {
      region: "European Languages",
      languages: [
        { name: "English", country: "Global" },
        { name: "Spanish", country: "Spain" },
        { name: "French", country: "France" },
        { name: "German", country: "Germany" },
        { name: "Italian", country: "Italy" },
        { name: "Portuguese", country: "Portugal" },
        { name: "Dutch", country: "Netherlands" },
        { name: "Greek", country: "Greece" },
        { name: "Russian", country: "Russia" },
        { name: "US English", country: "USA" },
        { name: "UK English", country: "United Kingdom" },
      ]
    },
    {
      region: "Asian Languages",
      languages: [
        { name: "Chinese (Simplified)", country: "China" },
        { name: "Chinese (Traditional)", country: "Taiwan" },
        { name: "Japanese", country: "Japan" },
        { name: "Korean", country: "Korea" },
        { name: "Thai", country: "Thailand" },
        { name: "Vietnamese", country: "Vietnam" },
        { name: "Indonesian", country: "Indonesia" },
        { name: "Malay", country: "Malaysia" },
      ]
    },
    {
      region: "Middle Eastern Languages",
      languages: [
        { name: "Arabic", country: "Multiple" },
        { name: "Turkish", country: "Turkey" },
        { name: "Persian", country: "Iran" },
        { name: "Hebrew", country: "Israel" },
      ]
    },
    {
      region: "African Languages below",
      languages: [
        { name: "Swahili", country: "East Africa" },
        { name: "Amharic", country: "Ethiopia" },
        { name: "Zulu", country: "South Africa" },
        { name: "Yoruba", country: "Nigeria" },
      ]
    }
  ];

  const handleFeedback = () => {
    setShowFeed(true);
  };

  const handleClosePopup = () => {
    setShowFeed(false);
  };

  // Handle checkbox selection for destination languages
  const handleDestinationLanguageChange = (language) => {
    if (destinationLanguages.includes(language)) {
      // Remove language if already selected (unless it's the last one)
      if (destinationLanguages.length > 1) {
        setDestinationLanguages(destinationLanguages.filter(lang => lang !== language));
      }
    } else {
      // Add language if not already selected
      setDestinationLanguages([...destinationLanguages, language]);
    }
  };

  const handleTransliterate = async () => {
    if (!inputText.trim()) {
      alert("Please enter text to transliterate");
      return;
    }

    setIsTransliterating(true);

    try {
      const user = authService.getCurrentUser();
      const userEmail = user?.email;
      const params = {
        inputText,
        sourceLanguage,
        destinationLanguage: destinationLanguages.join(","), // Convert array to comma-separated string
        model,
        temperature,
        maxOutput,
        TopK,
        email: userEmail,
      };

      // Construct the URL with the parameters
      const url = `http://localhost:8000/api/transliterate/?${Object.entries(params)
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
          console.error("Authentication required. Redirecting to /authenticate");
          window.location.href = "/authenticate";
        } 
        else if (error.response.status === 402) {
          // Show alert dialog for payment required
          const goToProfile = confirm("You need to add your credits. Go to profile page?");
          if (goToProfile) {
            window.location.href = "/profile";
          }
          // If user clicks Cancel, they stay on the current page
        } 
         else {
          setTransliteratedText(`Error: ${error.response.data.message || "Transliteration failed"}`);
        }
      } else {
        setTransliteratedText("Error: Could not connect to transliteration service");
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
            style={{
              backgroundColor: "#FAFAFA",
              height: "200px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              padding: "8px"
            }}
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {languageGroups.map(group => (
              <optgroup key={group.region} label={group.region}>
                {group.languages.map(language => (
                  <option key={language.name} value={language.name}>
                    {language.name} ({language.country})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Destination Languages Checkboxes - Grouped by region */}
        <div className="form-group">
          <label>Destination Languages</label>
          <div className="checkbox-container" style={{
            display: "flex",
            flexDirection: "column",
            height: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#FAFAFA",
            color: "black"
          }}>
            {languageGroups.map(group => (
              <div key={group.region}>
                <div className="region-header" style={{
                  fontWeight: "bold",
                  padding: "6px 0",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <FontAwesomeIcon icon={faGlobe} style={{ marginRight: "8px" }} />
                  {group.region}
                </div>
                <div style={{ marginLeft: "10px" }}>
                  {group.languages.map(language => (
                    <div 
                      key={language.name} 
                      className="checkbox-item"
                      style={{
                        display: "flex", 
                        alignItems: "center",
                        width: "100%",
                        padding: "4px 0"
                      }}
                    >
                      <div
                        onClick={() => handleDestinationLanguageChange(language.name)}
                        style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid #007bff",
                          borderRadius: "4px",
                          marginRight: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: destinationLanguages.includes(language.name)
                            ? "#007bff"
                            : "white",
                          cursor: "pointer"
                        }}
                      >
                        {destinationLanguages.includes(language.name) && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color="white"
                            style={{ fontSize: "10px" }}
                          />
                        )}
                      </div>
                      <span 
                        style={{ cursor: "pointer" }} 
                        onClick={() => handleDestinationLanguageChange(language.name)}
                      >
                        {language.name} <span style={{ fontSize: "0.85em", color: "#666" }}>({language.country})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
  .language-selection-row {
    display: flex;
    gap: 20px;
  }
  
  .language-selection-row .form-group {
    flex: 1;
    width: 50%;
  }
  
  @media (max-width: 768px) {
    .language-selection-row {
      flex-direction: column;
      gap: 15px;
    }
    
    .language-selection-row .form-group {
      width: 100%;
    }
    
    .form-group select, .checkbox-container {
      height: 150px !important; /* Smaller height on mobile */
    }
  }
  
  @media (max-width: 480px) {
    .form-group select, .checkbox-container {
      height: 120px !important; /* Even smaller for very small screens */
    }
  }
`}</style>

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
          className="btn-final"
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