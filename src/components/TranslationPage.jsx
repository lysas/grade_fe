
// import React, { useState, useContext } from "react";
// import axios from "axios";
// import { RiFileCopy2Line } from "react-icons/ri";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
// import FeedbackPopup from "./FeedbackPopup";
// import { AppContext } from "./AppContext";
// import "./TranslationPage.css";
// axios.defaults.withCredentials = true;
// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// axios.defaults.withXSRFToken = true; // For newer axios versions

// import { authService } from './Authentication/authService'; 
// const TranslationPage = () => {
//   // State variables for managing component state
//   const [translatedText, setTranslatedText] = useState("");
//   const [inputText, setInputText] = useState("");
//   const [sourceLanguage, setSourceLanguage] = useState("English");
//   const [destinationLanguages, setDestinationLanguages] = useState(["Tamil"]); // Default selection
//   const [domain, setDomain] = useState("");
//   const [subDomain, setSubDomain] = useState("");
//   const [showFeed, setShowFeed] = useState(false);
//   const [isTranslating, setIsTranslating] = useState(false);
//   const { model, temperature, maxOutput, TopK } = useContext(AppContext);
//   const user = authService.getCurrentUser();
//   const userEmail = user?.email ;

//   // Available languages for translation
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

//   const handleTranslate = async () => {
//     if (!inputText.trim()) {
//       alert("Please enter text to translate");
//       return;
//     }

//     setIsTranslating(true);

//     try {
//       // Get user email from localStorage
//       // const userEmail = localStorage.getItem("userEmail");
      
//       const params = {
//         inputText,
//         sourceLanguage,
//         destinationLanguage: destinationLanguages.join(","),
//         domain,
//         subDomain,
//         model,
//         temperature,
//         maxOutput,
//         TopK,
//         email: userEmail, // Include email as fallback authentication
//       };

//       // Construct the URL with parameters
//       const url = `http://localhost:8000/api/translate/?${Object.entries(params)
//         .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//         .join("&")}`;

//       // Make sure we're using axios with withCredentials
//       const response = await axios.get(url);
      
//       if (response.data.translation) {
//         setTranslatedText(response.data.translation);
//       } else if (response.data.message) {
//         setTranslatedText(response.data.message);
//       } else {
//         setTranslatedText("Error: No translation received");
//       }
//     } catch (error) {
//       console.error("Translation error:", error);
      
//       if (error.response) {
//         if (error.response.status === 401) {
//           window.location.href = "/authenticate";
//         } else if (error.response.status === 402) {
//           window.location.href = "/upgrade";
//         } else {
//           setTranslatedText(`Error: ${error.response.data.message || "Translation failed"}`);
//         }
//       } else {
//         setTranslatedText("Error: Could not connect to translation service");
//       }
//     } finally {
//       setIsTranslating(false);
//     }
// };

//   // Function to copy translated text to clipboard
//   const handleCopyToClipboard = () => {
//     if (!translatedText) return;

//     navigator.clipboard
//       .writeText(translatedText)
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
//       <h1 className="translation-title">Translation!</h1>

//       <div className="language-selection-row">
//         {/* Source Language dropdown */}
        
//         <div className="form-group">
//            <label htmlFor="source-language">Source Language</label>
//            <select
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

//       <div className="domain-selection-row">
//         {/* Domain input field */}
//         <div className="form-group">
//           <label htmlFor="domain-input">Domain</label>
//           <input
//             id="domain-input"
//             className="form-input"
//             type="text"
//             placeholder="Enter domain (e.g., Medical, Legal, Technical)"
//             value={domain}
//             onChange={(e) => setDomain(e.target.value)}
//           />
//         </div>

//         {/* Sub-Domain input field */}
//         <div className="form-group">
//           <label htmlFor="subdomain-input">Sub Domain</label>
//           <input
//             id="subdomain-input"
//             className="form-input"
//             type="text"
//             placeholder="Enter sub-domain (e.g., Cardiology, Contract Law)"
//             value={subDomain}
//             onChange={(e) => setSubDomain(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Text input field for translation */}
//       <div className="form-group full-width">
//         <label htmlFor="input-text">Text to translate</label>
//         <textarea
//           id="input-text"
//           className="form-textarea"
//           placeholder="Enter the text to translate"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//         />
//       </div>

//       {/* Translate button */}
//       <div className="button-container">
//         <button
//           className="btn-final"
//           onClick={handleTranslate}
//           disabled={isTranslating}
//         >
//           {isTranslating ? "Translating..." : "Translate"}
//         </button>
//       </div>

