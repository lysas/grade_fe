import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { RiFileCopy2Line } from "react-icons/ri";
import FeedbackPopup from "./FeedbackPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCheck } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from './AppContext';

const EntityRecognizer = () => {
  const [entityText, setEntityText] = useState('');
  const [entities, setEntities] = useState([{ value: 'Named Entity Recognition', label: 'Named Entity Recognition (NER)' }]);
  const [customEntity, setCustomEntity] = useState('');
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

    setIsLoading(true);
    try {
      const params = {
        input,
        entities: entities.map(entity => entity.value).join(','),
        customEntity,
        model,
        temperature,
        maxOutput,
        TopK
      };

      const url = `https://easy-with-ai-frontend.onrender/api/entity/?${Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;

      console.log('Entity API URL:', url);

      const response = await axios.get(url);
      console.log('Entity API Response:', response.data);

      if (response.data.entity) {
        try {
          // Try to parse if it's a JSON string
          const entityData = typeof response.data.entity === 'string'
            ? JSON.parse(response.data.entity)
            : response.data.entity;

          if (Array.isArray(entityData)) {
            const formattedString = entityData.map(item => {
              const entityType = item.type || item.entity || '';
              const entityText = item.text || '';
              return `${entityType}: ${entityText}`;
            }).join('\n');

            setEntityText(formattedString);
          } else {
            // Handle non-array JSON
            setEntityText(JSON.stringify(entityData, null, 2));
          }
        } catch (parseError) {
          // If it's not valid JSON, use the raw string with some formatting
          const formattedString = response.data.entity
            .replace(/\},\s\{/g, '\n')
            .replace(/[\[\]{}"]/g, '')
            .replace(/,\s*'type':\s*'([^']*)'/g, ': $1')
            .replace(/,\s*'text':\s*'([^']*)'/g, ': $1')
            .replace(/,\s*'entity':\s*'([^']*)'/g, ': $1');

          setEntityText(formattedString || response.data.entity);
        }
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
        } else if (error.response.status === 402) {
          console.error('Payment required. Redirecting to /upgrade');
          window.location.href = "/upgrade";
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
      <h1 style={{
        fontSize: "22px",
        marginTop: '-15px',
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        padding: '5px 0'
      }}>
        Entity Recognizer
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '10px',

      }}>
        <div className="form-group" style={{
          flex: '1 1 300px',
          minWidth: '250px',
          paddingTop: '30px',
          maxWidth: '100%'
        }} id="entity">
          <label htmlFor="entity-dropdown" style={{ display: 'block', marginBottom: '10px' }}>Entity</label>

          <div
            id="entity-dropdown"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '300px'
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
          flex: '1 1 300px',
          minWidth: '250px',
          paddingTop: '30px',
          maxWidth: '100%',

        }} id="custom-entity-container">
          <label htmlFor="custom-entity" style={{ display: 'block', marginBottom: '10px' }}>Custom Entity</label>
          <input
            id="custom-entity"
            style={{
              height: '40px',
              width: '100%',
              maxWidth: '300px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #ccc',
              borderRadius: '8px',
              paddingLeft: '10px',
              color: "black"
            }}
            placeholder="Enter the custom entity"
            value={customEntity}
            onChange={(e) => setCustomEntity(e.target.value)}
          />
        </div>
      </div>

      <div style={{ width: '100%', marginTop: '20px' }}>
        <label htmlFor="input-text" style={{ display: 'block', marginBottom: '10px' }}>Enter the text to find entities</label>
        <textarea
          id="input-text"
          name="input-text"
          style={{
            height: '150px',
            width: '100%',
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Apple Inc. is planning to open a new store in London next month."
        />
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          className="upgrade"
          style={{
            fontSize: '14px',
            fontWeight: '400',
            width: '200px',
            maxWidth: '100%',
            height: '40px',
            cursor: 'pointer',
            backgroundColor: '#0C0B6D',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            opacity: isLoading ? 0.7 : 1
          }}
          onClick={handleEntity}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : <strong style={{ fontWeight: 'bold' }}>Find Entity</strong>}
        </button>
      </div>

      <div style={{ width: '100%', position: 'relative', marginTop: '20px' }}>
        <label htmlFor="output" style={{ display: 'block', marginBottom: '10px' }}>Entity Recognizer</label>
        <div style={{ position: 'relative' }}>
          <textarea
            id="output"
            value={entityText}
            readOnly
            style={{
              height: '160px',
              width: '100%',
              backgroundColor: '#FAFAFA',
              border: '1px solid #ccc',
              whiteSpace: 'pre-wrap',
              borderRadius: '8px',
              padding: '10px',
              boxSizing: 'border-box',
              color: "black"
            }}
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={handleCopyToClipboard}
              style={{
                cursor: 'pointer',
                fontSize: '20px',
                color: '#0C0B6D',
                backgroundColor: 'white',
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid black',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Copy to clipboard"
            >
              <RiFileCopy2Line />
            </button>
            <button
              className="icon-button"
              onClick={handleFeedback}
              style={{
                cursor: 'pointer',
                fontSize: '20px',
                color: '#0C0B6D',
                backgroundColor: 'white',
                padding: '0px 5px',
                borderRadius: '5px',
                border: '1px solid black',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Provide feedback"
            >
              <FontAwesomeIcon icon={faComment} />
            </button>
          </div>
        </div>
        {showFeed && <FeedbackPopup onClose={handleClosePopup} />}
      </div>
    </div>
  );
};

export default EntityRecognizer;