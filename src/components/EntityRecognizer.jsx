import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { RiFileCopy2Line } from "react-icons/ri";
import FeedbackPopup from "./FeedbackPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from './AppContext';
import styled from 'styled-components';
import { authService } from './Authentication/authService'; 
import { Button, Input, TextArea, Heading, Label } from './common';
import OutputSection from './common/OutputSection';
import './common/Label.css';

const ResponsiveDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (min-width: 568px) {
    flex-direction: row;
  }
`;

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withXSRFToken = true; // For newer axios versions
const EntityRecognizer = () => {
  const [entityText, setEntityText] = useState('');
  const [entities, setEntities] = useState([
    { value: 'Person', label: 'Person' },
    { value: 'Organization', label: 'Organization' },
    { value: 'Date', label: 'Date' },
    { value: 'Time', label: 'Time' }
  ]);
  const [customEntity, setCustomEntity] = useState();
  const [showFeed, setShowFeed] = useState(false);
  const [input, setInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { model, temperature, maxOutput, TopK } = useContext(AppContext);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('entity-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFeedback = () => {
    setShowFeed(true);
  };

  const handleClosePopup = () => {
    setShowFeed(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(entityText)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleEntity = async () => {
    if (!input.trim()) {
      alert('Please enter some text to analyze');
      return;
    }
      const user = authService.getCurrentUser();
      const userEmail = user?.email ;
    setIsLoading(true);
    try {
      const params = {
        input,
        entities: entities.map(entity => entity.value).join(','),
        customEntity,
        model,
        temperature,
        maxOutput,
        TopK,
        email: userEmail,
      };

      // const url = `https://promptrightprod.onrender.com/api/entity/?${Object.entries(params)
      const url = `http://localhost:8000/api/entity/?${Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;

      console.log('Entity API URL:', url);

      const response = await axios.get(url);
      console.log('Entity API Response:', response.data);
      console.log(response)

      if (response.data.entity) {
        
        setEntityText(response.data.entity)
        
      } else {
        setEntityText('No entities found');
      }
    } catch (error) {
      console.error('Error in Entity Recognition:', error);
      setEntityText('Error: ' + (error.response?.data?.message || error.message || 'Failed to process request'));

      if (error.response) {
        if (error.response.status === 401) {
          console.error('Authentication required. Redirecting to /authenticate');
          window.location.href = "/authenticate";
        }  else if (error.response.status === 402) {
          // Show alert dialog for payment required
          const goToProfile = confirm("You need to add your credits. Go to profile page?");
          if (goToProfile) {
            window.location.href = "/profile";
          }
          // If user clicks Cancel, they stay on the current page
        } 
      }
    } finally {
      setIsLoading(false);
    }
  };

  const entityOptions = [
    { value: 'Named Entity Recognition', label: 'Named Entity Recognition (NER)' },
    { value: 'Person', label: 'Person' },
    { value: 'Organization', label: 'Organization' },
    { value: 'Date', label: 'Date' },
    { value: 'Time', label: 'Time' }
  ];

  const toggleEntity = (option) => {
    const isSelected = entities.some(entity => entity.value === option.value);
    if (isSelected) {
      // Don't allow deselecting if it's the last item
      if (entities.length > 1) {
        setEntities(entities.filter(entity => entity.value !== option.value));
      }
    } else {
      setEntities([...entities, option]);
    }
  };

  return (
    <div className="entity-recognizer-container" style={{
      maxWidth: '95%',
      margin: '0 auto',
      padding: '10px'
    }}>
      <Heading>Entity Recognizer!</Heading>

      <ResponsiveDiv>
        <div className="form-group" style={{
        }} id="entity">
          <Label htmlFor="entity-dropdown" className="form-label">Entity</Label>
          <div
            id="entity-dropdown"
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                height: '40px',
                width: '100%',
                backgroundColor: '#FAFAFA',
                border: '1px solid #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              role="button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              {entities.length > 0
                ? entities.map(entity => entity.label).join(', ')
                : 'Select Entities'}
            </div>

            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
                role="listbox"
              >
                {entityOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleEntity(option)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      cursor: 'pointer',
                      backgroundColor: entities.some(e => e.value === option.value)
                        ? '#e9ecef'
                        : 'white'
                    }}
                    role="option"
                    aria-selected={entities.some(e => e.value === option.value)}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #007bff',
                        borderRadius: '4px',
                        marginRight: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: entities.some(e => e.value === option.value)
                          ? '#007bff'
                          : 'white'
                      }}
                    >
                      {entities.some(e => e.value === option.value) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          color="white"
                          style={{ fontSize: '12px' }}
                        />
                      )}
                    </div>
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group" style={{
        }} id="custom-entity-container">
          <Label htmlFor="custom-entity" className="form-label">Custom Entity</Label>
          <Input
            id="custom-entity"
            value={customEntity}
            onChange={(e) => setCustomEntity(e.target.value)}
            placeholder="Enter the custom entity"
            style={{
              height: '40px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #ccc',
              borderRadius: '8px',
              color: "black"
            }}
          />
        </div>
      </ResponsiveDiv>

      <div className="form-group full-width" style={{ marginTop: '20px' }}>
        <Label htmlFor="input-text" className="form-label">Enter the text to find entities</Label>
        <TextArea
          id="input-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Apple Inc. is planning to open a new store in London next month."
          style={{
            height: '150px',
            fontSize: '16px',
            fontFamily: 'sans-serif',
            backgroundColor: '#FAFAFA',
            border: '1px solid #ccc',
            whiteSpace: 'pre-wrap',
            borderRadius: '8px',
            padding: '10px',
            boxSizing: 'border-box',
            color: "black"
          }}
        />
      </div>

      <OutputSection
        outputText={entityText}
        onCopy={handleCopyToClipboard}
        onFeedback={handleFeedback}
        showFeed={showFeed}
        onClosePopup={handleClosePopup}
        isLoading={isLoading}
        onGenerate={handleEntity}
        generateButtonText="Find Entity"
        outputLabel="Entity Recognition Results"
        FeedbackPopup={FeedbackPopup}
      />
    </div>
  );
};

export default EntityRecognizer;