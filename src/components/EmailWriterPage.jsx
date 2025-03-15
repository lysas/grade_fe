import React, { useState, useRef, useContext } from 'react';
import { RiFileCopy2Line } from "react-icons/ri";
import FeedbackPopup from "./FeedbackPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { AppContext } from './AppContext';
import './emailwriter.css';
const EmailWriterPage = () => {
  const [selectedType, setSelectedType] = useState('Personal');
  const [composedEmail, setComposedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFeed, setShowFeed] = useState(false);

  const { model, temperature, maxOutput, TopK } = useContext(AppContext);

  // Refs for different types of recipients and purposes
  const recipientRef = useRef(null);
  const purposeRef = useRef(null);
  const jobSeekersRecipientRef = useRef(null);
  const jobSeekersPurposeRef = useRef(null);
  const employeeRecipientRef = useRef(null);
  const employeePurposeRef = useRef(null);
  const personalizedRef = useRef(null);
  const toneRef = useRef(null);

  const handleFeedback = () => {
    setShowFeed(true);
  };

  const handleClosePopup = () => {
    setShowFeed(false);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleComposeEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      let recipient, purpose;

      // Get recipient and purpose based on selected type
      if (selectedType === 'Business') {
        recipient = recipientRef.current.value;
        purpose = purposeRef.current.value;
      } else if (selectedType === 'Job Seekers') {
        recipient = jobSeekersRecipientRef.current.value;
        purpose = jobSeekersPurposeRef.current.value;
      } else if (selectedType === 'HR/Employee') {
        recipient = employeeRecipientRef.current.value;
        purpose = employeePurposeRef.current.value;
      } else {
        // Personal type
        const recipientElement = document.getElementById('recipient');
        const purposeElement = document.getElementById('purpose');
        recipient = recipientElement.options[recipientElement.selectedIndex].text;
        purpose = purposeElement.options[purposeElement.selectedIndex].text;
      }

      const tone = toneRef.current.value;
      const personalized = personalizedRef.current.value;

      // Validate inputs
      if (!recipient || !purpose || !tone) {
        throw new Error('Please fill in all required fields');
      }

      const params = {
        selectedType,
        tone,
        recipient,
        purpose,
        personalized,
        model,
        temperature,
        maxOutput,
        TopK
      };

      const url = `https://promptrightprod.onrender/api/mail/?${Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;

      const response = await axios.get(url);
      setComposedEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching translated email:', error);

      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = "/authenticate";
        } else if (error.response.status === 402) {
          window.location.href = "/upgrade";
        } else {
          setError('Failed to generate email. Please try again.');
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (composedEmail) {
      navigator.clipboard.writeText(composedEmail)
        .then(() => {
          // Optional: Show a temporary "Copied!" message
          const copyIcon = document.querySelector('.copy-icon');
          if (copyIcon) {
            const originalTitle = copyIcon.title;
            copyIcon.title = 'Copied!';
            setTimeout(() => {
              copyIcon.title = originalTitle;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className="email-writer-container">
      {/* Title of the page */}
      <h1 className="email-writer-title">Email Writer!</h1>

      <div className="email-form-container">
        <div className="form-row">
          {/* Email Type Selector */}
          <div className="form-group">
            <label htmlFor="type">Type of Mail</label>
            <select
              id="type"
              data-testid="type"
              name="type"
              className="form-select"
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="" disabled hidden>Type of mail</option>
              <option value="Personal">Personal</option>
              <option value="Business">Business</option>
              <option value="Job Seekers">Job Seekers</option>
              <option value="HR/Employee">HR/Employee</option>
            </select>
          </div>

          {/* Tone Selector */}
          <div className="form-group">
            <label htmlFor="tone">Tone</label>
            <select
              id="tone"
              data-testid="tone"
              name="tone"
              className="form-select"
              ref={toneRef}
              defaultValue=""
            >
              <option value="" disabled hidden>Tone</option>
              <option value="Funny">Funny</option>
              <option value="Serious">Serious</option>
              <option value="Friendly">Friendly</option>
              <option value="Professional">Professional</option>
              <option value="Empathetic">Empathetic</option>
              <option value="Confident">Confident</option>
              <option value="Enthusiastic">Enthusiastic</option>
              <option value="Assertive">Assertive</option>
              <option value="Encouraging">Encouraging</option>
              <option value="Excited">Excited</option>
              <option value="Witty">Witty</option>
              <option value="Sympathetic">Sympathetic</option>
            </select>
          </div>
        </div>

        {/* Personal Email Group */}
        <div className="email-group" style={{ display: selectedType === "Personal" ? "block" : "none" }}>
          <div className="form-group">
            <label htmlFor="recipient">Recipient</label>
            <select
              id="recipient"
              data-testid="recipient"
              name="recipient"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Recipient</option>
              <option value="Friend">Friend</option>
              <option value="Family member">Family member</option>
              <option value="Doctors">Doctors</option>
              <option value="Therapists">Therapists</option>
              <option value="Religious leaders">Religious leaders</option>
              <option value="Pen pals">Pen pals</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose</label>
            <select
              id="purpose"
              data-testid="purpose"
              name="purpose"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Purpose</option>
              <option value="Welcome">Welcome</option>
              <option value="Wishes">Wishes</option>
              <option value="Ask help/advice">Ask help/advice</option>
              <option value="Express feelings/emotions">Express feelings/emotions</option>
              <option value="Conduct business">Conduct business</option>
              <option value="Apply for a job">Apply for a job</option>
              <option value="Thank you">Thank you</option>
              <option value="Apology">Apology</option>
              <option value="Reminder">Reminder</option>
              <option value="Invitation">Invitation</option>
              <option value="Request">Request</option>
              <option value="Job Seekers">Job Seekers</option>
            </select>
          </div>
        </div>

        {/* Business Email Group */}
        <div className="email-group" style={{ display: selectedType === "Business" ? "block" : "none" }}>
          <div className="form-group">
            <label htmlFor="business-recipient">Recipient</label>
            <select
              id="business-recipient"
              data-testid="recipient"
              ref={recipientRef}
              name="recipient"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Recipient</option>
              <option>Customer Support</option>
              <option>Customers</option>
              <option>Vendors</option>
              <option>Employees</option>
              <option>Partners</option>
              <option>Investors</option>
              <option>Government agencies</option>
              <option>Other businesses</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="business-purpose">Purpose</label>
            <select
              id="business-purpose"
              data-testid="purpose"
              ref={purposeRef}
              name="purpose"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Purpose</option>
              <option value="welcome">Welcome</option>
              <option value="thankyou">Thank you</option>
              <option value="promotional">Promotional</option>
              <option value="newsletter">Newsletter</option>
              <option value="transactional">Transactional</option>
              <option value="survey">Survey</option>
              <option value="cancellation">Cancellation</option>
              <option value="abandonedcart">Abandoned cart</option>
              <option value="confirmation">Confirmation</option>
              <option value="announcement">Announcement</option>
              <option value="invitation">Invitation</option>
              <option value="request">Request</option>
              <option value="complaint">Complaint</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
        </div>

        {/* Job Seekers Group */}
        <div className="email-group" style={{ display: selectedType === "Job Seekers" ? "block" : "none" }}>
          <div className="form-group">
            <label htmlFor="jobseeker-recipient">Recipient</label>
            <select
              id="jobseeker-recipient"
              data-testid="recipient"
              ref={jobSeekersRecipientRef}
              name="recipient"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Recipient</option>
              <option>HR Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="jobseeker-purpose">Purpose</label>
            <select
              id="jobseeker-purpose"
              data-testid="purpose"
              ref={jobSeekersPurposeRef}
              name="purpose"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Purpose</option>
              <option>Job Application</option>
              <option>Job Acceptance</option>
              <option>Job Rejection</option>
              <option>Thank You Email After Interview</option>
              <option>Reference Request</option>
              <option>Job Inquiry</option>
              <option>Follow-up Email After Interview</option>
              <option>Networking Email for Job Search</option>
            </select>
          </div>
        </div>

        {/* HR/Employee Group */}
        <div className="email-group" style={{ display: selectedType === "HR/Employee" ? "block" : "none" }}>
          <div className="form-group">
            <label htmlFor="employee-recipient">Recipient</label>
            <select
              id="employee-recipient"
              data-testid="recipient"
              ref={employeeRecipientRef}
              name="recipient"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Recipient</option>
              <option>Employee</option>
              <option>HR</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="employee-purpose">Purpose</label>
            <select
              id="employee-purpose"
              data-testid="purpose"
              ref={employeePurposeRef}
              name="purpose"
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled hidden>Purpose</option>
              <option>Resignation Letter</option>
              <option>Interview Invitation</option>
              <option>Interview Confirmation</option>
              <option value="Job Offer">Job Offer</option>
              <option value="Promotion Request">Promotion Request</option>
              <option value="Transfer Request">Transfer Request</option>
              <option value="Performance Appraisal">Performance Appraisal</option>
              <option value="Acknowledgment of Resignation">Acknowledgment of Resignation</option>
              <option value="Welcome Email to New Employee">Welcome Email to New Employee</option>
              <option value="Job Termination">Job Termination</option>
            </select>
          </div>
        </div>

        {/* Personalized Content */}
        <div className="form-group">
          <label htmlFor="personalized">Enter the content of the mail</label>
          <textarea
            id="personalized"
            data-testid="personalized"
            name="personalized"
            ref={personalizedRef}
            className="form-textarea"
            placeholder="Eg. invite - birthday - 2nd december - venue"
          />
        </div>

        {/* Error message display */}
        {error && <div className="error-message">{error}</div>}

        {/* Button to compose email */}
        <div className="form-action">
          <button
            className="compose-button"
            onClick={handleComposeEmail}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Compose Email'}
          </button>
        </div>

        {/* Output box to display the composed email text */}
        <div className="output-container">
          <label htmlFor="output">Compose Email</label>
          <div className="output-wrapper">
            <textarea
              id="output"
              data-testid="output"
              value={composedEmail}
              readOnly
              className="output-area"
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

        {/* Feedback popup */}
        {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
      </div>
    </div>
  );
};

export default EmailWriterPage;