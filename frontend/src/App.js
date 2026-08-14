import { useState, useEffect } from 'react';
import './App.css';
import { PasswordGate } from './components/PasswordGate';
import { HeartTransition } from './components/HeartTransition';
import { SwipeDeck } from './components/SwipeDeck';
import { Timeline } from './components/Timeline';
import { EditorDashboard } from './components/EditorDashboard';
import { BottomNav } from './components/BottomNav';
import { initializeStorage } from './utils/storage';

// App stages
const STAGES = {
  GATE: 'gate',
  VOID_HEART: 'void_heart',
  ALIVE_MAIN: 'alive_main'
};

// Per-account theme + greeting. 'user' is the 1234 (Mama) account,
// 'baba' is the baba1234 (Baba) account, 'editor' has no theme/greeting.
const ACCOUNT_CONFIG = {
  user: { themeClass: '', accentColor: '#9333EA', greeting: 'Hala Ya Mama ❤️' },
  baba: { themeClass: 'theme-blue', accentColor: '#2563EB', greeting: 'Hala Ya Baba ❤️' },
  editor: { themeClass: '', accentColor: '#9333EA', greeting: null }
};

function App() {
  const [stage, setStage] = useState(STAGES.GATE);
  const [role, setRole] = useState(null); // 'user' | 'baba' | 'editor'
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { themeClass, accentColor, greeting } = ACCOUNT_CONFIG[role] || ACCOUNT_CONFIG.user;

  useEffect(() => {
    initializeStorage();
    // Update theme color meta tag
    const themeColorMeta = document.getElementById('theme-color-meta');
    if (themeColorMeta) {
      themeColorMeta.content = stage === STAGES.ALIVE_MAIN ? '#FCFBF9' : '#050505';
    }
  }, [stage]);

  const handleAuthenticate = (userRole) => {
    setRole(userRole);
    
    if (userRole === 'editor') {
      // Editor goes directly to main app
      setStage(STAGES.ALIVE_MAIN);
    } else {
      // User always sees heart animation on login
      setStage(STAGES.VOID_HEART);
    }
  };

  const handleHeartComplete = () => {
    setStage(STAGES.ALIVE_MAIN);
  };

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Render password gate
  if (stage === STAGES.GATE) {
    return <PasswordGate onAuthenticate={handleAuthenticate} />;
  }

  // Render heart transition (user only, first time)
  if (stage === STAGES.VOID_HEART) {
    return (
      <div className={themeClass}>
        <HeartTransition onComplete={handleHeartComplete} accentColor={accentColor} />
      </div>
    );
  }

  // Render main app
  const isEditor = role === 'editor';

  return (
    <div className={`fixed inset-0 bg-alive-bg overflow-hidden ${themeClass}`} data-testid="main-app">
      {/* Safe area top */}
      <div className="h-safe-area-top bg-alive-bg" />
      
      {/* Main content */}
      <div className="flex flex-col h-full pb-24">
        {/* Account greeting */}
        {greeting && (
          <p
            className="font-serif text-center text-lg text-alive-accent pt-4 pb-2 select-none"
            data-testid="account-greeting"
          >
            {greeting}
          </p>
        )}

        {/* Tab content */}
        {activeTab === 0 && (
          isEditor ? (
            <EditorDashboard 
              key={`editor-reasons-${refreshKey}`}
              activeTab={0} 
              onDataChange={handleDataChange} 
            />
          ) : (
            <SwipeDeck key={`swipe-${refreshKey}`} />
          )
        )}
        {activeTab === 1 && (
          isEditor ? (
            <EditorDashboard 
              key={`editor-timeline-${refreshKey}`}
              activeTab={1} 
              onDataChange={handleDataChange} 
            />
          ) : (
            <Timeline key={`timeline-${refreshKey}`} />
          )
        )}
        {activeTab === 2 && isEditor && (
          <EditorDashboard activeTab={2} />
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isEditor={isEditor} 
      />
    </div>
  );
}

export default App;
