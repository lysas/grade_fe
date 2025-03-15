import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext';

// Prompt component for model settings
const Prompt = () => {
  // State variables from context
  const {
    model,
    setModel,
    temperature,
    setTemperature,
    maxOutput,
    setMaxOutput,
    TopK,
    setTopK
  } = useContext(AppContext);

  // Local state variables
  const [stopSequence, setStopSequence] = useState("");
  const [TopP, setTopP] = useState(0.95);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [outputLength, setOutputLength] = useState(1000);

  // Event handlers
  const handleTemperatureChange = (event) => {
    setTemperature(parseFloat(event.target.value));
  };

  const handleMaxOutputChange = (event) => {
    setMaxOutput(parseInt(event.target.value, 10));
  };

  const handleTopKChange = (event) => {
    setTopK(parseInt(event.target.value, 10));
  };

  const handleTopPChange = (event) => {
    setTopP(parseFloat(event.target.value));
  };

  const handleStopSequenceChange = (event) => {
    setStopSequence(event.target.value);
  };

  const handleOutputLengthChange = (event) => {
    setOutputLength(parseInt(event.target.value, 10));
  };

  // Available models
  const availableModels = [
    "gpt-3.5-turbo",
    "gpt-4-1106-preview",
    "deepseek-ai/deepseek-llm-67b-chat",
    "meta-llama/Llama-2-13b-chat-hf",
    "meta-llama/Llama-3-8b-chat-hf",
    "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    "Qwen/Qwen2-72B-Instruct",
    "upstage/SOLAR-10.7B-Instruct-v1.0"
  ];

  const settingGroupStyle = {
    marginBottom: "20px"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#333"
  };

  const rangeContainerStyle = {
    display: "flex",
    alignItems: "center"
  };

  const rangeStyle = {
    flex: "1",
    height: "5px",
    appearance: "none",
    backgroundColor: "#e0e0e0",
    borderRadius: "5px",
    outline: "none"
  };

  const valueDisplayStyle = {
    marginLeft: "10px",
    padding: "3px 8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minWidth: "40px",
    textAlign: "center",
    backgroundColor: "#f9f9f9"
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    // border: "1px solid rgb(204, 204, 204)"

  };

  const toggleButtonStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px 0",
    color: "#3366FF",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
    fontSize: "14px"
  };

  return (
    <div className="prompt-settings">
      <h3 style={{
        marginTop: 0,
        marginBottom: "20px",
        color: "#190A89"
      }}>Model Settings</h3>

      {/* Model Selection */}
      <div style={settingGroupStyle}>
        <label style={labelStyle}>🔬 Model</label>
        <select
          id="model"
          style={inputStyle}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {availableModels.map(modelOption => (
            <option key={modelOption} value={modelOption}>{modelOption}</option>
          ))}
        </select>
      </div>

      {/* Temperature Range Input */}
      <div style={settingGroupStyle}>
        <label style={labelStyle}>🌡️ Temperature</label>
        <div style={rangeContainerStyle}>
          <input
            type="range"
            id="temperature"
            name="temperature"
            min="0"
            max="2"
            step="0.1"
            style={rangeStyle}
            value={temperature}
            onChange={handleTemperatureChange}
          />
          <div style={valueDisplayStyle}>
            {temperature}
          </div>
        </div>
      </div>

      {/* Stop Sequence Input */}
      <div style={settingGroupStyle}>
        <label style={labelStyle}>⬢ Add Stop Sequence</label>
        <input
          type="text"
          id="stopSequence"
          name="stopSequence"
          value={stopSequence}
          onChange={handleStopSequenceChange}
          style={inputStyle}
          placeholder="Add stop..."
        />
      </div>

      {/* Max Output Range Input */}
      <div style={settingGroupStyle}>
        <label style={labelStyle}>🔢 Max Output</label>
        <div style={rangeContainerStyle}>
          <input
            type="range"
            id="maxOutput"
            name="maxOutput"
            min="0"
            max="4096"
            style={rangeStyle}
            value={maxOutput}
            onChange={handleMaxOutputChange}
          />
          <div style={valueDisplayStyle}>
            {maxOutput}
          </div>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          style={toggleButtonStyle}
        >
          {showAdvancedSettings ? 'Advanced Settings ▲' : 'Advanced Settings ▼'}
        </button>

        {/* Advanced Settings Section */}
        {showAdvancedSettings && (
          <div style={{ marginTop: "10px" }}>
            {/* Output Length Input */}
            <div style={settingGroupStyle}>
              <label style={labelStyle}>Output Length</label>
              <input
                type="number"
                id="outputLength"
                value={outputLength}
                onChange={handleOutputLengthChange}
                style={inputStyle}
                min="1"
                max="2000"
                step="1"
              />
            </div>

            {/* Top K Input */}
            <div style={settingGroupStyle}>
              <label style={labelStyle}>Top K</label>
              <input
                type="number"
                id="topK"
                value={TopK}
                onChange={handleTopKChange}
                style={inputStyle}
                min="1"
                max="2000"
                step="1"
              />
            </div>

            {/* Top P Range Input */}
            <div style={settingGroupStyle}>
              <label style={labelStyle}>Top P</label>
              <div style={rangeContainerStyle}>
                <input
                  type="range"
                  id="topP"
                  name="topP"
                  min="0"
                  max="1"
                  step="0.01"
                  style={rangeStyle}
                  value={TopP}
                  onChange={handleTopPChange}
                />
                <div style={valueDisplayStyle}>
                  {TopP}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prompt;