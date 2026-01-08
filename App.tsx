import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SetupScreen from './components/SetupScreen';
import { AppConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>({
  dataSource: '',
  sheetsUrl: '',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  isConfigured: true
});

  const [checking, setChecking] = useState(false);

 

  const handleSetupComplete = (newConfig: Omit<AppConfig, 'isConfigured'>) => {
    const fullConfig: AppConfig = {
      ...newConfig,
      isConfigured: true
    };
    localStorage.setItem('hotel_pro_config_v2', JSON.stringify(fullConfig));
    setConfig(fullConfig);
  };

  const handleConfigUpdate = (updates: Partial<AppConfig>) => {
    if (!config) return;
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('hotel_pro_config_v2', JSON.stringify(newConfig));
  };

  if (checking) return null;

  return (
    <>
      {config?.isConfigured ? (
        <Dashboard config={config} onConfigUpdate={handleConfigUpdate} />
      ) : (
        <SetupScreen onComplete={handleSetupComplete} />
      )}
    </>
  );
};

export default App;
