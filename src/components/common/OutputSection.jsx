import React from 'react';
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { Button, TextArea, Label } from './index';
import './OutputSection.css';

const OutputSection = ({
  outputText,
  onCopy,
  onFeedback,
  showFeed,
  onClosePopup,
  isLoading,
  onGenerate,
  generateButtonText = "Generate",
  outputLabel = "Output",
  FeedbackPopup
}) => {
  return (
    <div className="output-section">
      <div className="button-container">
        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {isLoading ? "Processing..." : generateButtonText}
        </Button>
      </div>

      <div className="form-group full-width">
        <Label htmlFor="output">{outputLabel}</Label>
        <div className="output-container">
          <TextArea
            id="output"
            value={outputText}
            readOnly
          />
          <div className="output-actions">
            <Button
              variant="icon"
              onClick={onCopy}
              icon={<RiFileCopy2Line />}
              title="Copy to clipboard"
            />
            <Button
              variant="icon"
              onClick={onFeedback}
              icon={<FontAwesomeIcon icon={faComment} />}
            />
          </div>
        </div>
      </div>

      {showFeed && FeedbackPopup && <FeedbackPopup onClose={onClosePopup} />}
    </div>
  );
};

export default OutputSection; 