import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SetupScreen from './components/SetupScreen';
import { AppConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check local storage for existing config
    const storedConfig = localStorage.getItem('hotel_pro_config_v2');
    if (storedConfig) {
      try {
        setConfig(JSON.parse(storedConfig));
      } catch (e) {
        console.error("Failed to parse stored config", e);
      }
    }
    setChecking(false);
  }, []);

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