//       {/* Display translated text */}
//       <div className="form-group full-width">
//         <label htmlFor="output">Translated Text</label>
//         <div className="output-container">
//           <textarea
//             id="output"
//             className="form-textarea"
//             value={translatedText}
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

// export default TranslationPage;

import React, { useState, useContext } from "react";
import axios from "axios";
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCheck, faGlobe } from "@fortawesome/free-solid-svg-icons";
import FeedbackPopup from "./FeedbackPopup";
import { AppContext } from "./AppContext";
import "./TranslationPage.css";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withXSRFToken = true; // For newer axios versions

import { authService } from './Authentication/authService'; 

const TranslationPage = () => {
  // State variables for managing component state
  const [translatedText, setTranslatedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [destinationLanguages, setDestinationLanguages] = useState(["Tamil"]); // Default selection
  const [domain, setDomain] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [showFeed, setShowFeed] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { model, temperature, maxOutput, TopK } = useContext(AppContext);
  const user = authService.getCurrentUser();
  const userEmail = user?.email;
  
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

  // Create a flat list of all languages for convenience
  const allLanguages = languageGroups.flatMap(group => 
    group.languages.map(lang => lang.name)
  );

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

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      alert("Please enter text to translate");
      return;
    }
    
    setIsTranslating(true);
    
    try {
      const params = {
        inputText,
        sourceLanguage,
        destinationLanguage: destinationLanguages.join(","),
        domain,
        subDomain,
        model,
        temperature,
        maxOutput,
        TopK,
        email: userEmail, // Include email as fallback authentication
      };
      
      // Construct the URL with parameters
      const url = `http://localhost:8000/api/translate/?${Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")}`;
      
      // Make sure we're using axios with withCredentials
      const response = await axios.get(url);
      
      if (response.data.translation) {
        setTranslatedText(response.data.translation);
      } else if (response.data.message) {
        setTranslatedText(response.data.message);
      } else {
        setTranslatedText("Error: No translation received");
      }
    } catch (error) {
      console.error("Translation error:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = "/authenticate";
        } else if (error.response.status === 402) {
          // Show alert dialog for payment required
          const goToProfile = confirm("You need to add your credits. Go to profile page?");
          if (goToProfile) {
            window.location.href = "/profile";
          }
          // If user clicks Cancel, they stay on the current page
        } else {
          setTranslatedText(`Error: ${error.response.data.message || "Translation failed"}`);
        }
      } else {
        setTranslatedText("Error: Could not connect to translation service");
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Function to copy translated text to clipboard
  const handleCopyToClipboard = () => {
    if (!translatedText) return;

    navigator.clipboard
      .writeText(translatedText)
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
      <h1 className="translation-title">Translation!</h1>

      <div className="language-selection-row">
        {/* Source Language dropdown - Fixed to single selection */}
        {/* <div className="form-group">
          <label htmlFor="source-language">Source Language</label>
          <select
            id="source-language"
            className="form-select"
            style={{backgroundColor: "#FAFAFA"}}
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
        </div> */}
       
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

{/* Make both form-group elements the same width */}
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

        {/* Destination Languages Checkboxes - Grouped by region */}
        <div className="form-group">
          <label>Destination Languages</label>
          <div className="checkbox-container" style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "200px",
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

      <div className="domain-selection-row">
        {/* Domain input field */}
        <div className="form-group">
          <label htmlFor="domain-input">Domain</label>
          <input
            id="domain-input"
            className="form-input"
            type="text"
            placeholder="Enter domain (e.g., Medical, Legal, Technical)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>

        {/* Sub-Domain input field */}
        <div className="form-group">
          <label htmlFor="subdomain-input">Sub Domain</label>
          <input
            id="subdomain-input"
            className="form-input"
            type="text"
            placeholder="Enter sub-domain (e.g., Cardiology, Contract Law)"
            value={subDomain}
            onChange={(e) => setSubDomain(e.target.value)}
          />
        </div>
      </div>

      {/* Text input field for translation */}
      <div className="form-group full-width">
        <label htmlFor="input-text">Text to translate</label>
        <textarea
          id="input-text"
          className="form-textarea"
          placeholder="Enter the text to translate"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Translate button */}
      <div className="button-container">
        <button
          className="btn-final"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
      </div>

      {/* Display translated text */}
      <div className="form-group full-width">
        <label htmlFor="output">Translated Text</label>
        <div className="output-container">
          <textarea
            id="output"
            className="form-textarea"
            value={translatedText}
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

export default TranslationPage;