import React, { useState } from 'react';
import ContextPanel from './components/ContextPanel';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

function App() {
  const [context, setContext] = useState({
    claimType: 'Auto',
    location: 'California',
    policyId: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            JIT Knowledge
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Appian Agent Assistant</p>
        </div>

        <ContextPanel context={context} setContext={setContext} />
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      <div className="main-content">
        <ChatInterface context={context} uploadedFiles={uploadedFiles} />
      </div>
    </div>
  );
}

export default App;
