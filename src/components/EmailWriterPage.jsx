import React, { useState, useRef, useContext } from 'react';
import { RiFileCopy2Line } from "react-icons/ri";
import FeedbackPopup from "./FeedbackPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { AppContext } from './AppContext';
import './emailwriter.css';
import { authService } from './Authentication/authService';
import { Button, Input, Select, TextArea, Heading, Label } from './common';
import OutputSection from './common/OutputSection';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withXSRFToken = true; // For newer axios versions

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
        const user = authService.getCurrentUser();
        const userEmail = user?.email ;

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
        TopK,
        email: userEmail, 
      };
      
      // const url = `https://promptrightprod.onrender.com/api/mail/?${Object.entries(params)
      const url = `http://localhost:8000/api/mail/?${Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;

      const response = await axios.get(url);
      setComposedEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching translated email:', error);

      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = "/authenticate";
        }  else if (error.response.status === 402) {
          // Show alert dialog for payment required
          const goToProfile = confirm("You need to add your credits. Go to profile page?");
          if (goToProfile) {
            window.location.href = "/profile";
          }
          // If user clicks Cancel, they stay on the current page
        }  else {
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
      <Heading>Email Writer!</Heading>

      <div className="email-form-container">
        <div className="form-row">
          <div className="form-group">
            <Label htmlFor="type">Type of Mail</Label>
            <Select
              id="type"
              value={selectedType}
              onChange={handleTypeChange}
              options={[
                { value: 'Personal', label: 'Personal' },
                { value: 'Business', label: 'Business' },
                { value: 'Job Seekers', label: 'Job Seekers' },
                { value: 'HR/Employee', label: 'HR/Employee' }
              ]}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="tone">Tone</Label>
            <Select
              id="tone"
              ref={toneRef}
              options={[
                { value: 'Funny', label: 'Funny' },
                { value: 'Serious', label: 'Serious' },
                { value: 'Friendly', label: 'Friendly' },
                { value: 'Professional', label: 'Professional' },
                { value: 'Empathetic', label: 'Empathetic' },
                { value: 'Confident', label: 'Confident' },
                { value: 'Enthusiastic', label: 'Enthusiastic' },
                { value: 'Assertive', label: 'Assertive' },
                { value: 'Encouraging', label: 'Encouraging' },
                { value: 'Excited', label: 'Excited' },
                { value: 'Witty', label: 'Witty' },
                { value: 'Sympathetic', label: 'Sympathetic' }
              ]}
            />
          </div>
        </div>

        {/* Personal Email Group */}
        <div className="email-group" style={{ display: selectedType === "Personal" ? "block" : "none" }}>
          <div className="form-row">
            <div className="form-group">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                id="recipient"
                options={[
                  { value: 'Friend', label: 'Friend' },
                  { value: 'Family member', label: 'Family member' },
                  { value: 'Doctors', label: 'Doctors' },
                  { value: 'Therapists', label: 'Therapists' },
                  { value: 'Religious leaders', label: 'Religious leaders' },
                  { value: 'Pen pals', label: 'Pen pals' }
                ]}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="purpose">Purpose</Label>
              <Select
                id="purpose"
                options={[
                  { value: 'Welcome', label: 'Welcome' },
                  { value: 'Wishes', label: 'Wishes' },
                  { value: 'Ask help/advice', label: 'Ask help/advice' },
                  { value: 'Express feelings/emotions', label: 'Express feelings/emotions' },
                  { value: 'Conduct business', label: 'Conduct business' },
                  { value: 'Apply for a job', label: 'Apply for a job' },
                  { value: 'Thank you', label: 'Thank you' },
                  { value: 'Apology', label: 'Apology' },
                  { value: 'Reminder', label: 'Reminder' },
                  { value: 'Invitation', label: 'Invitation' },
                  { value: 'Request', label: 'Request' },
                  { value: 'Job Seekers', label: 'Job Seekers' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Business Email Group */}
        <div className="email-group" style={{ display: selectedType === "Business" ? "block" : "none" }}>
          <div className="form-row">
            <div className="form-group">
              <Label htmlFor="business-recipient">Recipient</Label>
              <Select
                id="business-recipient"
                ref={recipientRef}
                options={[
                  { value: 'Customer Support', label: 'Customer Support' },
                  { value: 'Customers', label: 'Customers' },
                  { value: 'Vendors', label: 'Vendors' },
                  { value: 'Employees', label: 'Employees' },
                  { value: 'Partners', label: 'Partners' },
                  { value: 'Investors', label: 'Investors' },
                  { value: 'Government agencies', label: 'Government agencies' },
                  { value: 'Other businesses', label: 'Other businesses' }
                ]}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="business-purpose">Purpose</Label>
              <Select
                id="business-purpose"
                ref={purposeRef}
                options={[
                  { value: 'welcome', label: 'Welcome' },
                  { value: 'thankyou', label: 'Thank you' },
                  { value: 'promotional', label: 'Promotional' },
                  { value: 'newsletter', label: 'Newsletter' },
                  { value: 'transactional', label: 'Transactional' },
                  { value: 'survey', label: 'Survey' },
                  { value: 'cancellation', label: 'Cancellation' },
                  { value: 'abandonedcart', label: 'Abandoned cart' },
                  { value: 'confirmation', label: 'Confirmation' },
                  { value: 'announcement', label: 'Announcement' },
                  { value: 'invitation', label: 'Invitation' },
                  { value: 'request', label: 'Request' },
                  { value: 'complaint', label: 'Complaint' },
                  { value: 'feedback', label: 'Feedback' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Job Seekers Group */}
        <div className="email-group" style={{ display: selectedType === "Job Seekers" ? "block" : "none" }}>
          <div className="form-row">
            <div className="form-group">
              <Label htmlFor="jobseeker-recipient">Recipient</Label>
              <Select
                id="jobseeker-recipient"
                ref={jobSeekersRecipientRef}
                options={[
                  { value: 'HR Manager', label: 'HR Manager' }
                ]}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="jobseeker-purpose">Purpose</Label>
              <Select
                id="jobseeker-purpose"
                ref={jobSeekersPurposeRef}
                options={[
                  { value: 'Job Application', label: 'Job Application' },
                  { value: 'Job Acceptance', label: 'Job Acceptance' },
                  { value: 'Job Rejection', label: 'Job Rejection' },
                  { value: 'Thank You Email After Interview', label: 'Thank You Email After Interview' },
                  { value: 'Reference Request', label: 'Reference Request' },
                  { value: 'Job Inquiry', label: 'Job Inquiry' },
                  { value: 'Follow-up Email After Interview', label: 'Follow-up Email After Interview' },
                  { value: 'Networking Email for Job Search', label: 'Networking Email for Job Search' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* HR/Employee Group */}
        <div className="email-group" style={{ display: selectedType === "HR/Employee" ? "block" : "none" }}>
          <div className="form-row">
            <div className="form-group">
              <Label htmlFor="employee-recipient">Recipient</Label>
              <Select
                id="employee-recipient"
                ref={employeeRecipientRef}
                options={[
                  { value: 'Employee', label: 'Employee' },
                  { value: 'HR', label: 'HR' }
                ]}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="employee-purpose">Purpose</Label>
              <Select
                id="employee-purpose"
                ref={employeePurposeRef}
                options={[
                  { value: 'Resignation Letter', label: 'Resignation Letter' },
                  { value: 'Interview Invitation', label: 'Interview Invitation' },
                  { value: 'Interview Confirmation', label: 'Interview Confirmation' },
                  { value: 'Job Offer', label: 'Job Offer' },
                  { value: 'Promotion Request', label: 'Promotion Request' },
                  { value: 'Transfer Request', label: 'Transfer Request' },
                  { value: 'Performance Appraisal', label: 'Performance Appraisal' },
                  { value: 'Acknowledgment of Resignation', label: 'Acknowledgment of Resignation' },
                  { value: 'Welcome Email to New Employee', label: 'Welcome Email to New Employee' },
                  { value: 'Job Termination', label: 'Job Termination' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <Label htmlFor="personalized">Enter the content of the mail</Label>
          <TextArea
            id="personalized"
            ref={personalizedRef}
            placeholder="Eg. invite - birthday - 2nd december - venue"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <OutputSection
          outputText={composedEmail}
          onCopy={handleCopyToClipboard}
          onFeedback={handleFeedback}
          showFeed={showFeed}
          onClosePopup={handleClosePopup}
          isLoading={isLoading}
          onGenerate={handleComposeEmail}
          generateButtonText="Compose Email"
          outputLabel="Composed Email"
          FeedbackPopup={FeedbackPopup}
        />
      </div>
    </div>
  );
};

export default EmailWriterPage;