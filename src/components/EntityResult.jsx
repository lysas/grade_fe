import React from 'react';
import { RiFileCopy2Line } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import FeedbackPopup from "./FeedbackPopup";
import { Button, TextArea, Label } from './common';
import './common/Label.css';

const EntityResult = ({ entityText, onCopy, onFeedback, showFeed, onClosePopup }) => {
  return (
    <div className="form-group full-width">
      <Label htmlFor="output" className="form-label">Entity Result</Label>
      <div className="output-container">
        <TextArea
          id="output"
          value={entityText}
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
      {showFeed && <FeedbackPopup onClose={onClosePopup} />}
    </div>
  );
};

export default EntityResult; 