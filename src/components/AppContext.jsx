import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(1);
  const [maxOutput, setMaxOutput] = useState(1000);
  const [TopK, setTopK] = useState(2);

  return (
    <AppContext.Provider value={{ model, setModel, temperature, setTemperature, maxOutput, setMaxOutput, TopK, setTopK }}>
      {children}
    </AppContext.Provider>
  );
};
