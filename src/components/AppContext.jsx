import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(1);
  const [maxOutput, setMaxOutput] = useState(1000);
  const [TopK, setTopK] = useState(2);
  // Add missing states for Prompt
  const [TopP, setTopP] = useState(0.95);
  const [stopSequence, setStopSequence] = useState("");
  const [outputLength, setOutputLength] = useState(1000);
  const [selectedOrg, setSelectedOrg] = useState("OpenAI");
  const [modelsByOrg, setModelsByOrg] = useState({});
  const [organizations, setOrganizations] = useState([]);

  return (
    <AppContext.Provider value={{
      model, setModel,
      temperature, setTemperature,
      maxOutput, setMaxOutput,
      TopK, setTopK,
      TopP, setTopP,
      stopSequence, setStopSequence,
      outputLength, setOutputLength,
      selectedOrg, setSelectedOrg,
      modelsByOrg, setModelsByOrg,
      organizations, setOrganizations
    }}>
      {children}
    </AppContext.Provider>
  );
};
