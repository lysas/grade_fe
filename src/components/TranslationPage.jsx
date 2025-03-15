import React, { useState, useContext } from "react";
import axios from "axios";
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import FeedbackPopup from "./FeedbackPopup";
import { AppContext } from "./AppContext";
import "./TranslationPage.css";

const TranslationPage = () => {
  // State variables for managing component state
  const [translatedText, setTranslatedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [destinationLanguage, setDestinationLanguage] = useState(["Tamil"]); // Changed to array for multiple selections
  const [domain, setDomain] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [showFeed, setShowFeed] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
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
        destinationLanguage: destinationLanguage.join(","), // Convert array to comma-separated string
        domain,
        subDomain,
        model,
        temperature,
        maxOutput,
        TopK,
      };

      // Construct the URL with the parameters
      const url = `http://localhost:8000/api/translate/?${Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")}`;

      // Log the constructed URL for debugging

      const response = await axios.get(url);

      // Log the response data for debugging
      console.log("Translation API Response:", response.data);

      if (response.data.message) {
        setTranslatedText(response.data.message);
      } else if (response.data.translation) {
        setTranslatedText(response.data.translation);
      } else {
        setTranslatedText("Error: No translation received");
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in translation:", error);

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
          setTranslatedText(
            `Error: ${error.response.data.message || "Translation failed"}`
          );
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
        {/* Source Language dropdown */}
        <div className="form-group">
          <label htmlFor="source-language">Source Language</label>
          <select
            id="source-language"
            className="form-select"
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
          className="translate-button"
          onClick={handleTranslate}
          // disabled={isTranslating || !inputText.trim()}
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
